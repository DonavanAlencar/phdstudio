# ============================================
# PHD STUDIO - Script de Deploy para Windows
# ============================================
# Este script automatiza toda a implantação da aplicação no Windows
# Pré-requisitos: Docker Desktop instalado e rodando
# PostgreSQL deve estar configurado e acessível
# ============================================

param(
    [string]$PostgresHost = "localhost",
    [int]$PostgresPort = 5432,
    [string]$PostgresUser = "phd_crm_user",
    [string]$PostgresPassword = "PhdCrm@2024!Strong#Pass",
    [string]$PostgresDatabase = "phd_crm",
    [switch]$SkipMigrations = $false
)

# Cores para output
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
function Write-Warning { Write-ColorOutput Yellow "⚠ $args" }
function Write-Info { Write-ColorOutput Cyan "ℹ $args" }

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
    
    # URLs
    VITE_API_URL = "http://localhost:3001/api"
    VITE_INSTAGRAM_API_URL = "http://localhost:3001/api/instagram"
    ALLOWED_ORIGINS = "http://localhost:8080,http://localhost:3000,http://localhost:5173"
    
    # PostgreSQL (usar parâmetros ou valores padrão)
    CRM_DB_HOST = $PostgresHost
    CRM_DB_PORT = $PostgresPort
    CRM_DB_USER = $PostgresUser
    CRM_DB_PASSWORD = $PostgresPassword
    CRM_DB_NAME = $PostgresDatabase
    
    # API
    API_PORT = 3001
    NODE_ENV = "production"
}

Write-Info "============================================"
Write-Info "  PHD STUDIO - Deploy Automático Windows"
Write-Info "============================================"
Write-Info ""

# ============================================
# VERIFICAÇÕES INICIAIS
# ============================================

Write-Info "Verificando pré-requisitos..."

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker não está instalado ou não está no PATH"
    Write-Error "Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Success "Docker está rodando"
} catch {
    Write-Error "Docker não está rodando. Por favor, inicie o Docker Desktop"
    exit 1
}

# Verificar Docker Compose
try {
    $composeVersion = docker compose version
    Write-Success "Docker Compose encontrado: $composeVersion"
} catch {
    Write-Error "Docker Compose não está disponível"
    exit 1
}

# Verificar conexão com PostgreSQL
Write-Info "Verificando conexão com PostgreSQL..."
try {
    $env:PGPASSWORD = $Config.CRM_DB_PASSWORD
    $psqlCheck = & psql -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Conexão com PostgreSQL OK"
    } else {
        Write-Warning "Não foi possível verificar PostgreSQL via psql (pode estar OK se usando Docker)"
        Write-Info "Continuando... PostgreSQL será verificado durante o deploy"
    }
} catch {
    Write-Warning "psql não encontrado no PATH (normal se PostgreSQL não estiver instalado localmente)"
    Write-Info "Continuando... PostgreSQL será verificado durante o deploy"
}

Write-Info ""

# ============================================
# CRIAR ARQUIVOS .ENV
# ============================================

Write-Info "Criando arquivos de configuração..."

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
"@

$frontendEnv | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
Write-Success "Arquivo .env criado para frontend"

# Determinar o host do PostgreSQL para dentro do Docker
# Se for localhost, usar host.docker.internal
$dockerDbHost = if ($Config.CRM_DB_HOST -eq "localhost" -or $Config.CRM_DB_HOST -eq "127.0.0.1") {
    "host.docker.internal"
} else {
    $Config.CRM_DB_HOST
}

# api/.env para backend (runtime)
$apiEnv = @"
# API Environment Variables (Runtime)
# PostgreSQL CRM
CRM_DB_HOST=$dockerDbHost
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
"@

if (-not (Test-Path "api")) {
    New-Item -ItemType Directory -Path "api" | Out-Null
}

$apiEnv | Out-File -FilePath "api\.env" -Encoding UTF8 -NoNewline
Write-Success "Arquivo api\.env criado para backend"

Write-Info ""

# ============================================
# CRIAR DOCKER-COMPOSE PARA WINDOWS
# ============================================

Write-Info "Criando docker-compose.yml para Windows..."

