import { RequestHandler } from "express";
import { executeQuery } from "../config/database";
import { hashSenha } from "../utils/auth";
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/criar-barbearia-teste
 * Endpoint temporário para criar barbearia de teste
 */
export const criarBarbeariaTeste: RequestHandler = async (req, res) => {
  try {
    console.log('🔨 Criando barbearia teste...');
    
    const id = uuidv4();
    const senhaHash = await hashSenha('123456');
    
    const sql = `
      INSERT INTO barbearias (
        id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
        endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
        contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
        proprietario_email, senha_hash, status, data_cadastro, data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const valores = [
      id,
      'Barbearia Teste Login',
      'Barbearia criada especificamente para testar o sistema de login',
      'Rua Teste',
      '123',
      'Centro',
      'São Paulo',
      'SP',
      '01000-000',
      '(11) 99999-9999',
      'teste@barbearia.com',
      '(11) 99999-9999',
      'João da Silva',
      '123.456.789-00',
      'joao@barbearia.com',
      senhaHash,
      'ativa',
    ];
    
    await executeQuery(sql, valores);
    
    console.log('✅ Barbearia teste criada com sucesso!');
    
    res.json({
      sucesso: true,
      mensagem: 'Barbearia teste criada com sucesso!',
      dados: {
        id,
        email: 'teste@barbearia.com',
        senha: '123456'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar barbearia teste:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao criar barbearia teste',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
