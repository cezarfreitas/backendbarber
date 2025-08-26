# 🚀 Deploy Fullstack - Node.js + Express + Vite

## ✅ Arquitetura confirmada:

**Express serve API + Frontend na mesma porta:**

- `/` → Frontend (React/Vite buildado)
- `/api/*` → Backend API
- **Uma porta (80)** serve tudo

## 📋 Dockerfiles disponíveis:

### 1. **`Dockerfile.fullstack`** - Multi-stage otimizado (RECOMENDADO)

```dockerfile
# Build stage: npm run build:client + build:server
# Prod stage: Só node_modules + dist/
# Resultado: Imagem menor + mais rápida
```

### 2. **`Dockerfile.robust`** - Para resolver crashes

```dockerfile
# Servidor que nunca sai
# Só API básica (sem frontend)
# Para debug de problemas
```

### 3. **`Dockerfile.optimized`** - Segurança + otimização

```dockerfile
# Multi-stage + usuário não-root
# Health check integrado
# Mais seguro para produção
```

## 🎯 **Recomendação por situação:**

### 🔥 **Para resolver problema atual:**

```bash
Dockerfile: Dockerfile.robust
# Garante que não sai, depois migra
```

### ⚡ **Para produção completa:**

```bash
Dockerfile: Dockerfile.fullstack
# Serve frontend + API otimizado
```

### 🛡️ **Para produção segura:**

```bash
Dockerfile: Dockerfile.optimized
# + Segurança + Health check
```

## 🔧 **Configuração EasyPanel:**

**Para qualquer Dockerfile:**

```
Port: 80
Environment Variables:
  NODE_ENV=production
  PORT=80
  DB_HOST=server.idenegociosdigitais.com.br
  DB_PORT=3355
  DB_USER=barbearia
  DB_PASSWORD=5f8dab8402afe2a6e043
  DB_NAME=barbearia-db
  JWT_SECRET=seu_jwt_secret
```

## 📊 **Endpoints após deploy:**

- `https://seu-dominio.com/` → **Frontend** (React app)
- `https://seu-dominio.com/docs` → **Documentação** da API
- `https://seu-dominio.com/api/ping` → **Health check**
- `https://seu-dominio.com/api/barbearias` → **API** endpoints

**Tudo numa porta só! 🎯**

## 🚀 **Qual usar primeiro?**

1. **Se container ainda está saindo**: `Dockerfile.robust`
2. **Se quer tudo funcionando**: `Dockerfile.fullstack`
3. **Se quer máxima segurança**: `Dockerfile.optimized`
