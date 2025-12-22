# Instalação - PHD Studio Products no WordPress Docker

Este guia explica como instalar o plugin WordPress e configurar a API REST para funcionar com o WordPress que já está rodando no Docker.

## 📋 Pré-requisitos

- WordPress rodando no Docker (container `wp_wordpress`)
- MySQL rodando no Docker (container `wp_db`)
- Acesso ao servidor onde os containers estão rodando

## 🔍 Verificar Ambiente Docker

```bash
# Verificar containers WordPress e MySQL
docker ps | grep -E "wp_wordpress|wp_db"

# Verificar rede Docker
docker network inspect wordpress_wp_network
```

## 📦 Passo 1: Instalar Plugin WordPress

O plugin já foi copiado para o diretório de plugins do WordPress:

```bash
# Verificar se o plugin está no lugar correto
ls -la /root/wordpress/wp_data/plugins/phd-products/

# Ajustar permissões (se necessário)
chown -R www-data:www-data /root/wordpress/wp_data/plugins/phd-products
chmod -R 755 /root/wordpress/wp_data/plugins/phd-products
```

### Ativar o Plugin

1. Acesse o WordPress Admin: `http://seu-servidor:8080/wp-admin`
2. Vá em **Plugins** → **Plugins Instalados**
3. Procure por **"PHD Studio - Gerenciamento de Produtos"**
4. Clique em **Ativar**

**OU via WP-CLI (dentro do container):**

```bash
docker exec wp_wordpress wp plugin activate phd-products --allow-root
```

## 🗄️ Passo 2: Verificar Tabela no Banco de Dados

Após ativar o plugin, a tabela `wp_phd_products` será criada automaticamente.

Verificar via MySQL:

```bash
# Conectar ao MySQL do container
docker exec -it wp_db mysql -u wp_user -p'WpUser@2024!Strong#Pass' wordpress_db

# Dentro do MySQL, verificar a tabela
mysql> SHOW TABLES LIKE 'wp_phd_products';
mysql> SELECT COUNT(*) FROM wp_phd_products;
mysql> EXIT;
```

## 🚀 Passo 3: Configurar API REST

A API REST precisa estar na mesma rede Docker do MySQL para acessá-lo.

### 3.1 Criar arquivo .env da API

```bash
cd /root/phdstudio/api
cp env.example .env
nano .env
```

### 3.2 Configurar .env para Docker

```env
# MySQL do WordPress Docker
WP_DB_HOST=wp_db
WP_DB_USER=wp_user
WP_DB_PASSWORD=WpUser@2024!Strong#Pass
WP_DB_NAME=wordpress_db
WP_TABLE_PREFIX=wp_
WP_DB_SSL=false

# WordPress URL
WP_URL=http://localhost:8080

# API Key (gere uma segura)
PHD_API_KEY=CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU

# CORS
ALLOWED_ORIGINS=*

# Servidor
API_PORT=3001
NODE_ENV=production
```

**Importante:** `WP_DB_HOST=wp_db` é o nome do container MySQL na rede Docker.

### 3.3 Adicionar API ao docker-compose.yml

Edite `/root/phdstudio/docker-compose.yml` e adicione o serviço da API:

```yaml
services:
  phdstudio:
    # ... configuração existente ...
  
  phd-api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: phd-api
    expose:
      - "3001"
    environment:
      - WP_DB_HOST=wp_db
      - WP_DB_USER=wp_user
      - WP_DB_PASSWORD=WpUser@2024!Strong#Pass
      - WP_DB_NAME=wordpress_db
      - WP_TABLE_PREFIX=wp_
      - WP_DB_SSL=false
      - WP_URL=http://localhost:8080
      - PHD_API_KEY=${PHD_API_KEY:-CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU}
      - ALLOWED_ORIGINS=*
      - API_PORT=3001
      - NODE_ENV=production
    networks:
      - n8n_default
      - wordpress_wp_network
    restart: unless-stopped
    depends_on:
      - phdstudio

networks:
  n8n_default:
    external: true
  wordpress_wp_network:
    external: true
```

### 3.4 Build e Iniciar API

```bash
cd /root/phdstudio
docker compose up -d --build phd-api
```

### 3.5 Verificar Logs

```bash
docker logs -f phd-api
```

## 🧪 Passo 4: Testar

### Testar Plugin WordPress

1. Acesse: `http://seu-servidor:8080/wp-admin`
2. Vá em **PHD Studio** → **Todos os Produtos**
3. Deve aparecer os produtos do seed

### Testar API REST

```bash
# Health check
curl http://localhost:3001/health

# Listar produtos (substitua pela API key real)
curl -X GET http://localhost:3001/api/phd/v1/products \
  -H "X-PHD-API-KEY: CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
```

## 🔧 Troubleshooting

### Plugin não aparece no WordPress

```bash
# Verificar se arquivos estão no lugar
docker exec wp_wordpress ls -la /var/www/html/wp-content/plugins/phd-products/

# Verificar permissões
docker exec wp_wordpress ls -la /var/www/html/wp-content/plugins/ | grep phd-products
```

### Erro de conexão MySQL na API

```bash
# Verificar se API está na mesma rede do MySQL
docker network inspect wordpress_wp_network | grep phd-api

# Testar conexão do container da API ao MySQL
docker exec phd-api ping -c 2 wp_db
```

### Tabela não foi criada

```bash
# Ativar plugin manualmente via WP-CLI
docker exec wp_wordpress wp plugin activate phd-products --allow-root

# Verificar logs do WordPress
docker logs wp_wordpress | grep -i "phd"
```

## 📚 Próximos Passos

1. Configure a API Key segura (veja `SETUP_SEGURANCA.md`)
2. Configure CORS com origens específicas em produção
3. Integre com n8n usando a API REST
4. Configure backup regular do banco de dados

## 🔐 Segurança

- **NUNCA** commite o arquivo `.env` com senhas
- Use API Keys fortes (veja `SETUP_SEGURANCA.md`)
- Configure CORS adequadamente em produção
- Monitore logs de segurança



