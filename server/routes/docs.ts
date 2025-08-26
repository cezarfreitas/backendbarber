import { RequestHandler } from "express";

/**
 * GET /api/docs
 * Retorna a documentação HTML da API melhorada
 */
export const mostrarDocumentacao: RequestHandler = (_req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Barbearia SaaS - Documentação</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-dark: #3730a3;
            --primary-light: #818cf8;
            --secondary: #6366f1;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
            --gray-25: #fcfcfd;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --white: #ffffff;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --border-radius-sm: 6px;
            --border-radius: 8px;
            --border-radius-md: 12px;
            --border-radius-lg: 16px;
            --border-radius-xl: 20px;
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
            --spacing-2xl: 48px;
            --spacing-3xl: 64px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.65;
            color: var(--gray-800);
            background: var(--gray-25);
            overflow-x: hidden;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }

        /* Layout Principal */
        .layout { display: flex; min-height: 100vh; }

        /* Sidebar */
        .sidebar {
            width: 280px;
            background: linear-gradient(180deg, var(--gray-900) 0%, var(--gray-800) 100%);
            color: white;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            transform: translateX(0);
            border-right: 1px solid var(--gray-700);
            scrollbar-width: thin;
            scrollbar-color: var(--gray-600) transparent;
        }
        .sidebar::-webkit-scrollbar {
            width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
            background: transparent;
        }
        .sidebar::-webkit-scrollbar-thumb {
            background: var(--gray-600);
            border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
            background: var(--gray-500);
        }

        /* Toggle Button - Hidden */
        .sidebar-toggle {
            display: none;
        }

        /* Sidebar Content */
        .sidebar-header {
            padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
            border-bottom: 1px solid var(--gray-700);
        }
        .sidebar-header h1 {
            font-size: 1.375rem;
            margin-bottom: var(--spacing-sm);
            font-weight: 700;
            line-height: 1.3;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.025em;
        }
        .sidebar-header p {
            opacity: 0.85;
            font-size: 0.8125rem;
            color: var(--gray-300);
            line-height: 1.5;
        }

        .postman-download {
            margin: var(--spacing-md) var(--spacing-lg);
            padding: var(--spacing-md) var(--spacing-md);
            background: linear-gradient(135deg, var(--success), #059669);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 600;
            font-size: 0.8125rem;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            width: calc(100% - var(--spacing-xl));
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            letter-spacing: 0.025em;
            text-transform: uppercase;
        }
        .postman-download:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            background: linear-gradient(135deg, #0d9488, #047857);
        }
        .postman-download:active {
            transform: translateY(0);
        }

        .sidebar-nav { padding: var(--spacing-lg) 0; }
        .nav-section { margin-bottom: var(--spacing-xl); }
        .nav-section:last-child { margin-bottom: var(--spacing-lg); }
        .nav-section h3 {
            color: var(--gray-300);
            font-size: 0.6875rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: var(--spacing-md);
            padding: 0 var(--spacing-lg);
            font-weight: 700;
            opacity: 0.9;
        }

        /* Tree Structure */
        .nav-tree { margin-bottom: var(--spacing-xs); }
        .nav-tree-item {
            display: block;
            color: var(--gray-300);
            text-decoration: none;
            padding: var(--spacing-sm) var(--spacing-lg);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 3px solid transparent;
            cursor: pointer;
            position: relative;
            font-weight: 500;
            font-size: 0.875rem;
            border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
            margin: 0 var(--spacing-xs) 2px 0;
        }
        .nav-tree-item:hover {
            color: white;
            background: rgba(255,255,255,0.08);
            border-left-color: var(--primary-light);
            transform: translateX(2px);
        }
        .nav-tree-item.active {
            color: white;
            background: rgba(79, 70, 229, 0.15);
            border-left-color: var(--primary);
        }
        .nav-tree-item.expandable::after {
            content: "▶";
            position: absolute;
            right: var(--spacing-lg);
            top: 50%;
            transform: translateY(-50%);
            transition: transform 0.25s ease;
            font-size: 0.625rem;
            opacity: 0.7;
        }
        .nav-tree-item.expandable.expanded::after {
            transform: translateY(-50%) rotate(90deg);
            opacity: 1;
        }

        /* Sub-items */
        .nav-sub-items {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(0,0,0,0.15);
            border-radius: 0 0 var(--border-radius-sm) 0;
            margin: 0 var(--spacing-xs) var(--spacing-xs) 0;
        }
        .nav-sub-items.expanded { max-height: 600px; }
        .nav-sub-item {
            display: block;
            color: var(--gray-400);
            text-decoration: none;
            padding: var(--spacing-xs) var(--spacing-lg) var(--spacing-xs) var(--spacing-2xl);
            transition: all 0.25s ease;
            font-size: 0.8125rem;
            border-left: 3px solid transparent;
            border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
            margin: 0 var(--spacing-sm) 1px 0;
            position: relative;
        }
        .nav-sub-item::before {
            content: "";
            position: absolute;
            left: var(--spacing-lg);
            top: 50%;
            width: 4px;
            height: 4px;
            background: var(--gray-500);
            border-radius: 50%;
            transform: translateY(-50%);
            transition: all 0.2s ease;
        }
        .nav-sub-item:hover {
            color: white;
            background: rgba(255,255,255,0.08);
            border-left-color: var(--secondary);
            transform: translateX(2px);
        }
        .nav-sub-item:hover::before {
            background: var(--secondary);
            transform: translateY(-50%) scale(1.2);
        }
        .nav-sub-item.active {
            color: white;
            background: rgba(99, 102, 241, 0.15);
            border-left-color: var(--secondary);
        }
        .nav-sub-item.active::before {
            background: var(--secondary);
            transform: translateY(-50%) scale(1.3);
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            min-height: 100vh;
        }

        .container {
            max-width: 1024px;
            margin: 0 auto;
            padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .hero {
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--primary-dark) 100%);
            color: white;
            padding: var(--spacing-3xl) var(--spacing-lg);
            text-align: center;
            margin-bottom: var(--spacing-2xl);
            border-radius: var(--border-radius-lg);
            margin-left: var(--spacing-lg);
            margin-right: var(--spacing-lg);
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.08"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.08"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.08"/><circle cx="10" cy="50" r="1" fill="white" opacity="0.08"/><circle cx="90" cy="30" r="1" fill="white" opacity="0.08"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.4;
        }
        .hero h1 {
            font-size: 3.25rem;
            margin-bottom: var(--spacing-md);
            font-weight: 800;
            position: relative;
            z-index: 1;
            letter-spacing: -0.03em;
            line-height: 1.1;
        }
        .hero p {
            font-size: 1.1875rem;
            opacity: 0.92;
            max-width: 540px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
            line-height: 1.6;
            font-weight: 400;
        }

        .section {
            background: var(--white);
            margin-bottom: var(--spacing-2xl);
            padding: var(--spacing-2xl) 0;
            position: relative;
        }
        .section:first-of-type {
            padding-top: 0;
        }
        .section h2 {
            color: var(--gray-900);
            margin-bottom: var(--spacing-xl);
            padding-bottom: var(--spacing-md);
            border-bottom: 2px solid var(--gray-100);
            font-size: 1.875rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            letter-spacing: -0.025em;
            line-height: 1.2;
        }
        .section h3 {
            color: var(--gray-800);
            margin: var(--spacing-xl) 0 var(--spacing-md) 0;
            font-size: 1.375rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1.3;
        }
        .section p {
            color: var(--gray-700);
            line-height: 1.7;
            margin-bottom: var(--spacing-md);
        }
        .section ul {
            margin: var(--spacing-md) 0;
            padding-left: var(--spacing-xl);
        }
        .section li {
            color: var(--gray-700);
            line-height: 1.7;
            margin-bottom: var(--spacing-sm);
        }

        /* Endpoints */
        .endpoint {
            margin-bottom: var(--spacing-2xl);
            padding: var(--spacing-xl) 0;
            background: var(--white);
            border-left: 4px solid var(--primary);
            position: relative;
            border-radius: 0 var(--border-radius) var(--border-radius) 0;
            transition: all 0.2s ease;
        }
        .endpoint:hover {
            border-left-width: 6px;
            background: var(--gray-25);
        }

        .endpoint-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            flex-wrap: wrap;
            padding-bottom: var(--spacing-md);
            border-bottom: 1px solid var(--gray-100);
        }

        .method {
            display: inline-flex;
            align-items: center;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-xl);
            font-weight: 700;
            font-size: 0.8125rem;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            min-width: 75px;
            justify-content: center;
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease;
        }
        .method:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        .get {
            background: linear-gradient(135deg, var(--success), #059669);
            color: white;
            border: 1px solid #10b981;
        }
        .post {
            background: linear-gradient(135deg, var(--warning), #d97706);
            color: white;
            border: 1px solid #f59e0b;
        }
        .put {
            background: linear-gradient(135deg, var(--info), #2563eb);
            color: white;
            border: 1px solid #3b82f6;
        }
        .delete {
            background: linear-gradient(135deg, var(--danger), #dc2626);
            color: white;
            border: 1px solid #ef4444;
        }

        .url {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-weight: 500;
            color: var(--gray-800);
            font-size: 1rem;
            background: var(--gray-100);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            flex: 1;
            min-width: 0;
            border: 1px solid var(--gray-200);
            transition: all 0.2s ease;
        }
        .url:hover {
            background: var(--gray-50);
            border-color: var(--gray-300);
        }

        .params, .response {
            margin-top: var(--spacing-lg);
            padding-top: var(--spacing-lg);
            border-top: 1px solid var(--gray-100);
        }
        .params h4, .response h4 {
            margin-bottom: var(--spacing-md);
            color: var(--gray-800);
            font-size: 1.0625rem;
            font-weight: 600;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }
        .params h4::before {
            content: "⚙️";
            font-size: 1rem;
        }
        .response h4::before {
            content: "📄";
            font-size: 1rem;
        }

        .code-block {
            position: relative;
            margin: 16px 0;
        }

        .copy-button {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .copy-button:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }
        .copy-button.copied {
            background: var(--success);
            border-color: var(--success);
        }

        pre {
            background: linear-gradient(135deg, var(--gray-900), var(--gray-800));
            color: #e2e8f0;
            padding: 24px;
            border-radius: 12px;
            overflow-x: auto;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            border: 1px solid var(--gray-700);
            margin: 0;
            font-size: 0.875rem;
            line-height: 1.6;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: var(--spacing-md);
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--gray-200);
        }
        .table th, .table td {
            padding: var(--spacing-md) var(--spacing-md);
            text-align: left;
            border-bottom: 1px solid var(--gray-200);
            vertical-align: top;
        }
        .table th {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            font-weight: 600;
            font-size: 0.8125rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .table tr:nth-child(even) { background: var(--gray-25); }
        .table tr:hover {
            background: var(--gray-50);
            transition: background-color 0.15s ease;
        }
        .table code {
            background: var(--gray-100);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            color: var(--gray-800);
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid var(--gray-200);
        }

        /* Status badges */
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-success { background: #dcfce7; color: #166534; }
        .status-warning { background: #fef3c7; color: #92400e; }
        .status-danger { background: #fee2e2; color: #991b1b; }
        .status-info { background: #dbeafe; color: #1e40af; }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                width: 280px;
                transform: translateX(-280px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .sidebar.mobile-active { transform: translateX(0); }
            .sidebar-toggle {
                display: block;
                position: fixed;
                top: var(--spacing-lg);
                left: var(--spacing-lg);
                z-index: 1001;
                background: var(--primary);
                color: white;
                border: none;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--border-radius);
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                box-shadow: var(--shadow-md);
            }
            .main-content {
                margin-left: 0;
                padding-top: var(--spacing-3xl);
            }
            .container {
                padding: var(--spacing-md);
            }
            .hero {
                margin: 0 var(--spacing-md) var(--spacing-lg);
                padding: var(--spacing-xl) var(--spacing-md);
            }
            .hero h1 {
                font-size: 2.25rem;
                line-height: 1.1;
            }
            .hero p {
                font-size: 1.0625rem;
            }
            .section {
                padding: var(--spacing-lg) 0;
                margin-bottom: var(--spacing-lg);
            }
            .section h2 {
                font-size: 1.625rem;
            }
            .endpoint {
                padding: var(--spacing-lg) 0;
                margin-bottom: var(--spacing-lg);
            }
            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
                gap: var(--spacing-sm);
            }
            .url {
                font-size: 0.875rem;
                width: 100%;
            }
            .table {
                font-size: 0.875rem;
            }
            .table th, .table td {
                padding: var(--spacing-sm);
            }
        }

        /* Animações */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .section { animation: fadeIn 0.6s ease-out; }

        /* Copy feedback */
        .copy-feedback {
            position: fixed;
            top: var(--spacing-lg);
            right: var(--spacing-lg);
            background: var(--success);
            color: white;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            font-weight: 600;
            font-size: 0.875rem;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transform: translateX(calc(100% + 24px)) translateY(-50%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        .copy-feedback.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(0) translateY(0);
        }
    </style>
</head>
<body>
    <div class="copy-feedback" id="copyFeedback">📋 Código copiado!</div>
    
    <div class="layout">
        <button class="sidebar-toggle" id="sidebarToggle">☰</button>

        <nav class="sidebar active" id="sidebar">
            <div class="sidebar-header">
                <h1>🪒 API Barbearia</h1>
                <p>Sistema completo para gestão de barbearias</p>
            </div>
            
            <button class="postman-download" onclick="downloadPostmanCollection()">
                📥 Baixar Collection Postman
            </button>
            
            <div class="sidebar-nav">
                <div class="nav-section">
                    <h3>Início</h3>
                    <a href="#overview" class="nav-tree-item">📖 Visão Geral</a>
                    <a href="#authentication" class="nav-tree-item">🔐 Autenticação</a>
                    <a href="#errors" class="nav-tree-item">⚠️ Códigos de Erro</a>
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
                            <a href="#endpoints-barbearia-id" class="nav-sub-item">🔍 Buscar por ID</a>
                            <a href="#endpoints-barbearias-create" class="nav-sub-item">➕ Criar Barbearia</a>
                            <a href="#endpoints-barbearias-update" class="nav-sub-item">✏️ Atualizar Barbearia</a>
                            <a href="#endpoints-barbearias-delete" class="nav-sub-item">🗑️ Excluir Barbearia</a>
                        </div>
                    </div>
                    
                    <!-- Barbeiros -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="barbeiros-tree">
                            💇‍♂️ Barbeiros
                        </div>
                        <div class="nav-sub-items" id="barbeiros-tree">
                            <a href="#endpoints-barbeiros" class="nav-sub-item">📋 Listar Barbeiros</a>
                            <a href="#endpoints-barbeiro-id" class="nav-sub-item">🔍 Buscar por ID</a>
                            <a href="#endpoints-barbeiros-create" class="nav-sub-item">➕ Criar Barbeiro</a>
                            <a href="#endpoints-barbeiros-update" class="nav-sub-item">✏️ Atualizar Barbeiro</a>
                            <a href="#endpoints-barbeiros-delete" class="nav-sub-item">🗑️ Excluir Barbeiro</a>
                        </div>
                    </div>
                    
                    <!-- Serviços -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="servicos-tree">
                            ✂️ Serviços
                        </div>
                        <div class="nav-sub-items" id="servicos-tree">
                            <a href="#endpoints-servicos" class="nav-sub-item">📋 Listar Serviços</a>
                            <a href="#endpoints-servico-id" class="nav-sub-item">🔍 Buscar por ID</a>
                            <a href="#endpoints-servicos-create" class="nav-sub-item">➕ Criar Serviço</a>
                            <a href="#endpoints-servicos-update" class="nav-sub-item">✏️ Atualizar Serviço</a>
                            <a href="#endpoints-servicos-delete" class="nav-sub-item">🗑️ Excluir Serviço</a>
                        </div>
                    </div>
                    
                    <!-- Combos -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="combos-tree">
                            🎁 Combos
                        </div>
                        <div class="nav-sub-items" id="combos-tree">
                            <a href="#endpoints-combos" class="nav-sub-item">📋 Listar Combos</a>
                            <a href="#endpoints-combo-id" class="nav-sub-item">🔍 Buscar por ID</a>
                            <a href="#endpoints-combos-create" class="nav-sub-item">➕ Criar Combo</a>
                            <a href="#endpoints-combos-update" class="nav-sub-item">✏️ Atualizar Combo</a>
                            <a href="#endpoints-combos-delete" class="nav-sub-item">🗑️ Excluir Combo</a>
                        </div>
                    </div>
                    
                    <!-- Clientes -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="clientes-tree">
                            👥 Clientes
                        </div>
                        <div class="nav-sub-items" id="clientes-tree">
                            <a href="#endpoints-clientes" class="nav-sub-item">📋 Listar Clientes</a>
                            <a href="#endpoints-cliente-id" class="nav-sub-item">🔍 Buscar por ID</a>
                            <a href="#endpoints-clientes-create" class="nav-sub-item">➕ Criar Cliente</a>
                            <a href="#endpoints-clientes-update" class="nav-sub-item">✏️ Atualizar Cliente</a>
                            <a href="#endpoints-clientes-delete" class="nav-sub-item">🗑️ Excluir Cliente</a>
                        </div>
                    </div>
                    
                    <!-- Autenticação -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="auth-tree">
                            🔐 Autenticação
                        </div>
                        <div class="nav-sub-items" id="auth-tree">
                            <a href="#endpoints-auth-celular" class="nav-sub-item">📱 Login por Celular</a>
                            <a href="#endpoints-auth-google" class="nav-sub-item">🔗 Login Google</a>
                            <a href="#endpoints-auth-barbearia" class="nav-sub-item">🏪 Login Barbearia</a>
                            <a href="#endpoints-auth-barbeiro" class="nav-sub-item">💇‍♂️ Login Barbeiro</a>
                            <a href="#endpoints-auth-verify" class="nav-sub-item">✅ Verificar Token</a>
                            <a href="#endpoints-auth-refresh" class="nav-sub-item">🔄 Refresh Token</a>
                        </div>
                    </div>
                    
                    <!-- APIs de Diretório -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="diretorio-tree">
                            📂 APIs de Diretório
                        </div>
                        <div class="nav-sub-items" id="diretorio-tree">
                            <a href="#endpoints-diretorio-barbearias" class="nav-sub-item">🔍 Busca Pública</a>
                            <a href="#endpoints-diretorio-todas-barbearias" class="nav-sub-item">🏪 Listar Todas</a>
                            <a href="#endpoints-diretorio-cidades" class="nav-sub-item">🏙️ Cidades</a>
                            <a href="#endpoints-diretorio-estatisticas" class="nav-sub-item">📊 Estatísticas</a>
                            <a href="#endpoints-diretorio-sugestoes" class="nav-sub-item">💡 Sugestões</a>
                            <a href="#endpoints-diretorio-detalhes" class="nav-sub-item">📋 Detalhes Barbearia</a>
                            <a href="#endpoints-diretorio-promocoes" class="nav-sub-item">🎯 Promoções</a>
                        </div>
                    </div>

                    <!-- Admin Dashboard -->
                    <div class="nav-tree">
                        <div class="nav-tree-item expandable" data-target="admin-tree">
                            🔧 Admin Dashboard
                        </div>
                        <div class="nav-sub-items" id="admin-tree">
                            <a href="#endpoints-admin-dashboard" class="nav-sub-item">📊 Dashboard</a>
                            <a href="#endpoints-admin-barbearia-get" class="nav-sub-item">🏪 Buscar Barbearia</a>
                            <a href="#endpoints-admin-barbearia-update" class="nav-sub-item">✏️ Atualizar Barbearia</a>
                            <a href="#endpoints-admin-barbeiros-list" class="nav-sub-item">📋 Listar Barbeiros</a>
                            <a href="#endpoints-admin-barbeiros-create" class="nav-sub-item">➕ Criar Barbeiro</a>
                            <a href="#endpoints-admin-barbeiros-update" class="nav-sub-item">✏️ Atualizar Barbeiro</a>
                            <a href="#endpoints-admin-barbeiros-delete" class="nav-sub-item">🗑️ Remover Barbeiro</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="main-content shifted" id="mainContent">
            <div class="container">
                <div class="hero">
                    <h1>🪒 API Barbearia SaaS</h1>
                    <p>Sistema completo para gestão de barbearias, barbeiros, serviços e clientes com autenticação robusta e APIs públicas.</p>
                </div>
                
                <!-- Visão Geral -->
                <div class="section" id="overview">
                    <h2>📖 Visão Geral</h2>
                    <p>Esta API fornece um sistema completo para gestão de barbearias, incluindo:</p>
                    <ul style="margin: 20px 0; padding-left: 30px;">
                        <li><strong>Gestão de Barbearias</strong> - CRUD completo para barbearias</li>
                        <li><strong>Gestão de Barbeiros</strong> - Controle de barbeiros e suas especialidades</li>
                        <li><strong>Gestão de Serviços</strong> - Catálogo de serviços com preços e duração</li>
                        <li><strong>Sistema de Combos</strong> - Pacotes de serviços com desconto</li>
                        <li><strong>Gestão de Clientes</strong> - Registro e preferências de clientes</li>
                        <li><strong>Autenticação Múltipla</strong> - Login por celular, Google, barbearia e barbeiro</li>
                        <li><strong>APIs Públicas</strong> - Busca e listagem para o público geral</li>
                    </ul>
                    
                    <h3>🌐 Base URL</h3>
                    <div class="code-block">
                        <button class="copy-button" onclick="copyToClipboard(this, 'https://16b54ed7d945437b9ae24bfeca3d4937-f9a6c65b45c74b1aa5cd36a9a.fly.dev')">📋 Copiar</button>
                        <pre>https://16b54ed7d945437b9ae24bfeca3d4937-f9a6c65b45c74b1aa5cd36a9a.fly.dev</pre>
                    </div>
                </div>
                
                <!-- Autenticação -->
                <div class="section" id="authentication">
                    <h2>🔐 Autenticação</h2>
                    <p>A API suporta múltiplos tipos de autenticação usando JWT tokens:</p>
                    
                    <h3>Headers de Autenticação</h3>
                    <div class="code-block">
                        <button class="copy-button" onclick="copyToClipboard(this, 'Authorization: Bearer {token}')">📋 Copiar</button>
                        <pre>Authorization: Bearer {token}</pre>
                    </div>
                    
                    <h3>Tipos de Login</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Endpoint</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>Cliente</code></td>
                                <td><code>POST /api/auth/login/celular</code></td>
                                <td>Login de clientes usando celular + senha</td>
                            </tr>
                            <tr>
                                <td><code>Google</code></td>
                                <td><code>POST /api/auth/login/google</code></td>
                                <td>Login social via Google OAuth</td>
                            </tr>
                            <tr>
                                <td><code>Barbearia</code></td>
                                <td><code>POST /api/auth/login/barbearia</code></td>
                                <td>Login de administradores de barbearia</td>
                            </tr>
                            <tr>
                                <td><code>Barbeiro</code></td>
                                <td><code>POST /api/auth/login/barbeiro</code></td>
                                <td>Login de barbeiros funcionários</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Códigos de Erro -->
                <div class="section" id="errors">
                    <h2>⚠️ Códigos de Erro</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Código</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="status-badge status-success">200</span></td>
                                <td>OK</td>
                                <td>Requisição bem-sucedida</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-success">201</span></td>
                                <td>Created</td>
                                <td>Recurso criado com sucesso</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-warning">400</span></td>
                                <td>Bad Request</td>
                                <td>Dados inválidos na requisição</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-warning">401</span></td>
                                <td>Unauthorized</td>
                                <td>Token de autenticação inválido ou ausente</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-warning">403</span></td>
                                <td>Forbidden</td>
                                <td>Acesso negado para o recurso</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-warning">404</span></td>
                                <td>Not Found</td>
                                <td>Recurso não encontrado</td>
                            </tr>
                            <tr>
                                <td><span class="status-badge status-danger">500</span></td>
                                <td>Internal Server Error</td>
                                <td>Erro interno do servidor</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
`;

  // Continue with the endpoints sections...
  const endpointsHtml = generateEndpointsDocumentation();

  const footerHtml = `
            </div>
        </main>
    </div>
    
    <script>
        // Sidebar Toggle (mobile only)
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        // Check if mobile
        function isMobile() {
            return window.innerWidth <= 768;
        }

        sidebarToggle.addEventListener('click', () => {
            if (isMobile()) {
                sidebar.classList.toggle('mobile-active');
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (!isMobile()) {
                sidebar.classList.remove('mobile-active');
                sidebar.classList.add('active');
                mainContent.classList.add('shifted');
                mainContent.style.marginLeft = '280px';
            } else {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
                mainContent.style.marginLeft = '0';
            }
        });

        // Initialize correct state on load
        document.addEventListener('DOMContentLoaded', () => {
            if (!isMobile()) {
                sidebar.classList.add('active');
                mainContent.classList.add('shifted');
                mainContent.style.marginLeft = '280px';
            }

            // Garantir que o feedback de cópia esteja oculto
            const copyFeedback = document.getElementById('copyFeedback');
            if (copyFeedback) {
                copyFeedback.classList.remove('show');
            }
        });
        
        // Expandable Navigation
        document.querySelectorAll('.nav-tree-item.expandable').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('data-target');
                const target = document.getElementById(targetId);
                
                item.classList.toggle('expanded');
                target.classList.toggle('expanded');
            });
        });
        
        // Active Navigation
        function setActiveNav() {
            const sections = document.querySelectorAll('.section[id]');
            const navItems = document.querySelectorAll('.nav-tree-item, .nav-sub-item');
            
            let currentSection = '';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100) {
                    currentSection = section.id;
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href');
                if (href && href === '#' + currentSection) {
                    item.classList.add('active');
                    
                    // Expand parent if it's a sub-item
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
        
        window.addEventListener('scroll', setActiveNav);
        setActiveNav();
        
        // Copy to Clipboard
        function copyToClipboard(button, text) {
            // Verificar se a API de clipboard está disponível
            if (!navigator.clipboard) {
                console.warn('Clipboard API não disponível');
                return;
            }

            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '✅ Copiado!';
                button.classList.add('copied');

                showCopyFeedback();

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar texto:', err);
                // Fallback: tentar copiar usando o método tradicional
                fallbackCopyTextToClipboard(text);
                showCopyFeedback();
            });
        }

        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Erro no fallback de cópia:', err);
            }
            document.body.removeChild(textArea);
        }

        function showCopyFeedback() {
            const feedback = document.getElementById('copyFeedback');
            if (!feedback) return;

            // Garantir que está oculto primeiro
            feedback.classList.remove('show');

            // Usar requestAnimationFrame para garantir que a classe seja aplicada
            requestAnimationFrame(() => {
                feedback.classList.add('show');

                setTimeout(() => {
                    feedback.classList.remove('show');
                }, 2500);
            });
        }
        
        // Download Postman Collection
        function downloadPostmanCollection() {
            window.location.href = '/api/docs/postman-collection';
        }
        
        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html + endpointsHtml + footerHtml);
};

