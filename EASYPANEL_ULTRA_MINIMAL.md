# Ultra Minimal EasyPanel Deploy - NO HEALTH CHECK

Este é a abordagem mais simples possível para resolver o problema do serviço não iniciar no EasyPanel.

## 🔧 O que mudou:

1. **Dockerfile.ultra-minimal**: Docker sem NENHUM health check
2. **server/simple-start.ts**: Servidor básico que nunca trava
3. **vite.config.simple.ts**: Build simples para o servidor básico

## 📋 Passos para deploy:

### 1. Configurar no EasyPanel:

**Build Configuration:**
- Build Command: `pnpm install && npx vite build --config vite.config.simple.ts`
- Build Directory: `/`
- Port: `80`
- Dockerfile: `Dockerfile.ultra-minimal`

### 2. Environment Variables:

```
NODE_ENV=production
PORT=80
```

**IMPORTANTE**: Não adicione outras variáveis por enquanto. Vamos testar só com estas duas primeiro.

### 3. Deploy:

1. Faça o deploy no EasyPanel usando estas configurações
2. Aguarde o build completar
3. Teste o endpoint: `https://seu-dominio.com/health`

### 4. Se funcionar:

Quando o serviço estiver funcionando, adicione as outras variáveis:

```
NODE_ENV=production
PORT=80
DB_HOST=server.idenegociosdigitais.com.br
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_database
JWT_SECRET=seu_jwt_secret
```

## 🔍 Testando:

Quando funcionar, você deve ver:

- Status: **Verde** no EasyPanel
- Resposta no endpoint `/health`: `{"status": "ok", "timestamp": "..."}`
- Resposta no endpoint `/api/ping`: `{"message": "pong", "timestamp": "..."}`

## 🚨 Se NÃO funcionar:

1. Verifique os logs no EasyPanel
2. Confirme que está usando o `Dockerfile.ultra-minimal`
3. Confirme que o build command está correto
4. Teste localmente:

```bash
# Teste local
pnpm install
npx vite build --config vite.config.simple.ts
node dist/server/simple.mjs
```

## 📝 Notas:

- Este servidor é MUITO básico, só responde OK para testar se o container funciona
- Depois que funcionar, podemos adicionar funcionalidades gradualmente
- O objetivo é eliminar TODOS os pontos de falha possíveis
