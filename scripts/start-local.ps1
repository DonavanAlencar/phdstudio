# Script para Execução Local (Sem Docker) - PHD Studio
# Este script inicia o Frontend e o Backend simultaneamente no Windows.

Write-Host "=== Iniciando PHD Studio Localmente (Sem Docker) ===" -ForegroundColor Yellow

# 1. Configuração da API
Write-Host "`n[1/3] Preparando API Backend..." -ForegroundColor Blue
if (-not (Test-Path "api/node_modules")) {
    Write-Host "Instalando dependências da API..." -ForegroundColor Gray
    cd api
    npm install
    cd ..
}

# 2. Configuração do Frontend
Write-Host "[2/3] Preparando Frontend..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências do Frontend..." -ForegroundColor Gray
    npm install
}

# 3. Iniciando os serviços
Write-Host "`n[3/3] Iniciando serviços..." -ForegroundColor Blue

# Perguntar se deseja iniciar a API (Backend)
$startApi = Read-Host "`nDeseja iniciar a API Backend? (S/N) [N]"
if ($startApi -eq "S" -or $startApi -eq "s") {
    Write-Host "Iniciando Backend em uma nova janela (Porta 3002)..." -ForegroundColor Cyan
    Write-Host "NOTA: A API usa PostgreSQL (CRM + Produtos). Certifique-se de que ele está rodando." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; `$env:API_PORT=3002; npm run dev"
} else {
    Write-Host "API Backend não será iniciada. Apenas o Frontend será executado." -ForegroundColor Gray
}

# Iniciar Frontend na janela atual (porta padrão 5173)
Write-Host "`nIniciando Frontend na janela atual..." -ForegroundColor Cyan
Write-Host "O site estará disponível em: http://localhost:5173" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o Frontend." -ForegroundColor Gray
npm run dev
