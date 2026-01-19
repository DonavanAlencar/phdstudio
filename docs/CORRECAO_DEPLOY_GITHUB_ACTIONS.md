# 🔧 Correção: Deploy via GitHub Actions - Problema de Sincronização

## Problema Identificado

Quando o deploy era acionado via GitHub Actions após um `git push` de outra máquina (WSL2 Ubuntu), o site saía do ar. O problema estava relacionado à sincronização do código antes do deploy.

### Causa Raiz

1. **Git Pull Inconsistente**: O script `deploy-remote.sh` só fazia deploy se detectasse mudanças, mas não garantia que o código estava sincronizado
2. **Timing**: O GitHub Actions executava o deploy antes de garantir que o código no servidor estava atualizado
3. **Falta de Validação**: Não havia validação para garantir que o código local estava sincronizado com o remoto antes do deploy

## Soluções Implementadas

### 1. Melhoria no `git_pull()` do `deploy-remote.sh`

**Antes:**
- Retornava erro (1) se não havia mudanças
- Não validava sincronização após pull
- Não tratava adequadamente divergências

**Depois:**
- ✅ Sempre executa e valida sincronização
- ✅ Trata todos os casos: atualizado, atrás, à frente, divergente
- ✅ Valida que local e remoto estão sincronizados após pull
- ✅ Faz stash de mudanças locais não commitadas se necessário
- ✅ Garante que está no branch correto

### 2. Mudança no Fluxo Principal

**Antes:**
```bash
if git_pull; then
    log "Mudanças detectadas. Iniciando processo de deploy..."
else
    log "Nenhuma mudança detectada. Nada para implantar."
    exit 0
fi
```

**Depois:**
```bash
# SEMPRE fazer git pull antes do deploy para garantir sincronização
log "Sincronizando código com repositório remoto..."
git_pull || error "Falha ao sincronizar código do repositório"

log "Código sincronizado. Iniciando processo de deploy..."
```

### 3. Workflow do GitHub Actions Melhorado

Adicionada etapa **"Ensure Git is up to date before deploy"** que:

1. **Faz fetch** do repositório remoto
2. **Verifica e muda** para o branch correto (main/master)
3. **Faz pull** para garantir sincronização
4. **Mostra commit atual** para validação

E na etapa de deploy:

1. **Verifica branch** novamente
2. **Faz última verificação** de sincronização
3. **Faz pull final** se necessário
4. **Só então executa** o deploy

## Fluxo Corrigido

```
1. Desenvolvedor faz commit e push (WSL2 Ubuntu)
   ↓
2. GitHub Actions é acionado
   ↓
3. GitHub Actions conecta via SSH
   ↓
4. [NOVO] Garante que código está sincronizado (git fetch + pull)
   ↓
5. [NOVO] Valida sincronização (local == remoto)
   ↓
6. Executa deploy-remote.sh
   ↓
7. deploy-remote.sh faz git_pull() novamente (com validação)
   ↓
8. Valida que está sincronizado
   ↓
9. Para containers antigos
   ↓
10. Faz build das imagens
   ↓
11. Faz deploy
   ↓
12. Verifica status
```

## Benefícios

✅ **Garantia de Sincronização**: Código sempre atualizado antes do deploy  
✅ **Prevenção de Downtime**: Não tenta fazer deploy com código desatualizado  
✅ **Validação Dupla**: GitHub Actions + deploy-remote.sh validam sincronização  
✅ **Tratamento de Erros**: Falha claramente se não conseguir sincronizar  
✅ **Logs Detalhados**: Mostra exatamente o que está acontecendo em cada etapa  

## Como Testar

1. Faça uma mudança no código
2. Commit e push:
   ```bash
   git add .
   git commit -m "Teste de deploy"
   git push origin main
   ```
3. Observe o GitHub Actions:
   - Deve mostrar "Ensure Git is up to date before deploy"
   - Deve mostrar commit atual
   - Deve executar deploy sem erros
4. Site deve continuar funcionando durante todo o processo

## Troubleshooting

### Se o deploy ainda falhar:

1. **Verificar logs do GitHub Actions**:
   - Ver se a etapa "Ensure Git is up to date" passou
   - Ver se o commit mostrado é o correto

2. **Verificar no servidor**:
   ```bash
   cd /root/phdstudio
   git status
   git log -1 --oneline
   ```

3. **Verificar sincronização manual**:
   ```bash
   git fetch origin main
   git pull origin main
   ```

4. **Executar deploy manualmente**:
   ```bash
   ./deploy/docker/scripts/deploy-remote.sh
   ```

---

**Data da Correção:** 2026-01-19  
**Status:** ✅ Implementado e testado
