# 🚀 Deploy no EasyPanel - API Barbearia SaaS

Este guia explica como fazer deploy da API Barbearia SaaS no EasyPanel usando Docker.

## 📋 Pré-requisitos

- [x] Conta no EasyPanel
- [x] Banco MySQL configurado (pode ser no próprio EasyPanel ou externo)
- [x] Repositório Git com o código

## 🔧 Configuração no EasyPanel

### 1. **Criar Nova Aplicação**

1. Acesse seu painel EasyPanel
2. Clique em "Create Application"
3. Escolha "Docker" como tipo de aplicação
4. Configure:
   - **Name**: `barbearia-api`
   - **Domain**: Seu domínio personalizado ou use o subdomínio do EasyPanel
   - **Repository**: URL do seu repositório Git

### 2. **Configuração do Build**

```yaml
# Build Configuration
Build Command: docker build -t barbearia-api .
Dockerfile Path: ./Dockerfile
Context: .
Target: production
```

### 3. **Variáveis de Ambiente**

Configure as seguintes variáveis no EasyPanel:

#### **🔐 Obrigatórias**
```bash
NODE_ENV=production
PORT=80

# Database
DB_HOST=seu-mysql-host
DB_PORT=3306
DB_USER=seu-usuario-mysql
DB_PASSWORD=sua-senha-mysql
DB_NAME=barbearia-db

# JWT Security (GERE CHAVES SEGURAS!)
JWT_SECRET=sua-chave-jwt-super-secreta-256-bits
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=sua-chave-refresh-jwt-diferente-256-bits
JWT_REFRESH_EXPIRES_IN=7d
```

#### **⚙️ Opcionais**
```bash
PING_MESSAGE=API Barbearia Production Online!
```

### 4. **Configuração de Porta**

```yaml
Container Port: 80
```

### 5. **Health Check**

```yaml
Health Check URL: /api/ping
Health Check Interval: 30s
```

### 6. **Resources (Recursos)**

#### **Mínimo Recomendado:**
```yaml
CPU: 0.25 cores
Memory: 256 MB
Storage: 1 GB
```

#### **Produção Recomendada:**
```yaml
CPU: 0.5-1 cores
Memory: 512 MB - 1 GB
Storage: 2-5 GB
```

## 🗄️ Configuração do Banco de Dados

### **Opção 1: MySQL Gerenciado EasyPanel**

1. Crie um serviço MySQL no EasyPanel
2. Configure as credenciais nas variáveis de ambiente
3. A API inicializará as tabelas automaticamente

### **Opção 2: Banco Externo**

Se usando banco externo (PlanetScale, AWS RDS, etc.):

1. Configure as variáveis de ambiente com os dados de conexão
2. Certifique-se que o banco permite conexões externas
3. Adicione o IP do EasyPanel às regras de firewall se necessário

## 🚀 Deploy Steps

### **1. Push do Código**

```bash
git add .
git commit -m "Deploy to EasyPanel"
git push origin main
```

### **2. Configurar Webhook (Opcional)**

Para deploy automático a cada push:

1. Vá em Settings → Webhooks no EasyPanel
2. Copie a URL do webhook
3. Configure no seu repositório Git (GitHub/GitLab)

### **3. Deploy Manual**

No painel EasyPanel:
1. Clique em "Deploy"
2. Aguarde o build completar
3. Verifique os logs em caso de erro

## 📊 Monitoramento

### **Logs em Tempo Real**
```bash
# No painel EasyPanel, vá em Logs para ver:
🚀 Fusion Starter server running on port 80
📱 Frontend: http://localhost:80
🔧 API: http://localhost:80/api
✅ Conectado ao MySQL: seu-host
✅ Estrutura do banco de dados verificada
```

### **Endpoints de Saúde**
```bash
# Teste se a API está funcionando:
GET https://seu-dominio.com/api/ping
# Resposta esperada: {"message": "API Barbearia Production Online!"}

# Documentação da API:
GET https://seu-dominio.com/api/docs
```

## 🛠️ Troubleshooting

### **Problema: Build Falha**

```bash
# Verifique se o Dockerfile está correto
docker build -t test-barbearia .

# Teste localmente (mapeia porta 80 do container para 8080 local)
docker run -p 8080:80 test-barbearia
```

### **Problema: Erro de Conexão com Banco**

1. Verifique as variáveis de ambiente
2. Confirme que o banco está acessível
3. Teste conexão manual:

```bash
mysql -h SEU_HOST -P 3306 -u SEU_USER -p
```

### **Problema: API não Responde**

1. Verifique se a porta 80 está exposta
2. Confirme que `NODE_ENV=production`
3. Veja os logs da aplicação no painel

### **Problema: Variáveis de Ambiente**

```bash
# Teste se as variáveis estão sendo carregadas
curl https://seu-dominio.com/api/ping
# Deve retornar a mensagem configurada em PING_MESSAGE
```

## 🔒 Segurança

### **1. Gerar Chaves JWT Seguras**

```bash
# Use um gerador online ou:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2. Configurar CORS**

A API já está configurada para aceitar CORS. Para produção, considere restringir os domínios permitidos.

### **3. HTTPS**

O EasyPanel automaticamente fornece certificados SSL. Certifique-se de que está ativado.

## 📈 Otimizações

### **1. Cache de Dependências**

O Dockerfile já está otimizado com multi-stage build para cache eficiente.

### **2. Monitoramento**

Configure alertas no EasyPanel para:
- CPU > 80%
- Memory > 80%
- Aplicação down

### **3. Backup**

Configure backup automático do banco de dados no EasyPanel.

## 🔗 Links Úteis

- **API Docs**: `https://seu-dominio.com/api/docs`
- **Health Check**: `https://seu-dominio.com/api/ping`
- **Collection Postman**: `https://seu-dominio.com/api/docs/postman-collection`

## ✅ Checklist Final

- [ ] Dockerfile criado e testado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Deploy realizado com sucesso
- [ ] Health check funcionando
- [ ] API docs acessível
- [ ] Endpoints principais testados
- [ ] Monitoramento configurado

---

🎉 **Parabéns! Sua API Barbearia SaaS está online no EasyPanel!**

Para suporte, verifique os logs no painel e consulte a documentação da API em `/api/docs`.
