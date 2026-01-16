#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

CONFIG_PATH="${CONFIG_PATH:-${ROOT_DIR}/deploy/config/linux/db-config.json}"
MIGRATIONS_PATH="${MIGRATIONS_PATH:-${ROOT_DIR}/api/db/migrations}"
SKIP_MIGRATIONS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) CONFIG_PATH="$2"; shift 2 ;;
    --migrations) MIGRATIONS_PATH="$2"; shift 2 ;;
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

load_config() {
  require_command python3
  python3 - "$CONFIG_PATH" <<'PY'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
if not path.exists():
    print("!!missing!! Arquivo de configuração não encontrado", file=sys.stderr)
    sys.exit(1)

data = json.loads(path.read_text())
required = ["engine","host","port","database","user","password"]
missing = [k for k in required if not data.get(k)]
if missing:
    print("!!missing!! Campos ausentes: " + ",".join(missing), file=sys.stderr)
    sys.exit(1)

for key, val in data.items():
    if isinstance(val, bool):
        print(f"{key}={str(val).lower()}")
    else:
        print(f"{key}={val}")
PY
}

if ! cfg_out="$(load_config)"; then
  log ERROR "$cfg_out"
  exit 1
fi

eval "$cfg_out"

if [[ -n "${migrationDir:-}" ]]; then
  MIGRATIONS_PATH="${ROOT_DIR}/${migrationDir}"
fi

rollback_on_failure=${rollbackOnFailure:-true}
created_db=false
created_user=false

trap 'on_error "$LINENO"' ERR

on_error() {
  log ERROR "Falha na linha $1"
  if $created_db && [[ "${engine}" == "postgres" ]] && [[ "${rollback_on_failure}" != "false" ]]; then
    local admin="${adminUser:-$user}"
    local admin_pwd="${adminPassword:-$password}"
    log WARN "Rollback habilitado: removendo banco recém-criado ${database}"
    PGPASSWORD="$admin_pwd" psql -h "$host" -p "$port" -U "$admin" -d postgres -c "DROP DATABASE IF EXISTS ${database};" >/dev/null 2>&1 || true
  fi
  exit 1
}

ensure_psql() { require_command psql; }
ensure_mysql() { require_command mysql; }

run_postgres_migrations() {
  $SKIP_MIGRATIONS && { log INFO "Migrations ignoradas (--skip-migrations)"; return; }
  if [[ ! -d "$MIGRATIONS_PATH" ]]; then
    log WARN "Diretório de migrations não encontrado: $MIGRATIONS_PATH"
    return
  fi

  shopt -s nullglob
  local files=("$MIGRATIONS_PATH"/*.sql)
  if [[ ${#files[@]} -eq 0 ]]; then
    log WARN "Nenhum arquivo .sql encontrado em $MIGRATIONS_PATH"
    return
  fi

  for file in "${files[@]}"; do
    log INFO "Executando migration $(basename "$file")"
    if ! output=$(PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$database" -f "$file" 2>&1); then
      if grep -qiE "already exists|duplicate key" <<<"$output"; then
        log WARN "Migration já aplicada ou idempotente: $(basename "$file")"
      else
        log ERROR "Falha ao executar $(basename "$file"): $output"
        return 1
      fi
    fi
  done
  log INFO "Migrations PostgreSQL concluídas"
}

provision_postgres() {
  ensure_psql
  local admin="${adminUser:-$user}"
  local admin_pwd="${adminPassword:-$password}"

  if ! PGPASSWORD="$admin_pwd" psql -h "$host" -p "$port" -U "$admin" -d postgres -tAc "SELECT 1;" >/dev/null 2>&1; then
    log ERROR "Não foi possível conectar ao PostgreSQL com o usuário administrativo ($admin)"
    exit 1
  fi
  log INFO "Conexão administrativa ao PostgreSQL validada"

  local db_exists
  db_exists=$(PGPASSWORD="$admin_pwd" psql -h "$host" -p "$port" -U "$admin" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${database}';" 2>/dev/null || true)

  if [[ "$db_exists" != "1" ]]; then
    log INFO "Criando usuário e banco PostgreSQL..."
    PGPASSWORD="$admin_pwd" psql -h "$host" -p "$port" -U "$admin" -d postgres <<SQL
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${user}') THEN
      CREATE ROLE ${user} LOGIN PASSWORD '${password}';
   END IF;
END
$$;

SELECT 'CREATE DATABASE ${database} OWNER ${user}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${database}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${user};
SQL
    created_db=true
    created_user=true
    log INFO "Banco e usuário PostgreSQL criados"
  else
    log INFO "Banco PostgreSQL já existe; validando credenciais de aplicação"
    if ! PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$database" -tAc "SELECT 1;" >/dev/null 2>&1; then
      log ERROR "Credenciais de aplicação não conectam ao banco existente"
      exit 1
    fi
  fi

  run_postgres_migrations
}

provision_mysql() {
  ensure_mysql
  local admin="${adminUser:-root}"
  local admin_pwd="${adminPassword:-$password}"

  if ! MYSQL_PWD="$admin_pwd" mysql -h "$host" -P "$port" -u "$admin" -e "SELECT 1;" >/dev/null 2>&1; then
    log ERROR "Não foi possível conectar ao MySQL com o usuário administrativo ($admin)"
    exit 1
  fi
  log INFO "Conexão administrativa ao MySQL validada"

  MYSQL_PWD="$admin_pwd" mysql -h "$host" -P "$port" -u "$admin" <<SQL >/dev/null 2>&1
CREATE DATABASE IF NOT EXISTS \`${database}\`;
CREATE USER IF NOT EXISTS '${user}'@'%' IDENTIFIED BY '${password}';
GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${user}'@'%';
FLUSH PRIVILEGES;
SQL
  created_db=true
  created_user=true

  if ! MYSQL_PWD="$password" mysql -h "$host" -P "$port" -u "$user" "$database" -e "SELECT DATABASE();" >/dev/null 2>&1; then
    log ERROR "Usuário de aplicação não conecta ao MySQL recém-provisionado"
    exit 1
  fi

  log WARN "Nenhuma migration específica para MySQL disponível; valide schema manualmente se necessário."
}

log INFO "Validando banco de dados (${engine}) usando $CONFIG_PATH"

case "${engine,,}" in
  postgres) provision_postgres ;;
  mysql) provision_mysql ;;
  *) log ERROR "Engine de banco não suportada: ${engine}" && exit 1 ;;
esac

log INFO "Banco de dados validado com sucesso (${engine})"