function generateEndpointsDocumentation(): string {
  return `
                <!-- Barbearias Endpoints -->
                <div class="section" id="endpoints-barbearias">
                    <h2>🏪 Barbearias</h2>
                    
                    <div class="endpoint" id="endpoints-barbearias">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/barbearias</span>
                        </div>
                        <h4>Listar todas as barbearias</h4>
                        <p>Retorna uma lista paginada de barbearias com opções de filtro.</p>
                        
                        <div class="params">
                            <h4>Query Parameters</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Parâmetro</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Exemplo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>limite</code></td>
                                        <td>number</td>
                                        <td>Limite de resultados por página</td>
                                        <td>10</td>
                                    </tr>
                                    <tr>
                                        <td><code>pagina</code></td>
                                        <td>number</td>
                                        <td>Número da página</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td><code>status</code></td>
                                        <td>string</td>
                                        <td>Filtrar por status</td>
                                        <td>ativa</td>
                                    </tr>
                                    <tr>
                                        <td><code>cidade</code></td>
                                        <td>string</td>
                                        <td>Filtrar por cidade</td>
                                        <td>São Paulo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "barbearias": [
    {
      "id": "1",
      "nome": "Barbearia do João",
      "descricao": "A melhor barbearia do bairro",
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
        "email": "contato@barbeariadoroao.com"
      },
      "status": "ativa"
    }
  ]
}\`)">📋 Copiar</button>
                                <pre>{
  "barbearias": [
    {
      "id": "1",
      "nome": "Barbearia do João",
      "descricao": "A melhor barbearia do bairro",
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
        "email": "contato@barbeariadoroao.com"
      },
      "status": "ativa"
    }
  ]
}</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="endpoint" id="endpoints-barbearia-id">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/barbearias/{id}</span>
                        </div>
                        <h4>Buscar barbearia por ID</h4>
                        <p>Retorna os detalhes completos de uma barbearia específica.</p>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "id": "1",
    "nome": "Barbearia do João",
    "descricao": "A melhor barbearia do bairro",
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
      "email": "contato@barbeariadoroao.com"
    },
    "horario_funcionamento": {
      "segunda": {"inicio": "08:00", "fim": "18:00"},
      "terca": {"inicio": "08:00", "fim": "18:00"}
    },
    "barbeiros": [...],
    "servicos": [...]
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "id": "1",
    "nome": "Barbearia do João",
    "descricao": "A melhor barbearia do bairro",
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
      "email": "contato@barbeariadoroao.com"
    },
    "horario_funcionamento": {
      "segunda": {"inicio": "08:00", "fim": "18:00"},
      "terca": {"inicio": "08:00", "fim": "18:00"}
    },
    "barbeiros": [...],
    "servicos": [...]
  }
}</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="endpoint" id="endpoints-barbearias-create">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/barbearias</span>
                        </div>
                        <h4>Criar nova barbearia</h4>
                        <p>Cria uma nova barbearia no sistema.</p>
                        
                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "nome": "Nova Barbearia",
  "descricao": "Descrição da barbearia",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "456",
    "bairro": "Bairro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "12345-678"
  },
  "contato": {
    "telefone": "(11) 88888-8888",
    "email": "nova@barbearia.com"
  },
  "proprietario": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@proprietario.com"
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "nome": "Nova Barbearia",
  "descricao": "Descrição da barbearia",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "456",
    "bairro": "Bairro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "12345-678"
  },
  "contato": {
    "telefone": "(11) 88888-8888",
    "email": "nova@barbearia.com"
  },
  "proprietario": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@proprietario.com"
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- APIs de Diretório -->
                <div class="section" id="endpoints-diretorio-barbearias">
                    <h2>📂 APIs de Diretório</h2>
                    
                    <div class="endpoint">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/diretorio/barbearias</span>
                        </div>
                        <h4>Busca pública de barbearias</h4>
                        <p>API pública para buscar barbearias com filtros avançados.</p>
                        
                        <div class="params">
                            <h4>Query Parameters</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Parâmetro</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Exemplo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>q</code></td>
                                        <td>string</td>
                                        <td>Termo de busca</td>
                                        <td>João</td>
                                    </tr>
                                    <tr>
                                        <td><code>cidade</code></td>
                                        <td>string</td>
                                        <td>Filtrar por cidade</td>
                                        <td>São Paulo</td>
                                    </tr>
                                    <tr>
                                        <td><code>estado</code></td>
                                        <td>string</td>
                                        <td>Filtrar por estado</td>
                                        <td>SP</td>
                                    </tr>
                                    <tr>
                                        <td><code>ordenar</code></td>
                                        <td>string</td>
                                        <td>Ordenação (relevancia, distancia, avaliacao)</td>
                                        <td>relevancia</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "barbearias": [
      {
        "id": "1",
        "nome": "Barbearia do João",
        "endereco": {
          "cidade": "São Paulo",
          "estado": "SP"
        },
        "contato": {
          "telefone": "(11) 99999-9999"
        }
      }
    ],
    "pagina": 1,
    "limite": 20,
    "total": 1
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "barbearias": [
      {
        "id": "1",
        "nome": "Barbearia do João",
        "endereco": {
          "cidade": "São Paulo",
          "estado": "SP"
        },
        "contato": {
          "telefone": "(11) 99999-9999"
        }
      }
    ],
    "pagina": 1,
    "limite": 20,
    "total": 1
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-diretorio-todas-barbearias">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/diretorio/barbearias/todas</span>
                        </div>
                        <h4>🏪 Listar todas as barbearias</h4>
                        <p>Lista todas as barbearias ativas do diretório com paginação e ordenação.</p>

                        <div class="params">
                            <h4>Query Parameters</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Parâmetro</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Exemplo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>limite</code></td>
                                        <td>number</td>
                                        <td>Número de registros por página (1-100)</td>
                                        <td>50</td>
                                    </tr>
                                    <tr>
                                        <td><code>pagina</code></td>
                                        <td>number</td>
                                        <td>Número da página</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td><code>ordenar</code></td>
                                        <td>string</td>
                                        <td>Ordenação (nome, data_cadastro, cidade)</td>
                                        <td>nome</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "barbearias": [
      {
        "id": "1",
        "nome": "Barbearia Central",
        "descricao": "A melhor barbearia da cidade",
        "endereco": {
          "rua": "Rua Principal",
          "numero": "123",
          "bairro": "Centro",
          "cidade": "São Paulo",
          "estado": "SP",
          "cep": "01000-000"
        },
        "contato": {
          "telefone": "(11) 99999-9999",
          "email": "contato@barbeariacentral.com",
          "whatsapp": "(11) 99999-9999"
        },
        "data_cadastro": "2024-01-15T10:30:00.000Z",
        "status": "ativa"
      }
    ],
    "pagina": 1,
    "limite": 50,
    "total": 25,
    "total_paginas": 1
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "barbearias": [
      {
        "id": "1",
        "nome": "Barbearia Central",
        "descricao": "A melhor barbearia da cidade",
        "endereco": {
          "rua": "Rua Principal",
          "numero": "123",
          "bairro": "Centro",
          "cidade": "São Paulo",
          "estado": "SP",
          "cep": "01000-000"
        },
        "contato": {
          "telefone": "(11) 99999-9999",
          "email": "contato@barbeariacentral.com",
          "whatsapp": "(11) 99999-9999"
        },
        "data_cadastro": "2024-01-15T10:30:00.000Z",
        "status": "ativa"
      }
    ],
    "pagina": 1,
    "limite": 50,
    "total": 25,
    "total_paginas": 1
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-diretorio-cidades">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/diretorio/cidades</span>
                        </div>
                        <h4>Listar cidades disponíveis</h4>
                        <p>Retorna lista de cidades onde há barbearias cadastradas.</p>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "cidades": [
      {
        "cidade": "São Paulo",
        "estado": "SP",
        "total_barbearias": 2
      }
    ]
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "cidades": [
      {
        "cidade": "São Paulo",
        "estado": "SP",
        "total_barbearias": 2
      }
    ]
  }
}</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="endpoint" id="endpoints-diretorio-estatisticas">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/diretorio/estatisticas</span>
                        </div>
                        <h4>Estatísticas do diretório</h4>
                        <p>Retorna estatísticas gerais do sistema.</p>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "estatisticas": {
      "total_barbearias": 2,
      "total_barbeiros": 3,
      "total_servicos": 9,
      "preco_medio_servicos": 42.22,
      "cidades_populares": [
        {
          "cidade": "São Paulo",
          "estado": "SP",
          "total_barbearias": 2
        }
      ]
    }
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "estatisticas": {
      "total_barbearias": 2,
      "total_barbeiros": 3,
      "total_servicos": 9,
      "preco_medio_servicos": 42.22,
      "cidades_populares": [
        {
          "cidade": "São Paulo",
          "estado": "SP",
          "total_barbearias": 2
        }
      ]
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Autenticação Endpoints -->
                <div class="section" id="endpoints-auth-celular">
                    <h2>🔐 Autenticação</h2>
                    
                    <div class="endpoint">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/login/celular</span>
                        </div>
                        <h4>Login por celular</h4>
                        <p>Autentica cliente usando celular e senha.</p>
                        
                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "celular": "11987654321",
  "senha": "minhasenha123"
}\`)">📋 Copiar</button>
                                <pre>{
  "celular": "11987654321",
  "senha": "minhasenha123"
}</pre>
                            </div>
                        </div>
                        
                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, \`{
  "sucesso": true,
  "dados": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "cliente1",
      "nome": "João Silva",
      "email": "joao@email.com",
      "userType": "cliente"
    }
  }
}\`)">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "cliente1",
      "nome": "João Silva",
      "email": "joao@email.com",
      "userType": "cliente"
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                    
                    <div class="endpoint" id="endpoints-auth-barbearia">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/login/barbearia</span>
                        </div>
                        <h4>Login de barbearia</h4>
                        <p>Autentica proprietário/administrador de barbearia usando email e senha.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  email: 'contato@barbeariadoroao.com',
  senha: '123456'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "email": "contato@barbeariadoroao.com",
  "senha": "123456"
}</pre>
                            </div>
                        </div>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  sucesso: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  barbearia: {
    id: '1',
    nome: 'Barbearia do João',
    email: 'contato@barbeariadoroao.com',
    status: 'ativa',
    userType: 'barbearia'
  },
  expiresIn: 604800,
  mensagem: 'Login realizado com sucesso'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "barbearia": {
    "id": "1",
    "nome": "Barbearia do João",
    "email": "contato@barbeariadoroao.com",
    "status": "ativa",
    "userType": "barbearia"
  },
  "expiresIn": 604800,
  "mensagem": "Login realizado com sucesso"
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-auth-barbeiro">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/login/barbeiro</span>
                        </div>
                        <h4>Login de barbeiro</h4>
                        <p>Autentica barbeiro funcionário usando email e senha.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  email: 'carlos@barbeariadoroao.com',
  senha: '123456'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "email": "carlos@barbeariadoroao.com",
  "senha": "123456"
}</pre>
                            </div>
                        </div>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  sucesso: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  barbeiro: {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos@barbeariadoroao.com',
    barbearia_id: '1',
    status: 'ativo',
    userType: 'barbeiro'
  },
  expiresIn: 604800,
  mensagem: 'Login realizado com sucesso'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "barbeiro": {
    "id": "1",
    "nome": "Carlos Silva",
    "email": "carlos@barbeariadoroao.com",
    "barbearia_id": "1",
    "status": "ativo",
    "userType": "barbeiro"
  },
  "expiresIn": 604800,
  "mensagem": "Login realizado com sucesso"
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-auth-google">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/login/google</span>
                        </div>
                        <h4>Login via Google</h4>
                        <p>Autentica cliente usando Google OAuth token.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  googleToken: 'google_oauth_token_here',
  nome: 'João Silva',
  email: 'joao@gmail.com',
  foto: 'https://lh3.googleusercontent.com/...'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "googleToken": "google_oauth_token_here",
  "nome": "João Silva",
  "email": "joao@gmail.com",
  "foto": "https://lh3.googleusercontent.com/..."
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-auth-verify">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/verificar-token</span>
                        </div>
                        <h4>Verificar token</h4>
                        <p>Verifica se um token JWT é válido.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-auth-refresh">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/auth/refresh-token</span>
                        </div>
                        <h4>Renovar token</h4>
                        <p>Gera novo token usando refresh token.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  refreshToken: 'rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin Dashboard Endpoints -->
                <div class="section" id="endpoints-admin-dashboard">
                    <h2>🔧 Admin Dashboard</h2>
                    <p>APIs exclusivas para administradores (proprietários) de barbearias. Requer autenticação como barbearia.</p>

                    <div class="endpoint">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/admin/dashboard</span>
                        </div>
                        <h4>Dashboard com estatísticas</h4>
                        <p>Retorna estatísticas da barbearia e dados gerais para o dashboard administrativo.</p>

                        <div class="params">
                            <h4>Headers</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Header</th>
                                        <th>Valor</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>Authorization</code></td>
                                        <td>Bearer {token}</td>
                                        <td>Token JWT da barbearia</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  sucesso: true,
  dados: {
    barbearia: {
      id: '1',
      nome: 'Barbearia do João',
      descricao: 'A melhor barbearia do bairro',
      status: 'ativa'
    },
    estatisticas: {
      total_barbeiros: 3,
      total_servicos: 8,
      total_combos: 4,
      preco_medio_servicos: 45.50
    }
  }
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "barbearia": {
      "id": "1",
      "nome": "Barbearia do João",
      "descricao": "A melhor barbearia do bairro",
      "status": "ativa"
    },
    "estatisticas": {
      "total_barbeiros": 3,
      "total_servicos": 8,
      "total_combos": 4,
      "preco_medio_servicos": 45.50
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbeiros-list">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/admin/barbeiros</span>
                        </div>
                        <h4>Listar barbeiros da barbearia</h4>
                        <p>Lista todos os barbeiros associados à barbearia do administrador logado.</p>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  sucesso: true,
  dados: [
    {
      id: '1',
      nome: 'Carlos Silva',
      email: 'carlos@barbeariadoroao.com',
      telefone: '(11) 98888-7777',
      cpf: '111.222.333-44',
      tipo: 'comissionado',
      porcentagem_comissao: 40.00,
      especialidades: ['Corte masculino', 'Barba', 'Bigode'],
      status: 'ativo'
    }
  ]
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": [
    {
      "id": "1",
      "nome": "Carlos Silva",
      "email": "carlos@barbeariadoroao.com",
      "telefone": "(11) 98888-7777",
      "cpf": "111.222.333-44",
      "tipo": "comissionado",
      "porcentagem_comissao": 40.00,
      "especialidades": ["Corte masculino", "Barba", "Bigode"],
      "status": "ativo"
    }
  ]
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbeiros-create">
                        <div class="endpoint-header">
                            <span class="method post">POST</span>
                            <span class="url">/api/admin/barbeiros</span>
                        </div>
                        <h4>Criar novo barbeiro</h4>
                        <p>Adiciona um novo barbeiro à barbearia do administrador.</p>

                        <div class="params">
                            <h4>Body (JSON)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  nome: 'Pedro Santos',
  email: 'pedro@barbeariadoroao.com',
  telefone: '(11) 99999-8888',
  cpf: '444.555.666-77',
  senha: 'senha123',
  tipo: 'funcionario',
  salario_fixo: 3000.00,
  especialidades: ['Corte feminino', 'Escova'],
  horario_trabalho: {
    segunda: {inicio: '09:00', fim: '18:00'},
    terca: {inicio: '09:00', fim: '18:00'}
  }
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "nome": "Pedro Santos",
  "email": "pedro@barbeariadoroao.com",
  "telefone": "(11) 99999-8888",
  "cpf": "444.555.666-77",
  "senha": "senha123",
  "tipo": "funcionario",
  "salario_fixo": 3000.00,
  "especialidades": ["Corte feminino", "Escova"],
  "horario_trabalho": {
    "segunda": {"inicio": "09:00", "fim": "18:00"},
    "terca": {"inicio": "09:00", "fim": "18:00"}
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbeiros-update">
                        <div class="endpoint-header">
                            <span class="method put">PUT</span>
                            <span class="url">/api/admin/barbeiros/{id}</span>
                        </div>
                        <h4>Atualizar barbeiro</h4>
                        <p>Atualiza dados de um barbeiro da barbearia.</p>

                        <div class="params">
                            <h4>Path Parameters</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Parâmetro</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>id</code></td>
                                        <td>string</td>
                                        <td>ID do barbeiro a ser atualizado</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbeiros-delete">
                        <div class="endpoint-header">
                            <span class="method delete">DELETE</span>
                            <span class="url">/api/admin/barbeiros/{id}</span>
                        </div>
                        <h4>Remover barbeiro</h4>
                        <p>Remove (inativa) um barbeiro da barbearia. Operação de soft delete.</p>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({sucesso: true, dados: null}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": null
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbearia-get">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <span class="url">/api/admin/barbearia</span>
                        </div>
                        <h4>Buscar dados da barbearia</h4>
                        <p>Retorna os dados completos da barbearia do proprietário logado.</p>

                        <div class="headers">
                            <h4>Headers Obrigatórios</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Header</th>
                                        <th>Valor</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>Authorization</code></td>
                                        <td><code>Bearer TOKEN_JWT</code></td>
                                        <td>Token JWT de autenticação da barbearia</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="example-usage">
                            <h4>Exemplo de Uso (curl)</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, 'curl -X GET "http://localhost:8080/api/admin/barbearia" -H "Authorization: Bearer TOKEN_JWT"')">📋 Copiar</button>
                                <pre>curl -X GET "http://localhost:8080/api/admin/barbearia" \
  -H "Authorization: Bearer TOKEN_JWT"</pre>
                            </div>
                        </div>

                        <div class="response">
                            <h4>Exemplo de Resposta</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  sucesso: true,
  dados: {
    id: 'c48db985-4ab2-431a-8e42-ecf60048e261',
    nome: 'Barbearia Teste Login',
    descricao: 'Barbearia criada especificamente para testar o sistema de login',
    endereco: {
      rua: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000'
    },
    contato: {
      telefone: '(11) 99999-9999',
      email: 'teste@barbearia.com',
      whatsapp: '(11) 99999-9999'
    },
    proprietario: {
      nome: 'João da Silva',
      cpf: '123.456.789-00',
      email: 'joao@barbearia.com'
    },
    horarioFuncionamento: {
      segunda: {
        abertura: '10:00',
        fechamento: '19:00'
      },
      terca: {
        abertura: '10:00',
        fechamento: '19:00'
      },
      quarta: {
        abertura: '10:00',
        fechamento: '19:00'
      },
      quinta: {
        abertura: '10:00',
        fechamento: '19:00'
      },
      sexta: {
        abertura: '10:00',
        fechamento: '19:00'
      },
      sabado: {
        abertura: '09:00',
        fechamento: '13:00'
      }
    },
    status: 'ativa',
    dataCadastro: '2025-08-26T13:58:10.000Z',
    dataAtualizacao: '2025-08-26T14:03:00.000Z',
    ultimoLogin: '2025-08-26T14:15:30.000Z'
  }
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "sucesso": true,
  "dados": {
    "id": "c48db985-4ab2-431a-8e42-ecf60048e261",
    "nome": "Barbearia Teste Login",
    "descricao": "Barbearia criada especificamente para testar o sistema de login",
    "endereco": {
      "rua": "Rua Teste",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01000-000"
    },
    "contato": {
      "telefone": "(11) 99999-9999",
      "email": "teste@barbearia.com",
      "whatsapp": "(11) 99999-9999"
    },
    "proprietario": {
      "nome": "João da Silva",
      "cpf": "123.456.789-00",
      "email": "joao@barbearia.com"
    },
    "horarioFuncionamento": {
      "segunda": {
        "abertura": "10:00",
        "fechamento": "19:00"
      },
      "terca": {
        "abertura": "10:00",
        "fechamento": "19:00"
      },
      "quarta": {
        "abertura": "10:00",
        "fechamento": "19:00"
      },
      "quinta": {
        "abertura": "10:00",
        "fechamento": "19:00"
      },
      "sexta": {
        "abertura": "10:00",
        "fechamento": "19:00"
      },
      "sabado": {
        "abertura": "09:00",
        "fechamento": "13:00"
      }
    },
    "status": "ativa",
    "dataCadastro": "2025-08-26T13:58:10.000Z",
    "dataAtualizacao": "2025-08-26T14:03:00.000Z",
    "ultimoLogin": "2025-08-26T14:15:30.000Z"
  }
}</pre>
                            </div>
                        </div>
                    </div>

                    <div class="endpoint" id="endpoints-admin-barbearia-update">
                        <div class="endpoint-header">
                            <span class="method put">PUT</span>
                            <span class="url">/api/admin/barbearia</span>
                        </div>
                        <h4>Atualizar dados da barbearia</h4>
                        <p>Permite ao proprietário atualizar os dados da própria barbearia.</p>

                        <div class="params">
                            <h4>Body (JSON) - Todos os campos são opcionais</h4>
                            <div class="code-block">
                                <button class="copy-button" onclick="copyToClipboard(this, JSON.stringify({
  nome: 'Barbearia do João - Centro',
  descricao: 'Nova descrição da barbearia',
  endereco: {
    rua: 'Rua das Flores',
    numero: '125',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567'
  },
  contato: {
    telefone: '(11) 99999-9999',
    email: 'contato@barbeariadoroao.com',
    whatsapp: '(11) 99999-9999'
  },
  proprietario: {
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@barbearia.com'
  },
  horarioFuncionamento: {
    segunda: {
      abertura: '10:00',
      fechamento: '19:00'
    },
    terca: {
      abertura: '10:00',
      fechamento: '19:00'
    },
    quarta: {
      abertura: '10:00',
      fechamento: '19:00'
    },
    quinta: {
      abertura: '10:00',
      fechamento: '19:00'
    },
    sexta: {
      abertura: '10:00',
      fechamento: '19:00'
    },
    sabado: {
      abertura: '09:00',
      fechamento: '13:00'
    }
  }
}, null, 2))">📋 Copiar</button>
                                <pre>{
  "nome": "Barbearia do João - Centro",
  "descricao": "Nova descrição da barbearia",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "125",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "contato": {
    "telefone": "(11) 99999-9999",
    "email": "contato@barbeariadoroao.com",
    "whatsapp": "(11) 99999-9999"
  },
  "proprietario": {
    "nome": "João da Silva",
    "cpf": "123.456.789-00",
    "email": "joao@barbearia.com"
  },
  "horarioFuncionamento": {
    "segunda": {
      "abertura": "10:00",
      "fechamento": "19:00"
    },
    "terca": {
      "abertura": "10:00",
      "fechamento": "19:00"
    },
    "quarta": {
      "abertura": "10:00",
      "fechamento": "19:00"
    },
    "quinta": {
      "abertura": "10:00",
      "fechamento": "19:00"
    },
    "sexta": {
      "abertura": "10:00",
      "fechamento": "19:00"
    },
    "sabado": {
      "abertura": "09:00",
      "fechamento": "13:00"
    }
  }
}</pre>
                            </div>
                        </div>
                    </div>
                </div>
  `;
}

