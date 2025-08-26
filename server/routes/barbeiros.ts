import { RequestHandler } from "express";
import {
  Barbeiro,
  CriarBarbeiroRequest,
  AtualizarBarbeiroRequest,
  ListarBarbeirosResponse,
  ApiResponse,
} from "@shared/api";

// Simulação de banco de dados em memória para barbeiros
let barbeiros: Barbeiro[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    email: "carlos@barbeariadoroao.com",
    telefone: "(11) 98888-7777",
    cpf: "111.222.333-44",
    tipo: "comissionado",
    porcentagemComissao: 40,
    barbeariaId: "1",
    especialidades: ["Corte masculino", "Barba", "Bigode"],
    horarioTrabalho: {
      segunda: { inicio: "08:00", fim: "18:00" },
      terca: { inicio: "08:00", fim: "18:00" },
      quarta: { inicio: "08:00", fim: "18:00" },
      quinta: { inicio: "08:00", fim: "18:00" },
      sexta: { inicio: "08:00", fim: "18:00" },
      sabado: { inicio: "08:00", fim: "16:00" },
    },
    status: "ativo",
    dataCadastro: "2024-01-16T09:00:00Z",
    dataAtualizacao: "2024-01-16T09:00:00Z",
  },
  {
    id: "2",
    nome: "Ricardo Santos",
    email: "ricardo@barbeariadoroao.com",
    telefone: "(11) 97777-6666",
    cpf: "222.333.444-55",
    tipo: "funcionario",
    salarioFixo: 3500,
    barbeariaId: "1",
    especialidades: ["Corte feminino", "Coloração", "Tratamentos"],
    horarioTrabalho: {
      terca: { inicio: "09:00", fim: "19:00" },
      quarta: { inicio: "09:00", fim: "19:00" },
      quinta: { inicio: "09:00", fim: "19:00" },
      sexta: { inicio: "09:00", fim: "19:00" },
      sabado: { inicio: "09:00", fim: "17:00" },
    },
    status: "ativo",
    dataCadastro: "2024-01-18T10:30:00Z",
    dataAtualizacao: "2024-01-18T10:30:00Z",
  },
  {
    id: "3",
    nome: "Ana Costa",
    email: "ana@barbershoppremium.com",
    telefone: "(11) 96666-5555",
    cpf: "333.444.555-66",
    tipo: "freelancer",
    valorHora: 80,
    barbeariaId: "2",
    especialidades: [
      "Corte premium",
      "Barba premium",
      "Design de sobrancelhas",
    ],
    horarioTrabalho: {
      segunda: { inicio: "10:00", fim: "16:00" },
      quarta: { inicio: "10:00", fim: "16:00" },
      sexta: { inicio: "10:00", fim: "16:00" },
    },
    status: "ativo",
    dataCadastro: "2024-01-20T15:00:00Z",
    dataAtualizacao: "2024-01-20T15:00:00Z",
  },
];

// Função para gerar ID único
const gerarId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

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
 * Listar todos os barbeiros com paginação
 */
export const listarBarbeiros: RequestHandler = (req, res) => {
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

    let barbeirosFiltrados = [...barbeiros];

    // Filtrar por barbearia se fornecido
    if (barbeariaId) {
      barbeirosFiltrados = barbeirosFiltrados.filter(
        (b) => b.barbeariaId === barbeariaId,
      );
    }

    // Filtrar por status se fornecido
    if (status) {
      barbeirosFiltrados = barbeirosFiltrados.filter(
        (b) => b.status === status,
      );
    }

    // Filtrar por tipo se fornecido
    if (tipo) {
      barbeirosFiltrados = barbeirosFiltrados.filter((b) => b.tipo === tipo);
    }

    const total = barbeirosFiltrados.length;
    const totalPaginas = total === 0 ? 0 : Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    const barbeirosPaginados = barbeirosFiltrados.slice(inicio, fim);

    const baseUrl = req.protocol + "://" + req.get("host") + req.path;
    const queryParams = { ...req.query } as any;

    const buildPageUrl = (p: number) => {
      queryParams.pagina = p.toString();
      queryParams.limite = limite.toString();
      // build query string
      const qs = Object.keys(queryParams)
        .map(
          (k) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`,
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
      barbeiros: barbeirosPaginados,
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
 * Buscar barbeiro por ID
 */
export const buscarBarbeiro: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const barbeiro = barbeiros.find((b) => b.id === id);

    if (!barbeiro) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    return res.json({
      sucesso: true,
      dados: barbeiro,
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
 * Criar novo barbeiro
 */
export const criarBarbeiro: RequestHandler = (req, res) => {
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
    const emailExistente = barbeiros.find(
      (b) => b.email === dadosBarbeiro.email,
    );
    if (emailExistente) {
      return erroPadrao(
        res,
        400,
        "DUPLICATED_EMAIL",
        "Já existe um barbeiro cadastrado com este email",
      );
    }

    const cpfExistente = barbeiros.find((b) => b.cpf === dadosBarbeiro.cpf);
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

    const agora = new Date().toISOString();
    const novoBarbeiro: Barbeiro = {
      id: gerarId(),
      ...dadosBarbeiro,
      status: "ativo",
      dataCadastro: agora,
      dataAtualizacao: agora,
      especialidades: dadosBarbeiro.especialidades || [],
      horarioTrabalho: dadosBarbeiro.horarioTrabalho || {},
    };

    barbeiros.push(novoBarbeiro);

    return res
      .status(201)
      .json({
        sucesso: true,
        dados: novoBarbeiro,
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
 * Atualizar barbeiro existente
 */
export const atualizarBarbeiro: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarBarbeiroRequest = req.body;

    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const indice = barbeiros.findIndex((b) => b.id === id);
    if (indice === -1) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    const barbeiroExistente = barbeiros[indice];

    // Verificar se email está sendo alterado e se já existe
    if (
      dadosAtualizacao.email &&
      dadosAtualizacao.email !== barbeiroExistente.email
    ) {
      const emailExistente = barbeiros.find(
        (b) => b.email === dadosAtualizacao.email && b.id !== id,
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
      dadosAtualizacao.cpf !== barbeiroExistente.cpf
    ) {
      const cpfExistente = barbeiros.find(
        (b) => b.cpf === dadosAtualizacao.cpf && b.id !== id,
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
    const barbeiroAtualizado: Barbeiro = {
      ...barbeiroExistente,
      ...dadosAtualizacao,
      dataAtualizacao: new Date().toISOString(),
    };

    barbeiros[indice] = barbeiroAtualizado;

    return res.json({
      sucesso: true,
      dados: barbeiroAtualizado,
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
 * Excluir barbeiro
 */
export const excluirBarbeiro: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return erroPadrao(res, 400, "INVALID_ID", "ID do barbeiro é obrigatório");

    const indice = barbeiros.findIndex((b) => b.id === id);

    if (indice === -1) {
      return erroPadrao(res, 404, "NOT_FOUND", "Barbeiro não encontrado");
    }

    barbeiros.splice(indice, 1);

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
