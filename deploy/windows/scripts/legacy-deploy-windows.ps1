# PHD STUDIO - Script de Deploy para Windows (SEM DOCKER)
# ============================================
# Este script automatiza toda a implantação da aplicação no Windows
# Pre-requisitos: 
#   - Node.js instalado e no PATH
#   - PostgreSQL instalado e rodando
#   - psql no PATH (ou configurar caminho completo)
# ============================================

param(
    [string]$PostgresHost = "localhost",
    [int]$PostgresPort = 5432,
    [string]$PostgresUser = "phd_crm_user",
    [string]$PostgresPassword = "PhdCrm@2024!Strong#Pass",
    [string]$PostgresDatabase = "phd_crm",
    [switch]$SkipMigrations = $false,
    [switch]$SkipBuild = $false,
    [int]$ApiPort = 3001,
    [int]$FrontendPort = 8080
)

# Cores para output
$ErrorActionPreference = "Continue"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green "[OK] $args" }
function Write-Error { Write-ColorOutput Red "[ERROR] $args" }
function Write-Warning { Write-ColorOutput Yellow "[WARN] $args" }
function Write-Info { Write-ColorOutput Cyan "[INFO] $args" }

# ============================================
# CONFIGURAÇÕES E SECRETS
# ============================================
# IMPORTANTE: Estas são as credenciais e API keys do ambiente
# Podem ser escritas diretamente no código conforme solicitado

$Config = @{
    # API Keys e Secrets
    PHD_API_KEY = "CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
    JWT_SECRET = "phd-jwt-secret-production-2024-change-in-production"
    JWT_REFRESH_SECRET = "phd-refresh-secret-production-2024-change-in-production"
    
    # Gemini AI
    GEMINI_API_KEY = ""  # Preencher se necessário
    
    # EmailJS
    VITE_EMAILJS_SERVICE_ID = ""
    VITE_EMAILJS_TEMPLATE_ID = ""
    VITE_EMAILJS_PUBLIC_KEY = ""
    VITE_RECIPIENT_EMAIL = ""
    
    # Chat Webhook
    VITE_CHAT_WEBHOOK_URL = ""
    VITE_CHAT_AUTH_TOKEN = ""
    
    # Instagram
    INSTAGRAM_ACCESS_TOKEN = "EAAqpKJFj3OIBQZAQu1Qo8TmAoBhP5DEJMaD6W0gjrzZCvoZCj4YEvcwwSVJBAUJlhLohWdIOpQZAyWIMeX7qjcDZCJZCtlkTFW0PnuSDkD7I29VhPv9wMKHjfiSlrLwYAT4pYv0flQduZAy1n43ZBSuCzDpbhicWXHpQvOb8S2QEZBxHqBR6ANLuDlT6VK5bmbEnPnUR80Le2xgZDZD"
    INSTAGRAM_USER_ID = "17841403453191047"
    INSTAGRAM_API_VERSION = "v22.0"
    
    # YouTube API
    VITE_YOUTUBE_API_KEY = "AIzaSyDwZYKOSVF8WqYmukIa_-RltjQpV9HEKvg"
    VITE_YOUTUBE_PLAYLIST_ID = "PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa"
    VITE_YOUTUBE_CHANNEL_ID = "UCxasZ2ECtL0RH4iV6Cjsv3g"

    # Media base URL para fotos dos produtos
    PRODUCTS_MEDIA_BASE_URL = "http://localhost:8080"
   
    # URLs
    VITE_API_URL = "http://localhost:$ApiPort/api"
    VITE_INSTAGRAM_API_URL = "http://localhost:$ApiPort/api/instagram"
    ALLOWED_ORIGINS = "http://localhost:$FrontendPort,http://localhost:3000,http://localhost:5173"
    
    # PostgreSQL
    CRM_DB_HOST = $PostgresHost
    CRM_DB_PORT = $PostgresPort
    CRM_DB_USER = $PostgresUser
    CRM_DB_PASSWORD = $PostgresPassword
    CRM_DB_NAME = $PostgresDatabase
    
    # API
    API_PORT = $ApiPort
    NODE_ENV = "production"
}

