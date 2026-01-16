# Script de Deploy Local para PHD Studio (Windows/PowerShell)
# Este script automatiza o build e a execução dos containers locais no Windows.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..\\..")
$ComposeFile = Join-Path $RootDir "deploy/docker/config/docker-compose.local.yml"
$EnvFile = Join-Path $RootDir "deploy/config/shared/.env"

Write-Host "=== Implantando PHD Studio Localmente (Windows) ===" -ForegroundColor Yellow

# 1. Verificar se os arquivos de ambiente existem
if (-not (Test-Path $EnvFile)) {
    $envTemplate = "$EnvFile.example"
    if (Test-Path $envTemplate) {
        Copy-Item $envTemplate $EnvFile
        Write-Host "Arquivo $($EnvFile) criado a partir do template. Atualize os valores sensíveis." -ForegroundColor Yellow
    } else {
        Write-Host "Erro: Template de env não encontrado em $envTemplate" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path (Join-Path $RootDir "env.dev"))) {
    Write-Host "Erro: Arquivo env.dev não encontrado!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $RootDir "api/env.dev"))) {
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
docker compose -f $ComposeFile down

# 4. Subir novos containers
Write-Host "Subindo containers e realizando build..." -ForegroundColor Yellow
docker compose -f $ComposeFile up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Implantação Concluída com Sucesso! ===" -ForegroundColor Green
    Write-Host "Acesse:"
    Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "API Health: http://localhost:3001/api/crm/v1/health" -ForegroundColor Cyan
    Write-Host "`nComandos úteis:"
    Write-Host "Ver logs: docker compose -f $ComposeFile logs -f"
    Write-Host "Parar:    docker compose -f $ComposeFile down"
} else {
    Write-Host "`nFalha na implantação. Verifique os erros acima." -ForegroundColor Red
}
