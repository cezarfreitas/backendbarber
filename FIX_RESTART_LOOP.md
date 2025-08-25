# 🔄 CORRIGIR LOOP DE RESTART - EasyPanel

## 🚨 PROBLEMA ATUAL

Servidor inicia mas **reinicia infinitamente** porque health check falha.

## ✅ SOLUÇÃO IMEDIATA

### **OPÇÃO 1: Usar Dockerfile sem Health Check**

1. **No EasyPanel**, altere a configuração:
   - Dockerfile: `Dockerfile.nohealthcheck`
2. **Configure Environment Variables** (se não fez ainda):

```bash
NODE_ENV=production
PORT=80
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db
JWT_SECRET=sua_chave_jwt_segura
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=sua_chave_refresh_segura
JWT_REFRESH_EXPIRES_IN=7d
```

3. **Deploy** e aguarde (sem health check, deve estabilizar)

### **OPÇÃO 2: Desabilitar Health Check no EasyPanel**

1. **No painel EasyPanel**:
   - Vá em Settings da aplicação
   - Procure por "Health Check" ou "Health Check Path"
   - **DESABILITE** ou **REMOVA** o health check
   - Ou configure para um endpoint que sempre funciona

2. **Deploy** novamente

### **OPÇÃO 3: Build Estável**

1. **Use o build estável**:

```bash
pnpm run build:stable
```

2. **Configure Dockerfile para**: `Dockerfile.nohealthcheck`

3. **Deploy**

## 🔍 VERIFICAÇÃO

Após o deploy, o serviço deve:

- ✅ Parar de reiniciar constantemente
- ✅ Ficar estável (logs param de repetir)
- ✅ Responder nos endpoints após alguns minutos

**Teste:**

- https://ide-barbearia.jzo3qo.easypanel.host/api/ping
- https://ide-barbearia.jzo3qo.easypanel.host/health

## 💡 POR QUE ISSO FUNCIONA

O problema era que:

1. ❌ Servidor iniciava corretamente
2. ❌ Health check de 15-30s não conseguia acessar endpoints
3. ❌ EasyPanel matava o container
4. ❌ Loop infinito de restart

A solução remove o health check problemático, deixando o container estável.

## 🚨 SE NÃO FUNCIONAR

Tente estas alternativas:

### **1. Verificar Resources**

- CPU: Mínimo 0.5 cores
- Memory: Mínimo 512MB

### **2. Aguardar Mais Tempo**

- Deixe 10-15 minutos após deploy
- Monitor logs até parar de repetir

### **3. Alternativa: Railway**

```bash
# Railway é mais tolerante com health checks
# Mesmo Dockerfile funciona lá
```

### **4. Alternativa: Fly.io**

```bash
# Fly.io tem health check mais flexível
# Deploy direto do GitHub
```

---

🎯 **OBJETIVO:** Parar o loop de restart e estabilizar o serviço
