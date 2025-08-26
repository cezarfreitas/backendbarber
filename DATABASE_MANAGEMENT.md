# 🗄️ Gerenciamento do Banco de Dados

Este sistema possui funcionalidades completas para gerenciamento e reset do banco de dados.

## ✅ Funcionalidades Disponíveis

### 🚀 Inicialização Automática

- ✅ O sistema **automaticamente** verifica e cria todas as tabelas na inicialização
- ✅ Se as tabelas não existirem, são criadas automaticamente com dados iniciais
- ✅ Sistema de migração automática para adicionar novos campos

### 📋 Tabelas Criadas Automaticamente

- `barbearias` - Dados das barbearias
- `barbeiros` - Barbeiros e funcionários
- `servicos` - Catálogo de serviços
- `combos` - Pacotes de serviços com desconto
- `combo_servicos` - Relação many-to-many combos ↔ serviços
- `clientes` - Dados dos clientes

### 🔄 Comandos via NPM

```bash
# Verificar/criar tabelas (não remove dados existentes)
npm run db:init

# Limpar dados e reinserir dados iniciais (mantém estrutura)
npm run db:clear

# Reset completo - remove e recria tudo
npm run db:reset

# Ajuda
npm run db:help
```

### 🌐 Endpoints da API

#### ⚠️ Reset Completo

```bash
POST /api/admin/database/reset
Authorization: Bearer {jwt_token}
```

- Remove todas as tabelas
- Recria estrutura completa
- Insere dados iniciais

#### 🧹 Limpar Dados

```bash
POST /api/admin/database/clear-data
Authorization: Bearer {jwt_token}
```

- Remove todos os dados
- Mantém estrutura das tabelas
- Reinsere dados iniciais

#### 🔄 Recriar Tabelas

```bash
POST /api/admin/database/recreate-tables
Authorization: Bearer {jwt_token}
```

- Força verificação da estrutura
- Cria tabelas que não existem
- Não remove dados existentes

## 🔒 Segurança

- ✅ Todos os endpoints exigem autenticação JWT
- ✅ Apenas usuários tipo "barbearia" podem executar
- ✅ Logs de auditoria para todas as operações

## 📊 Dados Iniciais Inclusos

Quando as tabelas são criadas, o sistema insere automaticamente:

### 🏪 Barbearias de Exemplo

- 7 barbearias em diferentes cidades (SP, RJ, MG, RS, PR, BA)
- Dados completos: endere��o, contato, horários, etc.

### 👨‍💼 Barbeiros de Exemplo

- 3 barbeiros com diferentes tipos (comissionado, funcionário, freelancer)
- Especialidades, horários e formas de pagamento variadas

### ✂️ Serviços de Exemplo

- 8 serviços: cortes, barba, tratamentos, etc.
- Preços e durações realistas

### 🎁 Combos de Exemplo

- 4 combos com diferentes tipos de desconto
- Relações corretas com serviços

### 👥 Clientes de Exemplo

- 4 clientes com diferentes tipos de login
- Preferências e dados variados

## ⚠️ Importante

- **PRODUÇÃO**: Sempre faça backup antes de usar reset/clear
- **DESENVOLVIMENTO**: Use livremente para resetar o ambiente
- **DADOS**: Os comandos de reset/clear apagam TODOS os dados
- **AUTOMÁTICO**: Na inicialização, o sistema sempre verifica e cria tabelas automaticamente

## 🔧 Troubleshooting

Se você apagar as tabelas manualmente:

1. **Reinicie o servidor** - ele detectará e recriará automaticamente
2. **OU execute**: `npm run db:init`
3. **OU chame**: `POST /api/admin/database/recreate-tables`

O sistema é **resiliente** e sempre garante que as tabelas existam!
