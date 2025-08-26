import { RequestHandler } from "express";
import { executeQuery, executeQuerySingle } from "../config/database";
import { ApiResponse, Barbearia, Barbeiro } from "@shared/api";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/barbearia
 * Buscar dados completos da barbearia do admin logado
 */
export const buscarBarbeariaAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    // Buscar dados completos da barbearia
    const barbearia = await executeQuerySingle(
      `
      SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
             endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
             contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
             proprietario_email, horario_funcionamento, status, data_cadastro,
             data_atualizacao, ultimo_login
      FROM barbearias
      WHERE id = ?
    `,
      [barbeariaId],
    );

    if (!barbearia) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada",
      });
    }

    // Mapear dados para formato da interface
    const barbeariaFormatada = {
      id: barbearia.id,
      nome: barbearia.nome,
      descricao: barbearia.descricao,
      endereco: {
        rua: barbearia.endereco_rua,
        numero: barbearia.endereco_numero,
        bairro: barbearia.endereco_bairro,
        cidade: barbearia.endereco_cidade,
        estado: barbearia.endereco_estado,
        cep: barbearia.endereco_cep
      },
      contato: {
        telefone: barbearia.contato_telefone,
        email: barbearia.contato_email,
        whatsapp: barbearia.contato_whatsapp
      },
      proprietario: {
        nome: barbearia.proprietario_nome,
        cpf: barbearia.proprietario_cpf,
        email: barbearia.proprietario_email
      },
      horarioFuncionamento: (() => {
        try {
          if (typeof barbearia.horario_funcionamento === 'string') {
            return JSON.parse(barbearia.horario_funcionamento);
          } else if (typeof barbearia.horario_funcionamento === 'object') {
            return barbearia.horario_funcionamento;
          } else {
            return {};
          }
        } catch (error) {
          return {};
        }
      })(),
      status: barbearia.status,
      dataCadastro: barbearia.data_cadastro,
      dataAtualizacao: barbearia.data_atualizacao,
      ultimoLogin: barbearia.ultimo_login
    };

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: barbeariaFormatada,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar barbearia admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * GET /api/admin/dashboard
 * Dashboard com estatísticas da barbearia do proprietário
 */