Write-Info "============================================"
Write-Info "  PHD STUDIO - Deploy Automatico Windows"
Write-Info "  (SEM DOCKER - Node.js e PostgreSQL nativos)"
Write-Info "============================================"
Write-Info ""

# ============================================
# VERIFICAÇÕES INICIAIS
# ============================================

Write-Info "Verificando pré-requisitos..."

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js encontrado: $nodeVersion"
} catch {
    Write-Error "Node.js não está instalado ou não está no PATH"
    Write-Error "Por favor, instale o Node.js: https://nodejs.org/"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Success "npm encontrado: $npmVersion"
} catch {
    Write-Error "npm não está disponível"
    exit 1
}

# Verificar PostgreSQL (psql)
$psqlPath = $null
$psqlFound = $false

# Tentar encontrar psql no PATH
try {
    $psqlCheck = Get-Command psql -ErrorAction Stop
    $psqlPath = "psql"
    $psqlFound = $true
    Write-Success "psql encontrado no PATH"
} catch {
    # Tentar caminhos comuns do PostgreSQL no Windows
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\16\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\15\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\14\bin\psql.exe",
        "$env:ProgramFiles\PostgreSQL\13\bin\psql.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            $psqlFound = $true
            Write-Success "psql encontrado em: $path"
            break
        }
    }
    
    if (-not $psqlFound) {
        Write-Warning "psql nao encontrado no PATH ou em caminhos comuns"
        Write-Warning "Migrations serao puladas. Execute manualmente se necessario."
    }
}

Write-Info ""

# ============================================
# CRIAR ARQUIVOS .ENV
# ============================================

Write-Info "Criando arquivos de configuracao..."

# .env para frontend (build time)
$frontendEnv = @"
# Frontend Environment Variables (Build Time)
GEMINI_API_KEY=$($Config.GEMINI_API_KEY)
VITE_EMAILJS_SERVICE_ID=$($Config.VITE_EMAILJS_SERVICE_ID)
VITE_EMAILJS_TEMPLATE_ID=$($Config.VITE_EMAILJS_TEMPLATE_ID)
VITE_EMAILJS_PUBLIC_KEY=$($Config.VITE_EMAILJS_PUBLIC_KEY)
VITE_RECIPIENT_EMAIL=$($Config.VITE_RECIPIENT_EMAIL)
VITE_CHAT_WEBHOOK_URL=$($Config.VITE_CHAT_WEBHOOK_URL)
VITE_CHAT_AUTH_TOKEN=$($Config.VITE_CHAT_AUTH_TOKEN)
VITE_API_URL=$($Config.VITE_API_URL)
VITE_INSTAGRAM_API_URL=$($Config.VITE_INSTAGRAM_API_URL)
VITE_YOUTUBE_API_KEY=$($Config.VITE_YOUTUBE_API_KEY)
VITE_YOUTUBE_PLAYLIST_ID=$($Config.VITE_YOUTUBE_PLAYLIST_ID)
VITE_YOUTUBE_CHANNEL_ID=$($Config.VITE_YOUTUBE_CHANNEL_ID)
"@

$frontendEnv | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
Write-Success "Arquivo .env criado para frontend"

# api/.env para backend (runtime)
if (-not (Test-Path "api")) {
    New-Item -ItemType Directory -Path "api" | Out-Null
}

$apiEnv = @"
# API Environment Variables (Runtime)
# PostgreSQL CRM
CRM_DB_HOST=$($Config.CRM_DB_HOST)
CRM_DB_PORT=$($Config.CRM_DB_PORT)
CRM_DB_USER=$($Config.CRM_DB_USER)
CRM_DB_PASSWORD=$($Config.CRM_DB_PASSWORD)
CRM_DB_NAME=$($Config.CRM_DB_NAME)

# API Key
PHD_API_KEY=$($Config.PHD_API_KEY)

