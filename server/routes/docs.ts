import { RequestHandler } from "express";

/**
 * GET /api/docs
 * Retorna a documentação HTML da API
 */
export const mostrarDocumentacao: RequestHandler = (_req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Barbearia SaaS - Documentação</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #2c3e50, #34495e); 
            color: white; 
            padding: 40px 0; 
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .section { 
            background: white; 
            margin-bottom: 20px; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 { 
            color: #2c3e50; 
            margin-bottom: 20px; 
            padding-bottom: 10px; 
            border-bottom: 2px solid #ecf0f1;
        }
        .endpoint { 
            margin-bottom: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 6px; 
            border-left: 4px solid #3498db;
        }
        .method { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 4px; 
            font-weight: bold; 
            font-size: 0.8rem; 
            margin-right: 10px;
        }
        .get { background: #27ae60; color: white; }
        .post { background: #f39c12; color: white; }
        .put { background: #3498db; color: white; }
        .delete { background: #e74c3c; color: white; }
        .url { font-family: 'Courier New', monospace; font-weight: bold; }
        .params, .response { margin-top: 15px; }
        .params h4, .response h4 { margin-bottom: 10px; color: #2c3e50; }
        pre { 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 15px; 
            border-radius: 4px; 
            overflow-x: auto; 
            font-family: 'Courier New', monospace;
        }
        .example { margin-top: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        .table th { background: #f8f9fa; font-weight: bold; }
        .table code { 
            background: #f8f9fa; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace;
        }
        .toc { 
            background: #ecf0f1; 
            padding: 20px; 
            border-radius: 6px; 
            margin-bottom: 20px;
        }
        .toc h3 { margin-bottom: 15px; color: #2c3e50; }
        .toc ul { list-style: none; }
        .toc li { margin-bottom: 8px; }
        .toc a { color: #3498db; text-decoration: none; }
        .toc a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🪒 API Barbearia SaaS</h1>
            <p>Documentação completa da API para sistema de gestão de barbearias</p>
        </div>
    </div>

    <div class="container">
        <div class="section">
            <div class="toc">
                <h3>📋 Índice</h3>
                <ul>
                    <li><a href="#visao-geral">Visão Geral</a></li>
                    <li><a href="#autenticacao">Autenticação</a></li>
                    <li><a href="#endpoints-barbearias">Endpoints - Barbearias</a></li>
                    <li><a href="#endpoints-barbeiros">Endpoints - Barbeiros</a></li>
                    <li><a href="#endpoints-servicos">Endpoints - Serviços</a></li>
                    <li><a href="#modelos">Modelos de Dados</a></li>
                    <li><a href="#codigos-resposta">Códigos de Resposta</a></li>
                    <li><a href="#exemplos">Exemplos de Uso</a></li>
                </ul>
            </div>
        </div>

        <div class="section" id="visao-geral">
            <h2>🌟 Visão Geral</h2>
            <p>A API Barbearia SaaS permite o gerenciamento completo de barbearias, incluindo cadastro, consulta, atualização e exclusão. Todas as respostas são retornadas em formato JSON.</p>
            
            <h3>Base URL</h3>
            <pre>https://seu-dominio.com/api</pre>
            
            <h3>Formato das Respostas</h3>
            <p>Todas as respostas seguem o padrão:</p>
            <pre>{
  "sucesso": boolean,
  "dados": object | array,
  "mensagem": string,
  "erro": string
}</pre>
        </div>

        <div class="section" id="autenticacao">
            <h2>🔐 Autenticação</h2>
            <p>Atualmente a API não requer autenticação. Em produção, implemente autenticação JWT ou API Keys.</p>
        </div>

        <div class="section" id="endpoints-barbearias">
            <h2>🏪 Endpoints - Barbearias</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/barbearias</span>
                <h4>Listar barbearias</h4>
                <p>Retorna lista paginada de barbearias com filtros opcionais.</p>
                
                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padr��o: 1)</td></tr>
                        <tr><td><code>limite</code></td><td>number</td><td>Não</td><td>Itens por página (padrão: 10)</td></tr>
                        <tr><td><code>status</code></td><td>string</td><td>Não</td><td>Filtrar por status: ativa, inativa, pendente</td></tr>
                        <tr><td><code>cidade</code></td><td>string</td><td>Não</td><td>Filtrar por cidade</td></tr>
                        <tr><td><code>incluirBarbeiros</code></td><td>boolean</td><td>Não</td><td>Incluir lista de barbeiros (padrão: false)</td></tr>
                        <tr><td><code>incluirServicos</code></td><td>boolean</td><td>Não</td><td>Incluir lista de serviços (padrão: false)</td></tr>
                    </table>
                </div>

                <div class="response">
                    <h4>Resposta</h4>
                    <pre>{
  "barbearias": [/* array de barbearias */],
  "total": 15,
  "pagina": 1,
  "totalPaginas": 2
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/barbearias/{id}</span>
                <h4>Buscar barbearia por ID</h4>
                <p>Retorna dados detalhados de uma barbearia específica, incluindo barbeiros e serviços por padrão.</p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>incluirBarbeiros</code></td><td>boolean</td><td>Não</td><td>Incluir barbeiros (padrão: true)</td></tr>
                        <tr><td><code>incluirServicos</code></td><td>boolean</td><td>Não</td><td>Incluir serviços (padrão: true)</td></tr>
                    </table>
                </div>

                <div class="response">
                    <h4>Resposta</h4>
                    <pre>{
  "sucesso": true,
  "dados": {
    "id": "1",
    "nome": "Barbearia do João",
    "endereco": {...},
    "barbeiros": [...],
    "servicos": [...]
  }
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/barbearias</span>
                <h4>Criar nova barbearia</h4>
                <p>Cadastra uma nova barbearia no sistema.</p>
                
                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "nome": "Nome da Barbearia",
  "descricao": "Descrição opcional",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "contato": {
    "telefone": "(11) 99999-9999",
    "email": "contato@barbearia.com",
    "whatsapp": "(11) 99999-9999"
  },
  "proprietario": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@barbearia.com"
  },
  "horarioFuncionamento": {
    "segunda": { "abertura": "08:00", "fechamento": "18:00" },
    "terca": { "abertura": "08:00", "fechamento": "18:00" }
  },
  "servicos": ["Corte", "Barba", "Bigode"]
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method put">PUT</span>
                <span class="url">/api/barbearias/{id}</span>
                <h4>Atualizar barbearia</h4>
                <p>Atualiza dados de uma barbearia existente. Apenas os campos enviados serão atualizados.</p>
            </div>

            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <span class="url">/api/barbearias/{id}</span>
                <h4>Excluir barbearia</h4>
                <p>Remove permanentemente uma barbearia do sistema.</p>

                <div class="response">
                    <h4>Resposta</h4>
                    <pre>{
  "sucesso": true,
  "mensagem": "Barbearia excluída com sucesso"
}</pre>
                </div>
            </div>
        </div>

        <div class="section" id="endpoints-barbeiros">
            <h2>💇‍♂️ Endpoints - Barbeiros</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/barbeiros</span>
                <h4>Listar barbeiros</h4>
                <p>Retorna lista paginada de barbeiros com filtros opcionais.</p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padrão: 1)</td></tr>
                        <tr><td><code>limite</code></td><td>number</td><td>Não</td><td>Itens por página (padrão: 10)</td></tr>
                        <tr><td><code>barbeariaId</code></td><td>string</td><td>Não</td><td>Filtrar por barbearia específica</td></tr>
                        <tr><td><code>status</code></td><td>string</td><td>Não</td><td>Filtrar por status: ativo, inativo, afastado</td></tr>
                        <tr><td><code>tipo</code></td><td>string</td><td>Não</td><td>Filtrar por tipo: comissionado, funcionario, freelancer</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/barbeiros/{id}</span>
                <h4>Buscar barbeiro por ID</h4>
                <p>Retorna dados detalhados de um barbeiro específico.</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/barbeiros</span>
                <h4>Criar novo barbeiro</h4>
                <p>Cadastra um novo barbeiro no sistema.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "nome": "Carlos Silva",
  "email": "carlos@barbearia.com",
  "telefone": "(11) 99999-9999",
  "cpf": "111.222.333-44",
  "tipo": "comissionado",
  "porcentagemComissao": 40,
  "barbeariaId": "1",
  "especialidades": ["Corte masculino", "Barba"],
  "horarioTrabalho": {
    "segunda": { "inicio": "08:00", "fim": "18:00" },
    "terca": { "inicio": "08:00", "fim": "18:00" }
  }
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method put">PUT</span>
                <span class="url">/api/barbeiros/{id}</span>
                <h4>Atualizar barbeiro</h4>
                <p>Atualiza dados de um barbeiro existente.</p>
            </div>

            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <span class="url">/api/barbeiros/{id}</span>
                <h4>Excluir barbeiro</h4>
                <p>Remove permanentemente um barbeiro do sistema.</p>
            </div>
        </div>

        <div class="section" id="endpoints-servicos">
            <h2>✂️ Endpoints - Serviços</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/servicos</span>
                <h4>Listar serviços</h4>
                <p>Retorna lista paginada de serviços com filtros opcionais.</p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padrão: 1)</td></tr>
                        <tr><td><code>limite</code></td><td>number</td><td>Não</td><td>Itens por página (padrão: 10)</td></tr>
                        <tr><td><code>barbeariaId</code></td><td>string</td><td>Não</td><td>Filtrar por barbearia específica</td></tr>
                        <tr><td><code>categoria</code></td><td>string</td><td>Não</td><td>Filtrar por categoria (corte, barba, tratamento, etc.)</td></tr>
                        <tr><td><code>ativo</code></td><td>boolean</td><td>Não</td><td>Filtrar por status ativo/inativo</td></tr>
                        <tr><td><code>precoMin</code></td><td>number</td><td>Não</td><td>Preço mínimo</td></tr>
                        <tr><td><code>precoMax</code></td><td>number</td><td>Não</td><td>Preço máximo</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/servicos/{id}</span>
                <h4>Buscar serviço por ID</h4>
                <p>Retorna dados detalhados de um serviço específico.</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/servicos</span>
                <h4>Criar novo serviço</h4>
                <p>Cadastra um novo serviço no sistema.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "nome": "Corte Masculino",
  "descricao": "Corte tradicional masculino",
  "preco": 35.00,
  "duracaoMinutos": 45,
  "barbeariaId": "1",
  "categoria": "corte"
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method put">PUT</span>
                <span class="url">/api/servicos/{id}</span>
                <h4>Atualizar serviço</h4>
                <p>Atualiza dados de um serviço existente.</p>
            </div>

            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <span class="url">/api/servicos/{id}</span>
                <h4>Excluir serviço</h4>
                <p>Remove permanentemente um serviço do sistema.</p>
            </div>
        </div>

        <div class="section" id="modelo-barbearia">
            <h2>🏪 Modelo de Barbearia</h2>
            <p>Estrutura completa do objeto barbearia:</p>
            <pre>{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "endereco": {
    "rua": "string",
    "numero": "string", 
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string"
  },
  "contato": {
    "telefone": "string",
    "email": "string",
    "whatsapp": "string"
  },
  "proprietario": {
    "nome": "string",
    "cpf": "string",
    "email": "string"
  },
  "horarioFuncionamento": {
    "segunda": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "terca": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "quarta": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "quinta": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "sexta": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "sabado": { "abertura": "HH:mm", "fechamento": "HH:mm" },
    "domingo": { "abertura": "HH:mm", "fechamento": "HH:mm" }
  },
  "servicos": ["string"],
  "status": "ativa" | "inativa" | "pendente",
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601"
}</pre>
        </div>

        <div class="section" id="codigos-resposta">
            <h2>📊 Códigos de Resposta HTTP</h2>
            <table class="table">
                <tr><th>Código</th><th>Descrição</th></tr>
                <tr><td>200</td><td>Sucesso</td></tr>
                <tr><td>201</td><td>Criado com sucesso</td></tr>
                <tr><td>400</td><td>Dados inválidos</td></tr>
                <tr><td>404</td><td>Recurso não encontrado</td></tr>
                <tr><td>500</td><td>Erro interno do servidor</td></tr>
            </table>
        </div>

        <div class="section" id="exemplos">
            <h2>💡 Exemplos de Uso</h2>
            
            <h3>Listar barbearias ativas em São Paulo</h3>
            <pre>GET /api/barbearias?status=ativa&cidade=São Paulo&limite=5</pre>
            
            <h3>Criar nova barbearia</h3>
            <pre>POST /api/barbearias
Content-Type: application/json

{
  "nome": "Barbearia Exemplo",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro", 
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "contato": {
    "telefone": "(11) 99999-9999",
    "email": "contato@exemplo.com"
  },
  "proprietario": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@exemplo.com"
  }
}</pre>

            <h3>Atualizar status da barbearia</h3>
            <pre>PUT /api/barbearias/123
Content-Type: application/json

{
  "status": "ativa"
}</pre>
        </div>

        <div class="section">
            <h2>🔧 Suporte</h2>
            <p>Para suporte técnico ou dúvidas sobre a API, entre em contato:</p>
            <ul>
                <li>📧 Email: suporte@barbeariasaas.com</li>
                <li>📱 WhatsApp: (11) 99999-9999</li>
                <li>🌐 Website: www.barbeariasaas.com</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};
