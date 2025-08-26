import { executeQuery, initDatabase } from "./database";

/**
 * Script para criar e inicializar as tabelas do banco de dados
 */

/**
 * Executa query com retry em caso de deadlock
 */
const executeQueryWithRetry = async (
  sql: string,
  maxRetries = 3,
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeQuery(sql);
    } catch (error: any) {
      if (error.code === "ER_LOCK_DEADLOCK" && attempt < maxRetries) {
        console.log(
          `⚠️ Deadlock detectado, tentativa ${attempt}/${maxRetries}. Aguardando ${attempt * 1000}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }
      throw error;
    }
  }
};

/**
 * Verifica se dados já existem na tabela antes de inserir
 */
const checkDataExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await executeQuery(
      `SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`,
    );
    return (result as any[])[0]?.count > 0;
  } catch (error) {
    return false;
  }
};

// SQL para criar tabela de barbearias
const createBarbeariasTable = `
CREATE TABLE IF NOT EXISTS barbearias (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  endereco_rua VARCHAR(255) NOT NULL,
  endereco_numero VARCHAR(50) NOT NULL,
  endereco_bairro VARCHAR(100) NOT NULL,
  endereco_cidade VARCHAR(100) NOT NULL,
  endereco_estado VARCHAR(2) NOT NULL,
  endereco_cep VARCHAR(10) NOT NULL,
  contato_telefone VARCHAR(20) NOT NULL,
  contato_email VARCHAR(255) NOT NULL UNIQUE,
  contato_whatsapp VARCHAR(20),
  proprietario_nome VARCHAR(255) NOT NULL,
  proprietario_cpf VARCHAR(14) NOT NULL,
  proprietario_email VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255), -- Hash da senha para autenticação
  horario_funcionamento JSON,
  status ENUM('ativa', 'inativa', 'pendente') DEFAULT 'pendente',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL, -- Data do último login
  INDEX idx_status (status),
  INDEX idx_cidade (endereco_cidade),
  INDEX idx_email (contato_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de barbeiros
const createBarbeirosTable = `
CREATE TABLE IF NOT EXISTS barbeiros (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  senha_hash VARCHAR(255), -- Hash da senha para autenticação
  tipo ENUM('comissionado', 'funcionario', 'freelancer') NOT NULL,
  porcentagem_comissao DECIMAL(5,2) NULL,
  salario_fixo DECIMAL(10,2) NULL,
  valor_hora DECIMAL(10,2) NULL,
  barbearia_id VARCHAR(36) NOT NULL,
  especialidades JSON,
  horario_trabalho JSON,
  status ENUM('ativo', 'inativo', 'afastado') DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL, -- Data do último login
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_status (status),
  INDEX idx_tipo (tipo),
  INDEX idx_email (email),
  INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de serviços
const createServicosTable = `
CREATE TABLE IF NOT EXISTS servicos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INT NOT NULL,
  barbearia_id VARCHAR(36) NOT NULL,
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_categoria (categoria),
  INDEX idx_ativo (ativo),
  INDEX idx_preco (preco),
  UNIQUE KEY unique_nome_barbearia (nome, barbearia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de combos
const createCombosTable = `
CREATE TABLE IF NOT EXISTS combos (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  barbearia_id VARCHAR(36) NOT NULL,
  valor_original DECIMAL(10,2) NOT NULL,
  valor_combo DECIMAL(10,2) NOT NULL,
  tipo_desconto ENUM('valor', 'percentual') NOT NULL,
  valor_desconto DECIMAL(10,2) NOT NULL,
  duracao_total_minutos INT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_barbearia (barbearia_id),
  INDEX idx_ativo (ativo),
  INDEX idx_valor_combo (valor_combo),
  UNIQUE KEY unique_nome_barbearia (nome, barbearia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de relação combo-serviços (many-to-many)
const createComboServicosTable = `
CREATE TABLE IF NOT EXISTS combo_servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  combo_id VARCHAR(36) NOT NULL,
  servico_id VARCHAR(36) NOT NULL,
  ordem INT DEFAULT 1,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_combo_servico (combo_id, servico_id),
  INDEX idx_combo (combo_id),
  INDEX idx_servico (servico_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL para criar tabela de clientes
const createClientesTable = `
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(36) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  celular VARCHAR(20) NOT NULL UNIQUE,
  senha_hash VARCHAR(255), -- Hash da senha (nullable para Google login)
  data_nascimento DATE,
  foto VARCHAR(500), -- URL da foto de perfil
  endereco_rua VARCHAR(255),
  endereco_numero VARCHAR(50),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_estado VARCHAR(2),
  endereco_cep VARCHAR(10),
  barbearia_preferida VARCHAR(36),
  barbeiro_preferido VARCHAR(36),
  servicos_preferidos JSON, -- Array de IDs dos serviços preferidos
  tipo_login ENUM('celular', 'google', 'ambos') NOT NULL DEFAULT 'celular',
  google_id VARCHAR(255), -- ID único do Google OAuth
  email_verificado BOOLEAN DEFAULT FALSE,
  celular_verificado BOOLEAN DEFAULT FALSE,
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL,
  INDEX idx_celular (celular),
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_status (status),
  INDEX idx_barbearia_preferida (barbearia_preferida),
  INDEX idx_barbeiro_preferido (barbeiro_preferido),
  UNIQUE KEY unique_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Dados iniciais para barbearias
const insertInitialBarbearias = `
INSERT IGNORE INTO barbearias (
  id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
  endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
  contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
  proprietario_email, senha_hash, horario_funcionamento, status
) VALUES
(
  '1',
  'Barbearia do João',
  'A melhor barbearia do bairro, com mais de 20 anos de tradição',
  'Rua das Flores',
  '123',
  'Centro',
  'São Paulo',
  'SP',
  '01234-567',
  '(11) 99999-9999',
  'contato@barbeariadoroao.com',
  '(11) 99999-9999',
  'João Silva',
  '123.456.789-00',
  'joao@barbeariadoroao.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  '{"segunda": {"abertura": "08:00", "fechamento": "18:00"}, "terca": {"abertura": "08:00", "fechamento": "18:00"}, "quarta": {"abertura": "08:00", "fechamento": "18:00"}, "quinta": {"abertura": "08:00", "fechamento": "18:00"}, "sexta": {"abertura": "08:00", "fechamento": "18:00"}, "sabado": {"abertura": "08:00", "fechamento": "16:00"}}',
  'ativa'
),
(
  '2',
  'BarberShop Premium',
  'Barbearia moderna com serviços premium',
  'Av. Paulista',
  '1500',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  '(11) 88888-8888',
  'contato@barbershoppremium.com',
  NULL,
  'Maria Santos',
  '987.654.321-00',
  'maria@barbershoppremium.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  '{"segunda": {"abertura": "09:00", "fechamento": "19:00"}, "terca": {"abertura": "09:00", "fechamento": "19:00"}, "quarta": {"abertura": "09:00", "fechamento": "19:00"}, "quinta": {"abertura": "09:00", "fechamento": "19:00"}, "sexta": {"abertura": "09:00", "fechamento": "19:00"}, "sabado": {"abertura": "09:00", "fechamento": "17:00"}}',
  'ativa'
);
`;

// Dados iniciais para barbeiros
const insertMoreBarbearias = `
INSERT IGNORE INTO barbearias (
  id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
  endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
  contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
  proprietario_email, senha_hash, horario_funcionamento, status
) VALUES
(
  '3',
  'Barbearia Central',
  'Clássica no coração do Rio',
  'Rua da Lapa',
  '45',
  'Centro',
  'Rio de Janeiro',
  'RJ',
  '20021-180',
  '(21) 99999-1111',
  'contato@barbeariacentral.com',
  '(21) 99999-1111',
  'Paulo Nogueira',
  '123.321.123-00',
  'paulo@barbeariacentral.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2',
  '{"segunda": {"abertura": "09:00", "fechamento": "19:00"}, "terca": {"abertura": "09:00", "fechamento": "19:00"}, "quarta": {"abertura": "09:00", "fechamento": "19:00"}, "quinta": {"abertura": "09:00", "fechamento": "19:00"}, "sexta": {"abertura": "09:00", "fechamento": "19:00"}, "sabado": {"abertura": "09:00", "fechamento": "15:00"}}',
  'ativa'
),
(
  '4',
  'Barba & Bigode',
  'Atendimento premium em BH',
  'Av. Afonso Pena',
  '1200',
  'Centro',
  'Belo Horizonte',
  'MG',
  '30130-000',
  '(31) 98888-2222',
  'contato@barbaebigodebh.com',
  NULL,
  'Luiz Andrade',
  '456.654.456-11',
  'luiz@barbaebigodebh.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2',
  '{"segunda": {"abertura": "09:00", "fechamento": "19:00"}, "terca": {"abertura": "09:00", "fechamento": "19:00"}, "quarta": {"abertura": "09:00", "fechamento": "19:00"}, "quinta": {"abertura": "09:00", "fechamento": "19:00"}, "sexta": {"abertura": "09:00", "fechamento": "19:00"}}',
  'ativa'
),
(
  '5',
  'Porto Alegre Barber',
  'Tradição e estilo no Sul',
  'Rua dos Andradas',
  '900',
  'Centro',
  'Porto Alegre',
  'RS',
  '90020-005',
  '(51) 97777-3333',
  'contato@poabarber.com',
  '(51) 97777-3333',
  'Marcos Dias',
  '789.987.789-22',
  'marcos@poabarber.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2',
  '{"segunda": {"abertura": "08:30", "fechamento": "18:30"}, "terca": {"abertura": "08:30", "fechamento": "18:30"}, "quarta": {"abertura": "08:30", "fechamento": "18:30"}, "quinta": {"abertura": "08:30", "fechamento": "18:30"}, "sexta": {"abertura": "08:30", "fechamento": "18:30"}, "sabado": {"abertura": "09:00", "fechamento": "14:00"}}',
  'ativa'
),
(
  '6',
  'Curitiba Cuts',
  'Detalhe e precisão em Curitiba',
  'Rua XV de Novembro',
  '321',
  'Centro',
  'Curitiba',
  'PR',
  '80020-310',
  '(41) 96666-4444',
  'contato@curitibacuts.com',
  NULL,
  'Fábio Souza',
  '321.123.321-33',
  'fabio@curitibacuts.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2',
  '{"segunda": {"abertura": "09:00", "fechamento": "19:00"}, "terca": {"abertura": "09:00", "fechamento": "19:00"}, "quarta": {"abertura": "09:00", "fechamento": "19:00"}, "quinta": {"abertura": "09:00", "fechamento": "19:00"}, "sexta": {"abertura": "09:00", "fechamento": "19:00"}}',
  'ativa'
),
(
  '7',
  'Salvador Style',
  'Cortes com swing baiano',
  'Av. Sete de Setembro',
  '777',
  'Vitória',
  'Salvador',
  'BA',
  '40060-001',
  '(71) 95555-5555',
  'contato@salvadorstyle.com',
  '(71) 95555-5555',
  'Renato Lima',
  '654.456.654-44',
  'renato@salvadorstyle.com',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2',
  '{"segunda": {"abertura": "10:00", "fechamento": "19:00"}, "terca": {"abertura": "10:00", "fechamento": "19:00"}, "quarta": {"abertura": "10:00", "fechamento": "19:00"}, "quinta": {"abertura": "10:00", "fechamento": "19:00"}, "sexta": {"abertura": "10:00", "fechamento": "19:00"}, "sabado": {"abertura": "09:00", "fechamento": "13:00"}}',
  'ativa'
);
`;

const insertInitialBarbeiros = `
INSERT IGNORE INTO barbeiros (
  id, nome, email, telefone, cpf, senha_hash, tipo, porcentagem_comissao, salario_fixo,
  valor_hora, barbearia_id, especialidades, horario_trabalho, status
) VALUES
(
  '1',
  'Carlos Silva',
  'carlos@barbeariadoroao.com',
  '(11) 98888-7777',
  '111.222.333-44',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  'comissionado',
  40.00,
  NULL,
  NULL,
  '1',
  '["Corte masculino", "Barba", "Bigode"]',
  '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": {"inicio": "08:00", "fim": "16:00"}}',
  'ativo'
),
(
  '2',
  'Ricardo Santos',
  'ricardo@barbeariadoroao.com',
  '(11) 97777-6666',
  '222.333.444-55',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  'funcionario',
  NULL,
  3500.00,
  NULL,
  '1',
  '["Corte feminino", "Coloração", "Tratamentos"]',
  '{"terca": {"inicio": "09:00", "fim": "19:00"}, "quarta": {"inicio": "09:00", "fim": "19:00"}, "quinta": {"inicio": "09:00", "fim": "19:00"}, "sexta": {"inicio": "09:00", "fim": "19:00"}, "sabado": {"inicio": "09:00", "fim": "17:00"}}',
  'ativo'
),
(
  '3',
  'Ana Costa',
  'ana@barbershoppremium.com',
  '(11) 96666-5555',
  '333.444.555-66',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  'freelancer',
  NULL,
  NULL,
  80.00,
  '2',
  '["Corte premium", "Barba premium", "Design de sobrancelhas"]',
  '{"segunda": {"inicio": "10:00", "fim": "16:00"}, "quarta": {"inicio": "10:00", "fim": "16:00"}, "sexta": {"inicio": "10:00", "fim": "16:00"}}',
  'ativo'
);
`;

// Dados iniciais para serviços (removendo o combo manual da lista de serviços)
const insertInitialServicos = `
INSERT IGNORE INTO servicos (
  id, nome, descricao, preco, duracao_minutos, barbearia_id, categoria, ativo
) VALUES
('1', 'Corte Masculino Tradicional', 'Corte clássico masculino com acabamento na navalha', 35.00, 45, '1', 'corte', true),
('2', 'Barba Completa', 'Aparar, modelar e finalizar barba com produtos premium', 25.00, 30, '1', 'barba', true),
('4', 'Sobrancelha Masculina', 'Design e limpeza de sobrancelhas masculinas', 20.00, 20, '1', 'design', true),
('8', 'Lavagem de Cabelo', 'Lavagem profissional com shampoo premium', 15.00, 15, '1', 'lavagem', true),
('5', 'Corte Premium Executive', 'Corte executivo com lavagem, corte e finalizações premium', 80.00, 60, '2', 'corte', true),
('6', 'Barba Premium', 'Tratamento completo da barba com produtos importados', 50.00, 45, '2', 'barba', true),
('7', 'Tratamento Capilar', 'Hidratação e tratamento do couro cabeludo', 40.00, 30, '2', 'tratamento', true),
('9', 'Relaxamento', 'Relaxamento com produtos importados', 60.00, 45, '2', 'tratamento', true);
`;

// Dados iniciais para combos
const insertInitialCombos = `
INSERT IGNORE INTO combos (
  id, nome, descricao, barbearia_id, valor_original, valor_combo,
  tipo_desconto, valor_desconto, duracao_total_minutos, ativo
) VALUES
(
  'combo1',
  'Corte + Barba Tradicional',
  'Combo clássico: corte masculino + barba completa com desconto especial',
  '1',
  60.00,
  50.00,
  'valor',
  10.00,
  75,
  true
),
(
  'combo2',
  'Pacote Completo Masculino',
  'Corte + barba + sobrancelha - economia de 15%',
  '1',
  80.00,
  68.00,
  'percentual',
  15.00,
  95,
  true
),
(
  'combo3',
  'Premium Executive',
  'Corte premium + barba premium + tratamento capilar',
  '2',
  170.00,
  140.00,
  'valor',
  30.00,
  135,
  true
),
(
  'combo4',
  'Relax Total',
  'Corte premium + tratamento + relaxamento com 20% de desconto',
  '2',
  180.00,
  144.00,
  'percentual',
  20.00,
  135,
  true
);
`;

// Dados iniciais para relação combo-serviços
const insertInitialComboServicos = `
INSERT IGNORE INTO combo_servicos (combo_id, servico_id, ordem) VALUES
-- Combo 1: Corte + Barba Tradicional
('combo1', '1', 1), -- Corte Masculino Tradicional
('combo1', '2', 2), -- Barba Completa

-- Combo 2: Pacote Completo Masculino
('combo2', '1', 1), -- Corte Masculino Tradicional
('combo2', '2', 2), -- Barba Completa
('combo2', '4', 3), -- Sobrancelha Masculina

-- Combo 3: Premium Executive
('combo3', '5', 1), -- Corte Premium Executive
('combo3', '6', 2), -- Barba Premium
('combo3', '7', 3), -- Tratamento Capilar

-- Combo 4: Relax Total
('combo4', '5', 1), -- Corte Premium Executive
('combo4', '7', 2), -- Tratamento Capilar
('combo4', '9', 3); -- Relaxamento
`;

// Dados iniciais para clientes
const insertInitialClientes = `
INSERT IGNORE INTO clientes (
  id, nome, email, celular, senha_hash, data_nascimento, endereco_cidade,
  endereco_estado, barbearia_preferida, barbeiro_preferido,
  servicos_preferidos, tipo_login, email_verificado, celular_verificado, status
) VALUES
(
  'cliente1',
  'João Santos',
  'joao.santos@email.com',
  '(11) 98765-4321',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  '1990-05-15',
  'São Paulo',
  'SP',
  '1',
  '1',
  '["1", "2"]',
  'celular',
  true,
  true,
  'ativo'
),
(
  'cliente2',
  'Maria Silva',
  'maria.silva@gmail.com',
  '(11) 97654-3210',
  NULL, -- Login apenas por Google
  '1985-12-03',
  'São Paulo',
  'SP',
  '2',
  '3',
  '["5", "6", "7"]',
  'google',
  true,
  false,
  'ativo'
),
(
  'cliente3',
  'Pedro Oliveira',
  'pedro.oliveira@email.com',
  '(11) 96543-2109',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  '1992-08-20',
  'São Paulo',
  'SP',
  '1',
  '2',
  '["1", "4"]',
  'celular',
  true,
  true,
  'ativo'
),
(
  'cliente4',
  'Ana Costa',
  'ana.costa@email.com',
  '(11) 95432-1098',
  '$2b$10$rWRsQ8zJVx5Gx4U.wGpgI.CZLQPq1MjPcLzJhV6LfPwWvBzqR5Hk2', -- senha: 123456
  '1988-11-10',
  'São Paulo',
  'SP',
  '2',
  NULL,
  '["1", "4"]',
  'ambos',
  true,
  true,
  'ativo'
);
`;

/**
 * Função principal para inicializar o banco de dados
 */
export const initializeTables = async (): Promise<void> => {
  try {
    console.log("🗄️ Inicializando estrutura do banco de dados...");

    // Migrar tabelas existentes PRIMEIRO, antes de criar novas
    console.log("🔄 Verificando e migrando tabelas para autenticação...");
    await migrarTabelasParaAutenticacao();

    // Criar tabelas na ordem correta (respeitando foreign keys)
    console.log("📋 Criando tabela barbearias...");
    await executeQuery(createBarbeariasTable);

    console.log("👨‍💼 Criando tabela barbeiros...");
    await executeQuery(createBarbeirosTable);

    console.log("✂️ Criando tabela servicos...");
    await executeQuery(createServicosTable);

    console.log("�� Criando tabela combos...");
    await executeQuery(createCombosTable);

    console.log("🔗 Criando tabela combo_servicos...");
    await executeQuery(createComboServicosTable);

    console.log("👥 Criando tabela clientes...");
    await executeQuery(createClientesTable);

    // Migrar novamente após criação das tabelas para garantir que todas tenham os campos
    console.log("🔄 Verificando campos de autenticação novamente...");
    await migrarTabelasParaAutenticacao();

    // Inserir dados iniciais na ordem correta (com verificação)
    console.log("📝 Inserindo dados iniciais...");

    const barbeariasHasData = await checkDataExists("barbearias");
    if (!barbeariasHasData) {
      console.log("📝 Inserindo barbearias...");
      await executeQueryWithRetry(insertInitialBarbearias);
    } else {
      console.log("ℹ️ Dados já existem em barbearias, pulando inserção");
    }

    // Garantir mocks adicionais de barbearias
    await executeQueryWithRetry(insertMoreBarbearias);

    const barbeirosHasData = await checkDataExists("barbeiros");
    if (!barbeirosHasData) {
      console.log("📝 Inserindo barbeiros...");
      await executeQueryWithRetry(insertInitialBarbeiros);
    } else {
      console.log("ℹ️ Dados já existem em barbeiros, pulando inserção");
    }

    const servicosHasData = await checkDataExists("servicos");
    if (!servicosHasData) {
      console.log("📝 Inserindo serviços...");
      await executeQueryWithRetry(insertInitialServicos);
    } else {
      console.log("ℹ️ Dados já existem em servicos, pulando inserção");
    }

    const combosHasData = await checkDataExists("combos");
    if (!combosHasData) {
      console.log("📝 Inserindo combos...");
      await executeQueryWithRetry(insertInitialCombos);
    } else {
      console.log("ℹ️ Dados já existem em combos, pulando inserção");
    }

    const comboServicosHasData = await checkDataExists("combo_servicos");
    if (!comboServicosHasData) {
      console.log("📝 Inserindo relações combo-serviços...");
      await executeQueryWithRetry(insertInitialComboServicos);
    } else {
      console.log("ℹ️ Dados já existem em combo_servicos, pulando inserção");
    }

    const clientesHasData = await checkDataExists("clientes");
    if (!clientesHasData) {
      console.log("📝 Inserindo clientes...");
      await executeQueryWithRetry(insertInitialClientes);
    } else {
      console.log("ℹ️ Dados já existem em clientes, pulando inserção");
    }

    console.log("✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    throw error;
  }
};

/**
 * Função para migrar tabelas existentes adicionando campos de autenticação
 */
const migrarTabelasParaAutenticacao = async (): Promise<void> => {
  try {
    // Verificar se a tabela barbearias existe
    const barbeariasExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'barbearias'
    `);

    if ((barbeariasExists as any[])[0]?.count > 0) {
      // Verificar e adicionar campos na tabela barbearias
      const barbeariaColumns = await executeQuery(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'barbearias'
      `);

      const hasPasswordHash = (barbeariaColumns as any[]).some(
        (col) => col.COLUMN_NAME === "senha_hash",
      );
      const hasLastLogin = (barbeariaColumns as any[]).some(
        (col) => col.COLUMN_NAME === "ultimo_login",
      );

      if (!hasPasswordHash) {
        console.log("🔧 Adicionando campo senha_hash na tabela barbearias...");
        try {
          await executeQuery(`
            ALTER TABLE barbearias
            ADD COLUMN senha_hash VARCHAR(255)
          `);
          console.log("✅ Campo senha_hash adicionado à tabela barbearias");
        } catch (alterError: any) {
          console.error(
            "❌ Erro ao adicionar senha_hash à barbearias:",
            alterError.message,
          );
        }
      } else {
        console.log("ℹ️ Campo senha_hash já existe na tabela barbearias");
      }

      if (!hasLastLogin) {
        console.log(
          "🔧 Adicionando campo ultimo_login na tabela barbearias...",
        );
        try {
          await executeQuery(`
            ALTER TABLE barbearias
            ADD COLUMN ultimo_login TIMESTAMP NULL
          `);
          console.log("✅ Campo ultimo_login adicionado à tabela barbearias");
        } catch (alterError: any) {
          console.error(
            "❌ Erro ao adicionar ultimo_login à barbearias:",
            alterError.message,
          );
        }
      } else {
        console.log("ℹ️ Campo ultimo_login já existe na tabela barbearias");
      }
    }

    // Verificar se a tabela barbeiros existe
    const barbeirosExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'barbeiros'
    `);

    if ((barbeirosExists as any[])[0]?.count > 0) {
      // Verificar e adicionar campos na tabela barbeiros
      const barbeiroColumns = await executeQuery(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'barbeiros'
      `);

      const barbeiroHasPasswordHash = (barbeiroColumns as any[]).some(
        (col) => col.COLUMN_NAME === "senha_hash",
      );
      const barbeiroHasLastLogin = (barbeiroColumns as any[]).some(
        (col) => col.COLUMN_NAME === "ultimo_login",
      );

      if (!barbeiroHasPasswordHash) {
        console.log("🔧 Adicionando campo senha_hash na tabela barbeiros...");
        try {
          await executeQuery(`
            ALTER TABLE barbeiros
            ADD COLUMN senha_hash VARCHAR(255)
          `);
          console.log("✅ Campo senha_hash adicionado à tabela barbeiros");
        } catch (alterError: any) {
          console.error(
            "❌ Erro ao adicionar senha_hash à barbeiros:",
            alterError.message,
          );
        }
      } else {
        console.log("ℹ️ Campo senha_hash já existe na tabela barbeiros");
      }

      if (!barbeiroHasLastLogin) {
        console.log("🔧 Adicionando campo ultimo_login na tabela barbeiros...");
        try {
          await executeQuery(`
            ALTER TABLE barbeiros
            ADD COLUMN ultimo_login TIMESTAMP NULL
          `);
          console.log("✅ Campo ultimo_login adicionado à tabela barbeiros");
        } catch (alterError: any) {
          console.error(
            "❌ Erro ao adicionar ultimo_login à barbeiros:",
            alterError.message,
          );
        }
      } else {
        console.log("ℹ️ Campo ultimo_login já existe na tabela barbeiros");
      }
    }

    console.log("✅ Migração de autenticação concluída!");
  } catch (error: any) {
    console.error("⚠️ Erro na migração de autenticação:", error.message);
    // Não falha o processo, pois pode ser que as tabelas ainda não existam
  }
};

/**
 * Função para verificar se as tabelas existem
 */
export const checkTables = async (): Promise<boolean> => {
  try {
    const tables = await executeQuery(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('barbearias', 'barbeiros', 'servicos', 'combos', 'combo_servicos', 'clientes')
    `);

    return (tables as any[]).length === 6;
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error);
    return false;
  }
};

/**
 * Função para reset completo do banco - Remove e recria todas as tabelas
 * ⚠️ CUIDADO: Esta função apaga TODOS os dados!
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log("🗑️ INICIANDO RESET COMPLETO DO BANCO DE DADOS...");
    console.log("⚠️ ATENÇÃO: Todos os dados serão perdidos!");

    // Desabilitar verificações de foreign key temporariamente
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

    // Dropar tabelas na ordem inversa (para respeitar foreign keys)
    const tablesToDrop = [
      'combo_servicos',
      'combos',
      'servicos',
      'barbeiros',
      'clientes',
      'barbearias'
    ];

    for (const table of tablesToDrop) {
      try {
        console.log(`🗑️ Removendo tabela ${table}...`);
        await executeQuery(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Tabela ${table} removida`);
      } catch (error: any) {
        console.error(`❌ Erro ao remover tabela ${table}:`, error.message);
      }
    }

    // Reabilitar verificações de foreign key
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    console.log("✅ Todas as tabelas foram removidas com sucesso!");
    console.log("🔄 Recriando estrutura do banco...");

    // Recriar toda a estrutura
    await initializeTables();

    console.log("✅ RESET COMPLETO CONCLUÍDO! Banco de dados recriado com dados iniciais.");
  } catch (error) {
    console.error("❌ Erro durante o reset do banco:", error);
    throw error;
  }
};

/**
 * Função para limpar apenas os dados (manter estrutura das tabelas)
 */
export const clearData = async (): Promise<void> => {
  try {
    console.log("🧹 Limpando dados das tabelas...");

    // Desabilitar verificações de foreign key temporariamente
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

    // Limpar tabelas na ordem correta
    const tablesToClear = [
      'combo_servicos',
      'combos',
      'servicos',
      'barbeiros',
      'clientes',
      'barbearias'
    ];

    for (const table of tablesToClear) {
      try {
        console.log(`🧹 Limpando dados da tabela ${table}...`);
        await executeQuery(`DELETE FROM ${table}`);
        console.log(`✅ Dados da tabela ${table} removidos`);
      } catch (error: any) {
        console.error(`❌ Erro ao limpar tabela ${table}:`, error.message);
      }
    }

    // Reabilitar verificações de foreign key
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    console.log("✅ Dados removidos com sucesso!");
    console.log("🔄 Inserindo dados iniciais...");

    // Reinserir dados iniciais
    await executeQueryWithRetry(insertInitialBarbearias);
    await executeQueryWithRetry(insertMoreBarbearias);
    await executeQueryWithRetry(insertInitialBarbeiros);
    await executeQueryWithRetry(insertInitialServicos);
    await executeQueryWithRetry(insertInitialCombos);
    await executeQueryWithRetry(insertInitialComboServicos);
    await executeQueryWithRetry(insertInitialClientes);

    console.log("✅ DADOS RESTAURADOS! Banco recriado com dados iniciais.");
  } catch (error) {
    console.error("❌ Erro durante a limpeza dos dados:", error);
    throw error;
  }
};
