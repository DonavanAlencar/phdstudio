#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker/config/docker-compose.yml"
ENV_FILE="${ROOT_DIR}/deploy/config/shared/.env"

echo "=== Deploy PHDStudio (deploy-easypanel.sh) ==="

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo de configuração não encontrado em $ENV_FILE"
  echo "Crie a partir do template: cp ${ENV_FILE}.example ${ENV_FILE}"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" up -d --build

echo "Deploy concluído."
