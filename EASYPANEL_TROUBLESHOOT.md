# EasyPanel Container Troubleshooting Guide

## Problema: "No running containers found" após deploy

### Causa Comum

O container inicia mas para devido a **falha no health check**.

## ✅ Soluções Implementadas

### 1. Health Check Melhorado

```dockerfile
# Dockerfile - Health check com múltiplos endpoints e mais tempo
HEALTHCHECK --interval=30s --timeout=20s --start-period=180s --retries=10 \
    CMD curl -f -s http://localhost:80/health || curl -f -s http://localhost:80/api/ping || curl -f -s http://0.0.0.0:80/health || exit 1
```

**Melhorias:**

- ✅ `start-period=180s` - 3 minutos para aplicação inicializar
- ✅ `retries=10` - Mais tentativas antes de marcar como falha
- ✅ Múltiplos endpoints: `/health`, `/api/ping`
- ✅ Fallback para `0.0.0.0` se `localhost` falhar

### 2. Endpoints de Health Simples

**Endpoint Ultra-Simples:** `/health`

```typescript
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});
```

**Endpoint Completo:** `/api/ping`

```typescript
app.get("/api/ping", (_req, res) => {
  res.status(200).json({
    message: "ping",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### 3. Variáveis de Ambiente Essenciais

Configure no EasyPanel:

```bash
# Obrigatórias
NODE_ENV=production
PORT=80

# Database (configure com seus dados)
DB_HOST=seu-mysql-host
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=barbearia-db

# JWT (gere chaves seguras)
JWT_SECRET=sua-chave-jwt-256-bits
JWT_EXPIRES_IN=24h
```

## 🔍 Como Diagnosticar

### 1. Verificar Logs no EasyPanel

- Acesse **Application → Logs**
- Procure por:
  ```
  🚀 API Barbearia SaaS running on port 80
  ✅ Conectado ao MySQL
  ✅ Server startup completed successfully
  ```

### 2. Testar Health Check Manualmente

```bash
# Teste local antes do deploy
docker build -t test-barbearia .
docker run -p 8080:80 test-barbearia

# Em outro terminal
curl http://localhost:8080/health
curl http://localhost:8080/api/ping
```

### 3. Sinais de Problemas Comuns

**❌ Database Connection Failed:**

```
Error: connect ECONNREFUSED
```

**Solução:** Verificar variáveis DB_HOST, DB_USER, DB_PASSWORD

**❌ Port Already in Use:**

```
Error: listen EADDRINUSE :::80
```

**Solução:** EasyPanel gerencia isso automaticamente

**❌ Missing Environment Variables:**

```
JWT_SECRET is required
```

**Solução:** Configurar todas as variáveis obrigatórias

## 🛠️ Passos para Corrigir

### 1. Atualizar Código

- ✅ Health check melhorado já implementado
- ✅ Endpoints de health adicionados
- ✅ Error handling melhorado

### 2. Rebuild no EasyPanel

1. Acesse sua aplicação no EasyPanel
2. Clique em **"Deploy"** ou **"Rebuild"**
3. Aguarde 3-5 minutos para build completo

### 3. Configurar Variáveis de Ambiente

- Vá em **Application → Environment Variables**
- Configure todas as variáveis listadas acima

### 4. Monitorar Logs

- Durante o deploy, monitore os logs
- Verifique se aparecem as mensagens de sucesso

### 5. Testar Endpoints

Após deploy bem-sucedido:

```bash
# Health check simples
curl https://seu-dominio.com/health

# Health check completo
curl https://seu-dominio.com/api/ping

# Documentação da API
curl https://seu-dominio.com/api/docs
```

## 🎯 Checklist de Deploy

- [ ] Código atualizado com health checks melhorados
- [ ] Dockerfile com timing adequado para EasyPanel
- [ ] Variáveis de ambiente configuradas
- [ ] Build realizado no EasyPanel
- [ ] Logs mostram inicialização bem-sucedida
- [ ] Health checks respondem corretamente
- [ ] API endpoints funcionando

## 🚨 Se Ainda Não Funcionar

1. **Verifique Resource Limits**
   - CPU: Mínimo 0.25 cores
   - Memory: Mínimo 512MB

2. **Contate Suporte EasyPanel**
   - Forneça os logs da aplicação
   - Mencione que health check está configurado corretamente

3. **Teste em Outro Provider**
   - Fly.io ou Railway como alternativa
   - Mesmo Dockerfile deve funcionar

## URLs para Testar Após Deploy

- Health: `https://seu-dominio.com/health`
- API Ping: `https://seu-dominio.com/api/ping`
- Docs: `https://seu-dominio.com/api/docs`
- API Base: `https://seu-dominio.com/api/barbearias`
