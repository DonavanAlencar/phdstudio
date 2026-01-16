# PHD Studio - Sistema de Gerenciamento de Produtos

Sistema completo de gerenciamento de produtos/serviços do PHD Studio com:
- **API REST** para integração com n8n e outros sistemas
- **Banco de dados PostgreSQL** para CRM e produtos

## 📋 Status Atual

✅ **API REST:** Rodando na porta 3001  
✅ **Banco de Dados:** PostgreSQL configurado  
✅ **Docker:** Configurado e funcionando

## 🚀 Início Rápido

### 1. Acessar Painel WordPress

```
http://seu-servidor:8080/wp-admin
```

Menu: **PHD Studio** → **Todos os Produtos**

### 2. Testar API REST

```bash
# Health check
curl http://localhost:3001/health

# Listar produtos
curl -X GET http://localhost:3001/api/phd/v1/products \
  -H "X-PHD-API-KEY: sua-api-key"
```

### 3. Executar Testes Automatizados

```bash
/root/phdstudio/TESTE_API.sh
```

## 📚 Documentação

- **[DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)** - Documentação completa do projeto, APIs, instalação e troubleshooting

**Documentação histórica:** Arquivos antigos foram movidos para `docs/archive/` para referência.

## 🔧 Scripts Úteis

- **`ativar-plugin.sh`** - Ativar/reativar plugin WordPress
- **`TESTE_API.sh`** - Testar todos os endpoints da API

## 🗄️ Estrutura do Projeto

```
/root/phdstudio/
├── api/                    # API REST (Node.js/Express)
│   ├── server.js          # Servidor da API
│   ├── package.json       # Dependências
│   ├── Dockerfile         # Container da API
│   └── env.example        # Template de configuração
├── docker-compose.yml      # Configuração Docker
├── INSTALACAO_DOCKER.md   # Guia de instalação
├── README_PLUGIN.md       # Documentação do plugin
├── STATUS_INSTALACAO.md   # Status atual
├── SEGURANCA.md           # Segurança
├── SETUP_SEGURANCA.md     # Setup de segurança
├── ativar-plugin.sh       # Script de ativação
└── TESTE_API.sh           # Script de testes
```

## 🔐 Segurança

- API Key obrigatória para todos os endpoints
- Rate limiting configurado
- Headers de segurança (Helmet.js)
- Validação e sanitização rigorosa
- Prepared statements (proteção SQL injection)

**Importante:** Configure uma API Key segura no arquivo `.env` da API.

## 📖 Próximos Passos

1. Configure API Key segura (veja `SETUP_SEGURANCA.md`)
2. Integre com n8n usando a API REST
3. Configure backup regular do banco de dados

## 🆘 Troubleshooting

### Plugin não aparece no WordPress

```bash
/root/phdstudio/ativar-plugin.sh
```

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
