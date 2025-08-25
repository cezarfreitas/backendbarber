# 🔧 Correção do Erro de Build - EasyPanel

## ❌ **Problema Identificado**

O erro no EasyPanel era:

```bash
error during build:
Could not resolve entry module "index.html".
```

**Causa:** O Dockerfile estava tentando fazer build do frontend (`build:client`) que procura por `index.html`, mas este é um projeto **backend-only**.

## ✅ **Soluções Implementadas**

### 1. **Dockerfile Corrigido**

- ✅ **Build apenas do servidor**: `pnpm run build:server`
- ✅ **Cópia seletiva**: Apenas arquivos necessários para backend
- ✅ **Multi-stage build**: Otimização para produção
- ✅ **Verificação de build**: Confirma se `production.mjs` foi criado

### 2. **Dependências Otimizadas**

- ✅ **vite.config.server.ts**: Dependências externas adicionadas
- ✅ **package.json**: Comando `start` corrigido
- ✅ **.dockerignore**: Remove arquivos frontend desnecessários

### 3. **Scripts de Teste**

- ✅ **`scripts/test-backend-build.sh`**: Teste local do build
- ✅ **Validação**: Verifica se build está funcional

## 🚀 **Teste Local Antes do Deploy**

### **1. Testar Build do Servidor**

```bash
# Fazer backup antes de testar (se necessário)
chmod +x scripts/test-backend-build.sh
./scripts/test-backend-build.sh
```

### **2. Testar Docker Build**

```bash
# Build da imagem
docker build -t barbearia-api-test .

# Test run (porta 80 -> 8080 local)
docker run -d --name test-api -p 8080:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  barbearia-api-test

# Testar API
curl http://localhost:8080/api/ping

# Cleanup
docker stop test-api && docker rm test-api && docker rmi barbearia-api-test
```

## 📋 **Estrutura de Build Corrigida**

### **Arquivos Copiados no Docker:**

```
server/           # Código do backend
shared/           # Código compartilhado
package.json      # Dependências
pnpm-lock.yaml    # Lock de versões
vite.config.server.ts  # Config do build servidor
tsconfig.json     # TypeScript config
```

### **Arquivos Ignorados:**

```
client/           # Frontend React (não necessário)
public/           # Assets frontend
index.html        # Entry point frontend
vite.config.ts    # Config do frontend
```

## ⚙️ **Configuração EasyPanel Atualizada**

### **Build Settings:**

```yaml
Dockerfile: ./Dockerfile
Context: .
Target: production
Port: 80
```

### **Environment Variables:**

```bash
NODE_ENV=production
PORT=80
DB_HOST=seu-mysql-host
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=barbearia-db
JWT_SECRET=sua-chave-segura
```

### **Health Check:**

```bash
URL: /api/ping
Interval: 30s
Timeout: 10s
```

## 🐛 **Troubleshooting Adicional**

### **Se ainda houver erro de build:**

1. **Verificar logs completos** no EasyPanel
2. **Limpar cache** do Docker: Settings → Clear Build Cache
3. **Redeploy** forçado: Force rebuild

### **Se erro de dependências:**

```bash
# Adicionar dependência como externa no vite.config.server.ts
external: [
  // ... outras dependências
  "nova-dependencia-aqui"
]
```

### **Se erro de porta:**

```bash
# Verificar se PORT=80 está configurado nas env vars
# Verificar se Container Port está setado para 80
```

## 📊 **Resultado Esperado**

### **Build Success:**

```bash
✅ Dependencies installed
✅ Server build completed
✅ production.mjs created
✅ Docker image built
✅ Container started on port 80
✅ Health check passing
```

### **API Endpoints Funcionais:**

```bash
GET /api/ping          # Health check
GET /api/docs          # Documentação
GET /api/barbearias    # Lista barbearias
GET /api/auth/login/celular  # Login
```

## 🎯 **Status Final**

- ✅ **Dockerfile**: Corrigido para backend-only
- ✅ **Build Process**: Apenas servidor
- ✅ **Dependencies**: Otimizadas
- ✅ **Port Configuration**: 80 (EasyPanel)
- ✅ **Health Check**: Funcionando
- ✅ **Test Scripts**: Criados

**🚀 Pronto para deploy no EasyPanel!**

---

Se ainda houver problemas, verifique:

1. Logs detalhados no EasyPanel
2. Configuração das variáveis de ambiente
3. Conectividade com banco de dados
4. Executar scripts de teste localmente primeiro
