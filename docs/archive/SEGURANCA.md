# Guia de Segurança - PHD Studio Products

Este documento descreve as práticas de segurança implementadas no sistema.

## 🔐 Segurança da API REST

### Autenticação

- **API Key obrigatória**: Todas as requisições (exceto `/health`) requerem o header `X-PHD-API-KEY`
- **Comparação segura**: Uso de comparação constante-time para prevenir timing attacks
- **Logs de segurança**: Tentativas de autenticação falhadas são registradas

### Rate Limiting

- **Limite geral**: 100 requisições por IP a cada 15 minutos
- **Limite de autenticação**: 5 tentativas falhadas por IP a cada 15 minutos
- **Proteção contra brute force**: Previne ataques de força bruta

### Headers de Segurança

- **Helmet.js**: Configurado com políticas de segurança
- **X-Content-Type-Options**: `nosniff` - previne MIME sniffing
- **X-Frame-Options**: `DENY` - previne clickjacking
- **X-XSS-Protection**: `1; mode=block` - proteção XSS

### Validação e Sanitização

- **Validação de IDs**: Apenas números inteiros positivos válidos
- **Sanitização de strings**: Limite de tamanho e remoção de caracteres perigosos
- **Validação de URLs**: Apenas URLs HTTP/HTTPS válidas
- **Validação de JSON**: Estrutura validada antes do processamento
- **Prepared Statements**: Proteção contra SQL injection

### Configuração do Banco de Dados

- **Connection Pooling**: Limite de conexões simultâneas
- **Timeouts**: Timeout de 10 segundos para conexões
- **SSL opcional**: Suporte a conexões SSL para MySQL

## 🛡️ Segurança do Plugin WordPress

### Proteção CSRF

- **Nonces**: Todos os formulários usam nonces do WordPress
- **Verificação**: Nonces são verificados antes de processar ações

### Validação de Entrada

- **Sanitização**: Todos os inputs são sanitizados usando funções do WordPress
- **Whitelist de categorias**: Apenas categorias permitidas são aceitas
- **Validação de URLs**: URLs são validadas e sanitizadas
- **Limite de tamanho**: Campos têm limites de tamanho definidos

### Permissões

- **Capability check**: Apenas usuários com `manage_options` podem acessar
- **Verificação em todas as ações**: CRUD verifica permissões

### Proteção XSS

- **Escaping**: Todos os dados de saída são escapados
- **esc_attr()**: Para atributos HTML
- **esc_url()**: Para URLs
- **esc_textarea()**: Para áreas de texto

### Logs de Auditoria

- **Registro de ações**: Criação, atualização e exclusão são registradas
- **Informações do usuário**: Login e ID do usuário são registrados

## 🔑 Gerenciamento de Senhas e Chaves

### Gerar API Key Segura

```bash
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

### Gerar Senha MySQL Segura

```bash
openssl rand -base64 24 | tr -d "=+/"
```

### Boas Práticas

1. **Nunca commite senhas**: Use `.env` e adicione ao `.gitignore`
2. **Use senhas fortes**: Mínimo de 32 caracteres para API keys
3. **Rotacione chaves**: Mude API keys periodicamente
4. **Ambientes separados**: Use chaves diferentes para dev/prod

## 📋 Checklist de Segurança

### Antes de Deploy em Produção

- [ ] API Key gerada e configurada no `.env`
- [ ] Senha MySQL forte configurada
- [ ] `NODE_ENV=production` configurado
- [ ] CORS configurado com origens específicas (não `*`)
- [ ] SSL habilitado para MySQL (se disponível)
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Logs de erro não expõem informações sensíveis
- [ ] Rate limiting configurado adequadamente
- [ ] Headers de segurança ativados

### Manutenção Contínua

- [ ] Monitorar logs de segurança
- [ ] Revisar tentativas de autenticação falhadas
- [ ] Atualizar dependências regularmente
- [ ] Revisar permissões de usuários WordPress
- [ ] Backup regular do banco de dados

## 🚨 Resposta a Incidentes

### Se API Key for comprometida

1. Gere nova API Key imediatamente
2. Atualize `.env` com nova chave
3. Reinicie a API
4. Revise logs para atividades suspeitas
5. Notifique usuários se necessário

### Se detectar atividade suspeita

1. Revise logs de segurança
2. Verifique rate limiting
3. Bloqueie IPs suspeitos se necessário
4. Revise permissões de usuários
5. Considere rotacionar todas as chaves

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WordPress Security](https://wordpress.org/support/article/hardening-wordpress/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)



