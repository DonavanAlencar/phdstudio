# Servidor MCP CRM - Documentação

Servidor MCP (Model Context Protocol) para integração com WordPress/FluentCRM.

## 📋 Visão Geral

O servidor MCP CRM permite que agentes SDR (Sales Development Representatives) interajam com o CRM WordPress/FluentCRM através de ferramentas padronizadas.

## 🔧 Configuração

### Arquivo de Configuração

Localização: `/root/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "mcp-crm-server": {
      "command": "node",
      "args": ["/root/mcp-crm-server/server.js"]
    }
  }
}
```

### Variáveis de Ambiente

O servidor usa a variável `CRM_API_URL` para configurar a URL da API WordPress. Se não definida, usa o padrão:

```
http://148.230.79.105:8080/wp-json/phd/v1
```

Para configurar via variável de ambiente:

```bash
export CRM_API_URL="http://148.230.79.105:8080/wp-json/phd/v1"
```

## 🛠️ Ferramentas Disponíveis

### 1. check_lead

Verifica se um lead já existe no CRM pelo email.

**Parâmetros:**
- `email` (string, obrigatório): Email do lead a ser verificado

**Exemplo de uso:**
```json
{
  "email": "teste@example.com"
}
```

**Resposta (lead novo):**
```json
{
  "status": "new_lead",
  "context": "Lead novo, não encontrado no sistema",
  "email": "teste@example.com"
}
```

**Resposta (lead existente):**
```json
{
  "status": "success",
  "context": "Lead já existe. Nome: João Silva, Estágio: Curioso, Intenção: Precisa de automação de vendas",
  "data": {
    "id": 19,
    "email": "teste@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "status": "subscribed",
    "custom_fields": {
      "telefone_whatsapp": "11999999999",
      "origem_canal": "teste_mcp_cursor",
      "intencao_estagio": "Curioso",
      "dor_necessidade": "Precisa de automação de vendas"
    }
  }
}
```

---

### 2. update_lead

Registra ou atualiza um lead no CRM.

**Parâmetros:**
- `email` (string, obrigatório): Email do lead
- `first_name` (string, opcional): Nome do lead
- `phone` (string, opcional): Telefone/WhatsApp do lead
- `origem_canal` (string, opcional): Canal de origem (UTM, origem, etc)
- `intencao_estagio` (string, opcional): Estágio de intenção - valores permitidos: `"Curioso"`, `"Avaliando"`, `"Pronto para agir"`
- `dor_necessidade` (string, opcional): Resumo da dor ou necessidade do cliente

**Exemplo de uso:**
```json
{
  "email": "teste@example.com",
  "first_name": "João Silva",
  "phone": "11999999999",
  "origem_canal": "teste_mcp_cursor",
  "intencao_estagio": "Curioso",
  "dor_necessidade": "Precisa de automação de vendas"
}
```

**Resposta:**
```json
{
  "status": "success",
  "context": "Lead registrado/atualizado com sucesso",
  "data": {
    "id": 19,
    "email": "teste@example.com",
    "status": "subscribed",
    "first_name": "João",
    "last_name": "Silva",
    "created_at": {
      "date": "2025-12-21 16:50:22.000000",
      "timezone_type": 3,
      "timezone": "America/Sao_Paulo"
    },
    "custom_fields": {
      "telefone_whatsapp": "11999999999",
      "origem_canal": "teste_mcp_cursor",
      "intencao_estagio": "Curioso",
      "dor_necessidade": "Precisa de automação de vendas"
    }
  }
}
```

## 🔄 Mapeamento de Dados

O servidor MCP mapeia os dados recebidos para o formato esperado pela API WordPress/FluentCRM:

| Campo MCP | Campo API | Observações |
|-----------|-----------|-------------|
| `email` | `email` | Obrigatório |
| `first_name` | `Nome` | Opcional |
| `phone` | `Telefone_WhatsApp` | Opcional |
| `origem_canal` | `origem_canal` | Opcional |
| `intencao_estagio` | `intencao_estagio` | Opcional, padrão: "Curioso" |
| `dor_necessidade` | `dor_necessidade` | Opcional |

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js >= 18.0.0
- Acesso ao servidor WordPress/FluentCRM

### Instalação

```bash
cd /root/mcp-crm-server
npm install
```

### Configuração do Cursor

1. Edite o arquivo `/root/.cursor/mcp.json`
2. Adicione a configuração do servidor (já deve estar configurado)
3. Reinicie o Cursor para aplicar as mudanças

## 🧪 Testes

### Teste 1: Verificar Lead Novo

```bash
# Via Cursor, use a ferramenta MCP:
check_lead(email: "teste_novo@example.com")
```

**Resultado esperado:** `{"status": "new_lead", ...}`

### Teste 2: Registrar Lead

```bash
# Via Cursor, use a ferramenta MCP:
update_lead(
  email: "teste_novo@example.com",
  first_name: "João Silva",
  phone: "11999999999",
  origem_canal: "teste_mcp",
  intencao_estagio: "Curioso",
  dor_necessidade: "Precisa de automação"
)
```

**Resultado esperado:** `{"status": "success", ...}`

### Teste 3: Verificar Lead Existente

```bash
# Via Cursor, use a ferramenta MCP:
check_lead(email: "teste_novo@example.com")
```

**Resultado esperado:** `{"status": "success", "context": "Lead já existe...", ...}`

## 🔧 Troubleshooting

### Erro: "API retornou status 404"

**Causa:** URL da API WordPress incorreta ou endpoint não disponível.

**Solução:**
1. Verifique se o WordPress está rodando: `docker ps | grep wordpress`
2. Teste a API diretamente:
   ```bash
   curl "http://148.230.79.105:8080/wp-json/phd/v1/lead/teste@example.com"
   ```
3. Verifique a configuração em `/root/mcp-crm-server/server.js`

### Erro: "Erro ao verificar lead"

**Causa:** Problema de conexão ou API offline.

**Solução:**
1. Verifique conectividade: `ping 148.230.79.105`
2. Verifique se a porta 8080 está acessível
3. Verifique logs do WordPress: `docker logs wp_wordpress`

### Servidor MCP não carrega

**Causa:** Erro no código ou dependências faltando.

**Solução:**
1. Verifique se Node.js está instalado: `node --version`
2. Reinstale dependências: `cd /root/mcp-crm-server && npm install`
3. Teste o servidor manualmente: `node /root/mcp-crm-server/server.js`
4. Verifique logs do Cursor

## 📝 Notas Importantes

- ✅ O servidor usa **IP direto** (sem ngrok) para maior estabilidade
- ✅ Todas as requisições são feitas via HTTP (não HTTPS) no momento
- ✅ O servidor é reiniciado automaticamente pelo Cursor quando há mudanças
- ✅ Para mudanças no código, edite `/root/mcp-crm-server/server.js` e reinicie o Cursor

## 🔐 Segurança

- ✅ Validação de parâmetros obrigatórios
- ✅ Sanitização de dados antes de enviar para API
- ✅ Tratamento de erros robusto
- ⚠️ **Atenção:** Atualmente usando HTTP (não HTTPS). Veja plano de ação para HTTPS.

## 📞 Suporte

Para mais informações:
- Documentação da API WordPress: `CURLS_API_COMPLETOS.md`
- Documentação geral: `README.md`


