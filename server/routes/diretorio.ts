import { Request, Response } from "express";
import { connection } from "../config/database";
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
        b.endereco,
        b.contato,
        b.avaliacao_media,
        b.total_avaliacoes,
        b.preco_medio,
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
      sql += ` AND JSON_EXTRACT(b.endereco, '$.cidade') = ?`;
      params.push(cidade);
    }

    // Filtro por estado
    if (estado) {
      sql += ` AND JSON_EXTRACT(b.endereco, '$.estado') = ?`;
      params.push(estado);
    }

    // Filtro por avaliação mínima
    if (avaliacao_min) {
      sql += ` AND b.avaliacao_media >= ?`;
      params.push(parseFloat(avaliacao_min as string));
    }

    // Filtro por preço máximo
    if (preco_max) {
      sql += ` AND b.preco_medio <= ?`;
      params.push(parseFloat(preco_max as string));
    }

    // Ordenação
    switch (ordenar) {
      case 'distancia':
        if (latitude && longitude) {
          // Ordenar por distância (implementação simplificada)
          sql += ` ORDER BY b.nome`;
        } else {
          sql += ` ORDER BY b.nome`;
        }
        break;
      case 'avaliacao':
        sql += ` ORDER BY b.avaliacao_media DESC, b.total_avaliacoes DESC`;
        break;
      case 'preco':
        sql += ` ORDER BY b.preco_medio ASC`;
        break;
      default: // relevancia
        sql += ` ORDER BY b.avaliacao_media DESC, b.total_avaliacoes DESC, b.nome`;
    }

    // Paginação
    const offset = (parseInt(pagina as string) - 1) * parseInt(limite as string);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limite as string), offset);

    const [rows] = await connection.execute<Barbearia[]>(sql, params);

    // Parse JSON fields
    const barbearias = rows.map(barbearia => ({
      ...barbearia,
      endereco: typeof barbearia.endereco === 'string' ? JSON.parse(barbearia.endereco) : barbearia.endereco,
      contato: typeof barbearia.contato === 'string' ? JSON.parse(barbearia.contato) : barbearia.contato
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
        JSON_EXTRACT(endereco, '$.cidade') as cidade,
        JSON_EXTRACT(endereco, '$.estado') as estado,
        COUNT(*) as total_barbearias
      FROM barbearias 
      WHERE status = 'ativa'
        AND JSON_EXTRACT(endereco, '$.cidade') IS NOT NULL
      GROUP BY JSON_EXTRACT(endereco, '$.cidade'), JSON_EXTRACT(endereco, '$.estado')
      ORDER BY total_barbearias DESC, cidade ASC
    `;

    const [rows] = await connection.execute<Cidade[]>(sql);

    const cidades = rows.map(row => ({
      cidade: row.cidade?.toString().replace(/"/g, ''),
      estado: row.estado?.toString().replace(/"/g, ''),
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
    const [totalBarbearias] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM barbearias WHERE status = "ativa"'
    );

    // Total de barbeiros
    const [totalBarbeiros] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM barbeiros'
    );

    // Total de serviços
    const [totalServicos] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM servicos WHERE ativo = 1'
    );

    // Cidades com mais barbearias
    const [cidadesTop] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        JSON_EXTRACT(endereco, '$.cidade') as cidade,
        JSON_EXTRACT(endereco, '$.estado') as estado,
        COUNT(*) as total
      FROM barbearias 
      WHERE status = 'ativa'
        AND JSON_EXTRACT(endereco, '$.cidade') IS NOT NULL
      GROUP BY JSON_EXTRACT(endereco, '$.cidade'), JSON_EXTRACT(endereco, '$.estado')
      ORDER BY total DESC
      LIMIT 5
    `);

    // Preço médio dos serviços
    const [precoMedio] = await connection.execute<RowDataPacket[]>(
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
            cidade: cidade.cidade?.toString().replace(/"/g, ''),
            estado: cidade.estado?.toString().replace(/"/g, ''),
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
    const [barbearias] = await connection.execute<RowDataPacket[]>(
      `SELECT DISTINCT nome 
       FROM barbearias 
       WHERE status = 'ativa' AND nome LIKE ? 
       LIMIT 5`,
      [`%${q}%`]
    );

    // Sugestões de cidades
    const [cidades] = await connection.execute<RowDataPacket[]>(
      `SELECT DISTINCT JSON_EXTRACT(endereco, '$.cidade') as cidade
       FROM barbearias 
       WHERE status = 'ativa' 
         AND JSON_EXTRACT(endereco, '$.cidade') LIKE ?
       LIMIT 5`,
      [`%${q}%`]
    );

    const sugestoes = [
      ...barbearias.map(b => ({ tipo: 'barbearia', texto: b.nome })),
      ...cidades.map(c => ({ 
        tipo: 'cidade', 
        texto: c.cidade?.toString().replace(/"/g, '') 
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

    const [rows] = await connection.execute<Barbearia[]>(
      `SELECT 
        b.id,
        b.nome,
        b.descricao,
        b.endereco,
        b.contato,
        b.horario_funcionamento,
        b.especialidades,
        b.avaliacao_media,
        b.total_avaliacoes,
        b.preco_medio,
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
    const [barbeiros] = await connection.execute<RowDataPacket[]>(
      `SELECT nome, especialidades FROM barbeiros WHERE barbeariaId = ?`,
      [id]
    );

    // Buscar serviços da barbearia
    const [servicos] = await connection.execute<RowDataPacket[]>(
      `SELECT nome, preco, duracaoMinutos, categoria FROM servicos WHERE barbeariaId = ? AND ativo = 1`,
      [id]
    );

    const resultado = {
      ...barbearia,
      endereco: typeof barbearia.endereco === 'string' ? JSON.parse(barbearia.endereco) : barbearia.endereco,
      contato: typeof barbearia.contato === 'string' ? JSON.parse(barbearia.contato) : barbearia.contato,
      horario_funcionamento: typeof barbearia.horario_funcionamento === 'string' ? JSON.parse(barbearia.horario_funcionamento) : barbearia.horario_funcionamento,
      especialidades: typeof barbearia.especialidades === 'string' ? JSON.parse(barbearia.especialidades) : barbearia.especialidades,
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
        c.valorOriginal,
        c.valorCombo,
        c.tipoDesconto,
        c.valorDesconto,
        c.ativo,
        b.nome as barbearia_nome,
        JSON_EXTRACT(b.endereco, '$.cidade') as cidade,
        JSON_EXTRACT(b.endereco, '$.estado') as estado
      FROM combos c
      JOIN barbearias b ON c.barbeariaId = b.id
      WHERE c.ativo = 1 AND b.status = 'ativa'
    `;

    const params: any[] = [];

    if (cidade) {
      sql += ` AND JSON_EXTRACT(b.endereco, '$.cidade') = ?`;
      params.push(cidade);
    }

    if (estado) {
      sql += ` AND JSON_EXTRACT(b.endereco, '$.estado') = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY c.valorDesconto DESC LIMIT 20`;

    const [rows] = await connection.execute<RowDataPacket[]>(sql, params);

    const promocoes = rows.map(promo => ({
      ...promo,
      cidade: promo.cidade?.toString().replace(/"/g, ''),
      estado: promo.estado?.toString().replace(/"/g, ''),
      economia: promo.valorOriginal - promo.valorCombo,
      percentual_desconto: Math.round((1 - promo.valorCombo / promo.valorOriginal) * 100)
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
