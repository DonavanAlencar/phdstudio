#!/bin/bash

# Script de backup do banco de dados PostgreSQL
# Uso: ./scripts/backup-db.sh

set -e

BACKUP_DIR="./backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/crm_backup_${TIMESTAMP}.sql"

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

echo "Fazendo backup do banco de dados..."
echo "Arquivo: $BACKUP_FILE"

docker exec phd-crm-db pg_dump -U phd_crm_user phd_crm > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso!"
    echo "Tamanho: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Manter apenas os últimos 7 backups
    echo "Removendo backups antigos (mantendo últimos 7)..."
    ls -t "${BACKUP_DIR}/crm_backup_"*.sql | tail -n +8 | xargs rm -f 2>/dev/null || true
    
    echo "✅ Backup concluído!"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

