# Quick Start - Windows (Sem Docker)

## Passo a Passo Rápido

### 1. Pré-requisitos
- ✅ Node.js instalado
- ✅ PostgreSQL instalado e rodando

### 2. Executar Deploy

```powershell
.\deploy-windows.ps1
```

Isso irá:
- ✅ Criar arquivos `.env`
- ✅ Executar migrations do PostgreSQL
- ✅ Instalar dependências
- ✅ Fazer build do frontend
- ✅ Criar scripts de inicialização

### 3. Iniciar Serviços

```powershell
.\start-all.ps1
```

Ou iniciar separadamente:

**Terminal 1:**
```powershell
.\start-api.ps1
```

**Terminal 2:**
```powershell
.\start-frontend.ps1
```

### 4. Acessar

- Frontend: http://localhost:8080
- API: http://localhost:3001
- Health: http://localhost:3001/api/crm/v1/health

## Parâmetros Opcionais

```powershell
# Personalizar configurações
.\deploy-windows.ps1 `
    -PostgresHost "localhost" `
    -PostgresPort 5432 `
    -PostgresUser "phd_crm_user" `
    -PostgresPassword "sua_senha" `
    -PostgresDatabase "phd_crm" `
    -ApiPort 3001 `
    -FrontendPort 8080

# Pular migrations (se já executadas)
.\deploy-windows.ps1 -SkipMigrations

# Pular build (se já foi feito)
.\deploy-windows.ps1 -SkipBuild
```

## Troubleshooting Rápido

### Node.js não encontrado
```powershell
node --version  # Verificar se está instalado
# Se não estiver, instale: https://nodejs.org/
```

### PostgreSQL não encontrado
```powershell
# Adicionar ao PATH:
# C:\Program Files\PostgreSQL\16\bin
```

### Porta em uso
```powershell
# Verificar processo
netstat -ano | findstr :3001
# Parar processo
Stop-Process -Id <PID>
```

## Documentação Completa

Para mais detalhes, consulte: `README-DEPLOY-WINDOWS-NATIVE.md`

