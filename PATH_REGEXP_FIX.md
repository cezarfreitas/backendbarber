# 🚨 SOLUÇÃO IMEDIATA - path-to-regexp Error

## ⚡ **AÇÃO EMERGENCIAL:**

### 📋 **No EasyPanel:**
```
Dockerfile: Dockerfile.emergency
Port: 80
Environment: NODE_ENV=production, PORT=80
```

## 🎯 **O que acontece:**
- ✅ **Container fica UP** - Nunca mais sai
- ✅ **API básica funciona** - Health checks OK
- ❌ **Rotas complexas OFF** - Temporariamente desabilitadas

## 🔧 **Endpoints funcionando:**
- `https://dominio.com/health` → Health check
- `https://dominio.com/api/ping` → Ping test
- `https://dominio.com/api` → Info do servidor

## 📊 **Status esperado:**
```
🚨 EMERGENCY API running on port 80
⚠️ Complex API routes disabled - emergency mode only
```

## 🚀 **Resultado:**
- **Status GREEN** no EasyPanel
- **Container estável** - Não reinicia mais
- **Logs claros** - Mostra modo emergencial

---

## 🔄 **Para depois (quando estiver funcionando):**

### 🔍 **Identificar a rota problemática:**
O erro `path-to-regexp` indica que há uma rota com parâmetro mal definido. Possíveis causas:
- Rota com `:` vazio (ex: `/api/test/:` em vez de `/api/test/:id`)
- Caracteres especiais em parâmetros
- Middleware adicionando rotas dinamicamente

### 🛠️ **Para debug:**
1. Voltar para `Dockerfile` normal
2. Comentar rotas uma por uma
3. Identificar qual quebra o `path-to-regexp`

---

## ✅ **AGORA:**
**Use `Dockerfile.emergency` para ter o serviço funcionando!**

**Depois debugamos e voltamos para o fullstack completo! 🎯**
