# 🚀 Deploy Guide

## EasyPanel Deploy

### 1. Environment Variables

Configure estas variáveis no EasyPanel:

```
NODE_ENV=production
PORT=80
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 2. Deploy

- Push código para repositório
- Deploy no EasyPanel
- Aguarde 5-10 minutos

### 3. Teste

- https://seu-dominio.com/health
- https://seu-dominio.com/api/ping

## Outras Plataformas

Este Dockerfile funciona em:

- EasyPanel
- Railway
- Fly.io
- Render
- DigitalOcean App Platform

---

Simples assim! 🎯
