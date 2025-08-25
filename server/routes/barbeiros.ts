import { RequestHandler } from "express";
import { 
  Barbeiro, 
  CriarBarbeiroRequest, 
  AtualizarBarbeiroRequest,
  ListarBarbeirosResponse,
  ApiResponse 
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
      sabado: { inicio: "08:00", fim: "16:00" }
    },
    status: "ativo",
    dataCadastro: "2024-01-16T09:00:00Z",
    dataAtualizacao: "2024-01-16T09:00:00Z"
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
      sabado: { inicio: "09:00", fim: "17:00" }
    },
    status: "ativo",
    dataCadastro: "2024-01-18T10:30:00Z",
    dataAtualizacao: "2024-01-18T10:30:00Z"
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
    especialidades: ["Corte premium", "Barba premium", "Design de sobrancelhas"],
    horarioTrabalho: {
      segunda: { inicio: "10:00", fim: "16:00" },
      quarta: { inicio: "10:00", fim: "16:00" },
      sexta: { inicio: "10:00", fim: "16:00" }
    },
    status: "ativo",
    dataCadastro: "2024-01-20T15:00:00Z",
    dataAtualizacao: "2024-01-20T15:00:00Z"
  }
];

// Função para gerar ID único
const gerarId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * GET /api/barbeiros
 * Listar todos os barbeiros com paginação
 */
export const listarBarbeiros: RequestHandler = (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;
    const barbeariaId = req.query.barbeariaId as string;
    const status = req.query.status as string;
    const tipo = req.query.tipo as string;

    let barbeirosFiltrados = [...barbeiros];

    // Filtrar por barbearia se fornecido
    if (barbeariaId) {
      barbeirosFiltrados = barbeirosFiltrados.filter(b => b.barbeariaId === barbeariaId);
    }

    // Filtrar por status se fornecido
    if (status) {
      barbeirosFiltrados = barbeirosFiltrados.filter(b => b.status === status);
    }

    // Filtrar por tipo se fornecido
    if (tipo) {
      barbeirosFiltrados = barbeirosFiltrados.filter(b => b.tipo === tipo);
    }

    const total = barbeirosFiltrados.length;
    const totalPaginas = Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    const barbeirosPaginados = barbeirosFiltrados.slice(inicio, fim);

    const response: ListarBarbeirosResponse = {
      barbeiros: barbeirosPaginados,
      total,
      pagina,
      totalPaginas
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao listar barbeiros:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * GET /api/barbeiros/:id
 * Buscar barbeiro por ID
 */
export const buscarBarbeiro: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const barbeiro = barbeiros.find(b => b.id === id);

    if (!barbeiro) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbeiro não encontrado"
      } as ApiResponse);
    }

    res.json({
      sucesso: true,
      dados: barbeiro
    } as ApiResponse<Barbeiro>);
  } catch (error) {
    console.error("Erro ao buscar barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
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
    if (!dadosBarbeiro.nome || !dadosBarbeiro.email || !dadosBarbeiro.telefone || !dadosBarbeiro.cpf || !dadosBarbeiro.tipo || !dadosBarbeiro.barbeariaId) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados obrigatórios não fornecidos: nome, email, telefone, CPF, tipo e barbeariaId são obrigatórios"
      } as ApiResponse);
    }

    // Verificar se já existe barbeiro com mesmo email ou CPF
    const emailExistente = barbeiros.find(b => b.email === dadosBarbeiro.email);
    if (emailExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe um barbeiro cadastrado com este email"
      } as ApiResponse);
    }

    const cpfExistente = barbeiros.find(b => b.cpf === dadosBarbeiro.cpf);
    if (cpfExistente) {
      return res.status(400).json({
        sucesso: false,
        erro: "Já existe um barbeiro cadastrado com este CPF"
      } as ApiResponse);
    }

    // Validações específicas por tipo
    if (dadosBarbeiro.tipo === 'comissionado' && !dadosBarbeiro.porcentagemComissao) {
      return res.status(400).json({
        sucesso: false,
        erro: "Porcentagem de comissão é obrigatória para barbeiros comissionados"
      } as ApiResponse);
    }

    if (dadosBarbeiro.tipo === 'funcionario' && !dadosBarbeiro.salarioFixo) {
      return res.status(400).json({
        sucesso: false,
        erro: "Salário fixo é obrigatório para funcionários"
      } as ApiResponse);
    }

    if (dadosBarbeiro.tipo === 'freelancer' && !dadosBarbeiro.valorHora) {
      return res.status(400).json({
        sucesso: false,
        erro: "Valor por hora é obrigatório para freelancers"
      } as ApiResponse);
    }

    const agora = new Date().toISOString();
    const novoBarbeiro: Barbeiro = {
      id: gerarId(),
      ...dadosBarbeiro,
      status: "ativo",
      dataCadastro: agora,
      dataAtualizacao: agora,
      especialidades: dadosBarbeiro.especialidades || [],
      horarioTrabalho: dadosBarbeiro.horarioTrabalho || {}
    };

    barbeiros.push(novoBarbeiro);

    res.status(201).json({
      sucesso: true,
      dados: novoBarbeiro,
      mensagem: "Barbeiro cadastrado com sucesso"
    } as ApiResponse<Barbeiro>);
  } catch (error) {
    console.error("Erro ao criar barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
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

    const indice = barbeiros.findIndex(b => b.id === id);
    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbeiro não encontrado"
      } as ApiResponse);
    }

    const barbeiroExistente = barbeiros[indice];

    // Verificar se email está sendo alterado e se já existe
    if (dadosAtualizacao.email && dadosAtualizacao.email !== barbeiroExistente.email) {
      const emailExistente = barbeiros.find(b => b.email === dadosAtualizacao.email && b.id !== id);
      if (emailExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um barbeiro cadastrado com este email"
        } as ApiResponse);
      }
    }

    // Verificar se CPF está sendo alterado e se já existe
    if (dadosAtualizacao.cpf && dadosAtualizacao.cpf !== barbeiroExistente.cpf) {
      const cpfExistente = barbeiros.find(b => b.cpf === dadosAtualizacao.cpf && b.id !== id);
      if (cpfExistente) {
        return res.status(400).json({
          sucesso: false,
          erro: "Já existe um barbeiro cadastrado com este CPF"
        } as ApiResponse);
      }
    }

    // Atualizar dados
    const barbeiroAtualizado: Barbeiro = {
      ...barbeiroExistente,
      ...dadosAtualizacao,
      dataAtualizacao: new Date().toISOString()
    };

    barbeiros[indice] = barbeiroAtualizado;

    res.json({
      sucesso: true,
      dados: barbeiroAtualizado,
      mensagem: "Barbeiro atualizado com sucesso"
    } as ApiResponse<Barbeiro>);
  } catch (error) {
    console.error("Erro ao atualizar barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * DELETE /api/barbeiros/:id
 * Excluir barbeiro
 */
export const excluirBarbeiro: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const indice = barbeiros.findIndex(b => b.id === id);

    if (indice === -1) {
      return res.status(404).json({
        sucesso: false,
        erro: "Barbeiro não encontrado"
      } as ApiResponse);
    }

    barbeiros.splice(indice, 1);

    res.json({
      sucesso: true,
      mensagem: "Barbeiro excluído com sucesso"
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao excluir barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};