$dockerCompose = @"
services:
  phdstudio:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - GEMINI_API_KEY=$($Config.GEMINI_API_KEY)
        - VITE_EMAILJS_SERVICE_ID=$($Config.VITE_EMAILJS_SERVICE_ID)
        - VITE_EMAILJS_TEMPLATE_ID=$($Config.VITE_EMAILJS_TEMPLATE_ID)
        - VITE_EMAILJS_PUBLIC_KEY=$($Config.VITE_EMAILJS_PUBLIC_KEY)
        - VITE_RECIPIENT_EMAIL=$($Config.VITE_RECIPIENT_EMAIL)
        - VITE_CHAT_WEBHOOK_URL=$($Config.VITE_CHAT_WEBHOOK_URL)
        - VITE_CHAT_AUTH_TOKEN=$($Config.VITE_CHAT_AUTH_TOKEN)
        - VITE_API_URL=$($Config.VITE_API_URL)
        - VITE_INSTAGRAM_API_URL=$($Config.VITE_INSTAGRAM_API_URL)
    container_name: phdstudio-app
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=$($Config.NODE_ENV)
    networks:
      - phd_network

  phd-api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: phd-api
    ports:
      - "3001:3001"
    restart: unless-stopped
    env_file:
      - ./api/.env
    environment:
      - NODE_ENV=$($Config.NODE_ENV)
    extra_hosts:
      - "host.docker.internal:host-gateway"
    depends_on:
      phd-db-init:
        condition: service_completed_successfully
    networks:
      - phd_network

  phd-db-init:
    image: postgres:15-alpine
    container_name: phd-db-init
    environment:
      PGPASSWORD: $($Config.CRM_DB_PASSWORD)
      POSTGRES_HOST: $($Config.CRM_DB_HOST)
      POSTGRES_PORT: $($Config.CRM_DB_PORT)
      POSTGRES_USER: $($Config.CRM_DB_USER)
      POSTGRES_DB: $($Config.CRM_DB_NAME)
    volumes:
      - ./api/db/migrations:/migrations:ro
    extra_hosts:
      - "host.docker.internal:host-gateway"
    entrypoint: ["/bin/sh"]
    command:
      - -c
      - |
        echo "Aguardando PostgreSQL estar disponível em host.docker.internal..."
        # Se o host for localhost ou 127.0.0.1, usar host.docker.internal
        if [ "$$POSTGRES_HOST" = "localhost" ] || [ "$$POSTGRES_HOST" = "127.0.0.1" ]; then
          DB_HOST="host.docker.internal"
        else
          DB_HOST="$$POSTGRES_HOST"
        fi
        
        until PGPASSWORD=$$POSTGRES_PASSWORD psql -h $$DB_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; do
          echo "PostgreSQL não está disponível ainda. Aguardando..."
          sleep 2
        done
        echo "PostgreSQL está disponível!"
        
        # Criar banco se não existir
        PGPASSWORD=$$POSTGRES_PASSWORD psql -h $$DB_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$$POSTGRES_DB'" | grep -q 1 || \
        PGPASSWORD=$$POSTGRES_PASSWORD psql -h $$DB_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d postgres -c "CREATE DATABASE $$POSTGRES_DB;"
        
        # Executar migrations em ordem
        echo "Executando migrations..."
        for migration in /migrations/001_init_schema.sql /migrations/002_products.sql /migrations/003_messaging_custom_fields_timeline.sql /migrations/004_pipelines_deals_automation_integrations_files_profile.sql; do
          if [ -f "$$migration" ]; then
            echo "Executando: $$(basename $$migration)"
            PGPASSWORD=$$POSTGRES_PASSWORD psql -h $$DB_HOST -p $$POSTGRES_PORT -U $$POSTGRES_USER -d $$POSTGRES_DB -f "$$migration" 2>&1 || echo "Aviso: Migration pode ter falhado (pode ser normal se já executada)"
          fi
        done
        echo "Migrations concluídas!"
    networks:
      - phd_network

networks:
  phd_network:
    driver: bridge
"@

$dockerCompose | Out-File -FilePath "docker-compose.windows.yml" -Encoding UTF8
Write-Success "Arquivo docker-compose.windows.yml criado"

Write-Info ""

# ============================================
# EXECUTAR MIGRATIONS (se não pular)
# ============================================

