/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Interface para dados da barbearia
 */
export interface Barbearia {
  id: string;
  nome: string;
  descricao?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    whatsapp?: string;
  };
  proprietario: {
    nome: string;
    cpf: string;
    email: string;
  };
  horarioFuncionamento: {
    segunda?: { abertura: string; fechamento: string };
    terca?: { abertura: string; fechamento: string };
    quarta?: { abertura: string; fechamento: string };
    quinta?: { abertura: string; fechamento: string };
    sexta?: { abertura: string; fechamento: string };
    sabado?: { abertura: string; fechamento: string };
    domingo?: { abertura: string; fechamento: string };
  };
  status: 'ativa' | 'inativa' | 'pendente';
  dataCadastro: string;
  dataAtualizacao: string;
  // Relações - serão carregadas separadamente
  barbeiros?: Barbeiro[];
  servicos?: Servico[];
}

/**
 * Interface para dados do barbeiro
 */
export interface Barbeiro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  tipo: 'comissionado' | 'funcionario' | 'freelancer';
  porcentagemComissao?: number; // Apenas para comissionados (0-100)
  salarioFixo?: number; // Apenas para funcionários
  valorHora?: number; // Apenas para freelancers
  barbeariaId: string;
  especialidades?: string[]; // Ex: ["corte masculino", "barba", "coloração"]
  horarioTrabalho?: {
    segunda?: { inicio: string; fim: string };
    terca?: { inicio: string; fim: string };
    quarta?: { inicio: string; fim: string };
    quinta?: { inicio: string; fim: string };
    sexta?: { inicio: string; fim: string };
    sabado?: { inicio: string; fim: string };
    domingo?: { inicio: string; fim: string };
  };
  status: 'ativo' | 'inativo' | 'afastado';
  dataCadastro: string;
  dataAtualizacao: string;
}

/**
 * Interface para dados do serviço
 */
export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: string;
  categoria?: string; // Ex: "corte", "barba", "tratamento"
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}

/**
 * Interface para dados do combo de serviços
 */
export interface Combo {
  id: string;
  nome: string;
  descricao?: string;
  barbeariaId: string;
  servicoIds: string[]; // IDs dos serviços incluídos no combo
  servicos?: Servico[]; // Serviços completos (carregados quando necessário)
  valorOriginal: number; // Soma dos preços individuais dos serviços
  valorCombo: number; // Preço do combo (com desconto)
  tipoDesconto: 'valor' | 'percentual'; // Tipo do desconto aplicado
  valorDesconto: number; // Valor do desconto (absoluto ou %)
  duracaoTotalMinutos: number; // Soma das durações dos serviços
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}

/**
 * DTO para criação de nova barbearia
 */
export interface CriarBarbeariaRequest {
  nome: string;
  descricao?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    whatsapp?: string;
  };
  proprietario: {
    nome: string;
    cpf: string;
    email: string;
  };
  horarioFuncionamento?: {
    segunda?: { abertura: string; fechamento: string };
    terca?: { abertura: string; fechamento: string };
    quarta?: { abertura: string; fechamento: string };
    quinta?: { abertura: string; fechamento: string };
    sexta?: { abertura: string; fechamento: string };
    sabado?: { abertura: string; fechamento: string };
    domingo?: { abertura: string; fechamento: string };
  };
}

/**
 * DTO para criação de novo barbeiro
 */
export interface CriarBarbeiroRequest {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  tipo: 'comissionado' | 'funcionario' | 'freelancer';
  porcentagemComissao?: number;
  salarioFixo?: number;
  valorHora?: number;
  barbeariaId: string;
  especialidades?: string[];
  horarioTrabalho?: {
    segunda?: { inicio: string; fim: string };
    terca?: { inicio: string; fim: string };
    quarta?: { inicio: string; fim: string };
    quinta?: { inicio: string; fim: string };
    sexta?: { inicio: string; fim: string };
    sabado?: { inicio: string; fim: string };
    domingo?: { inicio: string; fim: string };
  };
}

/**
 * DTO para criação de novo serviço
 */
export interface CriarServicoRequest {
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: string;
  categoria?: string;
}

/**
 * DTO para atualização de barbearia
 */
export interface AtualizarBarbeariaRequest {
  nome?: string;
  descricao?: string;
  endereco?: Partial<{
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  }>;
  contato?: Partial<{
    telefone: string;
    email: string;
    whatsapp: string;
  }>;
  proprietario?: Partial<{
    nome: string;
    cpf: string;
    email: string;
  }>;
  horarioFuncionamento?: {
    segunda?: { abertura: string; fechamento: string };
    terca?: { abertura: string; fechamento: string };
    quarta?: { abertura: string; fechamento: string };
    quinta?: { abertura: string; fechamento: string };
    sexta?: { abertura: string; fechamento: string };
    sabado?: { abertura: string; fechamento: string };
    domingo?: { abertura: string; fechamento: string };
  };
  status?: 'ativa' | 'inativa' | 'pendente';
}

/**
 * DTO para atualização de barbeiro
 */
export interface AtualizarBarbeiroRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  tipo?: 'comissionado' | 'funcionario' | 'freelancer';
  porcentagemComissao?: number;
  salarioFixo?: number;
  valorHora?: number;
  especialidades?: string[];
  horarioTrabalho?: {
    segunda?: { inicio: string; fim: string };
    terca?: { inicio: string; fim: string };
    quarta?: { inicio: string; fim: string };
    quinta?: { inicio: string; fim: string };
    sexta?: { inicio: string; fim: string };
    sabado?: { inicio: string; fim: string };
    domingo?: { inicio: string; fim: string };
  };
  status?: 'ativo' | 'inativo' | 'afastado';
}

/**
 * DTO para atualização de serviço
 */
export interface AtualizarServicoRequest {
  nome?: string;
  descricao?: string;
  preco?: number;
  duracaoMinutos?: number;
  categoria?: string;
  ativo?: boolean;
}

/**
 * Resposta para listar barbearias
 */
export interface ListarBarbeariasResponse {
  barbearias: Barbearia[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

/**
 * Resposta para listar barbeiros
 */
export interface ListarBarbeirosResponse {
  barbeiros: Barbeiro[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

/**
 * Resposta para listar serviços
 */
export interface ListarServicosResponse {
  servicos: Servico[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

/**
 * Resposta para operações de sucesso
 */
export interface ApiResponse<T = any> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
}

/**
 * Example response type for /api/demo (mantido para compatibilidade)
 */
export interface DemoResponse {
  message: string;
}
