# 🔧 Barbearia SaaS API

API REST para sistema de gerenciamento de barbearias.

## 🚀 Quick Start

### Desenvolvimento

```bash
# 1. Instalar dependências
pnpm install

# 2. Iniciar desenvolvimento
pnpm run dev

# 3. Acessar
http://localhost:8080
```

### Deploy

```bash
# 1. Configure variáveis (veja ENV_TEMPLATE.txt)
# 2. Deploy no EasyPanel/Railway/Fly.io
# 3. Pronto!
```

## 📚 Endpoints

- `GET /health` - Health check
- `GET /api/ping` - API status
- `GET /api/docs` - Documentação
- `GET /api/barbearias` - Lista barbearias

## 🗄️ Database

MySQL configurado e funcionando:

- Host: server.idenegociosdigitais.com.br
- Database: barbearia-db

## 📁 Arquivos

- `Dockerfile` - Deploy simples
- `DEPLOY.md` - Guia de deploy
- `ENV_TEMPLATE.txt` - Variáveis de ambiente
- `.env` - Desenvolvimento local

---

**Simples, limpo e funcional!** ✨