/**
 * GET /api/docs/postman-collection
 * Retorna a collection do Postman em formato JSON
 */
export const downloadPostmanCollection: RequestHandler = (_req, res) => {
  const collection = {
    info: {
      name: "API Barbearia SaaS",
      description: "Collection completa da API de gestão de barbearias",
      version: "1.0.0",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{auth_token}}",
          type: "string",
        },
      ],
    },
    variable: [
      {
        key: "baseUrl",
        value:
          "https://16b54ed7d945437b9ae24bfeca3d4937-f9a6c65b45c74b1aa5cd36a9a.fly.dev",
        type: "string",
      },
      {
        key: "auth_token",
        value: "",
        type: "string",
      },
    ],
    item: [
      {
        name: "🏪 Barbearias",
        item: [
          {
            name: "Listar Barbearias",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/barbearias?limite=10&pagina=1",
                host: ["{{baseUrl}}"],
                path: ["api", "barbearias"],
                query: [
                  { key: "limite", value: "10" },
                  { key: "pagina", value: "1" },
                  { key: "status", value: "ativa", disabled: true },
                  { key: "cidade", value: "São Paulo", disabled: true },
                ],
              },
            },
          },
          {
            name: "Buscar Barbearia por ID",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/barbearias/1",
                host: ["{{baseUrl}}"],
                path: ["api", "barbearias", "1"],
              },
            },
          },
          {
            name: "Criar Barbearia",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "Nova Barbearia",\n  "descricao": "Descrição da barbearia",\n  "endereco": {\n    "rua": "Rua Exemplo",\n    "numero": "456",\n    "bairro": "Bairro",\n    "cidade": "São Paulo",\n    "estado": "SP",\n    "cep": "12345-678"\n  },\n  "contato": {\n    "telefone": "(11) 88888-8888",\n    "email": "nova@barbearia.com"\n  },\n  "proprietario": {\n    "nome": "João Silva",\n    "cpf": "123.456.789-00",\n    "email": "joao@proprietario.com"\n  }\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/barbearias",
                host: ["{{baseUrl}}"],
                path: ["api", "barbearias"],
              },
            },
          },
          {
            name: "Atualizar Barbearia",
            request: {
              method: "PUT",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "Barbearia Atualizada",\n  "descricao": "Nova descrição"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/barbearias/1",
                host: ["{{baseUrl}}"],
                path: ["api", "barbearias", "1"],
              },
            },
          },
          {
            name: "Excluir Barbearia",
            request: {
              method: "DELETE",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/barbearias/1",
                host: ["{{baseUrl}}"],
                path: ["api", "barbearias", "1"],
              },
            },
          },
        ],
      },
      {
        name: "💇‍♂️ Barbeiros",
        item: [
          {
            name: "Listar Barbeiros",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/barbeiros",
                host: ["{{baseUrl}}"],
                path: ["api", "barbeiros"],
              },
            },
          },
          {
            name: "Buscar Barbeiro por ID",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/barbeiros/1",
                host: ["{{baseUrl}}"],
                path: ["api", "barbeiros", "1"],
              },
            },
          },
          {
            name: "Criar Barbeiro",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "Carlos Silva",\n  "email": "carlos@barbearia.com",\n  "telefone": "(11) 99999-9999",\n  "cpf": "111.222.333-44",\n  "tipo": "comissionado",\n  "porcentagemComissao": 40,\n  "barbeariaId": "1",\n  "especialidades": ["Corte masculino", "Barba"]\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/barbeiros",
                host: ["{{baseUrl}}"],
                path: ["api", "barbeiros"],
              },
            },
          },
        ],
      },
      {
        name: "✂️ Serviços",
        item: [
          {
            name: "Listar Serviços",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/servicos",
                host: ["{{baseUrl}}"],
                path: ["api", "servicos"],
              },
            },
          },
          {
            name: "Criar Serviço",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "Corte + Barba",\n  "descricao": "Pacote completo de corte e barba",\n  "preco": 55.00,\n  "duracaoMinutos": 75,\n  "barbeariaId": "1",\n  "categoria": "combo"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/servicos",
                host: ["{{baseUrl}}"],
                path: ["api", "servicos"],
              },
            },
          },
        ],
      },
      {
        name: "🎁 Combos",
        item: [
          {
            name: "Listar Combos",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/combos",
                host: ["{{baseUrl}}"],
                path: ["api", "combos"],
              },
            },
          },
          {
            name: "Criar Combo",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "Combo Completo",\n  "descricao": "Corte + barba + sobrancelha",\n  "barbeariaId": "1",\n  "servicoIds": ["1", "2", "4"],\n  "tipoDesconto": "percentual",\n  "valorDesconto": 15.00\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/combos",
                host: ["{{baseUrl}}"],
                path: ["api", "combos"],
              },
            },
          },
        ],
      },
      {
        name: "👥 Clientes",
        item: [
          {
            name: "Listar Clientes",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/clientes",
                host: ["{{baseUrl}}"],
                path: ["api", "clientes"],
              },
            },
          },
          {
            name: "Criar Cliente",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "nome": "João Silva",\n  "celular": "11987654321",\n  "senha": "minhasenha123",\n  "email": "joao@email.com",\n  "tipoLogin": "celular"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/clientes",
                host: ["{{baseUrl}}"],
                path: ["api", "clientes"],
              },
            },
          },
          {
            name: "Perfil do Cliente (Me)",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{auth_token}}",
                },
              ],
              url: {
                raw: "{{baseUrl}}/api/clientes/me",
                host: ["{{baseUrl}}"],
                path: ["api", "clientes", "me"],
              },
            },
          },
        ],
      },
      {
        name: "🔐 Autenticação",
        item: [
          {
            name: "Login por Celular",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "if (pm.response.code === 200) {",
                    "    const response = pm.response.json();",
                    "    if (response.sucesso && response.dados.token) {",
                    "        pm.collectionVariables.set('auth_token', response.dados.token);",
                    "        console.log('Token salvo automaticamente');",
                    "    }",
                    "}",
                  ],
                  type: "text/javascript",
                },
              },
            ],
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "celular": "11987654321",\n  "senha": "minhasenha123"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/login/celular",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "login", "celular"],
              },
            },
          },
          {
            name: "Login Google",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "googleToken": "google_oauth_token_aqui",\n  "googleId": "google_user_id_123",\n  "email": "usuario@gmail.com",\n  "nome": "Nome do Usuario",\n  "foto": "https://lh3.googleusercontent.com/..."\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/login/google",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "login", "google"],
              },
            },
          },
          {
            name: "Login Barbearia",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "email": "admin@barbeariadoroao.com",\n  "senha": "senha123"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/login/barbearia",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "login", "barbearia"],
              },
            },
          },
          {
            name: "Login Barbeiro",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "email": "carlos@barbeariadoroao.com",\n  "senha": "senha123"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/login/barbeiro",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "login", "barbeiro"],
              },
            },
          },
          {
            name: "Verificar Token",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "token": "{{auth_token}}"\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/verificar-token",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "verificar-token"],
              },
            },
          },
          {
            name: "Refresh Token",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json",
                },
              ],
              body: {
                mode: "raw",
                raw: '{\n  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n}',
              },
              url: {
                raw: "{{baseUrl}}/api/auth/refresh-token",
                host: ["{{baseUrl}}"],
                path: ["api", "auth", "refresh-token"],
              },
            },
          },
        ],
      },
      {
        name: "📂 APIs de Diretório",
        item: [
          {
            name: "Busca Pública de Barbearias",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/barbearias?q=João&cidade=São Paulo&ordenar=relevancia&limite=10",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "barbearias"],
                query: [
                  { key: "q", value: "João" },
                  { key: "cidade", value: "São Paulo" },
                  { key: "estado", value: "SP", disabled: true },
                  { key: "ordenar", value: "relevancia" },
                  { key: "limite", value: "10" },
                  { key: "pagina", value: "1", disabled: true },
                ],
              },
            },
          },
          {
            name: "Listar Todas as Barbearias",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/barbearias/todas?limite=50&pagina=1&ordenar=nome",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "barbearias", "todas"],
                query: [
                  { key: "limite", value: "50" },
                  { key: "pagina", value: "1" },
                  {
                    key: "ordenar",
                    value: "nome",
                    description: "nome, data_cadastro, cidade",
                  },
                ],
              },
            },
          },
          {
            name: "Listar Cidades",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/cidades",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "cidades"],
              },
            },
          },
          {
            name: "Estatísticas do Diretório",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/estatisticas",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "estatisticas"],
              },
            },
          },
          {
            name: "Sugestões de Busca",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/sugestoes?q=bar",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "sugestoes"],
                query: [{ key: "q", value: "bar" }],
              },
            },
          },
          {
            name: "Detalhes da Barbearia",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/barbearia/1/detalhes",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "barbearia", "1", "detalhes"],
              },
            },
          },
          {
            name: "Promoções Ativas",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/diretorio/promocoes?cidade=São Paulo",
                host: ["{{baseUrl}}"],
                path: ["api", "diretorio", "promocoes"],
                query: [
                  { key: "cidade", value: "São Paulo" },
                  { key: "estado", value: "SP", disabled: true },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Barbearia-API-Collection.json"',
  );
  res.json(collection);
};
