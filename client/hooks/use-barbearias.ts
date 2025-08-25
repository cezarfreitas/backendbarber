import { useQuery } from '@tanstack/react-query';
import { Barbearia } from '@shared/api';

interface ListarBarbeariasResponse {
  barbearias: Barbearia[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

interface ListarBarbeariasParams {
  pagina?: number;
  limite?: number;
  status?: string;
  cidade?: string;
  incluirBarbeiros?: boolean;
  incluirServicos?: boolean;
}

interface BuscarBarbeariaResponse {
  sucesso: boolean;
  dados: Barbearia;
}

/**
 * Hook para listar barbearias com filtros e paginação
 */
export function useBarbearias(params: ListarBarbeariasParams = {}) {
  const { 
    pagina = 1, 
    limite = 10, 
    status = 'ativa',
    cidade,
    incluirBarbeiros = false,
    incluirServicos = false 
  } = params;

  return useQuery({
    queryKey: ['barbearias', { pagina, limite, status, cidade, incluirBarbeiros, incluirServicos }],
    queryFn: async (): Promise<ListarBarbeariasResponse> => {
      const searchParams = new URLSearchParams({
        pagina: pagina.toString(),
        limite: limite.toString(),
        status,
        ...(cidade && { cidade }),
        incluirBarbeiros: incluirBarbeiros.toString(),
        incluirServicos: incluirServicos.toString(),
      });

      const response = await fetch(`/api/barbearias?${searchParams}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar barbearias');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar uma barbearia específica por ID
 */
export function useBarbearia(id: string, incluirBarbeiros: boolean = true, incluirServicos: boolean = true) {
  return useQuery({
    queryKey: ['barbearia', id, { incluirBarbeiros, incluirServicos }],
    queryFn: async (): Promise<Barbearia> => {
      const searchParams = new URLSearchParams({
        incluirBarbeiros: incluirBarbeiros.toString(),
        incluirServicos: incluirServicos.toString(),
      });

      const response = await fetch(`/api/barbearias/${id}?${searchParams}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Barbearia não encontrada');
        }
        throw new Error('Erro ao buscar barbearia');
      }
      
      const data: BuscarBarbeariaResponse = await response.json();
      return data.dados;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar cidades disponíveis (para filtro)
 */
export function useCidadesBarbearias() {
  return useQuery({
    queryKey: ['cidades-barbearias'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch('/api/barbearias?limite=100');
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades');
      }
      
      const data: ListarBarbeariasResponse = await response.json();
      const cidades = [...new Set(data.barbearias.map(b => b.endereco.cidade))];
      return cidades.sort();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
  });
}
