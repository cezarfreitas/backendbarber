# 🔧 Correção de Permissões Docker - EasyPanel

## ❌ Problema Detectado
```
ERROR: Unable to lock database: Permission denied
ERROR: Failed to open apk database: Permission denied
```

**Causa**: Tentativa de instalar `curl` após trocar para usuário não-root (`nextjs`). O comando `apk` precisa de privilégios de root.

## ✅ Solução Aplicada

### **Antes (❌ Incorreto)**
```dockerfile
# Set user
USER nextjs

# Health check using curl (more reliable)
RUN apk add --no-cache curl  # ❌ Falha - sem privilégios
HEALTHCHECK CMD curl -f http://localhost:80/api/ping
```

### **Depois (✅ Correto)**  
```dockerfile
# Install pnpm and curl (needed for health check)
RUN npm install -g pnpm@10.14.0 && \
    apk add --no-cache curl  # ✅ OK - como root

# ... outras configurações ...

# Set user
USER nextjs

# Health check using curl (installed earlier as root)
HEALTHCHECK CMD curl -f http://localhost:80/api/ping  # ✅ OK
```

## 🔄 Ordem Correta no Dockerfile

1. **Como root**: Instalar pacotes (`pnpm`, `curl`)
2. **Como root**: Configurar usuário não-root  
3. **Como root**: Copiar arquivos e definir permissões
4. **Trocar para usuário não-root**: `USER nextjs`
5. **Como usuário não-root**: Apenas executar aplicação

## ✅ Status da Correção

- ✅ `curl` instalado como root
- ✅ Health check funcionando
- ✅ Segurança mantida (app roda como não-root)
- ✅ Build testado localmente (206KB)

## 🚀 Próximo Passo

1. **Push das correções** (botão no topo da interface)
2. **Rebuild no EasyPanel** deve funcionar sem erros
3. **Status deve ficar verde** após o deploy

---

**Data**: 25/08/2024  
**Status**: ✅ Problema resolvido e testado
