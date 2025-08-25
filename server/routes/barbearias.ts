import { RequestHandler } from "express";
import {
  Barbearia,
  Barbeiro,
  Servico,
  CriarBarbeariaRequest,
  AtualizarBarbeariaRequest,
  ListarBarbeariasResponse,
  ApiResponse
} from "@shared/api";
import { executeQuery, executeQuerySingle } from "../config/database";
import { v4 as uuidv4 } from 'uuid';

// Instalar uuid se não estiver instalado
// pnpm add uuid @types/uuid

// Função auxiliar para converter dados do MySQL para o formato da interface
const mapBarbeariaFromDB = (row: any): Barbearia => {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    endereco: {
      rua: row.endereco_rua,
      numero: row.endereco_numero,
      bairro: row.endereco_bairro,
      cidade: row.endereco_cidade,
      estado: row.endereco_estado,
      cep: row.endereco_cep
    },
    contato: {
      telefone: row.contato_telefone,
      email: row.contato_email,
      whatsapp: row.contato_whatsapp
    },
    proprietario: {
      nome: row.proprietario_nome,
      cpf: row.proprietario_cpf,
      email: row.proprietario_email
    },
    horarioFuncionamento: typeof row.horario_funcionamento === 'string'
      ? JSON.parse(row.horario_funcionamento)
      : row.horario_funcionamento || {},
    status: row.status,
    dataCadastro: row.data_cadastro,
    dataAtualizacao: row.data_atualizacao
  };
};

// Função auxiliar para buscar barbeiros de uma barbearia
const buscarBarbeirosPorBarbearia = async (barbeariaId: string): Promise<Barbeiro[]> => {
  try {
    const rows = await executeQuery(`
      SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao,
             salario_fixo, valor_hora, barbearia_id, especialidades,
             horario_trabalho, status, data_cadastro, data_atualizacao
      FROM barbeiros
      WHERE barbearia_id = ? AND status = 'ativo'
    `, [barbeariaId]);

    return rows.map((row: any): Barbeiro => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      cpf: row.cpf,
      tipo: row.tipo,
      porcentagemComissao: row.porcentagem_comissao,
      salarioFixo: row.salario_fixo,
      valorHora: row.valor_hora,
      barbeariaId: row.barbearia_id,
      especialidades: row.especialidades ? JSON.parse(row.especialidades) : [],
      horarioTrabalho: row.horario_trabalho ? JSON.parse(row.horario_trabalho) : {},
      status: row.status,
      dataCadastro: row.data_cadastro,
      dataAtualizacao: row.data_atualizacao
    }));
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return [];
  }
};

