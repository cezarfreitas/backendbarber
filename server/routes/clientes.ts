import { RequestHandler } from "express";
import { 
  Cliente, 
  CriarClienteRequest, 
  AtualizarClienteRequest,
  ListarClientesResponse,
  ApiResponse 
} from "@shared/api";
import { executeQuery, executeQuerySingle } from "../config/database";
import { v4 as uuidv4 } from 'uuid';
import { 
  hashSenha, 
  validarCelular, 
  formatarCelular, 
  validarEmail,
  verificarAutenticacao 
} from "../utils/auth";

// Função auxiliar para converter dados do MySQL para o formato da interface
const mapClienteFromDB = (row: any): Cliente => {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    celular: row.celular,
    dataNascimento: row.data_nascimento,
    foto: row.foto,
    endereco: {
      rua: row.endereco_rua,
      numero: row.endereco_numero,
      bairro: row.endereco_bairro,
      cidade: row.endereco_cidade,
      estado: row.endereco_estado,
      cep: row.endereco_cep
    },
    preferencias: {
      barbeariaId: row.barbearia_preferida,
      barbeiroId: row.barbeiro_preferido,
      servicosPreferidos: row.servicos_preferidos ? JSON.parse(row.servicos_preferidos) : []
    },
    tipoLogin: row.tipo_login,
    googleId: row.google_id,
    emailVerificado: row.email_verificado,
    celularVerificado: row.celular_verificado,
    status: row.status,
    dataCadastro: row.data_cadastro,
    dataAtualizacao: row.data_atualizacao,
    ultimoLogin: row.ultimo_login
  };
};

// Função para gerar ID único
const gerarId = (): string => {
  return uuidv4();
};

/**
 * GET /api/clientes
 * Listar todos os clientes com paginação (requer autenticação de admin)
 */
