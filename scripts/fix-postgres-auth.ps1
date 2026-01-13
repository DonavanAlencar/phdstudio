# ============================================
# PHD STUDIO - Script de Recuperação PostgreSQL
# ============================================
# Este script redefine a senha do PostgreSQL e configura o banco do CRM
# Execute como ADMINISTRADOR (PowerShell)
# ============================================

$PostgresData = "C:\Program Files\PostgreSQL\17\data"
$PostgresBin = "C:\Program Files\PostgreSQL\17\bin"
$ServiceName = "postgresql-x64-17"
$NewPassword = "PhdCrm@2024!Strong#Pass"
$DbUser = "phd_crm_user"
$DbName = "phd_crm"

function Write-Step($msg) { Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-Done($msg) { Write-Host "[DONE] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red }

# 1. Verificar se é Admin
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Fail "ERRO: Este script precisa ser executado como ADMINISTRADOR."
    exit 1
}

# 2. Parar o serviço
Write-Step "Parando serviço PostgreSQL..."
Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue
Write-Done "Serviço parado"

# 3. Backup e Modificar pg_hba.conf para TRUST
Write-Step "Configurando acesso temporário (trust)..."
$hbaFile = Join-Path $PostgresData "pg_hba.conf"
$hbaBackup = Join-Path $PostgresData "pg_hba.conf.bak"

if (!(Test-Path $hbaBackup)) {
    Copy-Item $hbaFile $hbaBackup
}

# Criar um pg_hba.conf que permite tudo localmente sem senha
$trustConfig = @"
# Local trust config
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
local   all             all                                     trust
"@
$trustConfig | Out-File -FilePath $hbaFile -Encoding ASCII

Write-Done "Acesso TRUST configurado"

# 4. Iniciar serviço novamente
Write-Step "Iniciando serviço em modo de manutenção..."
Start-Service -Name $ServiceName
Start-Sleep -Seconds 5

# 5. Resetar senhas via psql
Write-Step "Resetando senhas e criando banco de dados..."
$psql = Join-Path $PostgresBin "psql.exe"

# Comandos SQL
$sqlCommands = @"
ALTER USER postgres WITH PASSWORD '$NewPassword';
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DbUser') THEN
        CREATE USER $DbUser WITH PASSWORD '$NewPassword' SUPERUSER;
    ELSE
        ALTER USER $DbUser WITH PASSWORD '$NewPassword' SUPERUSER;
    END IF;
END
\$\$;
SELECT 'CREATE DATABASE $DbName' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DbName')\gexec
"@

$sqlCommands | & $psql -U postgres -d postgres

Write-Done "Senhas atualizadas e banco verificado"

# 6. Restaurar pg_hba.conf
Write-Step "Restaurando configurações de segurança..."
Copy-Item $hbaBackup $hbaFile -Force
Write-Done "Configurações restauradas"

# 7. Reiniciar serviço final
Write-Step "Reiniciando serviço PostgreSQL..."
Restart-Service -Name $ServiceName
Write-Done "Tudo pronto!"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " SUCESSO: Senha do CRM definida para: " -ForegroundColor White
Write-Host " $NewPassword" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
