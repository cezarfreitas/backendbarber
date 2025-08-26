#!/usr/bin/env ts-node

/**
 * Script para atualizar a senha da Barbearia do João
 * 
 * Execute com: npx ts-node server/scripts/update-barbearia-password.ts
 */

import { initDatabase, executeQuery, executeQuerySingle } from "../config/database";
import bcrypt from "bcryptjs";

async function updateBarbeariaPassword() {
  console.log("🔑 Atualizando senha da Barbearia do João...");
  
  try {
    // Conectar ao banco
    await initDatabase();
    console.log("✅ Conectado ao banco de dados");

    // Verificar se a barbearia existe
    const barbearia = await executeQuerySingle(
      `SELECT id, nome, contato_email FROM barbearias WHERE id = '1' OR nome LIKE '%João%'`
    );

    if (!barbearia) {
      console.log("❌ Barbearia do João não encontrada!");
      return;
    }

    console.log(`📍 Encontrada barbearia:`, {
      id: barbearia.id,
      nome: barbearia.nome,
      email: barbearia.contato_email
    });

    // Gerar hash da nova senha
    const novaSenha = "123456";
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    
    console.log("🔐 Hash gerado para a senha:", senhaHash);

    // Atualizar a senha
    await executeQuery(
      `UPDATE barbearias SET senha_hash = ? WHERE id = ?`,
      [senhaHash, barbearia.id]
    );

    console.log("✅ Senha atualizada com sucesso!");

    // Verificar se a atualização funcionou
    const verificacao = await executeQuerySingle(
      `SELECT senha_hash FROM barbearias WHERE id = ?`,
      [barbearia.id]
    );

    // Testar se a senha funciona
    const senhaValida = await bcrypt.compare(novaSenha, verificacao.senha_hash);
    
    if (senhaValida) {
      console.log("✅ Verificação: Nova senha funciona corretamente!");
    } else {
      console.log("❌ Erro: Nova senha não está funcionando!");
    }

    console.log(`
🎯 RESUMO:
- Barbearia: ${barbearia.nome}
- Email: ${barbearia.contato_email}
- Nova senha: ${novaSenha}
- Status: ✅ Atualizada com sucesso
    `);

  } catch (error) {
    console.error("❌ Erro durante a atualização:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar script
updateBarbeariaPassword();
