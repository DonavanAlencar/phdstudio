# Troubleshooting: Deploy via GitHub Actions

## Problema: SSH Connection Timeout

### Erro Comum
```
ssh: connect to host *** port 22: Connection timed out
Error: Process completed with exit code 255.
```

### Possíveis Causas

#### 1. Firewall Bloqueando Conexões do GitHub
O provedor de hospedagem pode estar bloqueando conexões do GitHub Actions.

**Solução:**
- Verificar firewall do servidor
- Adicionar IPs do GitHub Actions à whitelist (se possível)
- Verificar se há firewall no provedor (Cloudflare, etc.)

#### 2. IP do Servidor Mudou
O IP configurado no GitHub Secrets pode estar desatualizado.

**Solução:**
```bash
# Verificar IP atual do servidor
curl -4 ifconfig.me

# Atualizar no GitHub:
# Settings > Secrets and variables > Actions > SERVER_HOST
```

#### 3. SSH Não Está Acessível Externamente
O SSH pode estar configurado apenas para conexões locais.

**Verificar:**
```bash
# Verificar se SSH está escutando em todas as interfaces
ss -tlnp | grep :22

# Deve mostrar: 0.0.0.0:22 ou :::22
```

#### 4. Problemas de Rede Temporários
Conexões podem falhar temporariamente.

**Solução:**
- O workflow agora tem timeout maior (15 minutos)
- Testes de conectividade antes do deploy
- Retry automático (pode ser adicionado)

### Melhorias Implementadas no Workflow

1. **Teste de Conectividade**
   - Testa ping antes de conectar
   - Verifica se porta 22 está acessível
   - Mensagens de erro mais descritivas

2. **Timeouts Aumentados**
   - Timeout geral: 15 minutos
   - ConnectTimeout SSH: 20 segundos
   - ServerAliveInterval: 30 segundos

3. **Melhor Diagnóstico**
   - Logs detalhados em cada etapa
   - Mensagens de erro específicas
   - Sugestões de troubleshooting

### Verificações no Servidor

```bash
# 1. Verificar se SSH está rodando
systemctl status sshd

# 2. Verificar porta 22
netstat -tulpn | grep :22
# Deve mostrar: LISTEN em 0.0.0.0:22

# 3. Verificar firewall
ufw status
# Se ativo, garantir que porta 22 está aberta:
# ufw allow 22/tcp

# 4. Verificar logs do SSH
journalctl -u sshd -n 50

# 5. Testar conexão localmente
ssh -v root@localhost
```

### Solução Alternativa: Deploy Manual

Se o deploy automático continuar falhando, você pode fazer deploy manual:

```bash
# No servidor
cd /root/phdstudio
git pull origin main
docker compose up -d --build
```

### Configuração de Secrets no GitHub

Certifique-se de que os seguintes secrets estão configurados:

1. **SSH_PRIVATE_KEY**: Chave privada SSH para autenticação
2. **SERVER_HOST**: IP ou hostname do servidor (ex: 148.230.79.105)

**Como configurar:**
1. Acesse: `https://github.com/[seu-usuario]/[seu-repo]/settings/secrets/actions`
2. Adicione ou edite os secrets necessários

### Próximos Passos

1. Verificar se o servidor está acessível:
   ```bash
   # Do seu computador
   ping 148.230.79.105
   telnet 148.230.79.105 22
   ```

2. Testar conexão SSH manualmente:
   ```bash
   ssh -v root@148.230.79.105
   ```

3. Se funcionar manualmente, o problema pode ser:
   - Firewall bloqueando IPs do GitHub
   - Rate limiting do provedor
   - Problemas temporários de rede

4. Considerar alternativas:
   - Webhook local (mais confiável)
   - Deploy via Git push hook
   - CI/CD self-hosted


