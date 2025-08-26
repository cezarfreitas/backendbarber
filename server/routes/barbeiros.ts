import { RequestHandler } from "express";
import {
  Barbeiro,
  CriarBarbeiroRequest,
  AtualizarBarbeiroRequest,
  ListarBarbeirosResponse,
  ApiResponse,
} from "@shared/api";
import { executeQuery, executeQuerySingle } from "../config/database";
import { v4 as uuidv4 } from "uuid";

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
  const pagina = parseInt(paginaRaw as string) || 1;
  const limite = parseInt(limiteRaw as string) || 10;
  if (Number.isNaN(pagina) || pagina < 1)
    return {
      erro: true,
      mensagem: "Parâmetro pagina inválido",
      codigo: "INVALID_PAGE",
    };
  if (Number.isNaN(limite) || limite < 1)
    return {
      erro: true,
      mensagem: "Parâmetro limite inválido",
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
 * GET /api/barbeiros
 * Listar todos os barbeiros com paginação (conectado ao MySQL)
 */
export const listarBarbeiros: RequestHandler = async (req, res) => {
  try {
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
    const barbeariaId = req.query.barbeariaId as string | undefined;
    const status = req.query.status as string | undefined;
    const tipo = req.query.tipo as string | undefined;

    // Construir WHERE clause dinâmica
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Filtrar apenas barbeiros ativos por padrão para API pública
    whereConditions.push("status = 'ativo'");

    if (barbeariaId) {
      whereConditions.push("barbearia_id = ?");
      queryParams.push(barbeariaId);
    }

    if (status) {
      // Sobrescrever o filtro padrão se status específico for fornecido
      whereConditions = whereConditions.filter((c) => !c.includes("status"));
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    if (tipo) {
      whereConditions.push("tipo = ?");
      queryParams.push(tipo);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Total de barbeiros
    const totalResult = await executeQuerySingle(
      `SELECT COUNT(*) as total FROM barbeiros ${whereClause}`,
      queryParams,
    );
    const total = (totalResult as any)?.total || 0;
    const totalPaginas = total === 0 ? 0 : Math.ceil(total / limite);
    const offset = (pagina - 1) * limite;

    // Buscar barbeiros com paginação
    const barbeiros = await executeQuery(
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status, data_cadastro, barbearia_id as barbeariaId FROM barbeiros ${whereClause} ORDER BY nome ASC LIMIT ? OFFSET ?`,
      [...queryParams, limite, offset],
    );

    // Processar especialidades e horarioTrabalho (de JSON string para array/object)
    const barbeirosProcessados = (barbeiros as any[]).map((barbeiro) => ({
      ...barbeiro,
      especialidades: (() => {
        try {
          return barbeiro.especialidades
            ? JSON.parse(barbeiro.especialidades)
            : [];
        } catch {
          return [];
        }
      })(),
      horarioTrabalho: (() => {
        try {
          return barbeiro.horario_trabalho
            ? JSON.parse(barbeiro.horario_trabalho)
            : {};
        } catch {
          return {};
        }
      })(),
    }));

    const baseUrl = req.protocol + "://" + req.get("host") + req.path;
    const queryParams2 = { ...req.query } as any;

    const buildPageUrl = (p: number) => {
      queryParams2.pagina = p.toString();
      queryParams2.limite = limite.toString();
      const qs = Object.keys(queryParams2)
        .map(
          (k) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(queryParams2[k])}`,
        )
        .join("&");
      return baseUrl + "?" + qs;
    };

    const meta: any = {
      total,
      pagina,
      totalPaginas,
      limite,
    };

    if (pagina > 1 && totalPaginas >= 1)
      meta.prevPage = buildPageUrl(pagina - 1);
    if (pagina < totalPaginas) meta.nextPage = buildPageUrl(pagina + 1);

    const response: ListarBarbeirosResponse = {
      barbeiros: barbeirosProcessados,
      total,
      pagina,
      totalPaginas,
    };

    const mensagem =
      total === 0
        ? "Nenhum barbeiro encontrado para os filtros informados"
        : undefined;

    return res.json({
      sucesso: true,
      dados: response,
      meta,
      mensagem,
    } as ApiResponse<ListarBarbeirosResponse>);
  } catch (error: any) {
    console.error("Erro ao listar barbeiros:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * GET /api/barbeiros/:id
 * Buscar barbeiro por ID (conectado ao MySQL)
 */
export const buscarBarbeiro: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const barbeiro = await executeQuerySingle(
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status, data_cadastro, barbearia_id as barbeariaId FROM barbeiros WHERE id = ? AND status = 'ativo'`,
      [id],
    );

    if (!barbeiro) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    // Processar especialidades e horarioTrabalho
    const barbeiroProcessado = {
      ...(barbeiro as any),
      especialidades: (() => {
        try {
          return (barbeiro as any).especialidades
            ? JSON.parse((barbeiro as any).especialidades)
            : [];
        } catch {
          return [];
        }
      })(),
      horarioTrabalho: (() => {
        try {
          return (barbeiro as any).horario_trabalho
            ? JSON.parse((barbeiro as any).horario_trabalho)
            : {};
        } catch {
          return {};
        }
      })(),
    };

    return res.json({
      sucesso: true,
      dados: barbeiroProcessado,
    } as ApiResponse<Barbeiro>);
  } catch (error: any) {
    console.error("Erro ao buscar barbeiro:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * POST /api/barbeiros
 * Criar novo barbeiro (conectado ao MySQL)
 */
export const criarBarbeiro: RequestHandler = async (req, res) => {
  try {
    const dadosBarbeiro: CriarBarbeiroRequest = req.body;

    // Validações básicas
    const obrigatorios = [
      "nome",
      "email",
      "telefone",
      "cpf",
      "tipo",
      "barbeariaId",
    ];
    const faltando = obrigatorios.filter((k) => !(dadosBarbeiro as any)[k]);
    if (faltando.length > 0) {
      return erroPadrao(
        res,
        400,
        "MISSING_FIELDS",
        `Dados obrigatórios não fornecidos: ${faltando.join(", ")}`,
      );
    }

    // Verificar se já existe barbeiro com mesmo email ou CPF
    const emailExistente = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE email = ?`,
      [dadosBarbeiro.email],
    );
    if (emailExistente) {
      return erroPadrao(
        res,
        400,
        "DUPLICATED_EMAIL",
        "Já existe um barbeiro cadastrado com este email",
      );
    }

    const cpfExistente = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE cpf = ?`,
      [dadosBarbeiro.cpf],
    );
    if (cpfExistente) {
      return erroPadrao(
        res,
        400,
        "DUPLICATED_CPF",
        "Já existe um barbeiro cadastrado com este CPF",
      );
    }

    // Validações específicas por tipo
    if (
      dadosBarbeiro.tipo === "comissionado" &&
      (dadosBarbeiro.porcentagemComissao === undefined ||
        dadosBarbeiro.porcentagemComissao === null)
    ) {
      return erroPadrao(
        res,
        400,
        "MISSING_COMMISSION",
        "Porcentagem de comissão é obrigatória para barbeiros comissionados",
      );
    }

    if (
      dadosBarbeiro.tipo === "funcionario" &&
      (dadosBarbeiro.salarioFixo === undefined ||
        dadosBarbeiro.salarioFixo === null)
    ) {
      return erroPadrao(
        res,
        400,
        "MISSING_SALARY",
        "Salário fixo é obrigatório para funcionários",
      );
    }

    if (
      dadosBarbeiro.tipo === "freelancer" &&
      (dadosBarbeiro.valorHora === undefined ||
        dadosBarbeiro.valorHora === null)
    ) {
      return erroPadrao(
        res,
        400,
        "MISSING_HOURLY_RATE",
        "Valor por hora é obrigatório para freelancers",
      );
    }

    const id = uuidv4();

    // Inserir no banco
    await executeQuery(
      `INSERT INTO barbeiros (id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, barbearia_id, especialidades, horario_trabalho, status, data_cadastro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo', CURRENT_TIMESTAMP)`,
      [
        id,
        dadosBarbeiro.nome,
        dadosBarbeiro.email,
        dadosBarbeiro.telefone,
        dadosBarbeiro.cpf,
        dadosBarbeiro.tipo,
        dadosBarbeiro.porcentagemComissao || null,
        dadosBarbeiro.salarioFixo || null,
        dadosBarbeiro.valorHora || null,
        dadosBarbeiro.barbeariaId,
        JSON.stringify(dadosBarbeiro.especialidades || []),
        JSON.stringify(dadosBarbeiro.horarioTrabalho || {}),
      ],
    );

    // Buscar barbeiro criado
    const novoBarbeiro = await executeQuerySingle(
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status, data_cadastro, barbearia_id as barbeariaId FROM barbeiros WHERE id = ?`,
      [id],
    );

    // Processar dados
    const barbeiroProcessado = {
      ...(novoBarbeiro as any),
      especialidades: (() => {
        try {
          return (novoBarbeiro as any).especialidades
            ? JSON.parse((novoBarbeiro as any).especialidades)
            : [];
        } catch {
          return [];
        }
      })(),
      horarioTrabalho: (() => {
        try {
          return (novoBarbeiro as any).horario_trabalho
            ? JSON.parse((novoBarbeiro as any).horario_trabalho)
            : {};
        } catch {
          return {};
        }
      })(),
    };

    return res
      .status(201)
      .json({
        sucesso: true,
        dados: barbeiroProcessado,
        mensagem: "Barbeiro cadastrado com sucesso",
      } as ApiResponse<Barbeiro>);
  } catch (error: any) {
    console.error("Erro ao criar barbeiro:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * PUT /api/barbeiros/:id
 * Atualizar barbeiro existente (conectado ao MySQL)
 */
export const atualizarBarbeiro: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarBarbeiroRequest = req.body;

    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const barbeiroExistente = await executeQuerySingle(
      `SELECT * FROM barbeiros WHERE id = ?`,
      [id],
    );

    if (!barbeiroExistente) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    // Verificar se email está sendo alterado e se já existe
    if (
      dadosAtualizacao.email &&
      dadosAtualizacao.email !== (barbeiroExistente as any).email
    ) {
      const emailExistente = await executeQuerySingle(
        `SELECT id FROM barbeiros WHERE email = ? AND id != ?`,
        [dadosAtualizacao.email, id],
      );
      if (emailExistente) {
        return erroPadrao(
          res,
          400,
          "DUPLICATED_EMAIL",
          "Já existe um barbeiro cadastrado com este email",
        );
      }
    }

    // Verificar se CPF está sendo alterado e se já existe
    if (
      dadosAtualizacao.cpf &&
      dadosAtualizacao.cpf !== (barbeiroExistente as any).cpf
    ) {
      const cpfExistente = await executeQuerySingle(
        `SELECT id FROM barbeiros WHERE cpf = ? AND id != ?`,
        [dadosAtualizacao.cpf, id],
      );
      if (cpfExistente) {
        return erroPadrao(
          res,
          400,
          "DUPLICATED_CPF",
          "Já existe um barbeiro cadastrado com este CPF",
        );
      }
    }

    // Atualizar dados
    await executeQuery(
      `UPDATE barbeiros SET nome = COALESCE(?, nome), email = COALESCE(?, email), telefone = COALESCE(?, telefone), cpf = COALESCE(?, cpf), tipo = COALESCE(?, tipo), porcentagem_comissao = ?, salario_fixo = ?, valor_hora = ?, especialidades = COALESCE(?, especialidades), horario_trabalho = COALESCE(?, horario_trabalho), status = COALESCE(?, status), data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        dadosAtualizacao.nome,
        dadosAtualizacao.email,
        dadosAtualizacao.telefone,
        dadosAtualizacao.cpf,
        dadosAtualizacao.tipo,
        dadosAtualizacao.porcentagemComissao,
        dadosAtualizacao.salarioFixo,
        dadosAtualizacao.valorHora,
        dadosAtualizacao.especialidades
          ? JSON.stringify(dadosAtualizacao.especialidades)
          : null,
        dadosAtualizacao.horarioTrabalho
          ? JSON.stringify(dadosAtualizacao.horarioTrabalho)
          : null,
        dadosAtualizacao.status,
        id,
      ],
    );

    // Buscar barbeiro atualizado
    const barbeiroAtualizado = await executeQuerySingle(
      `SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao, salario_fixo, valor_hora, especialidades, horario_trabalho, status, data_cadastro, barbearia_id as barbeariaId FROM barbeiros WHERE id = ?`,
      [id],
    );

    // Processar dados
    const barbeiroProcessado = {
      ...(barbeiroAtualizado as any),
      especialidades: (() => {
        try {
          return (barbeiroAtualizado as any).especialidades
            ? JSON.parse((barbeiroAtualizado as any).especialidades)
            : [];
        } catch {
          return [];
        }
      })(),
      horarioTrabalho: (() => {
        try {
          return (barbeiroAtualizado as any).horario_trabalho
            ? JSON.parse((barbeiroAtualizado as any).horario_trabalho)
            : {};
        } catch {
          return {};
        }
      })(),
    };

    return res.json({
      sucesso: true,
      dados: barbeiroProcessado,
      mensagem: "Barbeiro atualizado com sucesso",
    } as ApiResponse<Barbeiro>);
  } catch (error: any) {
    console.error("Erro ao atualizar barbeiro:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};

/**
 * DELETE /api/barbeiros/:id
 * Excluir barbeiro (conectado ao MySQL)
 */
export const excluirBarbeiro: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const barbeiroExistente = await executeQuerySingle(
      `SELECT id FROM barbeiros WHERE id = ?`,
      [id],
    );

    if (!barbeiroExistente) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    // Soft delete - marcar como inativo
    await executeQuery(
      `UPDATE barbeiros SET status = 'inativo', data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
    );

    return res.json({
      sucesso: true,
      mensagem: "Barbeiro excluído com sucesso",
    } as ApiResponse);
  } catch (error: any) {
    console.error("Erro ao excluir barbeiro:", error);
    return erroPadrao(res, 500, "INTERNAL_ERROR", "Erro interno do servidor", {
      message: error?.message,
    });
  }
};
