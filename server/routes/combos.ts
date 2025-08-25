import { RequestHandler } from "express";
import { 
  Combo, 
  Servico,
  CriarComboRequest, 
  AtualizarComboRequest,
  ListarCombosResponse,
  ApiResponse 
} from "@shared/api";
import { executeQuery, executeQuerySingle, beginTransaction, commitTransaction, rollbackTransaction } from "../config/database";
import { v4 as uuidv4 } from 'uuid';

// Função auxiliar para converter dados do MySQL para o formato da interface
const mapComboFromDB = (row: any): Combo => {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    barbeariaId: row.barbearia_id,
    servicoIds: [], // Será preenchido pela função que busca os serviços
    valorOriginal: parseFloat(row.valor_original),
    valorCombo: parseFloat(row.valor_combo),
    tipoDesconto: row.tipo_desconto,
    valorDesconto: parseFloat(row.valor_desconto),
    duracaoTotalMinutos: row.duracao_total_minutos,
    ativo: row.ativo,
    dataCadastro: row.data_cadastro,
    dataAtualizacao: row.data_atualizacao
  };
};

// Função auxiliar para buscar serviços de um combo
const buscarServicosPorCombo = async (comboId: string): Promise<{ servicoIds: string[], servicos: Servico[] }> => {
  try {
    const rows = await executeQuery(`
      SELECT s.id, s.nome, s.descricao, s.preco, s.duracao_minutos, 
             s.barbearia_id, s.categoria, s.ativo, s.data_cadastro, s.data_atualizacao,
             cs.ordem
      FROM servicos s
      JOIN combo_servicos cs ON s.id = cs.servico_id
      WHERE cs.combo_id = ?
      ORDER BY cs.ordem ASC
    `, [comboId]);

    const servicoIds: string[] = [];
    const servicos: Servico[] = [];

    rows.forEach((row: any) => {
      servicoIds.push(row.id);
      servicos.push({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao,
        preco: parseFloat(row.preco),
        duracaoMinutos: row.duracao_minutos,
        barbeariaId: row.barbearia_id,
        categoria: row.categoria,
        ativo: row.ativo,
        dataCadastro: row.data_cadastro,
        dataAtualizacao: row.data_atualizacao
      });
    });

    return { servicoIds, servicos };
  } catch (error) {
    console.error('Erro ao buscar serviços do combo:', error);
    return { servicoIds: [], servicos: [] };
  }
};

// Função auxiliar para calcular valores do combo
const calcularValoresCombo = async (servicoIds: string[], tipoDesconto: 'valor' | 'percentual', valorDesconto: number) => {
  // Buscar preços e durações dos serviços
  const placeholders = servicoIds.map(() => '?').join(',');
  const rows = await executeQuery(`
    SELECT preco, duracao_minutos 
    FROM servicos 
    WHERE id IN (${placeholders}) AND ativo = true
  `, servicoIds);

  if (rows.length !== servicoIds.length) {
    throw new Error('Um ou mais serviços não foram encontrados ou estão inativos');
  }

  const valorOriginal = rows.reduce((total: number, row: any) => total + parseFloat(row.preco), 0);
  const duracaoTotal = rows.reduce((total: number, row: any) => total + row.duracao_minutos, 0);

  let valorCombo: number;
  if (tipoDesconto === 'valor') {
    valorCombo = valorOriginal - valorDesconto;
  } else {
    valorCombo = valorOriginal * (1 - valorDesconto / 100);
  }

  // Garantir que o valor do combo não seja negativo
  valorCombo = Math.max(0, valorCombo);

  return {
    valorOriginal: parseFloat(valorOriginal.toFixed(2)),
    valorCombo: parseFloat(valorCombo.toFixed(2)),
    duracaoTotal
  };
};

// Função para gerar ID único
const gerarId = (): string => {
  return uuidv4();
};

/**
 * GET /api/combos
 * Listar todos os combos com paginação
 */
