# 🛠️ Configuração de Desenvolvimento

## 📋 Environment Variables para Desenvolvimento

### 1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

### 2. O arquivo `.env` já está configurado com:

```bash
# Application
NODE_ENV=development
PORT=8080

# Database (MySQL)
DB_HOST=server.idenegociosdigitais.com.br
DB_PORT=3355
DB_USER=barbearia
DB_PASSWORD=5f8dab8402afe2a6e043
DB_NAME=barbearia-db

# JWT (Development keys)
JWT_SECRET=dev-jwt-secret-key-for-local-development-only
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=dev-refresh-secret-key-for-local-development-only
JWT_REFRESH_EXPIRES_IN=7d

# Messages
PING_MESSAGE=ping pong

# Debug
DEBUG=true
LOG_LEVEL=debug
```

## 🚀 Como Iniciar o Desenvolvimento

### 1. Instalar dependências:
```bash
pnpm install
```

### 2. Iniciar servidor de desenvolvimento:
```bash
pnpm run dev
```

### 3. Acessar aplicação:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/api
- **Documentação**: http://localhost:8080/api/docs
- **Health Check**: http://localhost:8080/api/ping

## 🔍 Verificar se está funcionando:

### 1. Teste a API:
```bash
curl http://localhost:8080/api/ping
```
**Resposta esperada:**
```json
{
  "message": "ping pong",
  "status": "healthy",
  "timestamp": "2024-xx-xxT...",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Teste conexão com banco:
```bash
curl http://localhost:8080/api/barbearias
```
**Resposta esperada:**
```json
{
  "barbearias": [...]
}
```

## 🗄️ Banco de Dados

### Configuração Automática
- ✅ Conecta automaticamente ao MySQL configurado
- ✅ Verifica estrutura do banco
- ✅ Inicializa tabelas se necessário
- ✅ Popula dados de exemplo

### Logs Esperados:
```
✅ Conectado ao MySQL: server.idenegociosdigitais.com.br
✅ Estrutura do banco de dados verificada
ℹ️ Tabelas já existem, pulando inicialização para evitar conflitos
```

## 📁 Estrutura do Projeto

```
/
├── .env                    # Variáveis de ambiente (development)
├── .env.example           # Exemplo de configuração
├── server/                # Backend API
│   ├── index.ts          # Servidor principal
│   ├── config/           # Configurações
│   ├── routes/           # Rotas da API
│   └── utils/            # Utilidades
├── client/               # Frontend (React)
├── shared/               # Código compartilhado
└── dist/                 # Build de produção
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev              # Inicia dev server (frontend + backend)

# Build
pnpm run build            # Build completo (frontend + backend)
pnpm run build:server     # Build apenas backend
pnpm run build:stable     # Build estável para produção

# Produção
pnpm run start            # Inicia servidor de produção
```

## 🚨 Troubleshooting

### Erro de Conexão com Banco:
```
❌ Error: connect ECONNREFUSED
```
**Solução:** Verificar se as credenciais do banco estão corretas no `.env`

### Porta em Uso:
```
❌ Error: listen EADDRINUSE :::8080
```
**Solução:** 
```bash
# Matar processo na porta 8080
lsof -ti:8080 | xargs kill -9
```

### Dependências em Falta:
```bash
pnpm install
```

### Limpar Cache:
```bash
rm -rf node_modules dist .vite
pnpm install
```

## 🔒 Segurança

### Desenvolvimento vs Produção:
- ✅ **Development**: Usa chaves JWT simples
- ⚠️ **Production**: DEVE usar chaves seguras geradas

### Para Produção (EasyPanel):
Gere chaves seguras:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Recursos

- **API Docs**: http://localhost:8080/api/docs
- **Postman Collection**: http://localhost:8080/api/docs/postman-collection
- **Health Check**: http://localhost:8080/health

---

🎯 **Objetivo**: Ambiente de desenvolvimento funcionando em http://localhost:8080
