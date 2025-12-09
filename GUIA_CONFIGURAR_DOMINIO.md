# Guia: Configurar Domínio phdstudio.com.br no Easypanel

## Situação Atual

✅ **Aplicação funcionando**: https://phdstudio-phdstudio.topuph.easypanel.host/  
✅ **DNS configurado**: phdstudio.com.br → 148.230.79.105  
✅ **Container rodando**: phdstudio_phdstudio.1.lywlp9n9eqow60vk42jyfhunk  
❌ **Domínio personalizado**: phdstudio.com.br retorna 404 (não configurado no Easypanel)

## Passo a Passo para Configurar o Domínio

### 1. Acesse o Painel do Easypanel

1. Abra o painel do Easypanel no navegador
2. Faça login se necessário

### 2. Navegue até a Seção "Domínios"

1. No menu lateral esquerdo, clique em **"Domínios"** (abaixo de "Visão Geral")
2. Você verá a lista de domínios configurados (provavelmente vazia ou só com o domínio do Easypanel)

### 3. Adicionar Novo Domínio

1. Clique no botão **"+ Adicionar Domínio"** ou **"+ Domínio"** (botão verde/azul)
2. Preencha os campos:
   - **Domínio**: `phdstudio.com.br`
   - **Serviço**: Selecione `phdstudio` (ou o nome do seu serviço)
   - **Porta**: `80` (porta interna do container)
   - **SSL/HTTPS**: Marque para habilitar (o Easypanel gerencia certificados Let's Encrypt automaticamente)

### 4. Configurar SSL/HTTPS

O Easypanel geralmente oferece opções:
- **Let's Encrypt**: Certificado SSL gratuito e automático (recomendado)
- **Certificado customizado**: Se você já tiver um certificado

**Recomendação**: Use Let's Encrypt, que é gerenciado automaticamente pelo Easypanel.

### 5. Salvar e Aguardar

1. Clique em **"Salvar"** ou **"Adicionar"**
2. O Easypanel irá:
   - Configurar o roteamento do domínio
   - Solicitar certificado SSL (se Let's Encrypt estiver habilitado)
   - Pode levar alguns minutos para o certificado ser emitido

### 6. Verificar Configuração

Após alguns minutos, teste:
```bash
curl -I https://phdstudio.com.br
```

Você deve receber um HTTP 200 (não mais 404).

## Informações Técnicas do Serviço

- **Nome do serviço**: `phdstudio`
- **Container**: `phdstudio_phdstudio.1.lywlp9n9eqow60vk42jyfhunk`
- **Porta interna**: `80`
- **Rede**: `easypanel`
- **IP na rede**: `10.11.1.46`

## Troubleshooting

### Se o domínio ainda não funcionar após configurar:

1. **Verifique os logs do Easypanel/Traefik**:
   ```bash
   docker logs traefik.1.u6nqhir2yqr5fy39mnfu9yu9x --tail 50
   ```

2. **Verifique se o DNS propagou completamente**:
   ```bash
   dig phdstudio.com.br
   nslookup phdstudio.com.br
   ```

3. **Aguarde alguns minutos**: Certificados SSL podem levar 2-5 minutos para serem emitidos

4. **Verifique no painel**: Confirme que o domínio aparece na lista de domínios configurados

## Notas Importantes

- O Easypanel gerencia os domínios através do seu painel web, não através de labels Docker
- O certificado SSL será renovado automaticamente pelo Easypanel
- O redirecionamento HTTP → HTTPS geralmente é automático
- Se houver problemas, verifique se o serviço está rodando e acessível na porta 80

