import { RequestHandler } from "express";
import { executeQuery, executeQuerySingle } from "../config/database";
import { ApiResponse, Barbearia, Barbeiro } from "@shared/api";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/dashboard
 * Dashboard com estatísticas da barbearia do proprietário
 */
export const dashboardAdmin: RequestHandler = async (req, res) => {
  try {
    const barbeariaId = req.user?.barbeariaId;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
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
    const barbeariaId = req.user?.barbeariaId;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
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
    const barbeariaId = req.user?.barbeariaId;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
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
    const barbeariaId = req.user?.barbeariaId;
    const barbeiroId = req.params.id;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
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
    const barbeariaId = req.user?.barbeariaId;
    const barbeiroId = req.params.id;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
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
    const barbeariaId = req.user?.barbeariaId;

    if (!barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso negado. Usuário não associado a uma barbearia.",
      });
    }

    const { nome, descricao, endereco, contato, horario_funcionamento } =
      req.body;

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
        contato_whatsapp = ?,
        horario_funcionamento = COALESCE(?, horario_funcionamento),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        nome,
        descricao,
        endereco?.rua,
        endereco?.numero,
        endereco?.bairro,
        endereco?.cidade,
        endereco?.estado,
        endereco?.cep,
        contato?.telefone,
        contato?.email,
        contato?.whatsapp,
        horario_funcionamento ? JSON.stringify(horario_funcionamento) : null,
        barbeariaId,
      ],
    );

    const barbeariaAtualizada = await executeQuerySingle(
      `
      SELECT * FROM barbearias WHERE id = ?
    `,
      [barbeariaId],
    );

    const response: ApiResponse<Barbearia> = {
      sucesso: true,
      dados: barbeariaAtualizada as Barbearia,
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao atualizar barbearia admin:", error);
    res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
  }
};
