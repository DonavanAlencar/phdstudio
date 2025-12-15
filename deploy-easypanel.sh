#!/bin/bash
set -e

cd /root/phdstudio

echo "=== Deploy PHDStudio (deploy-easypanel.sh) ==="

docker compose up -d --build

echo "Deploy concluído."
