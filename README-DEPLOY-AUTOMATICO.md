# Deploy Automatizado para Easypanel

Este guia explica como configurar o deploy automatizado da aplicação PHD Studio no Easypanel.

## 📋 Visão Geral

O sistema de deploy automatizado permite que toda vez que você atualizar o código no repositório Git, a aplicação seja automaticamente atualizada no Easypanel, sem necessidade de intervenção manual.

## 🚀 Opções de Deploy Automatizado

### Opção 1: Webhook (Recomendado) ⭐

O webhook recebe notificações do GitHub/GitLab quando há push e dispara o deploy automaticamente.

#### Configuração:

1. **Execute o script de setup:**
   ```bash
   cd /root/phdstudio
   bash setup-automated-deploy.sh
   ```

2. **Inicie o servidor de webhook:**
   ```bash
   python3 /tmp/webhook-server.py &
   ```
   
   Ou configure como serviço systemd:
   ```bash
   systemctl daemon-reload
   systemctl enable phdstudio-webhook
   systemctl start phdstudio-webhook
   ```

3. **Configure webhook no GitHub:**
   - Acesse: https://github.com/DonavanAlencar/phdstudio/settings/hooks
   - Clique em "Add webhook"
   - **Payload URL**: `http://148.230.79.105:9000/webhook` (ou seu IP)
   - **Content type**: `application/json`
   - **Events**: Selecione "Just the push event"
   - Clique em "Add webhook"

4. **Configure webhook no GitLab (se usar):**
   - Acesse: Settings → Webhooks
   - **URL**: `http://148.230.79.105:9000/webhook`
   - **Trigger**: Push events
   - Clique em "Add webhook"

### Opção 2: Cron Job (Verificação Periódica)

O cron job verifica periodicamente se há atualizações no repositório.

#### Configuração:

O cron job já é configurado automaticamente pelo script `setup-automated-deploy.sh`.

- **Frequência**: A cada 5 minutos
- **Log**: `/var/log/phdstudio-deploy.log`

Para alterar a frequência, edite o crontab:
```bash
crontab -e
```

### Opção 3: GitHub Actions

O GitHub Actions executa o deploy automaticamente quando há push na branch main.

#### Configuração:

1. **Configure secrets no GitHub:**
   - Acesse: https://github.com/DonavanAlencar/phdstudio/settings/secrets/actions
   - Adicione os seguintes secrets:
     - `SSH_PRIVATE_KEY`: Sua chave SSH privada (para acessar o servidor)
     - `SERVER_HOST`: IP ou hostname do servidor (ex: `148.230.79.105`)

2. **O workflow já está configurado** em `.github/workflows/deploy.yml`

3. **Faça push para a branch main** e o deploy será executado automaticamente

### Opção 4: Deploy Manual

Execute o script de deploy manualmente quando necessário:

```bash
cd /root/phdstudio
bash deploy-easypanel.sh
```

## 📁 Estrutura de Arquivos

```
/root/phdstudio/
├── deploy-easypanel.sh          # Script principal de deploy
├── webhook-handler.sh           # Handler de webhook
├── setup-automated-deploy.sh    # Script de configuração
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow
└── README-DEPLOY-AUTOMATICO.md  # Este arquivo
```

## 🔧 Como Funciona

1. **Detecção de Mudanças:**
   - Webhook: Recebe notificação do GitHub/GitLab
   - Cron: Verifica periodicamente se há commits novos
   - GitHub Actions: Executa no push

2. **Processo de Deploy:**
   - Faz pull do repositório Git
   - Carrega variáveis de ambiente do arquivo `.env`
   - Faz rebuild da imagem Docker
   - Atualiza o serviço no Easypanel
   - Verifica se o serviço está rodando

3. **Logs:**
   - Deploy: `/var/log/phdstudio-deploy.log`
   - Webhook: `/var/log/phdstudio-webhook.log`

## 🔍 Verificação e Troubleshooting

### Verificar se o deploy está funcionando:

```bash
# Ver logs do deploy
tail -f /var/log/phdstudio-deploy.log

# Ver logs do webhook
tail -f /var/log/phdstudio-webhook.log

# Verificar status do serviço
docker ps | grep phdstudio

# Testar deploy manualmente
cd /root/phdstudio && bash deploy-easypanel.sh
```

### Problemas Comuns:

1. **Webhook não está recebendo notificações:**
   - Verifique se o servidor de webhook está rodando: `ps aux | grep webhook-server`
   - Verifique firewall: `ufw status` (porta 9000 deve estar aberta)
   - Teste manualmente: `curl -X POST http://localhost:9000/webhook -d '{"ref":"refs/heads/main"}'`

2. **Deploy falha:**
   - Verifique logs: `tail -50 /var/log/phdstudio-deploy.log`
   - Verifique se o arquivo `.env` existe e tem as variáveis corretas
   - Verifique se o container do Easypanel está rodando: `docker ps | grep phdstudio`

3. **Cron job não está executando:**
   - Verifique crontab: `crontab -l`
   - Verifique logs do cron: `grep CRON /var/log/syslog`

## 🔐 Segurança

- **Webhook Secret**: Configure `WEBHOOK_SECRET` no `.env` para validar webhooks
- **Firewall**: Configure regras de firewall para permitir apenas IPs confiáveis
- **SSH Keys**: Use chaves SSH para GitHub Actions em vez de senhas

## 📝 Notas Importantes

- O deploy automatizado **não remove** containers ou imagens antigas automaticamente (para segurança)
- O script verifica se há mudanças antes de fazer deploy (evita deploys desnecessários)
- Logs são mantidos em `/var/log/phdstudio-*.log`
- O Easypanel gerencia os serviços via Docker Swarm, então o script tenta atualizar via `docker service update`

## 🎯 Próximos Passos

1. Execute `bash setup-automated-deploy.sh` para configurar tudo
2. Escolha uma das opções de deploy (webhook recomendado)
3. Faça um push de teste para verificar se está funcionando
4. Monitore os logs para garantir que tudo está correto

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs em `/var/log/phdstudio-*.log`
2. Execute o deploy manualmente para ver erros detalhados
3. Verifique se o container do Easypanel está acessível

