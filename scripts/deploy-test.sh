#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="${ROOT}/deploy"
COMPOSE=(docker compose --project-directory "${DEPLOY_DIR}" -f "${DEPLOY_DIR}/docker-compose.yml")

if [[ ! -f "${DEPLOY_DIR}/.env" ]]; then
	echo "Missing ${DEPLOY_DIR}/.env — copy deploy/.env.example and fill values." >&2
	exit 1
fi

# shellcheck disable=SC1091
set -a
source "${DEPLOY_DIR}/.env"
set +a

: "${BASE_DOMAIN:?BASE_DOMAIN must be set in deploy/.env}"

if [[ "${SKIP_GIT_PULL:-0}" == "1" ]]; then
	echo "==> Skipping git pull (release already synced by Actions)"
else
	echo "==> Updating repository on $(hostname)"
	cd "${ROOT}"
	git fetch origin main
	git checkout main
	git pull --ff-only origin main
fi

echo "==> Building and starting stack"
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
