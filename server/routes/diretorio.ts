import { Request, Response } from "express";
import { getPool } from "../config/database";
import { RowDataPacket } from "mysql2";

// Interface para Barbearia
interface Barbearia extends RowDataPacket {
  id: string;
  nome: string;
  descricao?: string;
  endereco: any;
  contato: any;
  status: string;
  avaliacao_media?: number;
  total_avaliacoes?: number;
  preco_medio?: number;
  distancia?: number;
  data_cadastro: Date;
}

// Interface para Cidade
interface Cidade extends RowDataPacket {
  cidade: string;
  estado: string;
  total_barbearias: number;
}

/**
 * GET /api/diretorio/barbearias/todas
 * Listar todas as barbearias ativas
 */
export async function listarTodasBarbearias(req: Request, res: Response) {
  try {
    const {
      limite = 50,
      pagina = 1,
      ordenar = 'nome' // nome, data_cadastro, cidade
    } = req.query;

    let sql = `
      SELECT
        b.id,
        b.nome,
        b.descricao,
        b.endereco_rua,
        b.endereco_numero,
        b.endereco_bairro,
        b.endereco_cidade,
        b.endereco_estado,
        b.endereco_cep,
        b.contato_telefone,
        b.contato_email,
        b.contato_whatsapp,
        b.data_cadastro,
        b.status
      FROM barbearias b
      WHERE b.status = 'ativa'
    `;

    // Ordenação
    switch (ordenar) {
      case 'data_cadastro':
        sql += ` ORDER BY b.data_cadastro DESC`;
        break;
      case 'cidade':
        sql += ` ORDER BY b.endereco_cidade ASC, b.nome ASC`;
        break;
      default: // nome
        sql += ` ORDER BY b.nome ASC`;
    }

    // Paginação
    const limiteParsed = Math.max(1, Math.min(100, parseInt(limite as string) || 50));
    const paginaParsed = Math.max(1, parseInt(pagina as string) || 1);
    const offset = (paginaParsed - 1) * limiteParsed;
    sql += ` LIMIT ${limiteParsed} OFFSET ${offset}`;

    // Contar total de registros
    const [totalRows] = await getPool().execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM barbearias WHERE status = "ativa"'
    );
    const total = totalRows[0].total;

    const [rows] = await getPool().execute<Barbearia[]>(sql);

    // Agrupar campos de endereço e contato
    const barbearias = rows.map(barbearia => ({
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
      data_cadastro: barbearia.data_cadastro,
      status: barbearia.status
    }));

    res.json({
      sucesso: true,
      dados: {
        barbearias,
        pagina: paginaParsed,
        limite: limiteParsed,
        total,
        total_paginas: Math.ceil(total / limiteParsed)
      }
    });

  } catch (error) {
    console.error('Erro ao listar todas as barbearias:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/barbearias
 * Busca pública de barbearias com filtros
 */
export async function buscarBarbeariasPublicas(req: Request, res: Response) {
  try {
    const {
      q, // termo de busca
      cidade,
      estado,
      latitude,
      longitude,
      raio = 10, // raio em km
      avaliacao_min,
      preco_max,
      especialidade,
      ordenar = 'relevancia', // relevancia, distancia, avaliacao, preco
      limite = 20,
      pagina = 1
    } = req.query;

    let sql = `
      SELECT
        b.id,
        b.nome,
        b.descricao,
        b.endereco_rua,
        b.endereco_numero,
        b.endereco_bairro,
        b.endereco_cidade,
        b.endereco_estado,
        b.endereco_cep,
        b.contato_telefone,
        b.contato_email,
        b.contato_whatsapp,
        b.data_cadastro,
        b.status
      FROM barbearias b
      WHERE b.status = 'ativa'
    `;

    const params: any[] = [];

    // Filtro por termo de busca
    if (q) {
      sql += ` AND (b.nome LIKE ? OR b.descricao LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // Filtro por cidade
    if (cidade) {
      sql += ` AND b.endereco_cidade = ?`;
      params.push(cidade);
    }

    // Filtro por estado
    if (estado) {
      sql += ` AND b.endereco_estado = ?`;
      params.push(estado);
    }

    // Nota: Campos de avaliação e preço médio não existem na estrutura atual
    // Removidos filtros por avaliacao_min e preco_max

    // Ordenação (simplificada devido à ausência de campos de avaliação)
    switch (ordenar) {
      case 'distancia':
        sql += ` ORDER BY b.nome`;
        break;
      case 'avaliacao':
        sql += ` ORDER BY b.nome`; // Fallback para nome
        break;
      case 'preco':
        sql += ` ORDER BY b.nome`; // Fallback para nome
        break;
      default: // relevancia
        sql += ` ORDER BY b.nome`;
    }

    // Paginação (usando interpolação de string para evitar problemas com prepared statements)
    const limiteParsed = Math.max(1, Math.min(100, parseInt(limite as string) || 20)); // Entre 1 e 100
    const paginaParsed = Math.max(1, parseInt(pagina as string) || 1);
    const offset = (paginaParsed - 1) * limiteParsed;
    sql += ` LIMIT ${limiteParsed} OFFSET ${offset}`;

    const [rows] = await getPool().execute<Barbearia[]>(sql, params);

    // Agrupar campos de endereço e contato
    const barbearias = rows.map(barbearia => ({
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
      data_cadastro: barbearia.data_cadastro,
      status: barbearia.status
    }));

    res.json({
      sucesso: true,
      dados: {
        barbearias,
        pagina: parseInt(pagina as string),
        limite: parseInt(limite as string),
        total: barbearias.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar barbearias públicas:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/cidades
 * Listar cidades disponíveis
 */
export async function listarCidades(req: Request, res: Response) {
  try {
    const sql = `
      SELECT
        endereco_cidade as cidade,
        endereco_estado as estado,
        COUNT(*) as total_barbearias
      FROM barbearias
      WHERE status = 'ativa'
        AND endereco_cidade IS NOT NULL
      GROUP BY endereco_cidade, endereco_estado
      ORDER BY total_barbearias DESC, cidade ASC
    `;

    const [rows] = await getPool().execute<Cidade[]>(sql);

    const cidades = rows.map(row => ({
      cidade: row.cidade,
      estado: row.estado,
      total_barbearias: row.total_barbearias
    }));

    res.json({
      sucesso: true,
      dados: { cidades }
    });

  } catch (error) {
    console.error('Erro ao listar cidades:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/estatisticas
 * Estatísticas do diretório
 */
export async function obterEstatisticas(req: Request, res: Response) {
  try {
    // Total de barbearias ativas
    const [totalBarbearias] = await getPool().execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM barbearias WHERE status = "ativa"'
    );

    // Total de barbeiros
    const [totalBarbeiros] = await getPool().execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM barbeiros'
    );

    // Total de serviços
    const [totalServicos] = await getPool().execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM servicos WHERE ativo = 1'
    );

    // Cidades com mais barbearias
    const [cidadesTop] = await getPool().execute<RowDataPacket[]>(`
      SELECT
        endereco_cidade as cidade,
        endereco_estado as estado,
        COUNT(*) as total
      FROM barbearias
      WHERE status = 'ativa'
        AND endereco_cidade IS NOT NULL
      GROUP BY endereco_cidade, endereco_estado
      ORDER BY total DESC
      LIMIT 5
    `);

    // Preço médio dos serviços
    const [precoMedio] = await getPool().execute<RowDataPacket[]>(
      'SELECT AVG(preco) as preco_medio FROM servicos WHERE ativo = 1'
    );

    res.json({
      sucesso: true,
      dados: {
        estatisticas: {
          total_barbearias: totalBarbearias[0].total,
          total_barbeiros: totalBarbeiros[0].total,
          total_servicos: totalServicos[0].total,
          preco_medio_servicos: Math.round(precoMedio[0].preco_medio * 100) / 100,
          cidades_populares: cidadesTop.map(cidade => ({
            cidade: cidade.cidade,
            estado: cidade.estado,
            total_barbearias: cidade.total
          }))
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/sugestoes
 * Sugestões de busca
 */
export async function obterSugestoes(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({
        sucesso: true,
        dados: { sugestoes: [] }
      });
    }

    // Sugestões de nomes de barbearias
    const [barbearias] = await getPool().execute<RowDataPacket[]>(
      `SELECT DISTINCT nome 
       FROM barbearias 
       WHERE status = 'ativa' AND nome LIKE ? 
       LIMIT 5`,
      [`%${q}%`]
    );

    // Sugestões de cidades
    const [cidades] = await getPool().execute<RowDataPacket[]>(
      `SELECT DISTINCT endereco_cidade as cidade
       FROM barbearias
       WHERE status = 'ativa'
         AND endereco_cidade LIKE ?
       LIMIT 5`,
      [`%${q}%`]
    );

    const sugestoes = [
      ...barbearias.map(b => ({ tipo: 'barbearia', texto: b.nome })),
      ...cidades.map(c => ({
        tipo: 'cidade',
        texto: c.cidade
      }))
    ];

    res.json({
      sucesso: true,
      dados: { sugestoes }
    });

  } catch (error) {
    console.error('Erro ao obter sugestões:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/barbearia/:id/detalhes
 * Detalhes públicos da barbearia
 */
export async function obterDetalhesBarbearia(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [rows] = await getPool().execute<Barbearia[]>(
      `SELECT
        b.id,
        b.nome,
        b.descricao,
        b.endereco_rua,
        b.endereco_numero,
        b.endereco_bairro,
        b.endereco_cidade,
        b.endereco_estado,
        b.endereco_cep,
        b.contato_telefone,
        b.contato_email,
        b.contato_whatsapp,
        b.horario_funcionamento,
        b.data_cadastro
       FROM barbearias b
       WHERE b.id = ? AND b.status = 'ativa'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Barbearia não encontrada'
      });
    }

    const barbearia = rows[0];

    // Buscar barbeiros da barbearia
    const [barbeiros] = await getPool().execute<RowDataPacket[]>(
      `SELECT nome, especialidades FROM barbeiros WHERE barbearia_id = ?`,
      [id]
    );

    // Buscar serviços da barbearia
    const [servicos] = await getPool().execute<RowDataPacket[]>(
      `SELECT nome, preco, duracao_minutos, categoria FROM servicos WHERE barbearia_id = ? AND ativo = 1`,
      [id]
    );

    const resultado = {
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
      horario_funcionamento: typeof barbearia.horario_funcionamento === 'string' ? JSON.parse(barbearia.horario_funcionamento) : barbearia.horario_funcionamento,
      data_cadastro: barbearia.data_cadastro,
      barbeiros: barbeiros.map(b => ({
        ...b,
        especialidades: typeof b.especialidades === 'string' ? JSON.parse(b.especialidades) : b.especialidades
      })),
      servicos
    };

    res.json({
      sucesso: true,
      dados: resultado
    });

  } catch (error) {
    console.error('Erro ao obter detalhes da barbearia:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}

/**
 * GET /api/diretorio/promocoes
 * Promoções ativas
 */
export async function listarPromocoes(req: Request, res: Response) {
  try {
    const { cidade, estado } = req.query;

    let sql = `
      SELECT 
        c.id,
        c.nome,
        c.descricao,
        c.valor_original,
        c.valor_combo,
        c.tipo_desconto,
        c.valor_desconto,
        c.ativo,
        b.nome as barbearia_nome,
        b.endereco_cidade as cidade,
        b.endereco_estado as estado
      FROM combos c
      JOIN barbearias b ON c.barbearia_id = b.id
      WHERE c.ativo = 1 AND b.status = 'ativa'
    `;

    const params: any[] = [];

    if (cidade) {
      sql += ` AND b.endereco_cidade = ?`;
      params.push(cidade);
    }

    if (estado) {
      sql += ` AND b.endereco_estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY c.valor_desconto DESC LIMIT 20`;

    const [rows] = await getPool().execute<RowDataPacket[]>(sql, params);

    const promocoes = rows.map(promo => ({
      ...promo,
      economia: promo.valor_original - promo.valor_combo,
      percentual_desconto: Math.round((1 - promo.valor_combo / promo.valor_original) * 100)
    }));

    res.json({
      sucesso: true,
      dados: { promocoes }
    });

  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro interno do servidor'
    });
  }
}
