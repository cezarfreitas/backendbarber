import { RequestHandler } from "express";
import { executeQuery, executeQuerySingle } from "../config/database";
import { ApiResponse, Barbearia, Barbeiro } from "@shared/api";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import {
  resetDatabase,
  clearData,
  initializeTables,
} from "../config/init-database";

// Helper para respostas de erro padronizadas
const erroPadrao = (
  res: any,
  status: number,
  codigo: string,
  mensagem: string,
  detalhes?: any,
) => {
  const payload: any = {
    sucesso: false,
    codigo,
    erro: mensagem,
  };
  if (detalhes) payload.detalhes = detalhes;
  return res.status(status).json(payload as ApiResponse);
};

// Helper para validar paginação
const validarPaginaLimite = (paginaRaw: any, limiteRaw: any) => {
  // Conversão mais segura para evitar NaN
  let pagina = 1;
  let limite = 10;

  if (paginaRaw !== undefined && paginaRaw !== null && paginaRaw !== "") {
    const paginaParsed = parseInt(String(paginaRaw), 10);
    if (!Number.isNaN(paginaParsed) && paginaParsed > 0) {
      pagina = paginaParsed;
    }
  }

  if (limiteRaw !== undefined && limiteRaw !== null && limiteRaw !== "") {
    const limiteParsed = parseInt(String(limiteRaw), 10);
    if (!Number.isNaN(limiteParsed) && limiteParsed > 0) {
      limite = limiteParsed;
    }
  }

  // Validações finais
  if (pagina < 1)
    return {
      erro: true,
      mensagem: "Parâmetro pagina deve ser maior que 0",
      codigo: "INVALID_PAGE",
    };
  if (limite < 1)
    return {
      erro: true,
      mensagem: "Parâmetro limite deve ser maior que 0",
      codigo: "INVALID_LIMIT",
    };

  const MAX_LIMIT = 100;
  if (limite > MAX_LIMIT)
    return {
      erro: true,
      mensagem: `Limite máximo permitido é ${MAX_LIMIT}`,
      codigo: "LIMIT_EXCEEDED",
    };

  return { erro: false, pagina, limite };
};

/**
 * GET /api/admin/barbearia
 * Buscar dados completos da barbearia do admin logado
 */
