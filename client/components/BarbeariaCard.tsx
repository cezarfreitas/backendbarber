import { Barbearia } from '@shared/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Users, Scissors, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BarbeariaCardProps {
  barbearia: Barbearia;
  showFullAddress?: boolean;
}

export function BarbeariaCard({ barbearia, showFullAddress = false }: BarbeariaCardProps) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'inativa':
        return 'Inativa';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatHorario = (horarioFuncionamento: Barbearia['horarioFuncionamento']) => {
    const hoje = new Date().toLocaleLowerCase();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaHoje = diasSemana[new Date().getDay()] as keyof typeof horarioFuncionamento;
    
    const horarioHoje = horarioFuncionamento[diaHoje];
    if (horarioHoje) {
      return `Hoje: ${horarioHoje.abertura} - ${horarioHoje.fechamento}`;
    }
    
    // Se não tem horário hoje, mostra o primeiro disponível
    for (const dia of Object.keys(horarioFuncionamento)) {
      const horario = horarioFuncionamento[dia as keyof typeof horarioFuncionamento];
      if (horario) {
        return `${dia}: ${horario.abertura} - ${horario.fechamento}`;
      }
    }
    
    return 'Horário não informado';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-gray-900 mb-1">
              {barbearia.nome}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {barbearia.descricao || 'Barbearia profissional'}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getStatusColor(barbearia.status)}`}>
            {getStatusLabel(barbearia.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Localização */}
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            {showFullAddress ? (
              <div>
                <div>{barbearia.endereco.rua}, {barbearia.endereco.numero}</div>
                <div>{barbearia.endereco.bairro} - {barbearia.endereco.cidade}/{barbearia.endereco.estado}</div>
                <div>CEP: {barbearia.endereco.cep}</div>
              </div>
            ) : (
              <span>
                {barbearia.endereco.bairro}, {barbearia.endereco.cidade}/{barbearia.endereco.estado}
              </span>
            )}
          </div>
        </div>

        {/* Contato */}
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {barbearia.contato.telefone}
          </span>
        </div>

        {/* Horário */}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {formatHorario(barbearia.horarioFuncionamento)}
          </span>
        </div>

        {/* Informações adicionais se disponíveis */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-3 text-xs text-gray-500">
            {barbearia.barbeiros && barbearia.barbeiros.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{barbearia.barbeiros.length} barbeiros</span>
              </div>
            )}
            {barbearia.servicos && barbearia.servicos.length > 0 && (
              <div className="flex items-center space-x-1">
                <Scissors className="h-3 w-3" />
                <span>{barbearia.servicos.length} serviços</span>
              </div>
            )}
          </div>
          
          {/* Avaliação mock - pode ser implementada depois */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-3">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/barbearia/${barbearia.id}`}>
              Ver Detalhes
            </Link>
          </Button>
          {barbearia.contato.whatsapp && (
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => {
                const phone = barbearia.contato.whatsapp?.replace(/\D/g, '');
                window.open(`https://wa.me/55${phone}`, '_blank');
              }}
            >
              WhatsApp
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
