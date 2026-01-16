# Script de Configuração Local do Banco de Dados PostgreSQL (CRM)
# Este script cria o banco de dados e o usuário necessários para o CRM rodar localmente.

Write-Host "=== Configurando Banco de Dados PostgreSQL Local (CRM) ===" -ForegroundColor Yellow

$DatabaseName = "phd_crm"
$UserName = "phd_crm_user"
$Password = "PhdCrm@2024!Strong#Pass"

# 1. Verificar se o comando 'psql' está no PATH
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "Erro: O comando 'psql' não foi encontrado no PATH." -ForegroundColor Red
    Write-Host "Certifique-se de que o PostgreSQL está instalado e o diretório 'bin' está no PATH do sistema." -ForegroundColor Cyan
    Write-Host "Normalmente está em: C:\Program Files\PostgreSQL\<versão>\bin" -ForegroundColor Gray
    exit 1
}

# 2. Executar comandos SQL
Write-Host "Criando banco de dados e usuário..." -ForegroundColor Blue

$SQL = @"
-- Criar usuário se não existir
DO
`$`$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$UserName') THEN
      CREATE USER $UserName WITH PASSWORD '$Password';
   END IF;
END
`$`$;

-- Criar banco de dados se não existir
SELECT 'CREATE DATABASE $DatabaseName OWNER $UserName'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DatabaseName')\gexec

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE $DatabaseName TO $UserName;
"@

# Salvar SQL em um arquivo temporário para execução
$TempFile = New-TemporaryFile
$SQL | Out-File -FilePath $TempFile -Encoding utf8

Write-Host "Por favor, insira a senha do usuário 'postgres' se solicitado:" -ForegroundColor White
psql -U postgres -f $TempFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBanco de dados '$DatabaseName' configurado com sucesso!" -ForegroundColor Green
    Write-Host "Usuário '$UserName' pronto para uso." -ForegroundColor Green
    Write-Host "`nAtualizando arquivo api\.env com as configurações..." -ForegroundColor Blue
    
    # Atualizar api\.env com as configurações do PostgreSQL
    $envPath = "api\.env"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath
        $envContent = $envContent -replace 'CRM_DB_HOST=.*', 'CRM_DB_HOST=localhost'
        $envContent = $envContent -replace 'CRM_DB_PORT=.*', 'CRM_DB_PORT=5432'
        $envContent = $envContent -replace 'CRM_DB_USER=.*', "CRM_DB_USER=$UserName"
        $envContent = $envContent -replace 'CRM_DB_PASSWORD=.*', "CRM_DB_PASSWORD=$Password"
        $envContent = $envContent -replace 'CRM_DB_NAME=.*', "CRM_DB_NAME=$DatabaseName"
        
        # Adicionar se não existir
        if (-not ($envContent -match 'CRM_DB_HOST')) {
            $envContent += "`nCRM_DB_HOST=localhost"
        }
        if (-not ($envContent -match 'CRM_DB_PORT')) {
            $envContent += "`nCRM_DB_PORT=5432"
        }
        if (-not ($envContent -match 'CRM_DB_USER')) {
            $envContent += "`nCRM_DB_USER=$UserName"
        }
        if (-not ($envContent -match 'CRM_DB_PASSWORD')) {
            $envContent += "`nCRM_DB_PASSWORD=$Password"
        }
        if (-not ($envContent -match 'CRM_DB_NAME')) {
            $envContent += "`nCRM_DB_NAME=$DatabaseName"
        }
        
        $envContent | Set-Content $envPath
        Write-Host "Arquivo api\.env atualizado!" -ForegroundColor Green
    }
} else {
    Write-Host "`nFalha ao configurar o banco de dados. Verifique a senha do postgres e tente novamente." -ForegroundColor Red
}

Remove-Item $TempFile
