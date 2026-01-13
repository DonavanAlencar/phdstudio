# Script de Configuração Local do Banco de Dados MySQL
# Este script cria o banco de dados e o usuário necessários para a aplicação rodar localmente.

Write-Host "=== Configurando Banco de Dados MySQL Local ===" -ForegroundColor Yellow

$DatabaseName = "wordpress_db"
$UserName = "wp_user"
$Password = "WpUser@2024!Strong#Pass"

# 1. Verificar se o comando 'mysql' está no PATH
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Host "Erro: O comando 'mysql' não foi encontrado no PATH." -ForegroundColor Red
    Write-Host "Certifique-se de que o MySQL está instalado e o diretório 'bin' está no PATH do sistema." -ForegroundColor Cyan
    exit 1
}

# 2. Executar comandos SQL
Write-Host "Criando banco de dados e usuário..." -ForegroundColor Blue

$SQL = @"
CREATE DATABASE IF NOT EXISTS $DatabaseName;
CREATE USER IF NOT EXISTS '$UserName'@'localhost' IDENTIFIED BY '$Password';
GRANT ALL PRIVILEGES ON $DatabaseName.* TO '$UserName'@'localhost';
FLUSH PRIVILEGES;
"@

# Salvar SQL em um arquivo temporário para execução
$TempFile = New-TemporaryFile
$SQL | Out-File -FilePath $TempFile -Encoding utf8

Write-Host "Por favor, insira a senha do ROOT do MySQL se solicitado:" -ForegroundColor White
mysql -u root -p --execute="source $TempFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBanco de dados '$DatabaseName' configurado com sucesso!" -ForegroundColor Green
    Write-Host "Usuário '$UserName' pronto para uso." -ForegroundColor Green
} else {
    Write-Host "`nFalha ao configurar o banco de dados. Verifique a senha do root e tente novamente." -ForegroundColor Red
}

Remove-Item $TempFile