export const buscarBarbeariaAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
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
      return erroPadrao(res, 404, "NOT_FOUND", "Barbearia não encontrada");
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
        cep: barbearia.endereco_cep,
      },
      contato: {
        telefone: barbearia.contato_telefone,
        email: barbearia.contato_email,
        whatsapp: barbearia.contato_whatsapp,
      },
      proprietario: {
        nome: barbearia.proprietario_nome,
        cpf: barbearia.proprietario_cpf,
        email: barbearia.proprietario_email,
      },
      horarioFuncionamento: (() => {
        try {
          if (typeof barbearia.horario_funcionamento === "string") {
            return JSON.parse(barbearia.horario_funcionamento);
          } else if (typeof barbearia.horario_funcionamento === "object") {
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
      ultimoLogin: barbearia.ultimo_login,
    };

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: barbeariaFormatada,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao buscar barbearia admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
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

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
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
      "SELECT AVG(preco) as preco_medio FROM servicos WHERE barbearia_id = ? AND ativo = true",
      [barbeariaId],
    );

    // Dados da barbearia
    const barbearia = await executeQuerySingle(
      `SELECT * FROM barbearias WHERE id = ?`,
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
  } catch (error: any) {
    console.error("Erro no dashboard admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * GET /api/admin/barbeiros
 * Listar barbeiros da barbearia do admin (com paginação)
 */
export const listarBarbeirosAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia


    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
    }

    const { pagina: paginaRaw, limite: limiteRaw } = req.query as any;
    const validacao = validarPaginaLimite(paginaRaw, limiteRaw);
    if (validacao.erro) {
      return erroPadrao(
        res,
        400,
        validacao.codigo || "INVALID_PAGINATION",
        validacao.mensagem || "Parâmetros de paginação inválidos",
      );
    }

    const pagina: number = validacao.pagina;
    const limite: number = validacao.limite;

    // Garantir que barbeariaId, limite e offset sejam válidos
    if (!barbeariaId) {
      return erroPadrao(
        res,
        400,
        "INVALID_BARBEARIA_ID",
        "ID da barbearia não encontrado",
      );
    }

    // Total de barbeiros
    const totalResult = await executeQuerySingle(
      `SELECT COUNT(*) as total FROM barbeiros WHERE barbearia_id = ?`,
      [barbeariaId],
    );
    const total = (totalResult as any)?.total || 0;
    const totalPaginas = total === 0 ? 0 : Math.ceil(total / limite);
    const offset = (pagina - 1) * limite;

    // Garantir que limite e offset sejam números válidos
    const limiteNum = parseInt(String(limite), 10);
    const offsetNum = parseInt(String(offset), 10);

    if (
      isNaN(limiteNum) ||
      isNaN(offsetNum) ||
      limiteNum < 1 ||
      offsetNum < 0
    ) {
      return erroPadrao(
        res,
        400,
        "INVALID_PAGINATION_VALUES",
        "Valores de paginação inválidos",
      );
    }

    console.log(
      `[DEBUG] Query params: barbeariaId=${barbeariaId}, limiteNum=${limiteNum}, offsetNum=${offsetNum}`,
    );
    console.log(
      `[DEBUG] Query params types: barbeariaId=${typeof barbeariaId}, limiteNum=${typeof limiteNum}, offsetNum=${typeof offsetNum}`,
    );

    // MySQL não permite parâmetros em LIMIT/OFFSET em prepared statements
    // Usar construção segura da query com validação prévia de tipos
    const barbeiros = await executeQuery(
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status, data_cadastro, ultimo_login FROM barbeiros WHERE barbearia_id = ? ORDER BY nome ASC LIMIT ${limiteNum} OFFSET ${offsetNum}`,
      [barbeariaId],
    );

    console.log(`[DEBUG] barbeiros result:`, barbeiros);

    const baseUrl = req.protocol + "://" + req.get("host") + req.path;
    const queryParams = { ...req.query } as any;
    const buildPageUrl = (p: number) => {
      queryParams.pagina = p.toString();
      queryParams.limite = limite.toString();
      const qs = Object.keys(queryParams)
        .map(
          (k) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`,
        )
        .join("&");
      return baseUrl + "?" + qs;
    };

    const meta: any = { total, pagina, totalPaginas, limite };
    if (pagina > 1 && totalPaginas >= 1)
      meta.prevPage = buildPageUrl(pagina - 1);
    if (pagina < totalPaginas) meta.nextPage = buildPageUrl(pagina + 1);

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: {
        barbeiros: barbeiros as Barbeiro[],
        total,
        pagina,
        totalPaginas,
      },
    };

    const mensagem =
      total === 0
        ? "Nenhum barbeiro encontrado para os filtros informados"
        : undefined;

    return res.json(
      Object.assign(response, mensagem ? { mensagem, meta } : { meta }),
    );
  } catch (error: any) {
    console.error("Erro ao listar barbeiros admin:", error);
    console.error("Stack trace:", error.stack);
    console.error("Código SQL error:", error.code);
    console.error("SQL State:", error.sqlState);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
      code: error?.code,
      sqlState: error?.sqlState,
    });
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

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
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
      return erroPadrao(
        res,
        400,
        "MISSING_FIELDS",
        "Campos obrigatórios: nome, email, telefone, cpf, tipo",
      );
    }

    // Verificar se email já existe
    const emailExiste = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE email = ?`,
      [email],
    );

    if (emailExiste) {
      return erroPadrao(
        res,
        400,
        "DUPLICATED_EMAIL",
        "Email já cadastrado no sistema",
      );
    }

    // Verificar se CPF já existe
    const cpfExiste = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE cpf = ?`,
      [cpf],
    );

    if (cpfExiste) {
      return erroPadrao(
        res,
        400,
        "DUPLICATED_CPF",
        "CPF já cadastrado no sistema",
      );
    }

    const id = uuidv4();
    const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;

    await executeQuery(
      `INSERT INTO barbeiros (id, nome, email, telefone, cpf, senha_hash, tipo, porcentagem_comissao, salario_fixo, valor_hora, barbearia_id, especialidades, horario_trabalho, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
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
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status FROM barbeiros WHERE id = ?`,
      [id],
    );

    const response: ApiResponse<Barbeiro> = {
      sucesso: true,
      dados: novoBarbeiro as Barbeiro,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error("Erro ao criar barbeiro admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
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

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbeiro = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE id = ? AND barbearia_id = ?`,
      [barbeiroId, barbeariaId],
    );

    if (!barbeiro) {
      return erroPadrao(
        res,
        404,
        "NOT_FOUND",
        "Barbeiro não encontrado ou não pertence à sua barbearia",
      );
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
        `SELECT id FROM barbeiros WHERE email = ? AND id != ?`,
        [email, barbeiroId],
      );
      if (emailExiste) {
        return erroPadrao(
          res,
          400,
          "DUPLICATED_EMAIL",
          "Email já cadastrado para outro barbeiro",
        );
      }
    }

    await executeQuery(
      `UPDATE barbeiros SET nome = COALESCE(?, nome), email = COALESCE(?, email), telefone = COALESCE(?, telefone), tipo = COALESCE(?, tipo), porcentagem_comissao = ?, salario_fixo = ?, valor_hora = ?, especialidades = COALESCE(?, especialidades), horario_trabalho = COALESCE(?, horario_trabalho), status = COALESCE(?, status), data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`,
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
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status FROM barbeiros WHERE id = ?`,
      [barbeiroId],
    );

    const response: ApiResponse<Barbeiro> = {
      sucesso: true,
      dados: barbeiroAtualizado as Barbeiro,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao atualizar barbeiro admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * DELETE /api/admin/barbeiros/:id
 * Remover barbeiro da barbearia do admin
 */
export const removerBarbeiroAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;
    const barbeariaId = userJWT?.userId; // Para barbearia, userId é o ID da própria barbearia
    const barbeiroId = req.params.id;

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbeiro = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE id = ? AND barbearia_id = ?`,
      [barbeiroId, barbeariaId],
    );

    if (!barbeiro) {
      return erroPadrao(
        res,
        404,
        "NOT_FOUND",
        "Barbeiro não encontrado ou não pertence à sua barbearia",
      );
    }

    // Soft delete - apenas marcar como inativo
    await executeQuery(
      `UPDATE barbeiros SET status = 'inativo', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`,
      [barbeiroId],
    );

    const response: ApiResponse<null> = {
      sucesso: true,
      dados: null,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao remover barbeiro admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
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

    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Usuário não é uma barbearia.",
      );
    }

    const {
      nome,
      descricao,
      endereco,
      contato,
      proprietario,
      horarioFuncionamento,
    } = req.body;

    // Se email foi alterado, verificar se não existe
    if (contato?.email) {
      const emailExiste = await executeQuerySingle(
        `SELECT id FROM barbearias WHERE contato_email = ? AND id != ?`,
        [contato.email, barbeariaId],
      );

      if (emailExiste) {
        return erroPadrao(
          res,
          400,
          "DUPLICATED_EMAIL",
          "Email já cadastrado para outra barbearia",
        );
      }
    }

    await executeQuery(
      `UPDATE barbearias SET nome = COALESCE(?, nome), descricao = COALESCE(?, descricao), endereco_rua = COALESCE(?, endereco_rua), endereco_numero = COALESCE(?, endereco_numero), endereco_bairro = COALESCE(?, endereco_bairro), endereco_cidade = COALESCE(?, endereco_cidade), endereco_estado = COALESCE(?, endereco_estado), endereco_cep = COALESCE(?, endereco_cep), contato_telefone = COALESCE(?, contato_telefone), contato_email = COALESCE(?, contato_email), contato_whatsapp = COALESCE(?, contato_whatsapp), proprietario_nome = COALESCE(?, proprietario_nome), proprietario_cpf = COALESCE(?, proprietario_cpf), proprietario_email = COALESCE(?, proprietario_email), horario_funcionamento = COALESCE(?, horario_funcionamento), data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`,
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
            if (
              horarioFuncionamento &&
              typeof horarioFuncionamento === "object"
            ) {
              return JSON.stringify(horarioFuncionamento);
            } else if (typeof horarioFuncionamento === "string") {
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
      `SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, contato_telefone, contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf, proprietario_email, horario_funcionamento, status, data_cadastro, data_atualizacao, ultimo_login FROM barbearias WHERE id = ?`,
      [barbeariaId],
    );

    if (!barbearia) {
      return erroPadrao(
        res,
        404,
        "NOT_FOUND",
        "Barbearia não encontrada após atualização",
      );
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
        cep: barbearia.endereco_cep,
      },
      contato: {
        telefone: barbearia.contato_telefone,
        email: barbearia.contato_email,
        whatsapp: barbearia.contato_whatsapp,
      },
      proprietario: {
        nome: barbearia.proprietario_nome,
        cpf: barbearia.proprietario_cpf,
        email: barbearia.proprietario_email,
      },
      horarioFuncionamento: (() => {
        try {
          if (typeof barbearia.horario_funcionamento === "string") {
            return JSON.parse(barbearia.horario_funcionamento);
          } else if (typeof barbearia.horario_funcionamento === "object") {
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
      ultimoLogin: barbearia.ultimo_login,
    };

    const response: ApiResponse<any> = {
      sucesso: true,
      dados: barbeariaFormatada,
      mensagem: "Dados da barbearia atualizados com sucesso",
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao atualizar barbearia admin:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * POST /api/admin/database/reset
 * ⚠️ RESET COMPLETO DO BANCO - Remove e recria todas as tabelas
 * Apenas para administradores de sistema
 */
export const resetDatabaseAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;

    // Verificar se é uma barbearia autenticada
    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Apenas administradores podem resetar o banco.",
      );
    }

    console.log(
      `⚠️ RESET DO BANCO solicitado por: ${userJWT.email} (ID: ${userJWT.userId})`,
    );

    // Executar reset completo
    await resetDatabase();

    const response: ApiResponse<null> = {
      sucesso: true,
      dados: null,
      mensagem:
        "Banco de dados resetado com sucesso! Todas as tabelas foram recriadas com dados iniciais.",
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao resetar banco de dados:", error);
    return erroPadrao(
      res,
      500,
      "INTERNAL_ERROR",
      "Erro ao resetar banco de dados",
      { message: error?.message },
    );
  }
};

/**
 * POST /api/admin/database/clear-data
 * Limpar dados das tabelas (manter estrutura)
 */
export const clearDatabaseDataAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;

    // Verificar se é uma barbearia autenticada
    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Apenas administradores podem limpar dados.",
      );
    }

    console.log(
      `🧹 LIMPEZA DE DADOS solicitada por: ${userJWT.email} (ID: ${userJWT.userId})`,
    );

    // Limpar dados e reinserir dados iniciais
    await clearData();

    const response: ApiResponse<null> = {
      sucesso: true,
      dados: null,
      mensagem:
        "Dados do banco limpos com sucesso! Dados iniciais foram restaurados.",
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao limpar dados do banco:", error);
    return erroPadrao(
      res,
      500,
      "INTERNAL_ERROR",
      "Erro ao limpar dados do banco",
      { message: error?.message },
    );
  }
};

/**
 * POST /api/admin/database/recreate-tables
 * Recriar estrutura das tabelas (força criação)
 */
export const recreateTablesAdmin: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente || (req as any).usuario;

    // Verificar se é uma barbearia autenticada
    if (!userJWT || userJWT.userType !== "barbearia") {
      return erroPadrao(
        res,
        403,
        "FORBIDDEN",
        "Acesso negado. Apenas administradores podem recriar tabelas.",
      );
    }

    console.log(
      `🔄 RECRIAÇÃO DE TABELAS solicitada por: ${userJWT.email} (ID: ${userJWT.userId})`,
    );

    // Forçar recriação das tabelas
    await initializeTables();

    const response: ApiResponse<null> = {
      sucesso: true,
      dados: null,
      mensagem: "Estrutura das tabelas verificada e atualizada com sucesso!",
    };

    res.json(response);
  } catch (error: any) {
    console.error("Erro ao recriar tabelas:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro ao recriar tabelas", {
      message: error?.message,
    });
  }
};
