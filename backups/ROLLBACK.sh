#!/bin/bash
# Script de Rollback para PHD Studio Docker
# Restaura configuração anterior e remove container

set -e

echo "=========================================="
echo "  PHD Studio - Rollback Docker"
echo "=========================================="
echo ""

# Parar e remover container
echo "Parando e removendo container phdstudio-app..."
docker stop phdstudio-app 2>/dev/null || true
docker rm phdstudio-app 2>/dev/null || true

# Remover imagem (opcional)
read -p "Deseja remover a imagem Docker também? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    docker rmi phdstudio 2>/dev/null || true
    echo "Imagem removida"
fi

# Restaurar docker-compose.yml se houver backup
BACKUP_FILE=$(ls -t backups/docker-compose.yml.backup-* 2>/dev/null | head -1)
if [ -n "$BACKUP_FILE" ]; then
    read -p "Deseja restaurar docker-compose.yml do backup? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cp "$BACKUP_FILE" docker-compose.yml
        echo "docker-compose.yml restaurado de $BACKUP_FILE"
    fi
fi

echo ""
echo "=========================================="
echo "  Rollback concluído!"
echo "=========================================="