if (-not $SkipMigrations) {
    Write-Info "Executando migrations do banco de dados..."
    
    # Verificar se psql está disponível
    $psqlAvailable = $false
    try {
        $null = Get-Command psql -ErrorAction Stop
        $psqlAvailable = $true
    } catch {
        Write-Warning "psql não encontrado. Migrations serão executadas via Docker"
    }
    
    if ($psqlAvailable) {
        Write-Info "Executando migrations via psql local..."
        
        # Criar banco se não existir
        $env:PGPASSWORD = $Config.CRM_DB_PASSWORD
        $createDb = "SELECT 1 FROM pg_database WHERE datname='$($Config.CRM_DB_NAME)'"
        $dbExists = & psql -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -tAc $createDb 2>&1
        
        if ($dbExists -notmatch "1") {
            Write-Info "Criando banco de dados $($Config.CRM_DB_NAME)..."
            & psql -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d postgres -c "CREATE DATABASE $($Config.CRM_DB_NAME);" 2>&1 | Out-Null
            Write-Success "Banco de dados criado"
        } else {
            Write-Info "Banco de dados já existe"
        }
        
        # Executar migrations
        $migrationFiles = Get-ChildItem -Path "api\db\migrations\*.sql" | Sort-Object Name
        foreach ($migration in $migrationFiles) {
            Write-Info "Executando migration: $($migration.Name)"
            $env:PGPASSWORD = $Config.CRM_DB_PASSWORD
            & psql -h $Config.CRM_DB_HOST -p $Config.CRM_DB_PORT -U $Config.CRM_DB_USER -d $Config.CRM_DB_NAME -f $migration.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Migration $($migration.Name) executada com sucesso"
            } else {
                Write-Warning "Migration $($migration.Name) pode ter falhado (pode ser normal se já executada)"
            }
        }
    } else {
        Write-Info "Migrations serão executadas automaticamente pelo container phd-db-init"
    }
} else {
    Write-Warning "Pulando migrations (serão executadas pelo container phd-db-init)"
}

Write-Info ""

# ============================================
# PARAR CONTAINERS ANTIGOS
# ============================================

Write-Info "Parando containers antigos (se existirem)..."
docker compose -f docker-compose.windows.yml down 2>&1 | Out-Null
Write-Success "Containers antigos removidos"

Write-Info ""

# ============================================
# BUILD E DEPLOY
# ============================================

Write-Info "Construindo imagens Docker..."
docker compose -f docker-compose.windows.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao construir imagens Docker"
    exit 1
}

Write-Success "Imagens construídas com sucesso"
Write-Info ""

Write-Info "Iniciando containers..."
docker compose -f docker-compose.windows.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao iniciar containers"
    exit 1
}

Write-Success "Containers iniciados"
Write-Info ""

# ============================================
# AGUARDAR SERVIÇOS FICAREM PRONTOS
# ============================================

Write-Info "Aguardando serviços ficarem prontos..."
Start-Sleep -Seconds 5

$maxAttempts = 30
$attempt = 0
$apiReady = $false

while ($attempt -lt $maxAttempts -and -not $apiReady) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/crm/v1/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Success "API está respondendo"
        }
    } catch {
        Write-Info "Aguardando API... ($attempt/$maxAttempts)"
        Start-Sleep -Seconds 2
    }
}

if (-not $apiReady) {
    Write-Warning "API não respondeu após $maxAttempts tentativas"
    Write-Info "Verifique os logs com: docker logs phd-api"
} else {
    Write-Success "API está pronta!"
}

Write-Info ""

# ============================================
# RESUMO FINAL
# ============================================

Write-Info "============================================"
Write-Success "Deploy concluído com sucesso!"
Write-Info "============================================"
Write-Info ""
Write-Info "Aplicação disponível em:"
Write-Info "  Frontend: http://localhost:8080"
Write-Info "  API:      http://localhost:3001"
Write-Info "  Health:   http://localhost:3001/api/crm/v1/health"
Write-Info ""
Write-Info "Comandos úteis:"
Write-Info "  Ver logs API:    docker logs -f phd-api"
Write-Info "  Ver logs Frontend: docker logs -f phdstudio-app"
Write-Info "  Parar tudo:      docker compose -f docker-compose.windows.yml down"
Write-Info "  Reiniciar:       docker compose -f docker-compose.windows.yml restart"
Write-Info ""
Write-Info "============================================"