# JWT Secrets
JWT_SECRET=$($Config.JWT_SECRET)
JWT_REFRESH_SECRET=$($Config.JWT_REFRESH_SECRET)

# CORS
ALLOWED_ORIGINS=$($Config.ALLOWED_ORIGINS)

# API Port
API_PORT=$($Config.API_PORT)
NODE_ENV=$($Config.NODE_ENV)

# Instagram Feed
INSTAGRAM_ACCESS_TOKEN=$($Config.INSTAGRAM_ACCESS_TOKEN)
INSTAGRAM_USER_ID=$($Config.INSTAGRAM_USER_ID)
INSTAGRAM_API_VERSION=$($Config.INSTAGRAM_API_VERSION)

# Media base para fotos de produtos
PRODUCTS_MEDIA_BASE_URL=$($Config.PRODUCTS_MEDIA_BASE_URL)
"@

$apiEnv | Out-File -FilePath "api\.env" -Encoding UTF8 -NoNewline
Write-Success "Arquivo api\.env criado para backend"

Write-Info ""

# ============================================
# EXECUTAR MIGRATIONS (se não pular)
# ============================================

if (-not $SkipMigrations -and $psqlFound) {
    Write-Info "Executando migrations do banco de dados..."
    
    # Verificar conexao
    Write-Info "Verificando conexao com PostgreSQL..."
    $env:PGPASSWORD = $Config.CRM_DB_PASSWORD
    
    $testConnection = & $psqlPath -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Nao foi possivel conectar ao PostgreSQL: $testConnection"
        Write-Warning "DICA: Verifique se o usuario '$($Config.CRM_DB_USER)' existe e se a senha esta correta no .env"
    } else {
        Write-Success "Conexao com PostgreSQL OK"
        
        # Criar banco se não existir
        Write-Info "Verificando se o banco de dados existe..."
        $dbCheck = & $psqlPath -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$($Config.CRM_DB_NAME)';" 2>&1
        
        if ($dbCheck -notmatch "1") {
            Write-Info "Criando banco de dados $($Config.CRM_DB_NAME)..."
            & $psqlPath -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -c "CREATE DATABASE $($Config.CRM_DB_NAME);" 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Banco de dados criado"
            } else {
                Write-Warning "Falha ao criar banco de dados (pode já existir)"
            }
        } else {
            Write-Info "Banco de dados já existe"
        }
        
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
                $env:PGPASSWORD = $Config.CRM_DB_PASSWORD
                $result = & $psqlPath -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d $Config.CRM_DB_NAME -f $migration 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Migration $(Split-Path $migration -Leaf) executada"
                } else {
                    # Alguns erros são esperados (ex: tabela já existe)
                    if ($result -match "already exists" -or $result -match "duplicate key") {
                        Write-Info "Migration $(Split-Path $migration -Leaf) já foi executada (ignorando)"
                    } else {
                        Write-Warning "Aviso ao executar migration $(Split-Path $migration -Leaf): $result"
                    }
                }
            } else {
                Write-Warning "Arquivo de migration não encontrado: $migration"
            }
        }
        
        Write-Success "Migrations concluidas!"
    }
} else {
    if ($SkipMigrations) {
        Write-Warning "Pulando migrations (flag -SkipMigrations)"
    } else {
        Write-Warning "psql nao encontrado. Migrations nao serao executadas."
        Write-Warning "Execute manualmente: .\scripts\run-migrations.ps1"
    }
}

Write-Info ""

# ============================================
# INSTALAR DEPENDÊNCIAS
# ============================================

Write-Info "Instalando dependências do frontend..."
Set-Location $PSScriptRoot
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao instalar dependências do frontend"
    exit 1
}
Write-Success "Dependências do frontend instaladas"

Write-Info "Instalando dependências da API..."
Set-Location api
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao instalar dependencias da API"
    exit 1
}
Write-Success "Dependencias da API instaladas"

Set-Location $PSScriptRoot
Write-Info ""

# ============================================
# BUILD DO FRONTEND
# ============================================