export const listarClientes: RequestHandler = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const status = req.query.status as string;
    const barbeariaId = req.query.barbeariaId as string;
    const barbeiroId = req.query.barbeiroId as string;

    // Construir query base
    let selectQuery = `
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM clientes';
    const whereConditions: string[] = [];
    const params: any[] = [];

    // Adicionar filtros
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (barbeariaId) {
      whereConditions.push('barbearia_preferida = ?');
      params.push(barbeariaId);
    }

    if (barbeiroId) {
      whereConditions.push('barbeiro_preferido = ?');
      params.push(barbeiroId);
    }

    // Aplicar WHERE se houver condições
    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      selectQuery += whereClause;
      countQuery += whereClause;
    }

    // Contar total
    const countResult = await executeQuerySingle<{ total: number }>(countQuery, params);
    const total = countResult?.total || 0;

    // Buscar dados
    selectQuery += ' ORDER BY nome';
    const rows = await executeQuery(selectQuery, params);
    const clientes = rows.map(mapClienteFromDB);

    const response: ListarClientesResponse = {
      clientes,
      total,
      pagina: 1,
      totalPaginas: 1
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/clientes/:id
 * Buscar cliente por ID
 */
export const buscarCliente: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const selectQuery = `
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ?
    `;
    
    const row = await executeQuerySingle(selectQuery, [id]);

    if (!row) {
      return res.status(404).json({
        sucesso: false,
        erro: "Cliente não encontrado"
      } as ApiResponse);
    }

    const cliente = mapClienteFromDB(row);

    res.json({
      sucesso: true,
      dados: cliente
    } as ApiResponse<Cliente>);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * POST /api/clientes
 * Criar novo cliente (cadastro)
 */
export const criarCliente: RequestHandler = async (req, res) => {
  try {
    const dadosCliente: CriarClienteRequest = req.body;

    // Validações básicas
    if (!dadosCliente.nome || !dadosCliente.celular || !dadosCliente.tipoLogin) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios não fornecidos: nome, celular e tipoLogin são obrigatórios"
      } as ApiResponse);
    }

    // Validar celular
    if (!validarCelular(dadosCliente.celular)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de celular inválido"
      } as ApiResponse);
    }

    // Validar email se fornecido
    if (dadosCliente.email && !validarEmail(dadosCliente.email)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de email inválido"
      } as ApiResponse);
    }

    // Validações específicas por tipo de login
    if (dadosCliente.tipoLogin === 'celular' && !dadosCliente.senha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha é obrigatória para login por celular"
      } as ApiResponse);
    }

    if (dadosCliente.tipoLogin === 'google' && !dadosCliente.googleId) {
      return res.status(400).json({
        sucesso: false,
        erro: "Google ID é obrigatório para login por Google"
      } as ApiResponse);
    }

    // Verificar se celular já existe
    const celularExistente = await executeQuerySingle(`
      SELECT id FROM clientes WHERE celular = ?
    `, [formatarCelular(dadosCliente.celular)]);

    if (celularExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe um cliente cadastrado com este celular"
      } as ApiResponse);
    }

    // Verificar se email já existe (se fornecido)
    if (dadosCliente.email) {
      const emailExistente = await executeQuerySingle(`
        SELECT id FROM clientes WHERE email = ?
      `, [dadosCliente.email]);

      if (emailExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um cliente cadastrado com este email"
        } as ApiResponse);
      }
    }

    // Verificar se Google ID já existe (se fornecido)
    if (dadosCliente.googleId) {
      const googleIdExistente = await executeQuerySingle(`
        SELECT id FROM clientes WHERE google_id = ?
      `, [dadosCliente.googleId]);

      if (googleIdExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um cliente cadastrado com este Google ID"
        } as ApiResponse);
      }
    }

    const clienteId = gerarId();
    let senhaHash: string | null = null;

    // Hash da senha se fornecida
    if (dadosCliente.senha) {
      senhaHash = await hashSenha(dadosCliente.senha);
    }

    // Inserir cliente
    await executeQuery(`
      INSERT INTO clientes (
        id, nome, email, celular, senha_hash, data_nascimento,
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade,
        endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
        tipo_login, google_id, email_verificado, celular_verificado, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
    `, [
      clienteId,
      dadosCliente.nome,
      dadosCliente.email || dadosCliente.googleEmail || null,
      formatarCelular(dadosCliente.celular),
      senhaHash,
      dadosCliente.dataNascimento || null,
      dadosCliente.endereco?.rua || null,
      dadosCliente.endereco?.numero || null,
      dadosCliente.endereco?.bairro || null,
      dadosCliente.endereco?.cidade || null,
      dadosCliente.endereco?.estado || null,
      dadosCliente.endereco?.cep || null,
      dadosCliente.preferencias?.barbeariaId || null,
      dadosCliente.preferencias?.barbeiroId || null,
      dadosCliente.tipoLogin,
      dadosCliente.googleId || null,
      dadosCliente.tipoLogin === 'google', // Email verificado automaticamente para Google
      false // Celular sempre começa como não verificado
    ]);

    // Buscar cliente criado (sem senha)
    const clienteCriado = await buscarCliente({ params: { id: clienteId } } as any, res);

    if (!res.headersSent) {
      res.status(201).json({
        sucesso: true,
        mensagem: "Cliente cadastrado com sucesso"
      } as ApiResponse);
    }

  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * PUT /api/clientes/:id
 * Atualizar cliente existente
 */
export const atualizarCliente: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarClienteRequest = req.body;

    // Verificar se cliente existe
    const clienteExistente = await executeQuerySingle(`
      SELECT * FROM clientes WHERE id = ?
    `, [id]);

    if (!clienteExistente) {
      return res.status(404).json({
        sucesso: false,
        erro: "Cliente não encontrado"
      } as ApiResponse);
    }

    // Validar email se fornecido
    if (dadosAtualizacao.email && !validarEmail(dadosAtualizacao.email)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de email inválido"
      } as ApiResponse);
    }

    // Verificar se email está sendo alterado e se já existe
    if (dadosAtualizacao.email && dadosAtualizacao.email !== clienteExistente.email) {
      const emailExistente = await executeQuerySingle(`
        SELECT id FROM clientes WHERE email = ? AND id != ?
      `, [dadosAtualizacao.email, id]);

      if (emailExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um cliente cadastrado com este email"
        } as ApiResponse);
      }
    }

    // Construir query de atualização
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (dadosAtualizacao.nome) {
      updateFields.push('nome = ?');
      updateValues.push(dadosAtualizacao.nome);
    }

    if (dadosAtualizacao.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(dadosAtualizacao.email);
    }

    if (dadosAtualizacao.dataNascimento !== undefined) {
      updateFields.push('data_nascimento = ?');
      updateValues.push(dadosAtualizacao.dataNascimento);
    }

    if (dadosAtualizacao.foto !== undefined) {
      updateFields.push('foto = ?');
      updateValues.push(dadosAtualizacao.foto);
    }

    if (dadosAtualizacao.endereco) {
      if (dadosAtualizacao.endereco.rua !== undefined) {
        updateFields.push('endereco_rua = ?');
        updateValues.push(dadosAtualizacao.endereco.rua);
      }
      if (dadosAtualizacao.endereco.numero !== undefined) {
        updateFields.push('endereco_numero = ?');
        updateValues.push(dadosAtualizacao.endereco.numero);
      }
      if (dadosAtualizacao.endereco.bairro !== undefined) {
        updateFields.push('endereco_bairro = ?');
        updateValues.push(dadosAtualizacao.endereco.bairro);
      }
      if (dadosAtualizacao.endereco.cidade !== undefined) {
        updateFields.push('endereco_cidade = ?');
        updateValues.push(dadosAtualizacao.endereco.cidade);
      }
      if (dadosAtualizacao.endereco.estado !== undefined) {
        updateFields.push('endereco_estado = ?');
        updateValues.push(dadosAtualizacao.endereco.estado);
      }
      if (dadosAtualizacao.endereco.cep !== undefined) {
        updateFields.push('endereco_cep = ?');
        updateValues.push(dadosAtualizacao.endereco.cep);
      }
    }

    if (dadosAtualizacao.preferencias) {
      if (dadosAtualizacao.preferencias.barbeariaId !== undefined) {
        updateFields.push('barbearia_preferida = ?');
        updateValues.push(dadosAtualizacao.preferencias.barbeariaId);
      }
      if (dadosAtualizacao.preferencias.barbeiroId !== undefined) {
        updateFields.push('barbeiro_preferido = ?');
        updateValues.push(dadosAtualizacao.preferencias.barbeiroId);
      }
      if (dadosAtualizacao.preferencias.servicosPreferidos !== undefined) {
        updateFields.push('servicos_preferidos = ?');
        updateValues.push(JSON.stringify(dadosAtualizacao.preferencias.servicosPreferidos));
      }
    }

    if (dadosAtualizacao.status) {
      updateFields.push('status = ?');
      updateValues.push(dadosAtualizacao.status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nenhum campo para atualizar foi fornecido"
      } as ApiResponse);
    }

    // Executar atualização
    updateValues.push(id);
    await executeQuery(`
      UPDATE clientes 
      SET ${updateFields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateValues);

    res.json({
      sucesso: true,
      mensagem: "Cliente atualizado com sucesso"
    } as ApiResponse);

  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * DELETE /api/clientes/:id
 * Excluir cliente (soft delete - marcar como inativo)
 */
export const excluirCliente: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(`
      UPDATE clientes SET status = 'inativo', data_atualizacao = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        erro: "Cliente não encontrado"
      } as ApiResponse);
    }

    res.json({
      sucesso: true,
      mensagem: "Cliente desativado com sucesso"
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/clientes/me
 * Buscar dados do cliente logado
 */
export const buscarPerfilCliente: RequestHandler = async (req, res) => {
  try {
    const clienteJWT = (req as any).cliente;
    
    if (!clienteJWT) {
      return res.status(401).json({
        sucesso: false,
        erro: "Autenticação requerida"
      } as ApiResponse);
    }

    const cliente = await buscarCliente({ params: { id: clienteJWT.clienteId } } as any, res);
    
  } catch (error) {
    console.error("Erro ao buscar perfil do cliente:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};
