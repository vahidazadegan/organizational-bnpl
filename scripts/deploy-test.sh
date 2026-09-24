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
UI_SERVICES=(
	admin-panel
	organization-panel
	customer-app
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

run_root() {
	if [[ "$(id -u)" -eq 0 ]]; then
		"$@"
	elif command -v sudo >/dev/null 2>&1; then
		sudo "$@"
	else
		echo "Need root/sudo to install packages, but sudo is unavailable." >&2
		exit 1
	fi
}

detect_pkg_manager() {
	if command -v apt-get >/dev/null 2>&1; then
		echo apt
	elif command -v dnf >/dev/null 2>&1; then
		echo dnf
	elif command -v yum >/dev/null 2>&1; then
		echo yum
	else
		echo unknown
	fi
}

java_major_version() {
	if ! command -v java >/dev/null 2>&1; then
		echo ""
		return
	fi
	java -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -n1
}

node_major_version() {
	if ! command -v node >/dev/null 2>&1; then
		echo ""
		return
	fi
	node -p "process.versions.node.split('.')[0]" 2>/dev/null || true
}

ensure_java_21() {
	local major
	major="$(java_major_version)"
	if [[ "${major}" == "21" ]]; then
		echo "==> Java 21 already installed ($(java -version 2>&1 | head -n1))"
		return
	fi

	echo "==> Installing Java 21 (found major=${major:-none})"
	case "$(detect_pkg_manager)" in
	apt)
		run_root apt-get update -y
		run_root DEBIAN_FRONTEND=noninteractive apt-get install -y openjdk-21-jdk-headless
		;;
	dnf)
		run_root dnf install -y java-21-openjdk-devel
		;;
	yum)
		run_root yum install -y java-21-openjdk-devel
		;;
	*)
		echo "Unsupported package manager for Java 21 auto-install." >&2
		exit 1
		;;
	esac

	hash -r || true
	major="$(java_major_version)"
	if [[ "${major}" != "21" ]]; then
		echo "Java 21 install finished but java major is still '${major:-unknown}'." >&2
		exit 1
	fi
	echo "==> Java 21 ready ($(java -version 2>&1 | head -n1))"
}

ensure_node_22() {
	local major
	major="$(node_major_version)"
	if [[ "${major}" == "22" ]]; then
		echo "==> Node.js 22 already installed ($(node -v))"
		return
	fi

	echo "==> Installing Node.js 22 (found major=${major:-none})"
	case "$(detect_pkg_manager)" in
	apt)
		run_root apt-get update -y
		run_root DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl gnupg
		curl -fsSL https://deb.nodesource.com/setup_22.x | run_root bash -
		run_root DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
		;;
	dnf)
		curl -fsSL https://rpm.nodesource.com/setup_22.x | run_root bash -
		run_root dnf install -y nodejs
		;;
	yum)
		curl -fsSL https://rpm.nodesource.com/setup_22.x | run_root bash -
		run_root yum install -y nodejs
		;;
	*)
		echo "Unsupported package manager for Node.js 22 auto-install." >&2
		exit 1
		;;
	esac

	hash -r || true
	major="$(node_major_version)"
	if [[ "${major}" != "22" ]]; then
		echo "Node.js 22 install finished but node major is still '${major:-unknown}'." >&2
		exit 1
	fi
	echo "==> Node.js 22 ready ($(node -v))"
}

require_cmd docker
if ! docker compose version >/dev/null 2>&1; then
	echo "Missing required command: docker compose" >&2
	exit 1
fi

ensure_java_21
ensure_node_22

# corepack ships with Node 22; enable it for pnpm.
if ! command -v corepack >/dev/null 2>&1; then
	echo "corepack is missing after Node 22 install." >&2
	exit 1
fi
corepack enable

if [[ "${SKIP_GIT_PULL:-0}" == "1" ]]; then
	echo "==> Skipping git pull (release already synced by Actions)"
else
	echo "==> Updating repository on $(hostname)"
	cd "${ROOT}"
	git fetch origin main
	git checkout main
	git pull --ff-only origin main
fi

cd "${DEPLOY_DIR}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
# Keep compose/buildkit from spawning many concurrent builders on a small VPS.
export COMPOSE_PARALLEL_LIMIT=1

echo "==> [1/3] Building backend JARs on host (Maven local ~/.m2)"
cd "${SERVICE_DIR}"
chmod +x mvnw
./mvnw -B package -DskipTests

echo "==> Staging backend artifacts"
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

echo "==> Building backend runtime images one by one"
cd "${DEPLOY_DIR}"
for module in "${BACKEND_MODULES[@]}"; do
	echo "  docker build ${module}"
	"${COMPOSE[@]}" --env-file .env build -- "${module}"
done

build_ui() {
	local app_dir="$1"
	local api_url="$2"
	local compose_service="$3"
	echo "==> [UI] Host build: ${compose_service}"
	cd "${app_dir}"
	corepack enable
	corepack prepare pnpm@10.17.0 --activate
	pnpm install --frozen-lockfile
	NEXT_PUBLIC_API_BASE_URL="${api_url}" pnpm build
	if [[ ! -f .next/standalone/server.js ]]; then
		echo "Next standalone output missing in ${app_dir} (.next/standalone/server.js)" >&2
		exit 1
	fi
	echo "==> [UI] Docker image: ${compose_service}"
	cd "${DEPLOY_DIR}"
	"${COMPOSE[@]}" --env-file .env build -- "${compose_service}"
}

echo "==> [2/3] Building UIs one by one (host compile, then image)"
build_ui "${ROOT}/ui/admin-panel" "${ADMIN_API_PUBLIC_URL}" admin-panel
build_ui "${ROOT}/ui/organization-panel" "${PANEL_API_PUBLIC_URL}" organization-panel
build_ui "${ROOT}/ui/customer-app" "${CUSTOMER_API_PUBLIC_URL}" customer-app

echo "==> [3/3] Starting stack"
cd "${DEPLOY_DIR}"
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
