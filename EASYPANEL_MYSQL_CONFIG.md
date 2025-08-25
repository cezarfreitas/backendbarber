# EasyPanel MySQL Configuration

## 🗄️ Credenciais do Banco de Dados

### Connection String:
```
mysql://barbearia:5f8dab8402afe2a6e043@server.idenegociosdigitais.com.br:3355/barbearia-db
```

## ⚙️ Variáveis de Ambiente para EasyPanel

Configure estas variáveis no painel EasyPanel:

### **🔐 Obrigatórias - Database**
```bash
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db
```

### **🔐 Obrigatórias - Application**
```bash
NODE_ENV=production
PORT=80
```

### **🔐 Obrigatórias - JWT (GERE CHAVES SEGURAS!)**
```bash
JWT_SECRET=sua-chave-jwt-super-secreta-256-bits
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=sua-chave-refresh-diferente-256-bits
JWT_REFRESH_EXPIRES_IN=7d
```

### **⚙️ Opcionais**
```bash
PING_MESSAGE=API Barbearia Production Online!
```

## 🚀 Como Configurar no EasyPanel

### 1. Acesse Environment Variables
1. Acesse sua aplicação no EasyPanel
2. Vá em **"Settings"** → **"Environment Variables"**
3. Adicione todas as variáveis listadas acima

### 2. Generate JWT Secrets
Use um gerador de chaves seguras:
```bash
# Exemplo de comando para gerar chaves (execute em seu terminal local)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy & Test
1. Configure todas as variáveis
2. Clique em **"Deploy"** 
3. Monitore os logs:
   ```
   ✅ Conectado ao MySQL: server.idenegociosdigitais.com.br
   🚀 API Barbearia SaaS running on port 80
   ```

## 🔍 Endpoints para Testar

Após deploy bem-sucedido:
```bash
# Health checks
curl https://seu-dominio.com/health
curl https://seu-dominio.com/api/ping

# API endpoints
curl https://seu-dominio.com/api/barbearias
curl https://seu-dominio.com/api/docs
```

## ✅ Status da Configuração

- ✅ **Database**: MySQL configurado e testado
- ✅ **Connection Pool**: Configurado com limites adequados  
- ✅ **Environment Variables**: Configuração flexível entre dev/prod
- ✅ **Health Checks**: Endpoints configurados
- ✅ **Error Handling**: Tratamento robusto de conexões

## 🛠️ Troubleshooting

### Connection Refused
```bash
❌ Error: connect ECONNREFUSED
```
**Solução**: Verificar se as variáveis DB_HOST, DB_PORT estão corretas

### Authentication Failed  
```bash
❌ Error: Access denied for user
```
**Solução**: Verificar DB_USER e DB_PASSWORD

### Database Not Found
```bash
❌ Error: Unknown database
```
**Solução**: Verificar DB_NAME (deve ser 'barbearia-db')

## 🎯 Próximos Passos

1. ✅ Configure todas as variáveis no EasyPanel
2. ✅ Gere chaves JWT seguras
3. ✅ Deploy e monitore logs
4. ✅ Teste endpoints após deploy
5. ✅ Configure monitoramento e alertas
