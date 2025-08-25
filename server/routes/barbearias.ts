import { RequestHandler } from "express";
import { 
  Barbearia, 
  CriarBarbeariaRequest, 
  AtualizarBarbeariaRequest,
  ListarBarbeariasResponse,
  ApiResponse 
} from "@shared/api";

// Simulação de banco de dados em memória
// Em produção, usar um banco real como PostgreSQL, MongoDB, etc.
let barbearias: Barbearia[] = [
  {
    id: "1",
    nome: "Barbearia do João",
    descricao: "A melhor barbearia do bairro, com mais de 20 anos de tradição",
    endereco: {
      rua: "Rua das Flores",
      numero: "123",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567"
    },
    contato: {
      telefone: "(11) 99999-9999",
      email: "contato@barbeariadoroao.com",
      whatsapp: "(11) 99999-9999"
    },
    proprietario: {
      nome: "João Silva",
      cpf: "123.456.789-00",
      email: "joao@barbeariadoroao.com"
    },
    horarioFuncionamento: {
      segunda: { abertura: "08:00", fechamento: "18:00" },
      terca: { abertura: "08:00", fechamento: "18:00" },
      quarta: { abertura: "08:00", fechamento: "18:00" },
      quinta: { abertura: "08:00", fechamento: "18:00" },
      sexta: { abertura: "08:00", fechamento: "18:00" },
      sabado: { abertura: "08:00", fechamento: "16:00" }
    },
    status: "ativa",
    dataCadastro: "2024-01-15T10:00:00Z",
    dataAtualizacao: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    nome: "BarberShop Premium",
    descricao: "Barbearia moderna com serviços premium",
    endereco: {
      rua: "Av. Paulista",
      numero: "1500",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100"
    },
    contato: {
      telefone: "(11) 88888-8888",
      email: "contato@barbershoppremium.com"
    },
    proprietario: {
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      email: "maria@barbershoppremium.com"
    },
    horarioFuncionamento: {
      segunda: { abertura: "09:00", fechamento: "19:00" },
      terca: { abertura: "09:00", fechamento: "19:00" },
      quarta: { abertura: "09:00", fechamento: "19:00" },
      quinta: { abertura: "09:00", fechamento: "19:00" },
      sexta: { abertura: "09:00", fechamento: "19:00" },
      sabado: { abertura: "09:00", fechamento: "17:00" }
    },
    status: "ativa",
    dataCadastro: "2024-01-20T14:30:00Z",
    dataAtualizacao: "2024-01-20T14:30:00Z"
  }
];

// Função para gerar ID único
const gerarId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * GET /api/barbearias
 * Listar todas as barbearias com paginação
 */
export const listarBarbearias: RequestHandler = (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const status = req.query.status as string;
    const cidade = req.query.cidade as string;

    let barbeariasFiltradas = [...barbearias];

    // Filtrar por status se fornecido
    if (status) {
      barbeariasFiltradas = barbeariasFiltradas.filter(b => b.status === status);
    }

    // Filtrar por cidade se fornecido
    if (cidade) {
      barbeariasFiltradas = barbeariasFiltradas.filter(b => 
        b.endereco.cidade.toLowerCase().includes(cidade.toLowerCase())
      );
    }

    const total = barbeariasFiltradas.length;
    const totalPaginas = Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    const barbeariasPaginadas = barbeariasFiltradas.slice(inicio, fim);

    const response: ListarBarbeariasResponse = {
      barbearias: barbeariasPaginadas,
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
export const buscarBarbearia: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const barbearia = barbearias.find(b => b.id === id);

    if (!barbearia) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbearia não encontrada"
      } as ApiResponse);
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
