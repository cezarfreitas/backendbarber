import { RequestHandler } from "express";
import { executeQuery, executeQuerySingle } from "../config/database";
import {
  Servico,
  CriarServicoRequest,
  AtualizarServicoRequest,
  ListarServicosResponse,
  ApiResponse
} from "@shared/api";
import { v4 as uuidv4 } from "uuid";

// Helper para respostas de erro padronizadas
const erroPadrao = (res: any, status: number, codigo: string, mensagem: string, detalhes?: any) => {
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
  let pagina = 1;
  let limite = 10;

  if (paginaRaw !== undefined && paginaRaw !== null && paginaRaw !== '') {
    const paginaParsed = parseInt(String(paginaRaw), 10);
    if (!Number.isNaN(paginaParsed) && paginaParsed > 0) {
      pagina = paginaParsed;
    }
  }

  if (limiteRaw !== undefined && limiteRaw !== null && limiteRaw !== '') {
    const limiteParsed = parseInt(String(limiteRaw), 10);
    if (!Number.isNaN(limiteParsed) && limiteParsed > 0) {
      limite = limiteParsed;
    }
  }

  if (pagina < 1) return { erro: true, mensagem: 'Parâmetro pagina deve ser maior que 0', codigo: 'INVALID_PAGE' };
  if (limite < 1) return { erro: true, mensagem: 'Parâmetro limite deve ser maior que 0', codigo: 'INVALID_LIMIT' };

  const MAX_LIMIT = 100;
  if (limite > MAX_LIMIT) return { erro: true, mensagem: `Limite máximo permitido é ${MAX_LIMIT}`, codigo: 'LIMIT_EXCEEDED' };

  return { erro: false, pagina, limite };
};

/**
 * GET /api/servicos
 * Listar todos os serviços com paginação
 */
export const listarServicos: RequestHandler = (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const barbeariaId = req.query.barbeariaId as string;
    const categoria = req.query.categoria as string;
    const ativo = req.query.ativo as string;
    const precoMin = parseFloat(req.query.precoMin as string);
    const precoMax = parseFloat(req.query.precoMax as string);

    let servicosFiltrados = [...servicos];

    // Filtrar por barbearia se fornecido
    if (barbeariaId) {
      servicosFiltrados = servicosFiltrados.filter(s => s.barbeariaId === barbeariaId);
    }

    // Filtrar por categoria se fornecido
    if (categoria) {
      servicosFiltrados = servicosFiltrados.filter(s => s.categoria === categoria);
    }

    // Filtrar por status ativo se fornecido
    if (ativo !== undefined) {
      const isAtivo = ativo === 'true';
      servicosFiltrados = servicosFiltrados.filter(s => s.ativo === isAtivo);
    }

    // Filtrar por faixa de preço
    if (!isNaN(precoMin)) {
      servicosFiltrados = servicosFiltrados.filter(s => s.preco >= precoMin);
    }
    if (!isNaN(precoMax)) {
      servicosFiltrados = servicosFiltrados.filter(s => s.preco <= precoMax);
    }

    const total = servicosFiltrados.length;
    const totalPaginas = Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    const servicosPaginados = servicosFiltrados.slice(inicio, fim);

    const response: ListarServicosResponse = {
      servicos: servicosPaginados,
      total,
      pagina,
      totalPaginas
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/servicos/:id
 * Buscar serviço por ID
 */
export const buscarServico: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const servico = servicos.find(s => s.id === id);

    if (!servico) {
      return res.status(404).json({
        sucesso: false,
        erro: "Serviço não encontrado"
      } as ApiResponse);
    }

    res.json({
      sucesso: true,
      dados: servico
    } as ApiResponse<Servico>);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * POST /api/servicos
 * Criar novo serviço
 */
export const criarServico: RequestHandler = (req, res) => {
  try {
    const dadosServico: CriarServicoRequest = req.body;

    // Validações básicas
    if (!dadosServico.nome || !dadosServico.preco || !dadosServico.duracaoMinutos || !dadosServico.barbeariaId) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios não fornecidos: nome, preço, duração e barbeariaId são obrigatórios"
      } as ApiResponse);
    }

    // Validar valores numéricos
    if (dadosServico.preco <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Preço deve ser maior que zero"
      } as ApiResponse);
    }

    if (dadosServico.duracaoMinutos <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Duração deve ser maior que zero"
      } as ApiResponse);
    }

    // Verificar se já existe serviço com mesmo nome na mesma barbearia
    const nomeExistente = servicos.find(s => 
      s.nome.toLowerCase() === dadosServico.nome.toLowerCase() && 
      s.barbeariaId === dadosServico.barbeariaId
    );
    if (nomeExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe um serviço com este nome nesta barbearia"
      } as ApiResponse);
    }

    const agora = new Date().toISOString();
    const novoServico: Servico = {
      id: gerarId(),
      ...dadosServico,
      ativo: true,
      dataCadastro: agora,
      dataAtualizacao: agora
    };

    servicos.push(novoServico);

    res.status(201).json({
      sucesso: true,
      dados: novoServico,
      mensagem: "Serviço cadastrado com sucesso"
    } as ApiResponse<Servico>);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * PUT /api/servicos/:id
 * Atualizar serviço existente
 */
export const atualizarServico: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarServicoRequest = req.body;

    const indice = servicos.findIndex(s => s.id === id);
    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Serviço não encontrado"
      } as ApiResponse);
    }

    const servicoExistente = servicos[indice];

    // Verificar se nome está sendo alterado e se já existe
    if (dadosAtualizacao.nome && dadosAtualizacao.nome !== servicoExistente.nome) {
      const nomeExistente = servicos.find(s => 
        s.nome.toLowerCase() === dadosAtualizacao.nome?.toLowerCase() && 
        s.barbeariaId === servicoExistente.barbeariaId && 
        s.id !== id
      );
      if (nomeExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um serviço com este nome nesta barbearia"
        } as ApiResponse);
      }
    }

    // Validar valores numéricos se fornecidos
    if (dadosAtualizacao.preco !== undefined && dadosAtualizacao.preco <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Preço deve ser maior que zero"
      } as ApiResponse);
    }

    if (dadosAtualizacao.duracaoMinutos !== undefined && dadosAtualizacao.duracaoMinutos <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Duração deve ser maior que zero"
      } as ApiResponse);
    }

    // Atualizar dados
    const servicoAtualizado: Servico = {
      ...servicoExistente,
      ...dadosAtualizacao,
      dataAtualizacao: new Date().toISOString()
    };

    servicos[indice] = servicoAtualizado;

    res.json({
      sucesso: true,
      dados: servicoAtualizado,
      mensagem: "Serviço atualizado com sucesso"
    } as ApiResponse<Servico>);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * DELETE /api/servicos/:id
 * Excluir serviço
 */
export const excluirServico: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const indice = servicos.findIndex(s => s.id === id);

    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Serviço não encontrado"
      } as ApiResponse);
    }

    servicos.splice(indice, 1);

    res.json({
      sucesso: true,
      mensagem: "Serviço excluído com sucesso"
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};
