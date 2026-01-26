# Iniciar API e Frontend
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PHD STUDIO - Iniciando ServiÃ§os" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar API em background
Write-Host "Iniciando API..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-api.ps1" -WindowStyle Normal

# Aguardar um pouco para API iniciar
Start-Sleep -Seconds 3

# Iniciar Frontend em background
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-frontend.ps1" -WindowStyle Normal

Write-Host ""
Write-Host "ServiÃ§os iniciados!" -ForegroundColor Green
Write-Host "  API:      http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair (os serviÃ§os continuarÃ£o rodando)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
