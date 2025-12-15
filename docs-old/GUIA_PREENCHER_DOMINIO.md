# Guia Detalhado: Preencher Formulário de Domínio no Easypanel

## Modal "Criar Domínio" - Preenchimento Passo a Passo

### Aba "Detalhes" (já selecionada)

#### Seção Superior (Configuração do Domínio)

1. **HTTPS** (Toggle Switch)
   - ✅ **Mantenha ATIVADO** (azul/ligado)
   - Isso habilita SSL/HTTPS automaticamente via Let's Encrypt

2. **Host *** (Campo de Texto - OBRIGATÓRIO)
   - **Preencha com**: `phdstudio.com.br`
   - ⚠️ **Importante**: Digite apenas o domínio, sem `http://` ou `https://`
   - ⚠️ **Não inclua** barra `/` no final

3. **Caminho *** (Campo de Texto - OBRIGATÓRIO)
   - **Mantenha como está**: `/`
   - Este campo já vem pré-preenchido corretamente
   - Representa o caminho base do domínio

#### Seção "Destino" (Destination)

4. **Protocolo *** (Dropdown - OBRIGATÓRIO)
   - **Mantenha selecionado**: `HTTP`
   - ✅ Já está correto (HTTP é o protocolo interno do container)

5. **Porta *** (Campo de Texto - OBRIGATÓRIO)
   - **Mantenha como está**: `80`
   - ✅ Já está correto (porta interna do container Nginx)

6. **Caminho *** (Campo de Texto - OBRIGATÓRIO)
   - **Mantenha como está**: `/`
   - ✅ Já está correto (caminho raiz da aplicação)

### Resumo do Preenchimento

```
┌─────────────────────────────────────────┐
│ HTTPS: ✅ ATIVADO (azul)                 │
│                                         │
│ Host *: phdstudio.com.br               │
│ Caminho *: /                            │
│                                         │
│ Destino:                                │
│   Protocolo *: HTTP                    │
│   Porta *: 80                           │
│   Caminho *: /                           │
│                                         │
│              [Criar]                    │
└─────────────────────────────────────────┘
```

### Valores Finais

| Campo | Valor |
|-------|-------|
| HTTPS | ✅ **Ativado** |
| Host * | `phdstudio.com.br` |
| Caminho * (superior) | `/` |
| Protocolo * | `HTTP` |
| Porta * | `80` |
| Caminho * (destino) | `/` |

### Após Preencher

1. Clique no botão verde **"Criar"** no canto inferior direito
2. Aguarde alguns segundos enquanto o Easypanel configura o domínio
3. O certificado SSL será emitido automaticamente (pode levar 2-5 minutos)
4. Você verá o domínio aparecer na lista de domínios configurados

### Verificação

Após criar, você pode verificar se funcionou:

```bash
# Aguarde 2-5 minutos e teste:
curl -I https://phdstudio.com.br
```

Você deve receber um `HTTP/2 200` (não mais 404).

### Observações Importantes

- ✅ **HTTPS ativado**: O Easypanel irá gerenciar o certificado SSL automaticamente
- ✅ **Porta 80**: É a porta interna do container (Nginx escuta na porta 80)
- ✅ **Protocolo HTTP**: É o protocolo interno (o Traefik/Easypanel faz o proxy HTTPS → HTTP internamente)
- ⚠️ **Não altere** os campos que já vêm pré-preenchidos (`/` e `80`)
- ⚠️ **Apenas preencha** o campo "Host" com `phdstudio.com.br`

### Troubleshooting

Se após criar o domínio ainda não funcionar:

1. **Aguarde 2-5 minutos**: Certificados SSL precisam de tempo para serem emitidos
2. **Verifique os logs**: No painel, vá em "Logs" do serviço phdstudio
3. **Confirme o DNS**: Certifique-se de que `phdstudio.com.br` aponta para `148.230.79.105`
4. **Verifique na lista**: O domínio deve aparecer na lista de domínios do serviço

