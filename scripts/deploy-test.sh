#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="${ROOT}/deploy"
SERVICE_DIR="${ROOT}/service"
ARTIFACTS_BACKEND="${DEPLOY_DIR}/artifacts/backend"
COMPOSE=(docker compose --project-directory "${DEPLOY_DIR}" -f "${DEPLOY_DIR}/docker-compose.yml")
BACKEND_MODULES=(
	admin-service
	organization-panel-service
	customer-service
	merchant-service
)

if [[ ! -f "${DEPLOY_DIR}/.env" ]]; then
	echo "Missing ${DEPLOY_DIR}/.env — copy deploy/.env.example and fill values." >&2
	exit 1
fi

# shellcheck disable=SC1091
set -a
source "${DEPLOY_DIR}/.env"
set +a

: "${BASE_DOMAIN:?BASE_DOMAIN must be set in deploy/.env}"
: "${ADMIN_API_PUBLIC_URL:?ADMIN_API_PUBLIC_URL must be set in deploy/.env}"
: "${PANEL_API_PUBLIC_URL:?PANEL_API_PUBLIC_URL must be set in deploy/.env}"
: "${CUSTOMER_API_PUBLIC_URL:?CUSTOMER_API_PUBLIC_URL must be set in deploy/.env}"

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "Missing required command: $1" >&2
		exit 1
	fi
}

require_cmd java
require_cmd docker
if ! docker compose version >/dev/null 2>&1; then
	echo "Missing required command: docker compose" >&2
	exit 1
fi
require_cmd node
require_cmd corepack

java_major="$(java -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -n1)"
if [[ "${java_major}" != "21" ]]; then
	echo "Java 21 is required on the host (found major=${java_major:-unknown})." >&2
	exit 1
fi

if [[ "${SKIP_GIT_PULL:-0}" == "1" ]]; then
	echo "==> Skipping git pull (release already synced by Actions)"
else
	echo "==> Updating repository on $(hostname)"
	cd "${ROOT}"
	git fetch origin main
	git checkout main
	git pull --ff-only origin main
fi

echo "==> Building backend JARs on host (Maven local ~/.m2)"
cd "${SERVICE_DIR}"
chmod +x mvnw
./mvnw -B package -DskipTests

echo "==> Staging backend artifacts for Docker runtime images"
rm -rf "${ARTIFACTS_BACKEND}"
for module in "${BACKEND_MODULES[@]}"; do
	jar="$(find "${SERVICE_DIR}/${module}/target" -maxdepth 1 -type f -name "*.jar" ! -name "*.original" | head -n 1)"
	if [[ -z "${jar}" ]]; then
		echo "No runnable JAR found for ${module}" >&2
		exit 1
	fi
	mkdir -p "${ARTIFACTS_BACKEND}/${module}"
	cp "${jar}" "${ARTIFACTS_BACKEND}/${module}/app.jar"
	cp "${DEPLOY_DIR}/docker/Dockerfile.backend" "${ARTIFACTS_BACKEND}/${module}/Dockerfile"
	echo "  staged ${module} <- ${jar}"
done

build_ui() {
	local app_dir="$1"
	local api_url="$2"
	echo "==> Building UI on host: $(basename "${app_dir}")"
	cd "${app_dir}"
	corepack enable
	corepack prepare pnpm@10.17.0 --activate
	pnpm install --frozen-lockfile
	NEXT_PUBLIC_API_BASE_URL="${api_url}" pnpm build
	if [[ ! -f .next/standalone/server.js ]]; then
		echo "Next standalone output missing in ${app_dir} (.next/standalone/server.js)" >&2
		exit 1
	fi
}

build_ui "${ROOT}/ui/admin-panel" "${ADMIN_API_PUBLIC_URL}"
build_ui "${ROOT}/ui/organization-panel" "${PANEL_API_PUBLIC_URL}"
build_ui "${ROOT}/ui/customer-app" "${CUSTOMER_API_PUBLIC_URL}"

echo "==> Building runtime Docker images (no compile inside Docker)"
cd "${DEPLOY_DIR}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
"${COMPOSE[@]}" --env-file .env build
"${COMPOSE[@]}" --env-file .env up -d --remove-orphans

echo "==> Waiting for API health endpoints"
apis=(
	"https://api-admin.${BASE_DOMAIN}/api/health"
	"https://api-org.${BASE_DOMAIN}/api/health"
	"https://api-app.${BASE_DOMAIN}/api/health"
	"https://api-merchant.${BASE_DOMAIN}/api/health"
)

failures=0
for url in "${apis[@]}"; do
	ok=0
	for _ in $(seq 1 30); do
		if curl -fsS --max-time 5 "${url}" >/dev/null; then
			echo "OK  ${url}"
			ok=1
			break
		fi
		sleep 5
	done
	if [[ "${ok}" -ne 1 ]]; then
		echo "FAIL ${url}" >&2
		failures=$((failures + 1))
	fi
done

if [[ "${failures}" -ne 0 ]]; then
	echo "Deploy finished but ${failures} health check(s) failed." >&2
	"${COMPOSE[@]}" --env-file .env ps >&2 || true
	exit 1
fi

echo "==> Deploy test environment succeeded"
