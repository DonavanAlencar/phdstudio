# Script de Deploy Local para PHD Studio (Windows/PowerShell)
# Este script automatiza o build e a execução dos containers locais no Windows.

Write-Host "=== Implantando PHD Studio Localmente (Windows) ===" -ForegroundColor Yellow

# 1. Verificar se os arquivos de ambiente existem
if (-not (Test-Path "env.dev")) {
    Write-Host "Erro: Arquivo env.dev não encontrado!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "api/env.dev")) {
    Write-Host "Erro: Arquivo api/env.dev não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivos de configuração encontrados." -ForegroundColor Green

# 2. Verificar se o Docker está rodando
try {
    docker version > $null 2>&1
} catch {
    Write-Host "Erro: O Docker não parece estar rodando ou não está instalado." -ForegroundColor Red
    Write-Host "Certifique-se de que o Docker Desktop está aberto." -ForegroundColor Cyan
    exit 1
}

# 3. Derrubar containers antigos se existirem
Write-Host "Parando containers antigos..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml down

# 4. Subir novos containers
Write-Host "Subindo containers e realizando build..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Implantação Concluída com Sucesso! ===" -ForegroundColor Green
    Write-Host "Acesse:"
    Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "API Health: http://localhost:3001/api/crm/v1/health" -ForegroundColor Cyan
    Write-Host "`nComandos úteis:"
    Write-Host "Ver logs: docker compose -f docker-compose.local.yml logs -f"
    Write-Host "Parar:    docker compose -f docker-compose.local.yml down"
} else {
    Write-Host "`nFalha na implantação. Verifique os erros acima." -ForegroundColor Red
}
