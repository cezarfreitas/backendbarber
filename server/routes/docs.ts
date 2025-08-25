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
            overflow-x: hidden;
        }

        /* Layout Principal */
        .layout { display: flex; min-height: 100vh; }

        /* Sidebar */
        .sidebar {
            width: 280px;
            background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
            color: white;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            transform: translateX(-280px);
            transition: transform 0.3s ease;
        }
        .sidebar.active { transform: translateX(0); }

        /* Toggle Button */
        .sidebar-toggle {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: #2c3e50;
            color: white;
            border: none;
            padding: 12px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .sidebar-toggle:hover { background: #34495e; }
        .sidebar-toggle.active { left: 300px; }

        /* Sidebar Content */
        .sidebar-header {
            padding: 30px 20px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-header h1 { font-size: 1.5rem; margin-bottom: 5px; }
        .sidebar-header p { opacity: 0.8; font-size: 0.9rem; }

        .sidebar-nav { padding: 20px 0; }
        .nav-section { margin-bottom: 25px; }
        .nav-section h3 {
            color: #ecf0f1;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            padding: 0 20px;
        }

        /* Tree Structure */
        .nav-tree { margin-bottom: 15px; }
        .nav-tree-item {
            display: block;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            padding: 8px 20px;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
            cursor: pointer;
            position: relative;
        }
        .nav-tree-item:hover {
            color: white;
            background: rgba(255,255,255,0.1);
            border-left-color: #3498db;
        }
        .nav-tree-item.active {
            color: white;
            background: rgba(52, 152, 219, 0.2);
            border-left-color: #3498db;
        }
        .nav-tree-item.expandable::after {
            content: "▶";
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            transition: transform 0.2s ease;
            font-size: 0.8rem;
        }
        .nav-tree-item.expandable.expanded::after {
            transform: translateY(-50%) rotate(90deg);
        }

        /* Sub-items */
        .nav-sub-items {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background: rgba(0,0,0,0.2);
        }
        .nav-sub-items.expanded {
            max-height: 500px;
        }
        .nav-sub-item {
            display: block;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            padding: 6px 20px 6px 40px;
            transition: all 0.2s ease;
            font-size: 0.9rem;
            border-left: 3px solid transparent;
        }
        .nav-sub-item:hover {
            color: white;
            background: rgba(255,255,255,0.1);
            border-left-color: #3498db;
        }
        .nav-sub-item.active {
            color: white;
            background: rgba(52, 152, 219, 0.2);
            border-left-color: #3498db;
        }

        /* Simple nav items (non-expandable) */
        .nav-item {
            display: block;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            padding: 8px 20px;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
        }
        .nav-item:hover {
            color: white;
            background: rgba(255,255,255,0.1);
            border-left-color: #3498db;
        }
        .nav-item.active {
            color: white;
            background: rgba(52, 152, 219, 0.2);
            border-left-color: #3498db;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 0;
            transition: margin-left 0.3s ease;
            padding-top: 80px;
        }
        .main-content.shifted { margin-left: 280px; }

        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }

        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 0;
            text-align: center;
            margin-bottom: 40px;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 15px; }
        .hero p { font-size: 1.3rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }

        .section {
            background: white;
            margin-bottom: 30px;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
        }
        .section h2 {
            color: #2c3e50;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
            font-size: 1.8rem;
        }
        .section h3 {
            color: #34495e;
            margin: 30px 0 15px 0;
            font-size: 1.3rem;
        }

        /* Endpoints */
        .endpoint {
            margin-bottom: 35px;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            border-left: 5px solid #3498db;
            transition: transform 0.2s ease;
        }
        .endpoint:hover { transform: translateY(-2px); }

        .method {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.8rem;
            margin-right: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .get { background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; }
        .post { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; }
        .put { background: linear-gradient(135deg, #3498db, #2980b9); color: white; }
        .delete { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; }

        .url {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1rem;
        }

        .params, .response { margin-top: 20px; }
        .params h4, .response h4 {
            margin-bottom: 15px;
            color: #2c3e50;
            font-size: 1.1rem;
        }

        pre {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            border: 1px solid #34495e;
            margin: 10px 0;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .table th, .table td {
            border: 1px solid #dee2e6;
            padding: 15px;
            text-align: left;
        }
        .table th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
        }
        .table tr:nth-child(even) { background: #f8f9fa; }
        .table code {
            background: #e9ecef;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #495057;
        }

        /* Status badges */
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-success { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        .status-danger { background: #f8d7da; color: #721c24; }
        .status-info { background: #d1ecf1; color: #0c5460; }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar { width: 100%; transform: translateX(-100%); }
            .sidebar-toggle.active { left: 20px; }
            .main-content.shifted { margin-left: 0; }
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1.1rem; }
            .container { padding: 15px; }
        }

        /* Smooth scrolling */
        html { scroll-behavior: smooth; }

        /* Custom scrollbar for sidebar */
        .sidebar::-webkit-scrollbar { width: 6px; }
        .sidebar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); }
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <!-- Sidebar Toggle -->
    <button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>

    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h1>🪒 API Docs</h1>
            <p>Barbearia SaaS</p>
        </div>

        <div class="sidebar-nav">
            <div class="nav-section">
                <h3>Começar</h3>
                <a href="#visao-geral" class="nav-item">Visão Geral</a>
                <a href="#autenticacao" class="nav-item">Autenticação</a>
                <a href="#banco-dados" class="nav-item">Banco de Dados</a>
            </div>

            <div class="nav-section">
                <h3>Endpoints</h3>

                <!-- Barbearias -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="barbearias-tree">
                        🏪 Barbearias
                    </div>
                    <div class="nav-sub-items" id="barbearias-tree">
                        <a href="#endpoints-barbearias" class="nav-sub-item">📋 Listar Barbearias</a>
                        <a href="#endpoints-barbearias" class="nav-sub-item">🔍 Buscar por ID</a>
                        <a href="#endpoints-barbearias" class="nav-sub-item">➕ Criar Barbearia</a>
                        <a href="#endpoints-barbearias" class="nav-sub-item">✏️ Atualizar Barbearia</a>
                        <a href="#endpoints-barbearias" class="nav-sub-item">🗑️ Excluir Barbearia</a>
                    </div>
                </div>

                <!-- Barbeiros -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="barbeiros-tree">
                        💇‍♂️ Barbeiros
                    </div>
                    <div class="nav-sub-items" id="barbeiros-tree">
                        <a href="#endpoints-barbeiros" class="nav-sub-item">📋 Listar Barbeiros</a>
                        <a href="#endpoints-barbeiros" class="nav-sub-item">🔍 Buscar por ID</a>
                        <a href="#endpoints-barbeiros" class="nav-sub-item">➕ Criar Barbeiro</a>
                        <a href="#endpoints-barbeiros" class="nav-sub-item">✏️ Atualizar Barbeiro</a>
                        <a href="#endpoints-barbeiros" class="nav-sub-item">🗑️ Excluir Barbeiro</a>
                    </div>
                </div>

                <!-- Serviços -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="servicos-tree">
                        ✂️ Serviços
                    </div>
                    <div class="nav-sub-items" id="servicos-tree">
                        <a href="#endpoints-servicos" class="nav-sub-item">📋 Listar Serviços</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">🔍 Buscar por ID</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">➕ Criar Serviço</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">✏️ Atualizar Serviço</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">🗑️ Excluir Serviço</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">🏷️ Filtrar por Categoria</a>
                        <a href="#endpoints-servicos" class="nav-sub-item">💰 Filtrar por Preço</a>
                    </div>
                </div>

                <!-- Combos -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="combos-tree">
                        🎁 Combos
                    </div>
                    <div class="nav-sub-items" id="combos-tree">
                        <a href="#endpoints-combos" class="nav-sub-item">📋 Listar Combos</a>
                        <a href="#endpoints-combos" class="nav-sub-item">🔍 Buscar por ID</a>
                        <a href="#endpoints-combos" class="nav-sub-item">➕ Criar Combo</a>
                        <a href="#endpoints-combos" class="nav-sub-item">✏️ Atualizar Combo</a>
                        <a href="#endpoints-combos" class="nav-sub-item">🗑️ Excluir Combo</a>
                        <a href="#endpoints-combos" class="nav-sub-item">🔢 Incluir Serviços</a>
                        <a href="#endpoints-combos" class="nav-sub-item">💯 Calcular Desconto</a>
                    </div>
                </div>

                <!-- Clientes -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="clientes-tree">
                        👥 Clientes
                    </div>
                    <div class="nav-sub-items" id="clientes-tree">
                        <a href="#endpoints-clientes" class="nav-sub-item">📋 Listar Clientes</a>
                        <a href="#endpoints-clientes" class="nav-sub-item">👤 Meu Perfil</a>
                        <a href="#endpoints-clientes" class="nav-sub-item">🔍 Buscar por ID</a>
                        <a href="#endpoints-clientes" class="nav-sub-item">➕ Cadastrar Cliente</a>
                        <a href="#endpoints-clientes" class="nav-sub-item">✏️ Atualizar Cliente</a>
                        <a href="#endpoints-clientes" class="nav-sub-item">🗑️ Desativar Cliente</a>
                    </div>
                </div>

                <!-- Autenticação -->
                <div class="nav-tree">
                    <div class="nav-tree-item expandable" data-target="auth-tree">
                        🔐 Autenticação
                    </div>
                    <div class="nav-sub-items" id="auth-tree">
                        <a href="#endpoints-auth" class="nav-sub-item">📱 Login com Celular</a>
                        <a href="#endpoints-auth" class="nav-sub-item">🌐 Login com Google</a>
                        <a href="#endpoints-auth" class="nav-sub-item">🏪 Login Barbearia</a>
                        <a href="#endpoints-auth" class="nav-sub-item">💇‍♂️ Login Barbeiro</a>
                        <a href="#endpoints-auth" class="nav-sub-item">✅ Verificar Token</a>
                        <a href="#endpoints-auth" class="nav-sub-item">🔄 Renovar Token</a>
                        <a href="#endpoints-auth" class="nav-sub-item">🔑 Alterar Senha</a>
                    </div>
                </div>
            </div>

            <div class="nav-section">
                <h3>Referência</h3>
                <a href="#modelos" class="nav-item">Modelos de Dados</a>
                <a href="#codigos-resposta" class="nav-item">Códigos HTTP</a>
                <a href="#exemplos" class="nav-item">Exemplos</a>
            </div>

            <div class="nav-section">
                <h3>Suporte</h3>
                <a href="#suporte" class="nav-item">Ajuda & Contato</a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="layout">
        <main class="main-content" id="mainContent">
            <div class="hero">
                <div class="container">
                    <h1>🪒 API Barbearia SaaS</h1>
                    <p>Documentação completa da API para sistema de gestão de barbearias com MySQL</p>
                </div>
            </div>

            <div class="container">

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

        <div class="section" id="banco-dados">
            <h2>🗄️ Banco de Dados</h2>
            <p>A API utiliza <strong>MySQL</strong> como banco de dados principal.</p>

            <h3>Configuração</h3>
            <div class="endpoint">
                <h4>Informações de Conexão</h4>
                <table class="table">
                    <tr><th>Parâmetro</th><th>Valor</th></tr>
                    <tr><td><strong>Servidor</strong></td><td>server.idenegociosdigitais.com.br</td></tr>
                    <tr><td><strong>Porta</strong></td><td>3355</td></tr>
                    <tr><td><strong>Database</strong></td><td>barbearia-db</td></tr>
                    <tr><td><strong>Usuário</strong></td><td>barbearia</td></tr>
                    <tr><td><strong>Engine</strong></td><td>MySQL 8.0+</td></tr>
                </table>
            </div>

            <h3>Estrutura das Tabelas</h3>
            <p>O banco de dados possui 3 tabelas principais:</p>
            <ul>
                <li><strong>barbearias</strong> - Dados das barbearias</li>
                <li><strong>barbeiros</strong> - Profissionais das barbearias</li>
                <li><strong>servicos</strong> - Serviços oferecidos</li>
            </ul>

            <div class="endpoint">
                <h4>📊 Status da Conexão</h4>
                <p><span class="status-badge status-success">✅ Conectado</span> - Banco MySQL operacional</p>
            </div>
        </div>

        <div class="section" id="endpoints-barbearias">
            <h2>�� Endpoints - Barbearias</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/barbearias</span>
                <h4>Listar barbearias</h4>
                <p>Retorna lista paginada de barbearias com filtros opcionais.</p>
                
                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padrão: 1)</td></tr>
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

        <div class="section" id="endpoints-combos">
            <h2>🎁 Endpoints - Combos</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/combos</span>
                <h4>Listar combos</h4>
                <p>Retorna lista paginada de combos com filtros opcionais.</p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padrão: 1)</td></tr>
                        <tr><td><code>limite</code></td><td>number</td><td>Não</td><td>Itens por página (padrão: 10)</td></tr>
                        <tr><td><code>barbeariaId</code></td><td>string</td><td>Não</td><td>Filtrar por barbearia específica</td></tr>
                        <tr><td><code>ativo</code></td><td>boolean</td><td>Não</td><td>Filtrar por status ativo/inativo</td></tr>
                        <tr><td><code>incluirServicos</code></td><td>boolean</td><td>Não</td><td>Incluir lista de serviços (padrão: true)</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/combos/{id}</span>
                <h4>Buscar combo por ID</h4>
                <p>Retorna dados detalhados de um combo específico com serviços incluídos.</p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>incluirServicos</code></td><td>boolean</td><td>Não</td><td>Incluir serviços completos (padrão: true)</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/combos</span>
                <h4>Criar novo combo</h4>
                <p>Cadastra um novo combo de serviços com desconto automático.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "nome": "Corte + Barba Tradicional",
  "descricao": "Combo clássico com desconto especial",
  "barbeariaId": "1",
  "servicoIds": ["1", "2"],
  "tipoDesconto": "valor",
  "valorDesconto": 10.00
}</pre>

                    <h4>Observações importantes:</h4>
                    <ul>
                        <li><strong>servicoIds:</strong> Deve conter pelo menos 2 serviços</li>
                        <li><strong>tipoDesconto:</strong> "valor" (desconto fixo) ou "percentual" (% de desconto)</li>
                        <li><strong>valorDesconto:</strong> Valor absoluto ou percentual (0-100 para percentual)</li>
                        <li><strong>Valores automáticos:</strong> valorOriginal, valorCombo e duração são calculados automaticamente</li>
                    </ul>
                </div>
            </div>

            <div class="endpoint">
                <span class="method put">PUT</span>
                <span class="url">/api/combos/{id}</span>
                <h4>Atualizar combo</h4>
                <p>Atualiza dados de um combo existente. Valores são recalculados automaticamente.</p>

                <div class="params">
                    <h4>Body (JSON) - Campos opcionais</h4>
                    <pre>{
  "nome": "Novo nome do combo",
  "servicoIds": ["1", "2", "4"],
  "tipoDesconto": "percentual",
  "valorDesconto": 15.00,
  "ativo": true
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <span class="url">/api/combos/{id}</span>
                <h4>Excluir combo</h4>
                <p>Remove permanentemente um combo do sistema.</p>
            </div>
        </div>

        <div class="section" id="endpoints-clientes">
            <h2>👥 Endpoints - Clientes</h2>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/clientes</span>
                <h4>Listar clientes</h4>
                <p>Retorna lista paginada de clientes. <strong>Requer autenticação de admin.</strong></p>

                <div class="params">
                    <h4>Parâmetros de Query</h4>
                    <table class="table">
                        <tr><th>Parâmetro</th><th>Tipo</th><th>Obrigatório</th><th>Descrição</th></tr>
                        <tr><td><code>pagina</code></td><td>number</td><td>Não</td><td>Número da página (padrão: 1)</td></tr>
                        <tr><td><code>limite</code></td><td>number</td><td>Não</td><td>Itens por página (padrão: 10)</td></tr>
                        <tr><td><code>status</code></td><td>string</td><td>Não</td><td>Filtrar por status: ativo, inativo, suspenso</td></tr>
                        <tr><td><code>barbeariaId</code></td><td>string</td><td>Não</td><td>Filtrar por barbearia preferida</td></tr>
                        <tr><td><code>barbeiroId</code></td><td>string</td><td>Não</td><td>Filtrar por barbeiro preferido</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/clientes/me</span>
                <h4>Buscar perfil do cliente logado</h4>
                <p>Retorna dados do cliente autenticado. <strong>Requer autenticação.</strong></p>

                <div class="params">
                    <h4>Headers</h4>
                    <table class="table">
                        <tr><th>Header</th><th>Valor</th><th>Descrição</th></tr>
                        <tr><td><code>Authorization</code></td><td>Bearer {token}</td><td>Token JWT obtido no login</td></tr>
                    </table>
                </div>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/api/clientes/{id}</span>
                <h4>Buscar cliente por ID</h4>
                <p>Retorna dados detalhados de um cliente específico.</p>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/clientes</span>
                <h4>Cadastrar novo cliente</h4>
                <p>Cria uma nova conta de cliente (endpoint público).</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "nome": "João Silva",
  "celular": "11987654321",
  "senha": "minhasenha123",
  "email": "joao@email.com",
  "tipoLogin": "celular",
  "dataNascimento": "1990-01-01",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "preferencias": {
    "barbeariaId": "1",
    "barbeiroId": "2"
  }
}</pre>

                    <h4>Observações:</h4>
                    <ul>
                        <li><strong>nome, celular, tipoLogin:</strong> Obrigatórios</li>
                        <li><strong>senha:</strong> Obrigatória para tipoLogin "celular"</li>
                        <li><strong>celular:</strong> Aceita formatos: "11987654321" ou "(11) 98765-4321"</li>
                        <li><strong>tipoLogin:</strong> "celular" ou "google"</li>
                    </ul>
                </div>
            </div>

            <div class="endpoint">
                <span class="method put">PUT</span>
                <span class="url">/api/clientes/{id}</span>
                <h4>Atualizar cliente</h4>
                <p>Atualiza dados de um cliente. <strong>Requer autenticação.</strong></p>
            </div>

            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <span class="url">/api/clientes/{id}</span>
                <h4>Desativar cliente</h4>
                <p>Marca cliente como inativo (soft delete). <strong>Requer autenticação.</strong></p>
            </div>
        </div>

        <div class="section" id="endpoints-auth">
            <h2>🔐 Endpoints - Autenticação</h2>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/auth/login/celular</span>
                <h4>Login com celular + senha</h4>
                <p>Autentica cliente usando celular e senha.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "celular": "11987654321",
  "senha": "minhasenha123"
}</pre>
                </div>

                <div class="response">
                    <h4>Resposta de Sucesso</h4>
                    <pre>{
  "sucesso": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cliente": {/* dados do cliente */},
  "expiresIn": 604800,
  "mensagem": "Login realizado com sucesso"
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/auth/login/google</span>
                <h4>Login/Cadastro com Google OAuth</h4>
                <p>Autentica ou cria conta usando Google OAuth.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "googleToken": "google_oauth_token_here",
  "googleId": "google_user_id",
  "email": "usuario@gmail.com",
  "nome": "Nome Usuario",
  "foto": "https://foto_url.jpg"
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/auth/verificar-token</span>
                <h4>Verificar token JWT</h4>
                <p>Valida se um token JWT ainda é válido.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/auth/refresh-token</span>
                <h4>Renovar token</h4>
                <p>Gera um novo token usando refresh token.</p>

                <div class="params">
                    <h4>Body (JSON)</h4>
                    <pre>{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>
                </div>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="url">/api/auth/alterar-senha</span>
                <h4>Alterar senha</h4>
                <p>Altera senha do cliente logado. <strong>Requer autenticação.</strong></p>

                <div class="params">
                    <h4>Headers</h4>
                    <table class="table">
                        <tr><th>Header</th><th>Valor</th></tr>
                        <tr><td><code>Authorization</code></td><td>Bearer {token}</td></tr>
                    </table>

                    <h4>Body (JSON)</h4>
                    <pre>{
  "senhaAtual": "senha_atual",
  "novaSenha": "nova_senha_123"
}</pre>
                </div>
            </div>
        </div>

        <div class="section" id="modelos">
            <h2>📋 Modelos de Dados</h2>

            <h3>🏪 Barbearia</h3>
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
  "servicos": [/* array de objetos Servico */],
  "barbeiros": [/* array de objetos Barbeiro */],
  "status": "ativa" | "inativa" | "pendente",
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601"
}</pre>

            <h3>💇‍♂️ Barbeiro</h3>
            <p>Estrutura do objeto barbeiro:</p>
            <pre>{
  "id": "string",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "cpf": "string",
  "tipo": "comissionado" | "funcionario" | "freelancer",
  "porcentagemComissao": number, // Apenas para comissionados
  "salarioFixo": number, // Apenas para funcionários
  "valorHora": number, // Apenas para freelancers
  "barbeariaId": "string",
  "especialidades": ["string"],
  "horarioTrabalho": {
    "segunda": { "inicio": "HH:mm", "fim": "HH:mm" },
    "terca": { "inicio": "HH:mm", "fim": "HH:mm" },
    "quarta": { "inicio": "HH:mm", "fim": "HH:mm" },
    "quinta": { "inicio": "HH:mm", "fim": "HH:mm" },
    "sexta": { "inicio": "HH:mm", "fim": "HH:mm" },
    "sabado": { "inicio": "HH:mm", "fim": "HH:mm" },
    "domingo": { "inicio": "HH:mm", "fim": "HH:mm" }
  },
  "status": "ativo" | "inativo" | "afastado",
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601"
}</pre>

            <h3>✂️ Serviço</h3>
            <p>Estrutura do objeto serviço:</p>
            <pre>{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "preco": number,
  "duracaoMinutos": number,
  "barbeariaId": "string",
  "categoria": "string",
  "ativo": boolean,
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601"
}</pre>

            <h3>🎁 Combo</h3>
            <p>Estrutura do objeto combo de serviços:</p>
            <pre>{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "barbeariaId": "string",
  "servicoIds": ["string"], // IDs dos serviços incluídos
  "servicos": [/* array de objetos Servico */], // Carregado quando solicitado
  "valorOriginal": number, // Soma dos preços individuais
  "valorCombo": number, // Preço final com desconto
  "tipoDesconto": "valor" | "percentual",
  "valorDesconto": number, // Valor do desconto aplicado
  "duracaoTotalMinutos": number, // Soma das durações
  "ativo": boolean,
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601"
}</pre>

            <h3>💡 Observações sobre Tipos de Barbeiro</h3>
            <ul>
                <li><strong>Comissionado:</strong> Recebe percentual sobre vendas (requer porcentagemComissao)</li>
                <li><strong>Funcionário:</strong> Recebe salário fixo mensal (requer salarioFixo)</li>
                <li><strong>Freelancer:</strong> Recebe por hora trabalhada (requer valorHora)</li>
            </ul>

            <h3>👥 Cliente</h3>
            <p>Estrutura do objeto cliente:</p>
            <pre>{
  "id": "string",
  "nome": "string",
  "email": "string",
  "celular": "string", // Campo principal para login
  "dataNascimento": "ISO 8601",
  "foto": "string", // URL da foto de perfil
  "endereco": {
    "rua": "string",
    "numero": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string"
  },
  "preferencias": {
    "barbeariaId": "string", // Barbearia preferida
    "barbeiroId": "string", // Barbeiro preferido
    "servicosPreferidos": ["string"] // IDs dos serviços preferidos
  },
  "tipoLogin": "celular" | "google" | "ambos",
  "googleId": "string", // ID do Google OAuth
  "emailVerificado": boolean,
  "celularVerificado": boolean,
  "status": "ativo" | "inativo" | "suspenso",
  "dataCadastro": "ISO 8601",
  "dataAtualizacao": "ISO 8601",
  "ultimoLogin": "ISO 8601"
}</pre>

            <h3>🎁 Observações sobre Combos</h3>
            <ul>
                <li><strong>Desconto por valor:</strong> Desconto fixo em reais (ex: R$ 10,00 de desconto)</li>
                <li><strong>Desconto percentual:</strong> Percentual de desconto sobre o valor original (ex: 15% de desconto)</li>
                <li><strong>Valor original:</strong> Soma dos preços individuais dos serviços</li>
                <li><strong>Valor combo:</strong> Preço final após aplicação do desconto</li>
                <li><strong>Mínimo de serviços:</strong> Um combo deve ter pelo menos 2 serviços</li>
            </ul>

            <h3>🔐 Observações sobre Autenticação</h3>
            <ul>
                <li><strong>Token JWT:</strong> Válido por 7 dias, deve ser enviado no header Authorization</li>
                <li><strong>Refresh Token:</strong> Válido por 30 dias, usado para renovar o token principal</li>
                <li><strong>Login por celular:</strong> Requer senha cadastrada</li>
                <li><strong>Login por Google:</strong> Cria conta automaticamente se não existir</li>
                <li><strong>Formato do header:</strong> Authorization: Bearer {token}</li>
            </ul>
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

            <h3>🏪 Barbearias</h3>
            <h4>Listar barbearias ativas em São Paulo com barbeiros e serviços</h4>
            <pre>GET /api/barbearias?status=ativa&cidade=São Paulo&incluirBarbeiros=true&incluirServicos=true&limite=5</pre>

            <h4>Buscar barbearia específica com todos os dados</h4>
            <pre>GET /api/barbearias/1</pre>

            <h4>Criar nova barbearia</h4>
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

            <h3>💇���♂️ Barbeiros</h3>
            <h4>Listar barbeiros comissionados de uma barbearia</h4>
            <pre>GET /api/barbeiros?barbeariaId=1&tipo=comissionado</pre>

            <h4>Criar barbeiro comissionado</h4>
            <pre>POST /api/barbeiros
Content-Type: application/json

{
  "nome": "Carlos Silva",
  "email": "carlos@barbearia.com",
  "telefone": "(11) 99999-9999",
  "cpf": "111.222.333-44",
  "tipo": "comissionado",
  "porcentagemComissao": 40,
  "barbeariaId": "1",
  "especialidades": ["Corte masculino", "Barba"]
}</pre>

            <h4>Criar barbeiro funcionário</h4>
            <pre>POST /api/barbeiros
Content-Type: application/json

{
  "nome": "Ana Santos",
  "email": "ana@barbearia.com",
  "telefone": "(11) 88888-8888",
  "cpf": "222.333.444-55",
  "tipo": "funcionario",
  "salarioFixo": 3500,
  "barbeariaId": "1"
}</pre>

            <h3>✂️ Serviços</h3>
            <h4>Listar serviços ativos de uma barbearia por faixa de preço</h4>
            <pre>GET /api/servicos?barbeariaId=1&ativo=true&precoMin=20&precoMax=50</pre>

            <h4>Criar novo serviço</h4>
            <pre>POST /api/servicos
Content-Type: application/json

{
  "nome": "Corte + Barba",
  "descricao": "Pacote completo de corte e barba",
  "preco": 55.00,
  "duracaoMinutos": 75,
  "barbeariaId": "1",
  "categoria": "combo"
}</pre>

            <h4>Atualizar preço de um serviço</h4>
            <pre>PUT /api/servicos/123
Content-Type: application/json

{
  "preco": 40.00
}</pre>

            <h3>🎁 Combos</h3>
            <h4>Listar combos ativos de uma barbearia</h4>
            <pre>GET /api/combos?barbeariaId=1&ativo=true&incluirServicos=true</pre>

            <h4>Criar combo com desconto fixo</h4>
            <pre>POST /api/combos
Content-Type: application/json

{
  "nome": "Corte + Barba Tradicional",
  "descricao": "Combo clássico com desconto especial",
  "barbeariaId": "1",
  "servicoIds": ["1", "2"],
  "tipoDesconto": "valor",
  "valorDesconto": 10.00
}</pre>

            <h4>Criar combo com desconto percentual</h4>
            <pre>POST /api/combos
Content-Type: application/json

{
  "nome": "Pacote Completo Masculino",
  "descricao": "Corte + barba + sobrancelha com 15% de desconto",
  "barbeariaId": "1",
  "servicoIds": ["1", "2", "4"],
  "tipoDesconto": "percentual",
  "valorDesconto": 15.00
}</pre>

            <h4>Atualizar serviços de um combo</h4>
            <pre>PUT /api/combos/combo1
Content-Type: application/json

{
  "servicoIds": ["1", "2", "4", "8"],
  "valorDesconto": 20.00
}</pre>

            <h4>Buscar combo específico com todos os serviços</h4>
            <pre>GET /api/combos/combo1?incluirServicos=true</pre>

            <h3>👥 Clientes</h3>
            <h4>Cadastrar novo cliente</h4>
            <pre>POST /api/clientes
Content-Type: application/json

{
  "nome": "João Silva",
  "celular": "11987654321",
  "senha": "minhasenha123",
  "email": "joao@email.com",
  "tipoLogin": "celular",
  "preferencias": {
    "barbeariaId": "1",
    "barbeiroId": "2"
  }
}</pre>

            <h4>Buscar perfil do cliente logado</h4>
            <pre>GET /api/clientes/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</pre>

            <h4>Atualizar preferências do cliente</h4>
            <pre>PUT /api/clientes/{clienteId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "preferencias": {
    "barbeariaId": "2",
    "barbeiroId": "3",
    "servicosPreferidos": ["1", "2", "combo1"]
  }
}</pre>

            <h3>🔐 Autenticação</h3>
            <h4>Login com celular e senha</h4>
            <pre>POST /api/auth/login/celular
Content-Type: application/json

{
  "celular": "11987654321",
  "senha": "minhasenha123"
}</pre>

            <h4>Login com Google OAuth</h4>
            <pre>POST /api/auth/login/google
Content-Type: application/json

{
  "googleToken": "google_oauth_token_aqui",
  "googleId": "google_user_id_123",
  "email": "usuario@gmail.com",
  "nome": "Nome do Usuario",
  "foto": "https://lh3.googleusercontent.com/..."
}</pre>

            <h4>Verificar se token é válido</h4>
            <pre>POST /api/auth/verificar-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>

            <h4>Alterar senha</h4>
            <pre>POST /api/auth/alterar-senha
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "senhaAtual": "senha_atual",
  "novaSenha": "nova_senha_123"
}</pre>

            <h4>Renovar token expirado</h4>
            <pre>POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>
        </div>

        <div class="section" id="suporte">
            <h2>🔧 Suporte</h2>
            <p>Para suporte técnico ou dúvidas sobre a API, entre em contato:</p>
            <ul>
                <li>📧 Email: suporte@barbeariasaas.com</li>
                <li>📱 WhatsApp: (11) 99999-9999</li>
                <li>🌐 Website: www.barbeariasaas.com</li>
            </ul>

            <div class="endpoint">
                <h4>🚀 Versão da API</h4>
                <p><span class="status-badge status-info">v1.0.0</span> - Versão atual</p>
                <p><strong>Última atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
            </div>
        </main>
    </div>

    <script>
        // Sidebar functionality
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const toggle = document.querySelector('.sidebar-toggle');

            sidebar.classList.toggle('active');
            mainContent.classList.toggle('shifted');
            toggle.classList.toggle('active');
        }

        // Tree navigation functionality
        function initializeTreeNavigation() {
            const treeItems = document.querySelectorAll('.nav-tree-item.expandable');

            treeItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();

                    const targetId = this.getAttribute('data-target');
                    const targetTree = document.getElementById(targetId);

                    if (targetTree) {
                        // Toggle expanded state
                        const isExpanded = this.classList.contains('expanded');

                        if (isExpanded) {
                            // Collapse
                            this.classList.remove('expanded');
                            targetTree.classList.remove('expanded');
                        } else {
                            // Expand
                            this.classList.add('expanded');
                            targetTree.classList.add('expanded');
                        }
                    }
                });
            });
        }

        // Auto-highlight current section in sidebar
        function highlightCurrentSection() {
            const sections = document.querySelectorAll('.section[id]');
            const navItems = document.querySelectorAll('.nav-item, .nav-sub-item');

            let currentSection = '';
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.id;
                }
            });

            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#' + currentSection) {
                    item.classList.add('active');

                    // Auto-expand parent tree if this is a sub-item
                    const parentTree = item.closest('.nav-sub-items');
                    if (parentTree) {
                        const parentItem = document.querySelector('[data-target="' + parentTree.id + '"]');
                        if (parentItem) {
                            parentItem.classList.add('expanded');
                            parentTree.classList.add('expanded');
                        }
                    }
                }
            });
        }

        // Smooth scroll for navigation links
        function initializeSmoothScroll() {
            document.querySelectorAll('.nav-item, .nav-sub-item').forEach(link => {
                link.addEventListener('click', function(e) {
                    if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href').substring(1);
                        const targetSection = document.getElementById(targetId);

                        if (targetSection) {
                            targetSection.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                });
            });
        }

        // Auto-expand tree items based on current section
        function autoExpandCurrentSection() {
            const currentHash = window.location.hash.substring(1);
            if (currentHash) {
                const targetElement = document.querySelector('[href="#' + currentHash + '"]');
                if (targetElement && targetElement.closest('.nav-sub-items')) {
                    const parentTree = targetElement.closest('.nav-sub-items');
                    const parentItem = document.querySelector('[data-target="' + parentTree.id + '"]');
                    if (parentItem) {
                        parentItem.classList.add('expanded');
                        parentTree.classList.add('expanded');
                    }
                }
            }
        }

        // Keyboard navigation
        function initializeKeyboardNavigation() {
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === '/') {
                    e.preventDefault();
                    toggleSidebar();
                }

                // Expand/collapse with Enter or Space
                if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('nav-tree-item')) {
                    e.preventDefault();
                    e.target.click();
                }
            });
        }

        // Highlight current section on scroll
        window.addEventListener('scroll', highlightCurrentSection);

        // Initialize on load
        document.addEventListener('DOMContentLoaded', function() {
            initializeTreeNavigation();
            initializeSmoothScroll();
            initializeKeyboardNavigation();
            highlightCurrentSection();
            autoExpandCurrentSection();

            // Auto-open sidebar on larger screens
            if (window.innerWidth > 768) {
                toggleSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const toggle = document.querySelector('.sidebar-toggle');

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
                toggle.classList.remove('active');
            } else if (!sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });

        // Close sidebar when clicking on main content (mobile)
        document.getElementById('mainContent').addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const mainContent = document.getElementById('mainContent');
                const toggle = document.querySelector('.sidebar-toggle');

                if (sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    mainContent.classList.remove('shifted');
                    toggle.classList.remove('active');
                }
            }
        });

        // Handle hash changes for deep linking
        window.addEventListener('hashchange', function() {
            autoExpandCurrentSection();
            highlightCurrentSection();
        });
    </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};
