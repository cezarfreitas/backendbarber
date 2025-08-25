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
  servicos?: string[];
  status: 'ativa' | 'inativa' | 'pendente';
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
  servicos?: string[];
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
  servicos?: string[];
  status?: 'ativa' | 'inativa' | 'pendente';
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
