# Script de Instalação do PostgreSQL para Windows
# Este script usa o winget para instalar o PostgreSQL Server.

Write-Host "=== Iniciando Instalação do PostgreSQL Server ===" -ForegroundColor Yellow

# 1. Instalar via winget
Write-Host "Buscando e instalando PostgreSQL via winget..." -ForegroundColor Blue
winget install --id PostgreSQL.PostgreSQL --accept-package-agreements --accept-source-agreements

if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Houve um problema na instalação ou o PostgreSQL já está instalado." -ForegroundColor Yellow
}

# 2. Instruções de Configuração
Write-Host "`n=== Próximos Passos de Configuração ===" -ForegroundColor Yellow
Write-Host "O instalador do PostgreSQL geralmente abre um assistente de configuração." -ForegroundColor Gray
Write-Host "IMPORTANTE: Anote a senha do usuário 'postgres' que você definir!" -ForegroundColor Red

Write-Host "`nApós a instalação, execute o script 'configure-postgres.ps1' para criar o banco de dados do CRM." -ForegroundColor Cyan

# 3. Verificar Serviço
Write-Host "`nVerificando status do serviço PostgreSQL..." -ForegroundColor Blue
Get-Service postgresql* -ErrorAction SilentlyContinue | Format-Table -AutoSize
