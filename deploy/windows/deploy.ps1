# PHD Studio - Deploy automatizado (Windows, sem Docker)
# - Valida pré-requisitos
# - Garante banco de dados (PostgreSQL/MySQL) usando setup-database.ps1
# - Sincroniza arquivos .env centralizados
# - Instala dependências e builda o frontend

param(
    [string]$DbConfigPath,
    [string]$AppConfigPath,
    [switch]$SkipMigrations
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\\..")

if (-not $DbConfigPath) { $DbConfigPath = Join-Path $RepoRoot "deploy/config/windows/db-config.json" }
if (-not $AppConfigPath) { $AppConfigPath = Join-Path $RepoRoot "deploy/config/windows/app-config.json" }

function Write-Log {
    param([string]$Level, [string]$Message)
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "[$ts][$Level] $Message"
}

function Require-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
    } catch {
        throw "Comando obrigatório não encontrado no PATH: $Command"
    }
}

function Load-AppConfig {
    if (-not (Test-Path $AppConfigPath)) {
        throw "Arquivo de configuração da aplicação não encontrado em $AppConfigPath"
    }

    $cfg = Get-Content $AppConfigPath -Raw | ConvertFrom-Json
    $required = @("apiPort","frontendPort","nodeVersion","envFile","envExample")
    foreach ($field in $required) {
        if (-not $cfg.$field) {
            throw "Campo obrigatório ausente no app-config.json: $field"
        }
    }
    return $cfg
}

function Ensure-EnvFile {
    param($cfg)
    $envPath = Join-Path $RepoRoot $cfg.envFile
    $envExample = Join-Path $RepoRoot $cfg.envExample

    if (-not (Test-Path $envPath)) {
        if (Test-Path $envExample) {
            Copy-Item $envExample $envPath
            Write-Log "WARN" "Arquivo de ambiente criado a partir do template. Atualize valores sensíveis em $envPath"
        } else {
            throw "Nenhum arquivo de ambiente encontrado. Crie $envPath (ou $envExample)."
        }
    }

    $destFrontend = Join-Path $RepoRoot ".env"
    $destApi = Join-Path $RepoRoot "api/.env"
    Copy-Item $envPath $destFrontend -Force
    Copy-Item $envPath $destApi -Force
    Write-Log "INFO" "Arquivos .env sincronizados (raiz e api/.env)"
    return $envPath
}

function Parse-DotEnv {
    param([string]$Path)
    $map = @{}
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $kv = $_ -split '=',2
        if ($kv.Length -eq 2) { $map[$kv[0]] = $kv[1] }
    }
    return $map
}

function Validate-EnvVars {
    param($envPath)
    $data = Parse-DotEnv -Path $envPath
    $required = @("CRM_DB_HOST","CRM_DB_PORT","CRM_DB_USER","CRM_DB_PASSWORD","CRM_DB_NAME","PHD_API_KEY","JWT_SECRET","JWT_REFRESH_SECRET")
    foreach ($key in $required) {
        if (-not $data.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($data[$key])) {
            Write-Log "WARN" "Variável obrigatória ausente ou vazia em $envPath: $key"
        }
    }
}

function Check-NodeVersion {
    param($expectedRange)
    $raw = (node -v).TrimStart("v")
    $installed = [version]($raw -replace "[^0-9\\.]", "")
    $min = [version]($expectedRange.TrimStart(">="))
    if ($installed -lt $min) {
        throw "Node.js mínimo $expectedRange exigido; encontrado v$installed"
    }
    Write-Log "INFO" "Node.js OK (v$installed)"
}

function Run-NpmInstall {
    param([string]$Path)
    Push-Location $Path
    try {
        Write-Log "INFO" "Instalando dependências em $Path"
        npm install --no-fund --progress=false | Out-Null
    } finally {
        Pop-Location
    }
}

function Build-Frontend {
    param($cfg)
    if (-not $cfg.buildScript) { return }
    Push-Location $RepoRoot
    try {
        Write-Log "INFO" "Executando build do frontend (${cfg.buildScript})"
        npm run $cfg.buildScript
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "  PHD Studio - Deploy Windows (sem Docker)"
Write-Host "============================================"
Write-Host ""

try {
    Require-Command "node"
    Require-Command "npm"

    $appConfig = Load-AppConfig
    Check-NodeVersion -expectedRange $appConfig.nodeVersion

    $envPath = Ensure-EnvFile -cfg $appConfig
    Validate-EnvVars -envPath $envPath

    $dbScript = Join-Path $RepoRoot "deploy/windows/setup-database.ps1"
    & $dbScript -ConfigPath $DbConfigPath -MigrationsPath (Join-Path $RepoRoot "api/db/migrations") -SkipMigrations:$SkipMigrations

    if ($appConfig.installDependencies) {
        Run-NpmInstall -Path $RepoRoot
        Run-NpmInstall -Path (Join-Path $RepoRoot "api")
    }

    if ($appConfig.runMigrations -and -not $SkipMigrations) {
        Write-Log "INFO" "Migrations já executadas via setup-database.ps1"
    }

    Build-Frontend -cfg $appConfig

    Write-Host ""
    Write-Log "INFO" "Deploy concluído. Inicie os serviços com start-all.ps1 ou scripts equivalentes."
    Write-Log "INFO" "API: porta ${($appConfig.apiPort)} | Frontend: porta ${($appConfig.frontendPort)}"
} catch {
    Write-Log "ERROR" $_.Exception.Message
    exit 1
}
