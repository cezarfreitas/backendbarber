import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDatabase } from "./config/database";
import { initializeTables, checkTables } from "./config/init-database";
import { handleDemo } from "./routes/demo";
import {
  listarBarbearias,
  buscarBarbearia,
  criarBarbearia,
  atualizarBarbearia,
  excluirBarbearia
} from "./routes/barbearias";
import {
  listarBarbeiros,
  buscarBarbeiro,
  criarBarbeiro,
  atualizarBarbeiro,
  excluirBarbeiro
} from "./routes/barbeiros";
import {
  listarServicos,
  buscarServico,
  criarServico,
  atualizarServico,
  excluirServico
} from "./routes/servicos";
import {
  listarCombos,
  buscarCombo,
  criarCombo,
  atualizarCombo,
  excluirCombo
} from "./routes/combos";
import {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  excluirCliente,
  buscarPerfilCliente
} from "./routes/clientes";
import {
  loginCelular,
  loginGoogle,
  verificarTokenAuth,
  alterarSenha,
  refreshTokenAuth
} from "./routes/auth";
import { verificarAutenticacao } from "./utils/auth";
import { mostrarDocumentacao } from "./routes/docs";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Documentação da API
  app.get("/api/docs", mostrarDocumentacao);
  app.get("/docs", mostrarDocumentacao);
  app.get("/", (_req, res) => {
    res.redirect("/docs");
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Rotas das barbearias
  app.get("/api/barbearias", listarBarbearias);
  app.get("/api/barbearias/:id", buscarBarbearia);
  app.post("/api/barbearias", criarBarbearia);
  app.put("/api/barbearias/:id", atualizarBarbearia);
  app.delete("/api/barbearias/:id", excluirBarbearia);

  // Rotas dos barbeiros
  app.get("/api/barbeiros", listarBarbeiros);
  app.get("/api/barbeiros/:id", buscarBarbeiro);
  app.post("/api/barbeiros", criarBarbeiro);
  app.put("/api/barbeiros/:id", atualizarBarbeiro);
  app.delete("/api/barbeiros/:id", excluirBarbeiro);

  // Rotas dos serviços
  app.get("/api/servicos", listarServicos);
  app.get("/api/servicos/:id", buscarServico);
  app.post("/api/servicos", criarServico);
  app.put("/api/servicos/:id", atualizarServico);
  app.delete("/api/servicos/:id", excluirServico);

  // Rotas dos combos
  app.get("/api/combos", listarCombos);
  app.get("/api/combos/:id", buscarCombo);
  app.post("/api/combos", criarCombo);
  app.put("/api/combos/:id", atualizarCombo);
  app.delete("/api/combos/:id", excluirCombo);

  return app;
}

// Inicializar banco de dados ao iniciar o servidor
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await initDatabase();

      // Verificar se as tabelas existem
      const tablesExist = await checkTables();
      if (!tablesExist) {
        console.log('🔧 Tabelas não encontradas, criando estrutura do banco...');
        await initializeTables();
      } else {
        console.log('✅ Estrutura do banco de dados verificada');
        // Força a criação das tabelas de combos se não existirem
        console.log('🔄 Verificando tabelas de combos...');
        await initializeTables();
      }

    } catch (error) {
      console.error('Falha ao inicializar banco de dados:', error);
      process.exit(1);
    }
  })();
}
