#!/usr/bin/env ts-node

/**
 * Script para reset manual do banco de dados
 * 
 * Execute com: npm run reset-db
 * ou: npx ts-node server/scripts/reset-database.ts
 */

import { initDatabase } from "../config/database";
import { resetDatabase, clearData, initializeTables } from "../config/init-database";

async function main() {
  console.log("🚀 Iniciando script de reset do banco de dados...");
  
  try {
    // Conectar ao banco
    await initDatabase();
    console.log("✅ Conectado ao banco de dados");

    // Obter argumentos da linha de comando
    const args = process.argv.slice(2);
    const operation = args[0] || 'help';

    switch (operation) {
      case 'reset':
        console.log("⚠️ INICIANDO RESET COMPLETO...");
        await resetDatabase();
        console.log("✅ Reset completo finalizado!");
        break;

      case 'clear':
        console.log("🧹 INICIANDO LIMPEZA DE DADOS...");
        await clearData();
        console.log("✅ Limpeza de dados finalizada!");
        break;

      case 'init':
        console.log("🔄 INICIANDO VERIFICAÇÃO E CRIAÇÃO DE TABELAS...");
        await initializeTables();
        console.log("✅ Inicialização finalizada!");
        break;

      case 'help':
      default:
        console.log(`
📖 Como usar este script:

npm run reset-db reset     - Reset completo (remove e recria tabelas)
npm run reset-db clear     - Limpa dados (mantém estrutura)
npm run reset-db init      - Verifica/cria tabelas (não remove dados)
npm run reset-db help      - Mostra esta ajuda

⚠️ ATENÇÃO:
- 'reset' e 'clear' apagam TODOS os dados existentes
- Sempre faça backup antes de usar em produção
- Use apenas em desenvolvimento/teste
        `);
        break;
    }

  } catch (error) {
    console.error("❌ Erro durante a operação:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main();
}
