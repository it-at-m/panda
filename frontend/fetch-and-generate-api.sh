#!/usr/bin/env bash
#
# Fetches the OpenAPI definition from the running FastAPI backend and generates
# a typed TypeScript client via the official openapi-generator Docker image.
#
# No Java installation required — Docker is used instead.
#
# Prerequisites:
#   * Docker is running
#   * The backend is running: cd backend && docker compose up --build
#
# Usage:
#   ./fetch-and-generate-api.sh                 # uses http://localhost:8083
#   BACKEND_URL=http://host:port ./fetch-and-generate-api.sh
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8083}"
GENERATOR_VERSION="7.23.0"
SPEC_FILE="src/api/demo-openapi.json"
OUTPUT_DIR="src/api/generated/demo"

# Resolve the absolute path of the frontend directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR"

echo "→ Fetching OpenAPI definition from ${BACKEND_URL}/openapi.json"
curl --fail --silent --show-error "${BACKEND_URL}/openapi.json" -o "${SPEC_FILE}"
echo "  saved to ${SPEC_FILE}"

echo "→ Generating TypeScript client via Docker (openapitools/openapi-generator-cli:v${GENERATOR_VERSION})"
docker run --rm \
  -v "${SCRIPT_DIR}:/local" \
  -w /local \
  "openapitools/openapi-generator-cli:v${GENERATOR_VERSION}" \
  generate \
    -i "/local/${SPEC_FILE}" \
    -g typescript-fetch \
    -o "/local/${OUTPUT_DIR}" \
    --additional-properties=\
supportsES6=true,\
enumPropertyNaming=UPPERCASE,\
disallowAdditionalPropertiesIfNotPresent=false,\
useSingleRequestParameter=false,\
validationAttributes=true

echo "✓ Done. Generated client is in ${OUTPUT_DIR}"
echo "  Re-run whenever the backend API changes."
