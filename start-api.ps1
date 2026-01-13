# Iniciar API Node.js
Write-Host "Iniciando API na porta 3001..." -ForegroundColor Cyan
Set-Location api
$env:NODE_ENV = "production"
node server.js
