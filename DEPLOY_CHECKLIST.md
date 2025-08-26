# ✅ Deploy Checklist - EasyPanel

## 🚀 **TUDO PRONTO! Use isto:**

### 📋 **EasyPanel Configuration:**

```
Dockerfile: Dockerfile (padrão)
Port: 80
```

### 🔧 **Environment Variables:**

```
NODE_ENV=production
PORT=80
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db
JWT_SECRET=seu_jwt_secret_aqui
```

## 🎯 **O que acontece:**

1. **Build multi-stage** → Frontend + Backend
2. **Express serve tudo** → API + Frontend React
3. **Uma porta** → 80 (frontend + API)
4. **SPA routing** → Todas as rotas funcionam

## 🌐 **Resultado:**

- `https://dominio.com/` → **Frontend React**
- `https://dominio.com/api/ping` → **API Health**
- `https://dominio.com/api/barbearias` → **API Data**

## 🔄 **Se der problema:**

Use `Dockerfile.robust` (só API básica)

**Mas deve funcionar! 🚀**
