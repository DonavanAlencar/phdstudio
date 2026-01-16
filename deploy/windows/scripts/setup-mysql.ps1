# Script de Instalação e Configuração do MySQL para Windows
# Este script usa o winget para instalar o MySQL Server e configura o banco de dados inicial.

Write-Host "=== Iniciando Instalação do MySQL Server ===" -ForegroundColor Yellow

# 1. Tentar instalar via winget
Write-Host "Buscando e instalando MySQL via winget..." -ForegroundColor Blue
winget install --id Oracle.MySQL --accept-package-agreements --accept-source-agreements

if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Houve um problema na instalação ou o MySQL já está instalado." -ForegroundColor Yellow
}

# 2. Instruções de Configuração
Write-Host "`n=== Próximos Passos de Configuração ===" -ForegroundColor Yellow
Write-Host "O instalador do MySQL geralmente abre um assistente de configuração." -ForegroundColor Gray
Write-Host "Se você já tem o MySQL instalado, execute estes comandos no seu terminal MySQL (root):" -ForegroundColor White

Write-Host "`nCREATE DATABASE IF NOT EXISTS wordpress_db;" -ForegroundColor Cyan
Write-Host "CREATE USER IF NOT EXISTS 'wp_user'@'localhost' IDENTIFIED BY 'WpUser@2024!Strong#Pass';" -ForegroundColor Cyan
Write-Host "GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';" -ForegroundColor Cyan
Write-Host "FLUSH PRIVILEGES;" -ForegroundColor Cyan

Write-Host "`n[DICA] Você pode usar o MySQL Workbench ou a linha de comando 'mysql -u root -p' para isso." -ForegroundColor Gray

# 3. Verificar Serviço
Write-Host "`nVerificando status do serviço MySQL..." -ForegroundColor Blue
Get-Service MySQL* -ErrorAction SilentlyContinue | Format-Table -AutoSize