export const listarCombos: RequestHandler = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const barbeariaId = req.query.barbeariaId as string;
    const ativo = req.query.ativo as string;
    const incluirServicos = req.query.incluirServicos !== 'false'; // Incluir por padrão

    // Construir query base
    let selectQuery = `
      SELECT id, nome, descricao, barbearia_id, valor_original, valor_combo,
             tipo_desconto, valor_desconto, duracao_total_minutos, ativo,
             data_cadastro, data_atualizacao
      FROM combos
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM combos';
    const whereConditions: string[] = [];
    const params: any[] = [];

    // Adicionar filtros
    if (barbeariaId) {
      whereConditions.push('barbearia_id = ?');
      params.push(barbeariaId);
    }

    if (ativo !== undefined) {
      whereConditions.push('ativo = ?');
      params.push(ativo === 'true' ? 1 : 0);
    }

    // Aplicar WHERE se houver condições
    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      selectQuery += whereClause;
      countQuery += whereClause;
    }

    // Contar total de registros
    const countResult = await executeQuerySingle<{ total: number }>(countQuery, params);
    const total = countResult?.total || 0;
    const totalPaginas = Math.ceil(total / limite);
    const offset = (pagina - 1) * limite;

    // Adicionar ordenação e paginação
    selectQuery += ' ORDER BY nome LIMIT ? OFFSET ?';
    const allParams = [...params, limite, offset];

    const rows = await executeQuery(selectQuery, allParams);
    const combos = await Promise.all(
      rows.map(async (row: any) => {
        const combo = mapComboFromDB(row);
        const { servicoIds, servicos } = await buscarServicosPorCombo(combo.id);

        combo.servicoIds = servicoIds;
        if (incluirServicos) {
          combo.servicos = servicos;
        }

        return combo;
      })
    );

    const response: ListarCombosResponse = {
      combos,
      total,
      pagina,
      totalPaginas
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar combos:", error);
    res.status(500).json({
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/combos/:id
 * Buscar combo por ID
 */
export const buscarCombo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const incluirServicos = req.query.incluirServicos !== 'false'; // Incluir por padrão
    
    const selectQuery = `
      SELECT id, nome, descricao, barbearia_id, valor_original, valor_combo,
             tipo_desconto, valor_desconto, duracao_total_minutos, ativo,
             data_cadastro, data_atualizacao
      FROM combos 
      WHERE id = ?
    `;
    
    const row = await executeQuerySingle(selectQuery, [id]);

    if (!row) {
      return res.status(404).json({
        sucesso: false,
        erro: "Combo não encontrado"
      } as ApiResponse);
    }

    const combo = mapComboFromDB(row);
    const { servicoIds, servicos } = await buscarServicosPorCombo(combo.id);
    
    combo.servicoIds = servicoIds;
    if (incluirServicos) {
      combo.servicos = servicos;
    }

    res.json({
      sucesso: true,
      dados: combo
    } as ApiResponse<Combo>);
  } catch (error) {
    console.error("Erro ao buscar combo:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * POST /api/combos
 * Criar novo combo
 */
export const criarCombo: RequestHandler = async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const dadosCombo: CriarComboRequest = req.body;

    // Validações básicas
    if (!dadosCombo.nome || !dadosCombo.barbeariaId || !dadosCombo.servicoIds || !dadosCombo.tipoDesconto) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios não fornecidos: nome, barbeariaId, servicoIds, tipoDesconto são obrigatórios"
      } as ApiResponse);
    }

    if (dadosCombo.servicoIds.length < 2) {
      return res.status(400).json({
        sucesso: false,
        erro: "Um combo deve ter pelo menos 2 serviços"
      } as ApiResponse);
    }

    if (dadosCombo.valorDesconto < 0) {
      return res.status(400).json({
        sucesso: false,
        erro: "Valor do desconto não pode ser negativo"
      } as ApiResponse);
    }

    if (dadosCombo.tipoDesconto === 'percentual' && dadosCombo.valorDesconto > 100) {
      return res.status(400).json({
        sucesso: false,
        erro: "Desconto percentual não pode ser maior que 100%"
      } as ApiResponse);
    }

    // Verificar se já existe combo com mesmo nome na mesma barbearia
    const nomeExistente = await executeQuerySingle(`
      SELECT id FROM combos 
      WHERE nome = ? AND barbearia_id = ?
    `, [dadosCombo.nome, dadosCombo.barbeariaId]);

    if (nomeExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe um combo com este nome nesta barbearia"
      } as ApiResponse);
    }

    // Calcular valores do combo
    const { valorOriginal, valorCombo, duracaoTotal } = await calcularValoresCombo(
      dadosCombo.servicoIds, 
      dadosCombo.tipoDesconto, 
      dadosCombo.valorDesconto
    );

    const comboId = gerarId();

    // Inserir combo
    await executeQuery(`
      INSERT INTO combos (
        id, nome, descricao, barbearia_id, valor_original, valor_combo,
        tipo_desconto, valor_desconto, duracao_total_minutos, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      comboId, dadosCombo.nome, dadosCombo.descricao, dadosCombo.barbeariaId,
      valorOriginal, valorCombo, dadosCombo.tipoDesconto, dadosCombo.valorDesconto, duracaoTotal
    ]);

    // Inserir relações combo-serviços
    for (let i = 0; i < dadosCombo.servicoIds.length; i++) {
      await executeQuery(`
        INSERT INTO combo_servicos (combo_id, servico_id, ordem) 
        VALUES (?, ?, ?)
      `, [comboId, dadosCombo.servicoIds[i], i + 1]);
    }

    await commitTransaction(connection);

    // Buscar combo criado com serviços
    const comboCreated = await buscarCombo({ params: { id: comboId }, query: {} } as any, res);
    
    if (res.headersSent) return; // Se buscarCombo j�� enviou resposta

    res.status(201).json({
      sucesso: true,
      mensagem: "Combo criado com sucesso"
    } as ApiResponse);

  } catch (error) {
    await rollbackTransaction(connection);
    console.error("Erro ao criar combo:", error);
    res.status(500).json({
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * PUT /api/combos/:id
 * Atualizar combo existente
 */
export const atualizarCombo: RequestHandler = async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const { id } = req.params;
    const dadosAtualizacao: AtualizarComboRequest = req.body;

    // Verificar se combo existe
    const comboExistente = await executeQuerySingle(`
      SELECT * FROM combos WHERE id = ?
    `, [id]);

    if (!comboExistente) {
      return res.status(404).json({
        sucesso: false,
        erro: "Combo não encontrado"
      } as ApiResponse);
    }

    // Verificar se nome está sendo alterado e se já existe
    if (dadosAtualizacao.nome && dadosAtualizacao.nome !== comboExistente.nome) {
      const nomeExistente = await executeQuerySingle(`
        SELECT id FROM combos 
        WHERE nome = ? AND barbearia_id = ? AND id != ?
      `, [dadosAtualizacao.nome, comboExistente.barbearia_id, id]);

      if (nomeExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um combo com este nome nesta barbearia"
        } as ApiResponse);
      }
    }

    let valorOriginal = comboExistente.valor_original;
    let valorCombo = comboExistente.valor_combo;
    let duracaoTotal = comboExistente.duracao_total_minutos;

    // Se serviços ou desconto foram alterados, recalcular valores
    if (dadosAtualizacao.servicoIds || dadosAtualizacao.tipoDesconto || dadosAtualizacao.valorDesconto) {
      const servicoIds = dadosAtualizacao.servicoIds || (await buscarServicosPorCombo(id)).servicoIds;
      const tipoDesconto = dadosAtualizacao.tipoDesconto || comboExistente.tipo_desconto;
      const valorDesconto = dadosAtualizacao.valorDesconto ?? comboExistente.valor_desconto;

      if (servicoIds.length < 2) {
        return res.status(400).json({
          sucesso: false,
          erro: "Um combo deve ter pelo menos 2 serviços"
        } as ApiResponse);
      }

      const valores = await calcularValoresCombo(servicoIds, tipoDesconto, valorDesconto);
      valorOriginal = valores.valorOriginal;
      valorCombo = valores.valorCombo;
      duracaoTotal = valores.duracaoTotal;

      // Atualizar relações combo-serviços se necessário
      if (dadosAtualizacao.servicoIds) {
        // Remover relações existentes
        await executeQuery(`DELETE FROM combo_servicos WHERE combo_id = ?`, [id]);
        
        // Inserir novas relações
        for (let i = 0; i < dadosAtualizacao.servicoIds.length; i++) {
          await executeQuery(`
            INSERT INTO combo_servicos (combo_id, servico_id, ordem) 
            VALUES (?, ?, ?)
          `, [id, dadosAtualizacao.servicoIds[i], i + 1]);
        }
      }
    }

    // Atualizar combo
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (dadosAtualizacao.nome) {
      updateFields.push('nome = ?');
      updateValues.push(dadosAtualizacao.nome);
    }

    if (dadosAtualizacao.descricao !== undefined) {
      updateFields.push('descricao = ?');
      updateValues.push(dadosAtualizacao.descricao);
    }

    if (dadosAtualizacao.tipoDesconto) {
      updateFields.push('tipo_desconto = ?');
      updateValues.push(dadosAtualizacao.tipoDesconto);
    }

    if (dadosAtualizacao.valorDesconto !== undefined) {
      updateFields.push('valor_desconto = ?');
      updateValues.push(dadosAtualizacao.valorDesconto);
    }

    if (dadosAtualizacao.ativo !== undefined) {
      updateFields.push('ativo = ?');
      updateValues.push(dadosAtualizacao.ativo);
    }

    // Sempre atualizar valores recalculados
    updateFields.push('valor_original = ?', 'valor_combo = ?', 'duracao_total_minutos = ?');
    updateValues.push(valorOriginal, valorCombo, duracaoTotal);

    if (updateFields.length > 0) {
      updateValues.push(id);
      await executeQuery(`
        UPDATE combos 
        SET ${updateFields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, updateValues);
    }

    await commitTransaction(connection);

    res.json({
      sucesso: true,
      mensagem: "Combo atualizado com sucesso"
    } as ApiResponse);

  } catch (error) {
    await rollbackTransaction(connection);
    console.error("Erro ao atualizar combo:", error);
    res.status(500).json({
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * DELETE /api/combos/:id
 * Excluir combo
 */
export const excluirCombo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(`DELETE FROM combos WHERE id = ?`, [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        erro: "Combo não encontrado"
      } as ApiResponse);
    }

    res.json({
      sucesso: true,
      mensagem: "Combo excluído com sucesso"
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao excluir combo:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};
