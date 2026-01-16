# PHD Studio - Validação e provisionamento de banco (Windows)
# - Suporta PostgreSQL e MySQL
# - Cria banco/usuário se não existir e executa migrations do PostgreSQL

param(
    [string]$ConfigPath,
    [string]$MigrationsPath,
    [switch]$SkipMigrations
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\\..")

if (-not $ConfigPath) {
    $ConfigPath = Join-Path $RepoRoot "deploy/config/windows/db-config.json"
}

if (-not $MigrationsPath) {
    $MigrationsPath = Join-Path $RepoRoot "api/db/migrations"
}

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
        throw "Comando obrigatório não encontrado: $Command"
    }
}

function Load-DbConfig {
    if (-not (Test-Path $ConfigPath)) {
        throw "Arquivo de configuração não encontrado em $ConfigPath"
    }

    $raw = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    $required = @("engine","host","port","database","user","password")
    foreach ($field in $required) {
        if (-not $raw.$field) {
            throw "Campo obrigatório ausente em db-config.json: $field"
        }
    }
    return $raw
}

$script:createdDb = $false
$script:createdUser = $false
$script:provisionedEngine = ""

function Invoke-PostgresMigrations {
    param($cfg)

    if ($SkipMigrations) {
        Write-Log "INFO" "Migrations ignoradas (--SkipMigrations habilitado)"
        return
    }

    if (-not (Test-Path $MigrationsPath)) {
        Write-Log "WARN" "Diretório de migrations não encontrado: $MigrationsPath"
        return
    }

    $env:PGPASSWORD = $cfg.password
    $files = Get-ChildItem -Path $MigrationsPath -Filter "*.sql" | Sort-Object Name
    foreach ($file in $files) {
        Write-Log "INFO" "Executando migration: $($file.Name)"
        $result = & psql -h $cfg.host -p $cfg.port -U $cfg.user -d $cfg.database -f $file.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            if ($result -match "already exists" -or $result -match "duplicate key") {
                Write-Log "WARN" "Migration já aplicada ou idempotente: $($file.Name)"
                continue
            }
            throw "Falha ao executar migration $($file.Name): $result"
        }
    }
    Write-Log "INFO" "Migrations concluídas para PostgreSQL"
}

function Invoke-PostgresProvision {
    param($cfg)
    $script:provisionedEngine = "postgres"
    Require-Command "psql"

    $adminUser = $cfg.adminUser
    if (-not $adminUser) { $adminUser = $cfg.user }
    $adminPassword = $cfg.adminPassword
    if (-not $adminPassword) { $adminPassword = $cfg.password }

    $env:PGPASSWORD = $adminPassword
    $connection = & psql -h $cfg.host -p $cfg.port -U $adminUser -d postgres -tAc "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Não foi possível conectar ao PostgreSQL com o usuário administrativo (${adminUser}): $connection"
    }
    Write-Log "INFO" "Conexão administrativa ao PostgreSQL validada"

    $dbExists = & psql -h $cfg.host -p $cfg.port -U $adminUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$($cfg.database)';" 2>&1

    if ($dbExists -ne "1") {
        Write-Log "INFO" "Criando usuário e banco PostgreSQL..."
        $createSql = @"
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$($cfg.user)') THEN
      CREATE ROLE $($cfg.user) LOGIN PASSWORD '$($cfg.password)';
   END IF;
END
$$;

SELECT 'CREATE DATABASE $($cfg.database) OWNER $($cfg.user)'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$($cfg.database)')\gexec

GRANT ALL PRIVILEGES ON DATABASE $($cfg.database) TO $($cfg.user);
"@
        & psql -h $cfg.host -p $cfg.port -U $adminUser -d postgres -c $createSql | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Falha ao criar banco ou usuário PostgreSQL" }
        $script:createdDb = $true
        $script:createdUser = $true
        Write-Log "INFO" "Banco e usuário PostgreSQL criados"
    } else {
        Write-Log "INFO" "Banco PostgreSQL já existe; apenas validando usuário"
        $env:PGPASSWORD = $cfg.password
        $userOk = & psql -h $cfg.host -p $cfg.port -U $cfg.user -d $cfg.database -tAc "SELECT 1;" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Usuário configurado não conecta ao banco existente: $userOk"
        }
    }

    Invoke-PostgresMigrations -cfg $cfg
}

function Invoke-MySqlProvision {
    param($cfg)
    $script:provisionedEngine = "mysql"
    Require-Command "mysql"

    $adminUser = $cfg.adminUser
    if (-not $adminUser) { $adminUser = "root" }
    $adminPassword = $cfg.adminPassword
    if (-not $adminPassword) { $adminPassword = $cfg.password }

    $env:MYSQL_PWD = $adminPassword
    $ping = & mysql -h $cfg.host -P $cfg.port -u $adminUser -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Não foi possível conectar ao MySQL com o usuário administrativo (${adminUser}): $ping"
    }
    Write-Log "INFO" "Conexão administrativa ao MySQL validada"

    $sql = @"
CREATE DATABASE IF NOT EXISTS \`$($cfg.database)\`;
CREATE USER IF NOT EXISTS '$($cfg.user)'@'%' IDENTIFIED BY '$($cfg.password)';
GRANT ALL PRIVILEGES ON \`$($cfg.database)\`.* TO '$($cfg.user)'@'%';
FLUSH PRIVILEGES;
"@

    & mysql -h $cfg.host -P $cfg.port -u $adminUser -e $sql 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar banco/usuário MySQL" }

    $script:createdDb = $true
    $script:createdUser = $true
    Write-Log "INFO" "Banco e usuário MySQL garantidos"

    $env:MYSQL_PWD = $cfg.password
    $conn = & mysql -h $cfg.host -P $cfg.port -u $cfg.user $cfg.database -e "SELECT DATABASE();" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao validar conexão com usuário de aplicação no MySQL: $conn"
    }
    Write-Log "WARN" "Nenhuma migration específica para MySQL foi localizada; apenas schema inicial foi garantido."
}

try {
    $config = Load-DbConfig
    if (-not $PSBoundParameters.ContainsKey('MigrationsPath') -and $config.migrationDir) {
        $MigrationsPath = Join-Path $RepoRoot $config.migrationDir
    }
    switch ($config.engine.ToLower()) {
        "postgres" { Invoke-PostgresProvision -cfg $config }
        "mysql"    { Invoke-MySqlProvision -cfg $config }
        default    { throw "Engine de banco de dados não suportada: $($config.engine)" }
    }

    Write-Log "INFO" "Banco validado com sucesso para engine '$($config.engine)'"
} catch {
    Write-Log "ERROR" $_.Exception.Message
    if ($script:createdDb -and $script:provisionedEngine -eq "postgres" -and $null -ne $config -and $config.rollbackOnFailure -ne $false) {
        try {
            $adminUser = if ($config.adminUser) { $config.adminUser } else { $config.user }
            $env:PGPASSWORD = if ($config.adminPassword) { $config.adminPassword } else { $config.password }
            psql -h $config.host -p $config.port -U $adminUser -d postgres -c "DROP DATABASE IF EXISTS $($config.database);" | Out-Null
            Write-Log "WARN" "Rollback aplicado: banco criado nesta execução foi removido"
        } catch {
            Write-Log "WARN" "Rollback falhou, revise manualmente o banco $($config.database)"
        }
    }
    exit 1
}
