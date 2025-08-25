# ⚡ Configuração EasyPanel - Porta 80

## ✅ **Alterações Realizadas**

Todos os arquivos foram atualizados para usar a **porta 80** padrão do EasyPanel:

### 📁 **Arquivos Modificados:**

1. **`Dockerfile`**
   - `EXPOSE 80`
   - `ENV PORT=80`
   - Health check ajustado para `localhost:80`

2. **`docker-compose.yml`**
   - Ports: `"80:80"`
   - Environment: `PORT=80`
   - Health check: `localhost:80`

3. **`server/node-build.ts`**
   - Default port: `process.env.PORT || 80`

4. **`DEPLOY_EASYPANEL.md`**
   - Todos os exemplos atualizados para porta 80
   - Configurações e troubleshooting ajustados

### 🔧 **Scripts Criados:**

- **`scripts/build-production.sh`** - Build para produção
- **`scripts/test-docker-easypanel.sh`** - Teste local do Docker

## 🚀 **Deploy no EasyPanel**

### **Configuração Rápida:**

```yaml
# EasyPanel Application Settings
Name: barbearia-api
Type: Docker
Repository: seu-repositorio
Dockerfile: ./Dockerfile
Port: 80
```

### **Variáveis de Ambiente Essenciais:**

```bash
NODE_ENV=production
PORT=80
DB_HOST=seu-mysql-host
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=barbearia-db
JWT_SECRET=sua-chave-segura-256-bits
```

### **Health Check:**
```bash
URL: /api/ping
Interval: 30s
```

## 🧪 **Teste Local**

Para testar localmente com porta 80:

```bash
# Tornar scripts executáveis (se necessário)
chmod +x scripts/*.sh

# Testar build Docker
./scripts/test-docker-easypanel.sh

# Build para produção
./scripts/build-production.sh
```

### **Teste Manual Docker:**

```bash
# Build
docker build -t barbearia-api .

# Run (porta 80 do container -> 8080 local)
docker run -p 8080:80 -e PORT=80 barbearia-api

# Teste
curl http://localhost:8080/api/ping
```

## 📊 **Recursos Recomendados EasyPanel:**

### **Mínimo:**
- CPU: 0.25 cores
- RAM: 256 MB
- Storage: 1 GB

### **Produção:**
- CPU: 0.5-1 cores  
- RAM: 512 MB - 1 GB
- Storage: 2-5 GB

## 🔗 **URLs Finais:**

Após deploy no EasyPanel:

```bash
# API Base
https://seu-dominio.com/api/ping

# Documentação
https://seu-dominio.com/api/docs

# Collection Postman
https://seu-dominio.com/api/docs/postman-collection
```

## ✅ **Checklist Deploy:**

- [ ] Dockerfile configurado para porta 80
- [ ] Variáveis de ambiente definidas no EasyPanel
- [ ] Banco de dados MySQL configurado
- [ ] Health check funcionando (`/api/ping`)
- [ ] Documentação acessível (`/api/docs`)
- [ ] APIs funcionando corretamente

---

🎯 **Pronto para deploy no EasyPanel com porta 80!**
