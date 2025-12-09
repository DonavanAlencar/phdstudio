# Configuração do phdstudio.com.br no Easypanel

## Problema Identificado

O Traefik está com erro de versão da API do Docker (versão 1.24 vs 1.44 requerida) e não consegue detectar containers automaticamente. Por isso, o domínio phdstudio.com.br precisa ser configurado diretamente no painel do Easypanel.

## Status Atual

✅ Container `phdstudio-app` está rodando  
✅ Container está na rede `easypanel`  
✅ Container expõe a porta 80  
✅ Aplicação responde corretamente internamente  
❌ Traefik não está detectando o container (erro de versão da API)  
❌ Domínio precisa ser configurado no painel do Easypanel  

## Passos para Configurar no Easypanel

1. **Acesse o painel do Easypanel**
   - URL: http://seu-servidor:3000 (ou conforme configurado)

2. **Encontre o serviço phdstudio**
   - Procure pelo container `phdstudio-app` na lista de serviços
   - Ou crie um novo serviço apontando para o container existente

3. **Configure o domínio phdstudio.com.br**
   - Adicione o domínio `phdstudio.com.br` ao serviço
   - Configure para apontar para o container `phdstudio-app` na porta `80`
   - Configure SSL/HTTPS (o Easypanel pode gerenciar certificados Let's Encrypt)

4. **Verifique a configuração**
   - O container deve estar acessível em: `phdstudio-app:80` (dentro da rede easypanel)
   - IP do container na rede easypanel: Verifique com `docker inspect phdstudio-app`

## Informações do Container

- **Nome do container**: `phdstudio-app`
- **Porta interna**: `80`
- **Rede**: `easypanel`
- **Status**: Rodando

## Comandos Úteis

```bash
# Verificar status do container
docker ps | grep phdstudio

# Ver logs do container
docker logs -f phdstudio-app

# Verificar IP do container na rede easypanel
docker inspect phdstudio-app | grep -A 10 "easypanel"

# Testar aplicação internamente
docker exec phdstudio-app curl http://localhost
```

## Solução Alternativa: Corrigir Traefik

Se preferir usar o Traefik, será necessário:

1. Atualizar o Traefik para uma versão compatível com a API do Docker 1.44+
2. Ou configurar o Traefik para usar uma versão mais antiga da API (não recomendado)

## Nota sobre o Traefik

O Traefik está apresentando o seguinte erro:
```
Error response from daemon: client version 1.24 is too old. Minimum supported API version is 1.44
```

Isso indica que o Traefik precisa ser atualizado ou reconfigurado para funcionar com a versão atual do Docker.

