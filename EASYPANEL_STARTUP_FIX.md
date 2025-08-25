# 🚀 EasyPanel Startup Fix Guide

## Problema: Serviço não inicia no EasyPanel

### 🔍 Diagnóstico Comum

**Sintomas:**
- Container não inicia ou para imediatamente
- "No running containers found" 
- Build falha silenciosamente
- Health check nunca passa

**Principais Causas:**
1. **Variáveis de ambiente em falta**
2. **Health check muito rigoroso**
3. **Dependências não instaladas**
4. **Erro durante build**
5. **Problema de conexão com banco**

## ✅ Soluções Implementadas

### 1. **Dockerfile Otimizado**
- ✅ Health check mais tolerante (5min startup, 15 retries)
- ✅ Logs detalhados durante build
- ✅ Verificação de dependências
- ✅ Script de diagnóstico integrado

### 2. **Startup Melhorado**
- ✅ Script de diagnóstico (`scripts/easypanel-startup-debug.sh`)
- ✅ Startup especializado (`server/easypanel-start.ts`)
- ✅ Error handling robusto
- ✅ Logs detalhados de inicialização

### 3. **Health Checks Múltiplos**
- ✅ `/health` - Ultra simples (apenas "OK")
- ✅ `/api/ping` - Completo com informações
- ✅ `/api/health` - Detalhado para debug

## 🔧 Configuração Obrigatória no EasyPanel

### **Environment Variables (OBRIGATÓRIAS)**

```bash
# Application
NODE_ENV=production
PORT=80

# Database (MySQL)
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db

# JWT Security (GERE CHAVES ÚNICAS!)
JWT_SECRET=SUA_CHAVE_JWT_SEGURA_256_BITS
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=SUA_CHAVE_REFRESH_DIFERENTE_256_BITS
JWT_REFRESH_EXPIRES_IN=7d

# Optional
PING_MESSAGE=API Barbearia EasyPanel Online!
```

### **Como Gerar Chaves JWT Seguras:**
```bash
# No seu terminal local:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🛠️ Passos para Corrigir

### **1. Atualizar Repository**
- ✅ Push das correções aplicadas
- ✅ Dockerfile otimizado
- ✅ Scripts de diagnóstico

### **2. Configurar EasyPanel**

#### **A. Environment Variables**
1. Acesse sua app no EasyPanel
2. Vá em **Settings** → **Environment Variables**
3. Configure TODAS as variáveis listadas acima
4. **IMPORTANTE:** Gere chaves JWT únicas e seguras

#### **B. Build Configuration**
```yaml
Build Command: docker build -t barbearia-api .
Dockerfile: ./Dockerfile
Context: .
Target: production
```

#### **C. Health Check Settings**
```yaml
Health Check Path: /health
Health Check Interval: 30s
Health Check Timeout: 30s
Health Check Retries: 15
```

#### **D. Resource Settings (Mínimo)**
```yaml
CPU: 0.5 cores
Memory: 512MB
```

### **3. Deploy e Monitor**

#### **Deploy:**
1. Configure todas as variáveis
2. Clique em **"Deploy"**
3. **Aguarde 5-10 minutos** (startup pode ser lento)

#### **Monitor Logs:**
Procure por estes logs de sucesso:
```
🚀 EasyPanel Startup - Barbearia SaaS API
✅ Server started successfully!
🚀 API Barbearia SaaS running on port 80
✅ Conectado ao MySQL: server.idenegociosdigitais.com.br
🎯 READY - Service is ready to accept connections
💓 Heartbeat - Memory: XXXmb
```

#### **Logs de Erro Comuns:**
```bash
# Variáveis em falta:
❌ DB_HOST: not set

# Conexão com banco:
❌ Error: connect ECONNREFUSED

# Porta em uso:
❌ Error: listen EADDRINUSE :::80

# Dependências:
❌ Cannot find module 'express'
```

### **4. Testar Endpoints**

Após deploy bem-sucedido:
```bash
# Health checks simples
curl https://seu-dominio.easypanel.host/health
# Resposta: OK

# Health check completo
curl https://seu-dominio.easypanel.host/api/ping
# Resposta: {"message":"ping pong","status":"healthy"...}

# API de barbearias
curl https://seu-dominio.easypanel.host/api/barbearias
# Resposta: {"barbearias":[...]}

# Documentação
curl https://seu-dominio.easypanel.host/api/docs
# Resposta: HTML da documentação
```

## 🚨 Se Ainda Não Funcionar

### **1. Use Dockerfile Alternativo**
Se o Dockerfile padrão não funcionar, tente:
```bash
# No EasyPanel, altere o Dockerfile para:
Dockerfile: ./Dockerfile.easypanel
```

### **2. Debug Manual**
Acesse os logs do container no EasyPanel e procure por:
- Mensagens de erro específicas
- Problemas de conexão
- Falhas de dependências

### **3. Teste Build Local**
```bash
# No seu ambiente local:
docker build -t test-barbearia -f Dockerfile.easypanel .
docker run -p 8080:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  -e DB_HOST=server.idenegociosdigitais.com.br \
  -e DB_PORT=3355 \
  -e DB_USER=barbearia \
  -e DB_PASSWORD=5f8dab8402afe2a6e043 \
  -e DB_NAME=barbearia-db \
  -e JWT_SECRET=test-secret \
  test-barbearia
```

### **4. Alternativas de Deploy**
Se EasyPanel continuar falhando:
- **Fly.io** (Dockerfile compatível)
- **Railway** (Deploy simples)
- **Render** (Auto-deploy do GitHub)
- **DigitalOcean App Platform**

## 📋 Checklist Final

- [ ] ✅ Repository atualizado com correções
- [ ] 🔧 Todas as environment variables configuradas
- [ ] 🔑 Chaves JWT geradas e configuradas
- [ ] 🏗️ Build configuration correta no EasyPanel
- [ ] ⚡ Resources adequados (>= 0.5 CPU, >= 512MB RAM)
- [ ] 🚀 Deploy realizado e aguardado tempo adequado
- [ ] 📊 Logs mostram mensagens de sucesso
- [ ] 🌐 Endpoints de health respondendo
- [ ] 🔗 API endpoints funcionando
- [ ] 📚 Documentação acessível

## 🆘 Suporte

Se nada funcionar:
1. **Copie os logs completos** do EasyPanel
2. **Verifique todas as environment variables**
3. **Teste build local** primeiro
4. **Considere provedor alternativo** temporariamente

---

🎯 **META:** Container rodando e respondendo em `/health` no EasyPanel
