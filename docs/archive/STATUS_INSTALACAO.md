# ✅ Status da Instalação - PHD Studio Products

**Data:** 21/12/2024  
**Status:** ✅ **INSTALADO E ATIVADO COM SUCESSO**

## 📦 Plugin WordPress

- ✅ **Instalado em:** `/root/wordpress/wp_data/plugins/phd-products/`
- ✅ **Status:** Ativado
- ✅ **Tabela criada:** `wp_phd_products`
- ✅ **Dados populados:** 9 produtos (seed automático)

## 🗄️ Banco de Dados

- **Container MySQL:** `wp_db`
- **Database:** `wordpress_db`
- **Tabela:** `wp_phd_products`
- **Produtos cadastrados:** 9 (3 por categoria)

### Categorias:
- Marketing Recorrente (3 produtos)
- Lançamentos Digitais (3 produtos)
- Tecnologia + IA (3 produtos)

## 🚀 Próximos Passos

### 1. Verificar Plugin no WordPress Admin

Acesse: `http://seu-servidor:8080/wp-admin`

No menu lateral, você verá:
- **PHD Studio** → Todos os Produtos
- **PHD Studio** → Adicionar Novo

### 2. Configurar e Iniciar API REST

```bash
cd /root/phdstudio/api

# Criar arquivo .env
cp env.example .env
nano .env  # Já vem pré-configurado!

# Build e iniciar API
cd /root/phdstudio
docker compose up -d --build phd-api

# Verificar logs
docker logs -f phd-api
```

### 3. Testar API

```bash
# Health check
curl http://localhost:3001/health

# Listar produtos (substitua pela API key do .env)
curl -X GET http://localhost:3001/api/phd/v1/products \
  -H "X-PHD-API-KEY: sua-api-key-aqui"
```

## 📋 Comandos Úteis

### Verificar Plugin

```bash
# Ver se plugin está ativo
docker exec wp_wordpress php -r "require('/var/www/html/wp-load.php'); echo is_plugin_active('phd-products/phd-products.php') ? 'Ativo' : 'Inativo';"
```

### Verificar Tabela

```bash
# Contar produtos
docker exec wp_db mysql -u wp_user -p'WpUser@2024!Strong#Pass' wordpress_db -e "SELECT COUNT(*) FROM wp_phd_products;"

# Listar produtos
docker exec wp_db mysql -u wp_user -p'WpUser@2024!Strong#Pass' wordpress_db -e "SELECT id, nome, categoria FROM wp_phd_products;"
```

### Reativar Plugin (se necessário)

```bash
/root/phdstudio/ativar-plugin.sh
```

## 🔧 Troubleshooting

### Se o plugin não aparecer no admin:

1. Verifique permissões:
```bash
chown -R www-data:www-data /root/wordpress/wp_data/plugins/phd-products
chmod -R 755 /root/wordpress/wp_data/plugins/phd-products
```

2. Verifique logs do WordPress:
```bash
docker logs wp_wordpress | tail -50
```

### Se a tabela não foi criada:

Execute manualmente:
```bash
docker exec wp_wordpress php -r "
define('WP_USE_THEMES', false);
require('/var/www/html/wp-load.php');
require_once('/var/www/html/wp-content/plugins/phd-products/includes/class-phd-products-database.php');
PHD_Products_Database::create_table();
PHD_Products_Database::seed_data();
echo 'Tabela criada!';
"
```

## 📚 Documentação

- `INSTALACAO_DOCKER.md` - Guia completo de instalação
- `README_PLUGIN.md` - Documentação do plugin
- `API_README.md` - Documentação da API REST
- `SEGURANCA.md` - Práticas de segurança

## ✅ Checklist de Instalação

- [x] Plugin copiado para `/root/wordpress/wp_data/plugins/phd-products/`
- [x] Permissões ajustadas (www-data:www-data)
- [x] Plugin ativado no WordPress
- [x] Tabela `wp_phd_products` criada
- [x] Dados iniciais (seed) populados
- [ ] API REST configurada e rodando
- [ ] API Key segura configurada
- [ ] Testes da API realizados
- [ ] Integração com n8n configurada (se aplicável)



