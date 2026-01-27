# Correção: Chat não desaparece ao desativar

## Problema
Ao clicar em "Desativar Chat" na tela de logs, o chat da home não desaparece para todos os usuários.

## Causa
A migration `007_global_chat_settings.sql` não foi executada no banco de dados, então a tabela `global_settings` não existe.

## Solução

### Passo 1: Executar a migration

Execute o script de migration:

```bash
cd /root/phdstudio
./scripts/run-chat-settings-migration.sh
```

Ou execute manualmente:

```bash
cd /root/phdstudio
source backend/env  # Carregar variáveis de ambiente
psql -h $CRM_DB_HOST -p $CRM_DB_PORT -U $CRM_DB_USER -d $CRM_DB_NAME -f backend/db/migrations/007_global_chat_settings.sql
```

### Passo 2: Verificar se funcionou

Execute o script de diagnóstico:

```bash
./scripts/test-chat-settings-api.sh
```

Este script verifica:
- ✅ Se a tabela `global_settings` existe
- ✅ Se a configuração `chat_visibility` existe
- ✅ Se o endpoint da API está funcionando

### Passo 3: Reiniciar a API (se necessário)

Se a API estiver rodando em Docker:

```bash
cd /root/phdstudio/deploy/docker/scripts
docker compose restart phd-api
```

Ou se estiver rodando localmente:

```bash
# Parar e iniciar novamente a API
```

### Passo 4: Testar

1. Acesse a tela de logs como admin
2. Clique em "Desativar Chat"
3. Abra a home em outra aba/janela (ou outro navegador)
4. O chat deve desaparecer em até 5 segundos

## Como funciona

1. **Backend**: A rota `/api/crm/v1/chat-settings` lê/escreve na tabela `global_settings`
2. **Frontend**: 
   - `ChatVisibilityProvider` verifica a API a cada 5 segundos
   - `ChatWidget` verifica a API a cada 3 segundos
   - Quando admin clica em desativar, salva na API imediatamente

## Troubleshooting

### Erro: "relation global_settings does not exist"
- **Solução**: Execute a migration (Passo 1)

### Erro: "endpoint não encontrado"
- **Solução**: Verifique se a rota está registrada em `backend/server.js`
- Verifique se a API está rodando

### Chat não desaparece mesmo após migration
- Verifique os logs do navegador (F12 → Console)
- Verifique se há erros de CORS
- Verifique se o token de autenticação está válido

### Ver logs da API

```bash
# Se estiver em Docker
docker logs phd-api

# Se estiver rodando localmente
# Verifique os logs do processo Node.js
```

## Estrutura da Tabela

```sql
CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

A configuração do chat é armazenada como:
```json
{
  "enabled": true  // ou false
}
```
