import { useState } from 'react';
import { useBarbearias, useCidadesBarbearias } from '@/hooks/use-barbearias';
import { BarbeariaCard } from '@/components/BarbeariaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, MapPin, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Barbearias() {
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 12,
    status: 'ativa',
    cidade: '',
    busca: '',
  });

  const { data, isLoading, error, isError } = useBarbearias({
    pagina: filtros.pagina,
    limite: filtros.limite,
    status: filtros.status,
    cidade: filtros.cidade,
    incluirBarbeiros: true,
    incluirServicos: true,
  });

  const { data: cidades } = useCidadesBarbearias();

  // Filtro local por nome/descrição
  const barbearias = data?.barbearias.filter(barbearia => {
    if (!filtros.busca) return true;
    const busca = filtros.busca.toLowerCase();
    return (
      barbearia.nome.toLowerCase().includes(busca) ||
      barbearia.descricao?.toLowerCase().includes(busca) ||
      barbearia.endereco.bairro.toLowerCase().includes(busca)
    );
  }) || [];

  const handleFiltroChange = (key: string, value: string | number) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'pagina' && { pagina: 1 }) // Reset página quando muda filtro
    }));
  };

  const StatusBadge = ({ count, label }: { count: number; label: string }) => (
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">{count}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Alert className="max-w-md mx-auto mt-8">
            <AlertDescription>
              {error?.message || 'Erro ao carregar barbearias. Tente novamente.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Diretório de Barbearias</h1>
                <p className="text-gray-600">Encontre a barbearia perfeita para você</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Estatísticas */}
        {data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusBadge count={data.total} label="Total de Barbearias" />
                <StatusBadge count={barbearias.length} label="Resultados Filtrados" />
                <StatusBadge count={cidades?.length || 0} label="Cidades Atendidas" />
                <StatusBadge count={data.totalPaginas} label="Páginas" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar a barbearia ideal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca por nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nome</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome da barbearia..."
                    value={filtros.busca}
                    onChange={(e) => handleFiltroChange('busca', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por cidade */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Select
                  value={filtros.cidade}
                  onValueChange={(value) => handleFiltroChange('cidade', value)}
                >
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cidades?.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filtros.status}
                  onValueChange={(value) => handleFiltroChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativas</SelectItem>
                    <SelectItem value="inativa">Inativas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resultados por página */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados por página</label>
                <Select
                  value={filtros.limite.toString()}
                  onValueChange={(value) => handleFiltroChange('limite', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 por página</SelectItem>
                    <SelectItem value="12">12 por página</SelectItem>
                    <SelectItem value="24">24 por página</SelectItem>
                    <SelectItem value="48">48 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Barbearias */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: filtros.limite }, (_, i) => (
              <Card key={i} className="h-80">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : barbearias.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma barbearia encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros para encontrar mais resultados.
              </p>
              <Button 
                onClick={() => setFiltros({ pagina: 1, limite: 12, status: 'ativa', cidade: '', busca: '' })}
                variant="outline"
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {barbearias.map((barbearia) => (
              <BarbeariaCard
                key={barbearia.id}
                barbearia={barbearia}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {data && data.totalPaginas > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange('pagina', filtros.pagina - 1)}
              disabled={filtros.pagina <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, data.totalPaginas) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={filtros.pagina === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFiltroChange('pagina', pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltroChange('pagina', filtros.pagina + 1)}
              disabled={filtros.pagina >= data.totalPaginas}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
