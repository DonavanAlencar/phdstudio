#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

APP_CONFIG="${ROOT_DIR}/deploy/config/linux/app-config.json"
DB_CONFIG="${ROOT_DIR}/deploy/config/linux/db-config.json"
SKIP_MIGRATIONS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-config) APP_CONFIG="$2"; shift 2 ;;
    --db-config) DB_CONFIG="$2"; shift 2 ;;
    --skip-migrations) SKIP_MIGRATIONS=true; shift ;;
    *) echo "Argumento desconhecido: $1" && exit 1 ;;
  esac
done

log() {
  local level="$1"; shift
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[$ts][$level] $*"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log ERROR "Comando obrigatório não encontrado: $cmd"
    exit 1
  fi
}

load_json() {
  require_command python3
  python3 - "$1" <<'PY'
import json, sys
from pathlib import Path
path = Path(sys.argv[1])
if not path.exists():
    print("!!missing!! Arquivo não encontrado", file=sys.stderr)
    sys.exit(1)
data = json.loads(path.read_text())
for k, v in data.items():
    if isinstance(v, bool):
        print(f"{k}={str(v).lower()}")
    elif isinstance(v, list):
        print(f"{k}={'|'.join(str(i) for i in v)}")
    elif isinstance(v, dict):
        for dk, dv in v.items():
            if isinstance(dv, bool):
                print(f"{k}_{dk}={str(dv).lower()}")
            else:
                print(f"{k}_{dk}={dv}")
    else:
        print(f"{k}={v}")
PY
}

load_app_config() {
  if ! cfg_out="$(load_json "$APP_CONFIG")"; then
    log ERROR "Falha ao carregar app-config: $cfg_out"
    exit 1
  fi
  eval "$cfg_out"

  if [[ -z "${apiPort:-}" || -z "${frontendPort:-}" || -z "${envFile:-}" || -z "${envExample:-}" ]]; then
    log ERROR "Campos obrigatórios ausentes em $APP_CONFIG"
    exit 1
  fi
}

ensure_env_files() {
  local env_path="${ROOT_DIR}/${envFile}"
  local env_example="${ROOT_DIR}/${envExample}"

  if [[ ! -f "$env_path" ]]; then
    if [[ -f "$env_example" ]]; then
      cp "$env_example" "$env_path"
      log WARN "Arquivo de ambiente criado a partir do template; atualize valores sensíveis em $env_path"
    else
      log ERROR "Nenhum arquivo de ambiente encontrado (esperado $env_path)"
      exit 1
    fi
  fi

  cp "$env_path" "${ROOT_DIR}/.env"
  cp "$env_path" "${ROOT_DIR}/api/.env"
  log INFO "Arquivos .env sincronizados (raiz e api/.env)"
}

validate_env_vars() {
  local env_path="${ROOT_DIR}/${envFile}"
  local required_vars=(CRM_DB_HOST CRM_DB_PORT CRM_DB_USER CRM_DB_PASSWORD CRM_DB_NAME PHD_API_KEY JWT_SECRET JWT_REFRESH_SECRET)
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    env_map["$key"]="$value"
  done <"$env_path"

  for var in "${required_vars[@]}"; do
    if [[ -z "${env_map[$var]:-}" ]]; then
      log WARN "Variável obrigatória ausente ou vazia em $env_path: $var"
    fi
  done
}

install_system_packages() {
  local raw_packages="${installSystemPackages:-}"
  [[ -z "$raw_packages" ]] && return

  IFS='|' read -ra packages <<<"$raw_packages"
  if command -v apt-get >/dev/null 2>&1; then
    log INFO "Instalando dependências de sistema: ${packages[*]}"
    sudo apt-get update -y >/dev/null
    sudo apt-get install -y "${packages[@]}" >/dev/null
  else
    log WARN "apt-get não encontrado; instale manualmente: ${packages[*]}"
  fi
}

run_npm_install() {
  local path="$1"
  pushd "$path" >/dev/null
  log INFO "Instalando dependências em $path"
  npm install --no-fund --progress=false >/dev/null
  popd >/dev/null
}

build_frontend() {
  [[ -z "${buildScript:-}" ]] && return
  pushd "$ROOT_DIR" >/dev/null
  log INFO "Executando build do frontend (${buildScript})"
  npm run "$buildScript"
  popd >/dev/null
}

log INFO "============================================"
log INFO "  PHD Studio - Deploy Linux (sem Docker)"
log INFO "============================================"

declare -A env_map

load_app_config
ensure_env_files
validate_env_vars

require_command node
require_command npm

install_system_packages

db_args=(--config "$DB_CONFIG")
$SKIP_MIGRATIONS && db_args+=(--skip-migrations)

"${ROOT_DIR}/deploy/linux/setup-database.sh" "${db_args[@]}"

if [[ "${installDependencies:-true}" != "false" ]]; then
  run_npm_install "$ROOT_DIR"
  run_npm_install "$ROOT_DIR/api"
fi

build_frontend

log INFO "Deploy concluído. API porta ${apiPort}, frontend porta ${frontendPort}."
log INFO "Inicie os processos com seu gerenciador preferido (pm2/systemd) apontando para api/server.js e dist estático."