// Função auxiliar para buscar serviços de uma barbearia
const buscarServicosPorBarbearia = async (barbeariaId: string): Promise<Servico[]> => {
  try {
    const rows = await executeQuery(`
      SELECT id, nome, descricao, preco, duracao_minutos, barbearia_id,
             categoria, ativo, data_cadastro, data_atualizacao
      FROM servicos
      WHERE barbearia_id = ? AND ativo = true
    `, [barbeariaId]);

    return rows.map((row: any): Servico => ({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      preco: row.preco,
      duracaoMinutos: row.duracao_minutos,
      barbeariaId: row.barbearia_id,
      categoria: row.categoria,
      ativo: row.ativo,
      dataCadastro: row.data_cadastro,
      dataAtualizacao: row.data_atualizacao
    }));
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
};

// Função para gerar ID único
const gerarId = (): string => {
  return uuidv4();
};

/**
 * GET /api/barbearias
 * Listar todas as barbearias com paginação
 */
export const listarBarbearias: RequestHandler = async (req, res) => {
  try {
    // Validar e garantir que pagina e limite sejam números válidos
    const paginaParam = req.query.pagina as string;
    const limiteParam = req.query.limite as string;

    const pagina = Math.max(1, parseInt(paginaParam) || 1);
    const limite = Math.max(1, Math.min(50, parseInt(limiteParam) || 10)); // Máximo de 50 por página

    const status = req.query.status as string;
    const cidade = req.query.cidade as string;
    const incluirBarbeiros = req.query.incluirBarbeiros === 'true';
    const incluirServicos = req.query.incluirServicos === 'true';

    // Construir query com filtros
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (cidade) {
      whereClause += ' AND endereco_cidade LIKE ?';
      params.push(`%${cidade}%`);
    }

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM barbearias
      ${whereClause}
    `;
    const countResult = await executeQuerySingle<{ total: number }>(countQuery, params);
    const total = countResult?.total || 0;
    const totalPaginas = Math.ceil(total / limite);
    const offset = Math.max(0, (pagina - 1) * limite);

    // Buscar barbearias com paginação
    // Usar string interpolation para LIMIT e OFFSET (com validação para evitar SQL injection)
    const selectQuery = `
      SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
             endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
             contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
             proprietario_email, horario_funcionamento, status, data_cadastro, data_atualizacao
      FROM barbearias
      ${whereClause}
      ORDER BY nome
      LIMIT ${limite} OFFSET ${offset}
    `;

    const rows = await executeQuery(selectQuery, params);
    const barbearias = rows.map(mapBarbeariaFromDB);

    // Incluir barbeiros e serviços se solicitado
    const barbeariasComRelacionamentos = await Promise.all(
      barbearias.map(async (barbearia) => {
        const barbeariaCompleta: Barbearia = { ...barbearia };

        if (incluirBarbeiros) {
          barbeariaCompleta.barbeiros = await buscarBarbeirosPorBarbearia(barbearia.id);
        }

        if (incluirServicos) {
          barbeariaCompleta.servicos = await buscarServicosPorBarbearia(barbearia.id);
        }

        return barbeariaCompleta;
      })
    );

    const response: ListarBarbeariasResponse = {
      barbearias: barbeariasComRelacionamentos,
      total,
      pagina,
      totalPaginas
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar barbearias:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/barbearias/:id
 * Buscar barbearia por ID
 */
export const buscarBarbearia: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const incluirBarbeiros = req.query.incluirBarbeiros !== 'false'; // Incluir por padrão
    const incluirServicos = req.query.incluirServicos !== 'false'; // Incluir por padrão

    const selectQuery = `
      SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
             endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
             contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
             proprietario_email, horario_funcionamento, status, data_cadastro, data_atualizacao
      FROM barbearias
      WHERE id = ?
    `;

    const row = await executeQuerySingle(selectQuery, [id]);

    if (!row) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada"
      } as ApiResponse);
    }

    // Criar barbearia completa com relacionamentos
    const barbearia = mapBarbeariaFromDB(row);

    if (incluirBarbeiros) {
      barbearia.barbeiros = await buscarBarbeirosPorBarbearia(barbearia.id);
    }

    if (incluirServicos) {
      barbearia.servicos = await buscarServicosPorBarbearia(barbearia.id);
    }

    res.json({
      sucesso: true,
      dados: barbearia
    } as ApiResponse<Barbearia>);
  } catch (error) {
    console.error("Erro ao buscar barbearia:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * POST /api/barbearias
 * Criar nova barbearia
 */
export const criarBarbearia: RequestHandler = (req, res) => {
  try {
    const dadosBarbearia: CriarBarbeariaRequest = req.body;

    // Validações básicas
    if (!dadosBarbearia.nome || !dadosBarbearia.endereco || !dadosBarbearia.contato || !dadosBarbearia.proprietario) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios não fornecidos: nome, endereço, contato e proprietário são obrigatórios"
      } as ApiResponse);
    }

    // Verificar se já existe barbearia com mesmo email
    const emailExistente = barbearias.find(b => b.contato.email === dadosBarbearia.contato.email);
    if (emailExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe uma barbearia cadastrada com este email"
      } as ApiResponse);
    }

    const agora = new Date().toISOString();
    const novaBarbearia: Barbearia = {
      id: gerarId(),
      ...dadosBarbearia,
      status: "pendente",
      dataCadastro: agora,
      dataAtualizacao: agora,
      horarioFuncionamento: dadosBarbearia.horarioFuncionamento || {},
      servicos: dadosBarbearia.servicos || []
    };

    barbearias.push(novaBarbearia);

    res.status(201).json({
      sucesso: true,
      dados: novaBarbearia,
      mensagem: "Barbearia cadastrada com sucesso"
    } as ApiResponse<Barbearia>);
  } catch (error) {
    console.error("Erro ao criar barbearia:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * PUT /api/barbearias/:id
 * Atualizar barbearia existente
 */
export const atualizarBarbearia: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarBarbeariaRequest = req.body;

    const indice = barbearias.findIndex(b => b.id === id);
    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada"
      } as ApiResponse);
    }

    const barbeariaExistente = barbearias[indice];

    // Verificar se email está sendo alterado e se já existe
    if (dadosAtualizacao.contato?.email && dadosAtualizacao.contato.email !== barbeariaExistente.contato.email) {
      const emailExistente = barbearias.find(b => b.contato.email === dadosAtualizacao.contato?.email && b.id !== id);
      if (emailExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe uma barbearia cadastrada com este email"
        } as ApiResponse);
      }
    }

    // Atualizar dados
    const barbeariaAtualizada: Barbearia = {
      ...barbeariaExistente,
      ...dadosAtualizacao,
      endereco: dadosAtualizacao.endereco ? { ...barbeariaExistente.endereco, ...dadosAtualizacao.endereco } : barbeariaExistente.endereco,
      contato: dadosAtualizacao.contato ? { ...barbeariaExistente.contato, ...dadosAtualizacao.contato } : barbeariaExistente.contato,
      proprietario: dadosAtualizacao.proprietario ? { ...barbeariaExistente.proprietario, ...dadosAtualizacao.proprietario } : barbeariaExistente.proprietario,
      horarioFuncionamento: dadosAtualizacao.horarioFuncionamento || barbeariaExistente.horarioFuncionamento,
      dataAtualizacao: new Date().toISOString()
    };

    barbearias[indice] = barbeariaAtualizada;

    res.json({
      sucesso: true,
      dados: barbeariaAtualizada,
      mensagem: "Barbearia atualizada com sucesso"
    } as ApiResponse<Barbearia>);
  } catch (error) {
    console.error("Erro ao atualizar barbearia:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * DELETE /api/barbearias/:id
 * Excluir barbearia
 */
export const excluirBarbearia: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const indice = barbearias.findIndex(b => b.id === id);

    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada"
      } as ApiResponse);
    }

    barbearias.splice(indice, 1);

    res.json({
      sucesso: true,
      mensagem: "Barbearia excluída com sucesso"
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao excluir barbearia:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};
