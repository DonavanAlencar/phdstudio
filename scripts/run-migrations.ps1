# ============================================
# Script para executar migrations do PostgreSQL
# ============================================
# Este script executa todas as migrations do banco de dados
# Pode ser executado independentemente do deploy principal

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresHost,
    
    [Parameter(Mandatory=$false)]
    [int]$PostgresPort = 5432,
    
    [Parameter(Mandatory=$true)]
    [string]$PostgresUser,
    
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword,
    
    [Parameter(Mandatory=$true)]
    [string]$PostgresDatabase
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green "✓ $args" }
function Write-Error { Write-ColorOutput Red "✗ $args" }
function Write-Info { Write-ColorOutput Cyan "ℹ $args" }

Write-Info "============================================"
Write-Info "  Executando Migrations PostgreSQL"
Write-Info "============================================"
Write-Info ""

# Verificar se psql está disponível
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Error "psql não encontrado no PATH"
    Write-Error "Por favor, instale o PostgreSQL Client ou use Docker para executar migrations"
    exit 1
}

# Verificar conexão
Write-Info "Verificando conexão com PostgreSQL..."
$env:PGPASSWORD = $PostgresPassword
$testConnection = & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d postgres -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "Não foi possível conectar ao PostgreSQL"
    Write-Error $testConnection
    exit 1
}

Write-Success "Conexão com PostgreSQL OK"
Write-Info ""

# Criar banco se não existir
Write-Info "Verificando se o banco de dados existe..."
$dbCheck = & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$PostgresDatabase';" 2>&1

if ($dbCheck -notmatch "1") {
    Write-Info "Criando banco de dados $PostgresDatabase..."
    & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d postgres -c "CREATE DATABASE $PostgresDatabase;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Banco de dados criado"
    } else {
        Write-Error "Falha ao criar banco de dados"
        exit 1
    }
} else {
    Write-Info "Banco de dados já existe"
}

Write-Info ""

# Executar migrations em ordem
$migrationFiles = @(
    "api\db\migrations\001_init_schema.sql",
    "api\db\migrations\002_products.sql",
    "api\db\migrations\003_messaging_custom_fields_timeline.sql",
    "api\db\migrations\004_pipelines_deals_automation_integrations_files_profile.sql"
)

foreach ($migration in $migrationFiles) {
    if (Test-Path $migration) {
        Write-Info "Executando: $(Split-Path $migration -Leaf)"
        $env:PGPASSWORD = $PostgresPassword
        $result = & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d $PostgresDatabase -f $migration 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migration $(Split-Path $migration -Leaf) executada"
        } else {
            # Alguns erros são esperados (ex: tabela já existe)
            if ($result -match "already exists" -or $result -match "duplicate key") {
                Write-Info "Migration $(Split-Path $migration -Leaf) já foi executada (ignorando)"
            } else {
                Write-Error "Erro ao executar migration $(Split-Path $migration -Leaf)"
                Write-Error $result
            }
        }
    } else {
        Write-Error "Arquivo de migration não encontrado: $migration"
    }
}

Write-Info ""
Write-Info "============================================"
Write-Success "Migrations concluídas!"
Write-Info "============================================"