export const dashboardAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    // Estatísticas da barbearia
    const [totalBarbeiros, totalServicos, totalCombos] = await Promise.all([
      executeQuery(
        `SELECT COUNT(*) as total FROM barbeiros WHERE barbearia_id = ? AND status = 'ativo'`,
        [barbeariaId],
      ),
      executeQuery(
        `SELECT COUNT(*) as total FROM servicos WHERE barbearia_id = ? AND ativo = true`,
        [barbeariaId],
      ),
      executeQuery(
        `SELECT COUNT(*) as total FROM combos WHERE barbearia_id = ? AND ativo = true`,
        [barbeariaId],
      ),
    ]);

    // Preço médio dos serviços
    const precoMedio = await executeQuerySingle(
      `
      SELECT AVG(preco) as preco_medio 
      FROM servicos 
      WHERE barbearia_id = ? AND ativo = true
    `,
      [barbeariaId],
    );

    // Dados da barbearia
    const barbearia = await executeQuerySingle(
      `
      SELECT * FROM barbearias WHERE id = ?
    `,
      [barbeariaId],
    );

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: {
        barbearia: barbearia,
        estatisticas: {
          total_barbeiros: (totalBarbeiros as any[])[0]?.total || 0,
          total_servicos: (totalServicos as any[])[0]?.total || 0,
          total_combos: (totalCombos as any[])[0]?.total || 0,
          preco_medio_servicos: parseFloat(
            (precoMedio as any)?.preco_medio || 0,
          ),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no dashboard admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * GET /api/admin/barbeiros
 * Listar barbeiros da barbearia do admin
 */
export const listarBarbeirosAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    const barbeiros = await executeQuery(
      `
      SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, 
             salario_fixo, valor_hora, especialidades, horario_trabalho, status,
             data_cadastro, ultimo_login
      FROM barbeiros 
      WHERE barbearia_id = ?
      ORDER BY nome ASC
    `,
      [barbeariaId],
    );

    const response: ApiResponse<Barbeiro[]> = {
      sucesso: true,
      dados: barbeiros as Barbeiro[],
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar barbeiros admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * POST /api/admin/barbeiros
 * Criar novo barbeiro na barbearia do admin
 */
export const criarBarbeiroAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    const {
      nome,
      email,
      telefone,
      cpf,
      senha,
      tipo,
      porcentagem_comissao,
      salario_fixo,
      valor_hora,
      especialidades,
      horario_trabalho,
    } = req.body;

    // Validações básicas
    if (!nome || !email || !telefone || !cpf || !tipo) {
      return res.status(400).json({
        sucesso: false,
        erro: "Campos obrigatórios: nome, email, telefone, cpf, tipo",
      });
    }

    // Verificar se email já existe
    const emailExiste = await executeQuerySingle(
      `
      SELECT id FROM barbeiros WHERE email = ?
    `,
      [email],
    );

    if (emailExiste) {
      return res.status(400).json({
        sucesso: false,
        erro: "Email já cadastrado no sistema",
      });
    }

    // Verificar se CPF já existe
    const cpfExiste = await executeQuerySingle(
      `
      SELECT id FROM barbeiros WHERE cpf = ?
    `,
      [cpf],
    );

    if (cpfExiste) {
      return res.status(400).json({
        sucesso: false,
        erro: "CPF já cadastrado no sistema",
      });
    }

    const id = uuidv4();
    const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;

    await executeQuery(
      `
      INSERT INTO barbeiros (
        id, nome, email, telefone, cpf, senha_hash, tipo,
        porcentagem_comissao, salario_fixo, valor_hora, barbearia_id,
        especialidades, horario_trabalho, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
    `,
      [
        id,
        nome,
        email,
        telefone,
        cpf,
        senhaHash,
        tipo,
        porcentagem_comissao || null,
        salario_fixo || null,
        valor_hora || null,
        barbeariaId,
        JSON.stringify(especialidades || []),
        JSON.stringify(horario_trabalho || {}),
      ],
    );

    const novoBarbeiro = await executeQuerySingle(
      `
      SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao,
             salario_fixo, valor_hora, especialidades, horario_trabalho, status
      FROM barbeiros WHERE id = ?
    `,
      [id],
    );

    const response: ApiResponse<Barbeiro> = {
      sucesso: true,
      dados: novoBarbeiro as Barbeiro,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar barbeiro admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * PUT /api/admin/barbeiros/:id
 * Atualizar barbeiro da barbearia do admin
 */
export const atualizarBarbeiroAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia
    const barbeiroId = req.params.id;

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbeiro = await executeQuerySingle(
      `
      SELECT id FROM barbeiros WHERE id = ? AND barbearia_id = ?
    `,
      [barbeiroId, barbeariaId],
    );

    if (!barbeiro) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbeiro não encontrado ou não pertence à sua barbearia",
      });
    }

    const {
      nome,
      email,
      telefone,
      tipo,
      porcentagem_comissao,
      salario_fixo,
      valor_hora,
      especialidades,
      horario_trabalho,
      status,
    } = req.body;

    // Se email foi alterado, verificar se não existe
    if (email) {
      const emailExiste = await executeQuerySingle(
        `
        SELECT id FROM barbeiros WHERE email = ? AND id != ?
      `,
        [email, barbeiroId],
      );

      if (emailExiste) {
        return res.status(400).json({
          sucesso: false,
          erro: "Email já cadastrado para outro barbeiro",
        });
      }
    }

    await executeQuery(
      `
      UPDATE barbeiros SET
        nome = COALESCE(?, nome),
        email = COALESCE(?, email),
        telefone = COALESCE(?, telefone),
        tipo = COALESCE(?, tipo),
        porcentagem_comissao = ?,
        salario_fixo = ?,
        valor_hora = ?,
        especialidades = COALESCE(?, especialidades),
        horario_trabalho = COALESCE(?, horario_trabalho),
        status = COALESCE(?, status),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        nome,
        email,
        telefone,
        tipo,
        porcentagem_comissao,
        salario_fixo,
        valor_hora,
        especialidades ? JSON.stringify(especialidades) : null,
        horario_trabalho ? JSON.stringify(horario_trabalho) : null,
        status,
        barbeiroId,
      ],
    );

    const barbeiroAtualizado = await executeQuerySingle(
      `
      SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao,
             salario_fixo, valor_hora, especialidades, horario_trabalho, status
      FROM barbeiros WHERE id = ?
    `,
      [barbeiroId],
    );

    const response: ApiResponse<Barbeiro> = {
      sucesso: true,
      dados: barbeiroAtualizado as Barbeiro,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar barbeiro admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * DELETE /api/admin/barbeiros/:id
 * Remover barbeiro da barbearia do admin
 */
export const removerBarbeiroAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId �� o ID da própria barbearia
    const barbeiroId = req.params.id;

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbeiro = await executeQuerySingle(
      `
      SELECT id FROM barbeiros WHERE id = ? AND barbearia_id = ?
    `,
      [barbeiroId, barbeariaId],
    );

    if (!barbeiro) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbeiro não encontrado ou não pertence à sua barbearia",
      });
    }

    // Soft delete - apenas marcar como inativo
    await executeQuery(
      `
      UPDATE barbeiros SET 
        status = 'inativo',
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [barbeiroId],
    );

    const response: ApiResponse<null> = {
      sucesso: true,
      dados: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao remover barbeiro admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};

/**
 * PUT /api/admin/barbearia
 * Atualizar dados da própria barbearia
 */
export const atualizarBarbeariaAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== 'barbearia') {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não é uma barbearia.",
      });
    }

    const { nome, descricao, endereco, contato, proprietario, horarioFuncionamento } = req.body;

    // Se email foi alterado, verificar se não existe
    if (contato?.email) {
      const emailExiste = await executeQuerySingle(
        `
        SELECT id FROM barbearias WHERE contato_email = ? AND id != ?
      `,
        [contato.email, barbeariaId],
      );

      if (emailExiste) {
        return res.status(400).json({
          sucesso: false,
          erro: "Email já cadastrado para outra barbearia",
        });
      }
    }

    await executeQuery(
      `
      UPDATE barbearias SET
        nome = COALESCE(?, nome),
        descricao = COALESCE(?, descricao),
        endereco_rua = COALESCE(?, endereco_rua),
        endereco_numero = COALESCE(?, endereco_numero),
        endereco_bairro = COALESCE(?, endereco_bairro),
        endereco_cidade = COALESCE(?, endereco_cidade),
        endereco_estado = COALESCE(?, endereco_estado),
        endereco_cep = COALESCE(?, endereco_cep),
        contato_telefone = COALESCE(?, contato_telefone),
        contato_email = COALESCE(?, contato_email),
        contato_whatsapp = COALESCE(?, contato_whatsapp),
        proprietario_nome = COALESCE(?, proprietario_nome),
        proprietario_cpf = COALESCE(?, proprietario_cpf),
        proprietario_email = COALESCE(?, proprietario_email),
        horario_funcionamento = COALESCE(?, horario_funcionamento),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        nome || null,
        descricao || null,
        endereco?.rua || null,
        endereco?.numero || null,
        endereco?.bairro || null,
        endereco?.cidade || null,
        endereco?.estado || null,
        endereco?.cep || null,
        contato?.telefone || null,
        contato?.email || null,
        contato?.whatsapp || null,
        proprietario?.nome || null,
        proprietario?.cpf || null,
        proprietario?.email || null,
        (() => {
          try {
            if (horarioFuncionamento && typeof horarioFuncionamento === 'object') {
              return JSON.stringify(horarioFuncionamento);
            } else if (typeof horarioFuncionamento === 'string') {
              // Se já é string, verifica se é JSON válido
              JSON.parse(horarioFuncionamento);
              return horarioFuncionamento;
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        })(),
        barbeariaId,
      ],
    );

    // Buscar dados atualizados da barbearia
    const barbearia = await executeQuerySingle(
      `
      SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
             endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
             contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
             proprietario_email, horario_funcionamento, status, data_cadastro,
             data_atualizacao, ultimo_login
      FROM barbearias WHERE id = ?
    `,
      [barbeariaId],
    );

    if (!barbearia) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada após atualização",
      });
    }

    // Mapear dados para formato da interface
    const barbeariaFormatada = {
      id: barbearia.id,
      nome: barbearia.nome,
      descricao: barbearia.descricao,
      endereco: {
        rua: barbearia.endereco_rua,
        numero: barbearia.endereco_numero,
        bairro: barbearia.endereco_bairro,
        cidade: barbearia.endereco_cidade,
        estado: barbearia.endereco_estado,
        cep: barbearia.endereco_cep
      },
      contato: {
        telefone: barbearia.contato_telefone,
        email: barbearia.contato_email,
        whatsapp: barbearia.contato_whatsapp
      },
      proprietario: {
        nome: barbearia.proprietario_nome,
        cpf: barbearia.proprietario_cpf,
        email: barbearia.proprietario_email
      },
      horarioFuncionamento: (() => {
        try {
          if (typeof barbearia.horario_funcionamento === 'string') {
            return JSON.parse(barbearia.horario_funcionamento);
          } else if (typeof barbearia.horario_funcionamento === 'object') {
            return barbearia.horario_funcionamento;
          } else {
            return {};
          }
        } catch (error) {
          return {};
        }
      })(),
      status: barbearia.status,
      dataCadastro: barbearia.data_cadastro,
      dataAtualizacao: barbearia.data_atualizacao,
      ultimoLogin: barbearia.ultimo_login
    };

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: barbeariaFormatada,
      mensagem: "Dados da barbearia atualizados com sucesso"
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar barbearia admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};
