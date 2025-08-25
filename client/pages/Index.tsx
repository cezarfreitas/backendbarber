import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Search,
  MapPin,
  Users,
  Scissors,
  Clock,
  Star,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Busca Avançada",
      description: "Encontre barbearias por localização, serviços e avaliações"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Localização Precisa",
      description: "Veja barbearias próximas a você com mapas integrados"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Equipe Qualificada",
      description: "Conheça os profissionais e suas especialidades"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Agendamento Fácil",
      description: "Agende seus horários diretamente pelo WhatsApp"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">BarberFind</h1>
            </div>
            <Link to="/barbearias">
              <Button>
                Explorar Barbearias
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Encontre a <span className="text-blue-600">Barbearia Perfeita</span> para Você
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Conectamos você com as melhores barbearias da sua região.
            Descubra profissionais qualificados, serviços especializados e agende seus horários facilmente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/barbearias">
              <Button size="lg" className="text-lg px-8 py-6">
                <Search className="h-5 w-5 mr-2" />
                Buscar Barbearias
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Store className="h-5 w-5 mr-2" />
              Cadastrar Minha Barbearia
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">Barbearias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">200+</div>
              <div className="text-gray-600">Profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10+</div>
              <div className="text-gray-600">Cidades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.8★</div>
              <div className="text-gray-600">Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o BarberFind?
            </h3>
            <p className="text-gray-600 text-lg">
              Facilitamos sua busca pela barbearia ideal com recursos pensados para você
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Como funciona?
            </h3>
            <p className="text-gray-600 text-lg">
              Em poucos passos você encontra e agenda na barbearia ideal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Busque</h4>
              <p className="text-gray-600">
                Use nossos filtros para encontrar barbearias próximas a você
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Compare</h4>
              <p className="text-gray-600">
                Veja detalhes, serviços, preços e avaliações de cada barbearia
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Agende</h4>
              <p className="text-gray-600">
                Entre em contato via WhatsApp e agende seu horário facilmente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para encontrar sua próxima barbearia?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Explore nosso diretório e descubra os melhores profissionais da sua região
          </p>
          <Link to="/barbearias">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Store className="h-5 w-5 mr-2" />
              Explorar Barbearias Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="h-6 w-6" />
            <span className="text-xl font-bold">BarberFind</span>
          </div>
          <p className="text-gray-400">
            Conectando você com as melhores barbearias desde 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
