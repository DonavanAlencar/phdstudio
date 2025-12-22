# Plugin WordPress - PHD Studio Products

## ✅ Status: Instalado no WordPress Docker

O plugin foi instalado no diretório de plugins do WordPress que está rodando no Docker.

## 📍 Localização

- **Host:** `/root/wordpress/wp_data/plugins/phd-products/`
- **Container:** `/var/www/html/wp-content/plugins/phd-products/`

## 🚀 Ativação

### Opção 1: Via WordPress Admin

1. Acesse: `http://seu-servidor:8080/wp-admin`
2. Vá em **Plugins** → **Plugins Instalados**
3. Procure por **"PHD Studio - Gerenciamento de Produtos"**
4. Clique em **Ativar**

### Opção 2: Via WP-CLI (Recomendado)

```bash
docker exec wp_wordpress wp plugin activate phd-products --allow-root
```

## 📋 Funcionalidades

Após ativar, o plugin irá:

1. ✅ Criar automaticamente a tabela `wp_phd_products` no banco de dados
2. ✅ Popular com dados iniciais (seed) - 9 produtos
3. ✅ Criar menu **"PHD Studio"** no admin do WordPress

## 🎯 Acessar o Painel

Após ativar o plugin:

1. Acesse: `http://seu-servidor:8080/wp-admin`
2. No menu lateral, clique em **"PHD Studio"**
3. Você verá:
   - **Todos os Produtos** - Lista de produtos por categoria
   - **Adicionar Novo** - Formulário para criar novo produto

## 🗄️ Verificar Banco de Dados

```bash
# Conectar ao MySQL
docker exec -it wp_db mysql -u wp_user -p'WpUser@2024!Strong#Pass' wordpress_db

# Verificar tabela
mysql> SHOW TABLES LIKE 'wp_phd_products';
mysql> SELECT COUNT(*) FROM wp_phd_products;
mysql> SELECT * FROM wp_phd_products LIMIT 3;
mysql> EXIT;
```

## 🔧 Troubleshooting

### Plugin não aparece

```bash
# Verificar se arquivos estão no lugar
ls -la /root/wordpress/wp_data/plugins/phd-products/

# Verificar permissões
chown -R www-data:www-data /root/wordpress/wp_data/plugins/phd-products
chmod -R 755 /root/wordpress/wp_data/plugins/phd-products
```

### Erro ao ativar

```bash
# Ver logs do WordPress
docker logs wp_wordpress | tail -50

# Verificar erros PHP
docker exec wp_wordpress tail -f /var/log/apache2/error.log
```

### Tabela não foi criada

```bash
# Executar criação manual via WP-CLI
docker exec wp_wordpress wp eval 'PHD_Products_Database::create_table();' --allow-root
docker exec wp_wordpress wp eval 'PHD_Products_Database::seed_data();' --allow-root
```

## 📚 Estrutura do Plugin

```
phd-products/
├── phd-products.php                    # Arquivo principal
├── includes/
│   ├── class-phd-products-database.php # Gerenciamento do banco
│   └── class-phd-products-admin.php    # Painel administrativo
├── assets/
│   ├── admin.js                        # Scripts do admin
│   └── admin.css                       # Estilos do admin
└── phd-products-seed.sql              # Script SQL (referência)
```

## 🔐 Segurança

O plugin implementa:
- ✅ Validação de nonces (CSRF protection)
- ✅ Verificação de permissões (`manage_options`)
- ✅ Sanitização de todos os inputs
- ✅ Validação de dados
- ✅ Logs de auditoria

## 📖 Documentação Completa

Veja `INSTALACAO_DOCKER.md` para instruções completas de instalação e configuração.



