import { useParams, Link } from 'react-router-dom';
import { useBarbearia } from '@/hooks/use-barbearias';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Scissors, 
  Star, 
  ArrowLeft,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  Award,
  Info
} from 'lucide-react';

export default function BarbeariaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { data: barbearia, isLoading, error, isError } = useBarbearia(id || '', true, true);

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert className="mt-8">
            <AlertDescription>
              ID da barbearia não fornecido.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/barbearias">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Button>
            </Link>
          </div>
          <Alert className="mt-8">
            <AlertDescription>
              {error?.message || 'Erro ao carregar detalhes da barbearia.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!barbearia) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert className="mt-8">
            <AlertDescription>
              Barbearia não encontrada.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativa':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const diasSemana = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/barbearias">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Button>
            </Link>
            <Badge className={getStatusColor(barbearia.status)}>
              {barbearia.status === 'ativa' ? 'Ativa' : 
               barbearia.status === 'inativa' ? 'Inativa' : 'Pendente'}
            </Badge>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {barbearia.nome}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {barbearia.descricao || 'Barbearia profissional'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (124 avaliações)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{barbearia.barbeiros?.length || 0} barbeiros</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Scissors className="h-4 w-4" />
                  <span>{barbearia.servicos?.length || 0} serviços</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Informações de Contato e Localização */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Localização</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">Endereço</div>
                  <div className="text-gray-600">
                    {barbearia.endereco.rua}, {barbearia.endereco.numero}
                  </div>
                  <div className="text-gray-600">
                    {barbearia.endereco.bairro} - {barbearia.endereco.cidade}/{barbearia.endereco.estado}
                  </div>
                  <div className="text-gray-600">
                    CEP: {barbearia.endereco.cep}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const address = `${barbearia.endereco.rua}, ${barbearia.endereco.numero}, ${barbearia.endereco.bairro}, ${barbearia.endereco.cidade}, ${barbearia.endereco.estado}`;
                    window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver no Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">Telefone</div>
                  <div className="text-gray-600">{barbearia.contato.telefone}</div>
                </div>
                <div>
                  <div className="font-medium">E-mail</div>
                  <div className="text-gray-600">{barbearia.contato.email}</div>
                </div>
                {barbearia.contato.whatsapp && (
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-gray-600">{barbearia.contato.whatsapp}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  {barbearia.contato.whatsapp && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        const phone = barbearia.contato.whatsapp?.replace(/\D/g, '');
                        window.open(`https://wa.me/55${phone}`, '_blank');
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Horário de Funcionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horário de Funcionamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(diasSemana).map(([dia, label]) => {
                  const horario = barbearia.horarioFuncionamento[dia as keyof typeof barbearia.horarioFuncionamento];
                  const hoje = new Date().toLocaleLowerCase();
                  const diasSemanaArray = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                  const isToday = diasSemanaArray[new Date().getDay()] === dia;
                  
                  return (
                    <div key={dia} className={`flex justify-between items-center p-2 rounded ${isToday ? 'bg-blue-50 border border-blue-200' : ''}`}>
                      <span className={`font-medium ${isToday ? 'text-blue-700' : ''}`}>
                        {label} {isToday && '(Hoje)'}
                      </span>
                      <span className={isToday ? 'text-blue-700' : 'text-gray-600'}>
                        {horario ? `${horario.abertura} - ${horario.fechamento}` : 'Fechado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Barbeiros */}
          {barbearia.barbeiros && barbearia.barbeiros.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Nossa Equipe</span>
                </CardTitle>
                <CardDescription>
                  Conheça nossos profissionais especializados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {barbearia.barbeiros.map((barbeiro) => (
                    <div key={barbeiro.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{barbeiro.nome}</h4>
                          <Badge variant="outline" className="mt-1">
                            {barbeiro.tipo === 'comissionado' ? 'Comissionado' : 
                             barbeiro.tipo === 'funcionario' ? 'Funcionário' : 'Freelancer'}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {barbeiro.tipo === 'comissionado' && barbeiro.porcentagemComissao && (
                            <div>{barbeiro.porcentagemComissao}% comissão</div>
                          )}
                          {barbeiro.tipo === 'funcionario' && barbeiro.salarioFixo && (
                            <div>{formatCurrency(barbeiro.salarioFixo)}/mês</div>
                          )}
                          {barbeiro.tipo === 'freelancer' && barbeiro.valorHora && (
                            <div>{formatCurrency(barbeiro.valorHora)}/hora</div>
                          )}
                        </div>
                      </div>
                      
                      {barbeiro.especialidades && barbeiro.especialidades.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">Especialidades:</div>
                          <div className="flex flex-wrap gap-1">
                            {barbeiro.especialidades.map((esp, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {esp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Profissional {barbeiro.status}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Serviços */}
          {barbearia.servicos && barbearia.servicos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scissors className="h-5 w-5" />
                  <span>Nossos Serviços</span>
                </CardTitle>
                <CardDescription>
                  Confira todos os serviços disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {barbearia.servicos.map((servico, index) => (
                    <div key={servico.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-semibold">{servico.nome}</h4>
                              {servico.descricao && (
                                <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(servico.duracaoMinutos)}</span>
                                </div>
                                {servico.categoria && (
                                  <Badge variant="outline" className="text-xs">
                                    {servico.categoria}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(servico.preco)}
                          </div>
                          <Button size="sm" className="mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                      {index < barbearia.servicos!.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Proprietário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Informações da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Proprietário</div>
                  <div className="text-gray-600">{barbearia.proprietario.nome}</div>
                </div>
                <div>
                  <div className="font-medium">CPF</div>
                  <div className="text-gray-600">{barbearia.proprietario.cpf}</div>
                </div>
                <div>
                  <div className="font-medium">E-mail do proprietário</div>
                  <div className="text-gray-600">{barbearia.proprietario.email}</div>
                </div>
                <div>
                  <div className="font-medium">Cadastrado em</div>
                  <div className="text-gray-600">
                    {new Date(barbearia.dataCadastro).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Horário
                </Button>
                {barbearia.contato.whatsapp && (
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="lg"
                    onClick={() => {
                      const phone = barbearia.contato.whatsapp?.replace(/\D/g, '');
                      window.open(`https://wa.me/55${phone}`, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                <Button variant="outline" size="lg">
                  <Star className="h-4 w-4 mr-2" />
                  Avaliar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