if (-not $SkipBuild) {
    Write-Info "Fazendo build do frontend..."
    Set-Location $PSScriptRoot
    
    # Carregar variáveis de ambiente para o build
    $env:GEMINI_API_KEY = $Config.GEMINI_API_KEY
    $env:VITE_EMAILJS_SERVICE_ID = $Config.VITE_EMAILJS_SERVICE_ID
    $env:VITE_EMAILJS_TEMPLATE_ID = $Config.VITE_EMAILJS_TEMPLATE_ID
    $env:VITE_EMAILJS_PUBLIC_KEY = $Config.VITE_EMAILJS_PUBLIC_KEY
    $env:VITE_RECIPIENT_EMAIL = $Config.VITE_RECIPIENT_EMAIL
    $env:VITE_CHAT_WEBHOOK_URL = $Config.VITE_CHAT_WEBHOOK_URL
    $env:VITE_CHAT_AUTH_TOKEN = $Config.VITE_CHAT_AUTH_TOKEN
    $env:VITE_API_URL = $Config.VITE_API_URL
    $env:VITE_INSTAGRAM_API_URL = $Config.VITE_INSTAGRAM_API_URL
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao fazer build do frontend"
        exit 1
    }
    Write-Success "Build do frontend concluido"
} else {
    Write-Warning "Pulando build do frontend (flag -SkipBuild)"
}

Write-Info ""

# ============================================
# CRIAR SCRIPTS DE INICIALIZAÇÃO
# ============================================

Write-Info "Criando scripts de inicialização..."

# Script para iniciar API
$startApiScript = @"
# Iniciar API Node.js
Write-Host "Iniciando API na porta $ApiPort..." -ForegroundColor Cyan
Set-Location api
`$env:NODE_ENV = "production"
node server.js
"@

$startApiScript | Out-File -FilePath "start-api.ps1" -Encoding UTF8
Write-Success "Script start-api.ps1 criado"

# Script para iniciar Frontend (usando Vite preview)
$startFrontendScript = @"
# Iniciar Frontend (Vite Preview)
Write-Host "Iniciando Frontend na porta $FrontendPort..." -ForegroundColor Cyan
npm run preview -- --port $FrontendPort --host
"@

$startFrontendScript | Out-File -FilePath "start-frontend.ps1" -Encoding UTF8
Write-Success "Script start-frontend.ps1 criado"

# Script para iniciar ambos
$startAllScript = @"
# Iniciar API e Frontend
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PHD STUDIO - Iniciando Serviços" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar API em background
Write-Host "Iniciando API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "start-api.ps1" -WindowStyle Normal

# Aguardar um pouco para API iniciar
Start-Sleep -Seconds 3

# Iniciar Frontend em background
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "start-frontend.ps1" -WindowStyle Normal

Write-Host ""
Write-Host "Serviços iniciados!" -ForegroundColor Green
Write-Host "  API:      http://localhost:$ApiPort" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair (os serviços continuarão rodando)..." -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@

$startAllScript | Out-File -FilePath "start-all.ps1" -Encoding UTF8
Write-Success "Script start-all.ps1 criado"

Write-Info ""

# ============================================
# RESUMO FINAL
# ============================================

Write-Info "============================================"
Write-Success "Deploy concluido com sucesso!"
Write-Info "============================================"
Write-Info ""
Write-Info "Proximos passos:"
Write-Info ""
Write-Info "1. Iniciar API:"
Write-Info "   .\start-api.ps1"
Write-Info ""
Write-Info "2. Iniciar Frontend (em outro terminal):"
Write-Info "   .\start-frontend.ps1"
Write-Info ""
Write-Info "3. OU iniciar ambos:"
Write-Info "   .\start-all.ps1"
Write-Info ""
Write-Info "URLs:"
Write-Info "  Frontend: http://localhost:$FrontendPort"
Write-Info "  API:      http://localhost:$ApiPort"
Write-Info "  Health:   http://localhost:$ApiPort/api/crm/v1/health"
Write-Info ""
Write-Info "============================================"
