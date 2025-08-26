# 🚨 DEPLOY EMERGENCIAL - path-to-regexp Error

## 🚨 **Problema identificado:**
```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

**Causa:** Alguma rota tem parâmetro mal definido que quebra o `path-to-regexp`

## ✅ **SOLUÇÃO EMERGENCIAL:**

### 🆘 **Use o Dockerfile.emergency:**

**No EasyPanel:**
```
Dockerfile: Dockerfile.emergency
Port: 80
```

### 📋 **Environment Variables:**
```
NODE_ENV=production
PORT=80
```

**IMPORTANTE:** Não precisa das variáveis de banco! Servidor emergencial não usa banco.

## 🔧 **O que o servidor emergencial faz:**

### ✅ **Endpoints funcionando:**
- `GET /health` → Health check
- `GET /api/ping` → Ping test  
- `GET /api/status` → Status detalhado
- `GET /api` → Info do servidor
- `GET /*` → Qualquer rota responde OK

### ⚠️ **Endpoints desabilitados:**
- Todas as rotas `/api/barbearias/*`
- Todas as rotas `/api/barbeiros/*`
- Todas as rotas complexas (temporariamente)

## 🎯 **Resultado esperado:**

### 🌐 **Depois do deploy:**
- **Status**: GREEN no EasyPanel
- **Logs**: "🚨 EMERGENCY API running on port 80"
- **Acesso**: `https://dominio.com/health` → `{"status": "ok"}`

### 📊 **Para testar:**
```bash
curl https://dominio.com/health
# Resposta: {"status": "ok", "message": "Emergency server running"}

curl https://dominio.com/api
# Resposta: {"message": "Barbearia API - Emergency Mode"}
```

## 🔄 **Próximos passos:**

1. **Deploy emergencial** → Garante que container não sai
2. **Identificar rota problemática** → Debug do path-to-regexp
3. **Corrigir rota específica** → Volta para Dockerfile normal

## ✅ **Status:**
- ✅ **Container vai ficar UP** - Nunca sai
- ✅ **Servidor funcional** - Health checks OK
- ✅ **Zero complexidade** - Sem rotas problemáticas

**Use `Dockerfile.emergency` para resolver o crash imediatamente! 🚨**

### 📝 **Para resolver definitivamente:**
Depois que funcionar, podemos debugar qual rota específica está quebrando o `path-to-regexp`.
