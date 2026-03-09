# PHD Studio

**Site principal (phdstudio.com.br) é 100% React** — frontend em React/Vite, API em Node.js, sem WordPress no site.

Sistema inclui:
- **Site institucional** (React) com carrosséis, formulários e integrações
- **API REST** para integração com n8n e outros sistemas
- **Banco de dados PostgreSQL** para CRM
- **Carrossel do blog** pode consumir uma API JSON (blog em React, CMS, etc.) ou RSS; configurável por variáveis de ambiente

## 📋 Status Atual

✅ **API REST:** Rodando na porta 3001  
✅ **Banco de Dados:** PostgreSQL configurado  
✅ **Docker:** Configurado e funcionando

## 🚀 Início Rápido

### 1. Testar API REST

```bash
# Health check
curl http://localhost:3001/health

# Listar produtos
curl -X GET http://localhost:3001/api/phd/v1/products \
  -H "X-PHD-API-KEY: sua-api-key"
```

### 2. Executar Testes Automatizados

```bash
PHD_API_KEY=sua-api-key ./scripts/test-api.sh
```

## 📚 Documentação

Toda a documentação está centralizada no diretório `docs/`:

- **docs/README.md** - Índice da documentação e navegação centralizada
- **docs/api/overview.md** - Guia completo da API, instalação e troubleshooting
- **docs/deployment/** - Guias de deploy para Windows, Linux e Docker
- **docs/archive/** - Histórico preservado de documentos e análises
- **docs/*.md** - Documentação específica (checklists, correções, relatórios, etc.)

**Documentação histórica:** Arquivos antigos foram movidos para `docs/archive/`.

## 🔧 Scripts Úteis

Todos os scripts estão organizados no diretório `scripts/`:

- **`scripts/test-api.sh`** - Smoke tests dos endpoints principais
- **`scripts/backup-db.sh`** - Backup do banco PostgreSQL
- **`scripts/reset-admin-password.sh`** - Reset de senha de administrador
- **`scripts/start-all.ps1`** - Inicia API e Frontend simultaneamente (Windows)
- **`scripts/start-api.ps1`** - Inicia apenas a API (Windows)
- **`scripts/start-frontend.ps1`** - Inicia apenas o Frontend (Windows)
- **`scripts/start-local.ps1`** - Inicia serviços localmente sem Docker (Windows)
- **`scripts/ROLLBACK.sh`** - Script de rollback para Docker

**Scripts de deploy:**
- **`deploy/windows/deploy.ps1`** - Deploy no Windows com validação de banco (sem Docker)
- **`deploy/linux/deploy.sh`** - Deploy no Ubuntu com validação de banco
- **`deploy/docker/scripts/`** - Automação de deploy Docker (Traefik, remoto e local)

## 🗄️ Estrutura do Projeto

```
phdstudio-1/
├── api/                       # API REST (Node.js/Express)
├── deploy/
│   ├── windows/               # Scripts PowerShell sem Docker
│   ├── linux/                 # Scripts Bash sem Docker
│   └── docker/                # Dockerfiles, docker-compose e scripts
├── docs/                      # Documentação centralizada + archive
├── public/                    # Assets do frontend
├── scripts/                   # Utilitários ativos (tests, backup, admin)
└── src/                       # Frontend React/Vite
```

## 🔐 Segurança

- API Key obrigatória para todos os endpoints
- Rate limiting configurado
- Headers de segurança (Helmet.js)
- Validação e sanitização rigorosa
- Prepared statements (proteção SQL injection)

**Importante:** Configure uma API Key segura no arquivo `.env` da API.

## 📖 Próximos Passos

1. Configure API Key segura (veja `docs/archive/SETUP_SEGURANCA.md`)
2. Integre com n8n usando a API REST
3. Configure backup regular do banco de dados

## 🆘 Troubleshooting

### API não responde

```bash
docker logs phd-api
docker compose up -d phd-api
```

### Verificar banco de dados

```bash
docker exec wp_db mysql -u wp_user -p'WpUser@2024!Strong#Pass' wordpress_db -e "SELECT COUNT(*) FROM wp_phd_products;"
```

## 📞 Suporte

Para mais detalhes, consulte a documentação específica em cada arquivo `.md`.
1234
