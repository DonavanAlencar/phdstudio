# Setup de Segurança - PHD Studio Products

## 🔐 Passo 1: Gerar API Key Segura

Execute o comando abaixo para gerar uma API Key segura:

```bash
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

**Exemplo de saída:**
```
CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU
```

Copie essa chave e use no arquivo `.env` da API.

## 🔑 Passo 2: Gerar Senha MySQL Segura

Execute o comando abaixo para gerar uma senha MySQL segura:

```bash
openssl rand -base64 24 | tr -d "=+/"
```

**Exemplo de saída:**
```
BidJz4tHkbnMsWK2weARw968w6yPJTZl
```

## 📝 Passo 3: Configurar Arquivo .env

1. Copie o arquivo de exemplo:
```bash
cd /root/phdstudio/api
cp env.example .env
```

2. Edite o arquivo `.env`:
```bash
nano .env
```

3. Preencha com os valores gerados:

```env
# MySQL
WP_DB_HOST=localhost
WP_DB_USER=seu_usuario_mysql
WP_DB_PASSWORD=BidJz4tHkbnMsWK2weARw968w6yPJTZl
WP_DB_NAME=wordpress
WP_TABLE_PREFIX=wp_
WP_DB_SSL=false

# WordPress URL
WP_URL=https://phdstudio.com.br

# API Key (use a chave gerada no Passo 1)
PHD_API_KEY=CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU

# CORS (configure origens específicas em produção)
ALLOWED_ORIGINS=https://phdstudio.com.br,https://app.phdstudio.com.br

# Servidor
API_PORT=3001
NODE_ENV=production
```

4. Salve e feche o arquivo (Ctrl+X, Y, Enter)

## 🔒 Passo 4: Proteger Arquivo .env

Certifique-se de que o arquivo `.env` não seja commitado:

```bash
# Verificar se .env está no .gitignore
echo ".env" >> /root/phdstudio/api/.gitignore

# Proteger permissões do arquivo
chmod 600 /root/phdstudio/api/.env
```

## ✅ Passo 5: Validar Configuração

Teste se a API está funcionando:

```bash
cd /root/phdstudio/api
npm install
npm start
```

Em outro terminal, teste a autenticação:

```bash
curl -X GET http://localhost:3001/health
```

Se retornar `{"status":"ok",...}`, a API está funcionando!

## 🚨 Importante

- **NUNCA** commite o arquivo `.env` com senhas reais
- **NUNCA** compartilhe API Keys em logs ou mensagens
- **ROTACIONE** as chaves periodicamente (a cada 3-6 meses)
- **USE** senhas diferentes para desenvolvimento e produção
- **MONITORE** logs de segurança regularmente

## 📚 Documentação Completa

Consulte `SEGURANCA.md` para detalhes completos sobre as práticas de segurança implementadas.



