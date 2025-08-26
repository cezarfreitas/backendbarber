import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "./config/database";
import { initializeTables, checkTables } from "./config/init-database";
import { handleDemo } from "./routes/demo";
import {
  listarBarbearias,
  buscarBarbearia,
  criarBarbearia,
  atualizarBarbearia,
  excluirBarbearia,
} from "./routes/barbearias";
import {
  listarBarbeiros,
  buscarBarbeiro,
  criarBarbeiro,
  atualizarBarbeiro,
  excluirBarbeiro,
} from "./routes/barbeiros";
import {
  listarServicos,
  buscarServico,
  criarServico,
  atualizarServico,
  excluirServico,
} from "./routes/servicos";
import {
  listarCombos,
  buscarCombo,
  criarCombo,
  atualizarCombo,
  excluirCombo,
} from "./routes/combos";
import {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  excluirCliente,
  buscarPerfilCliente,
} from "./routes/clientes";
import {
  loginCelular,
  loginGoogle,
  loginBarbearia,
  loginBarbeiro,
  verificarTokenAuth,
  alterarSenha,
  alterarSenhaBarbearia,
  alterarSenhaBarbeiro,
  refreshTokenAuth,
} from "./routes/auth";
import {
  verificarAutenticacao,
  verificarBarbearia,
  verificarBarbeiro,
  verificarCliente,
  verificarAdminBarbearia,
} from "./utils/auth";
import { mostrarDocumentacao, downloadPostmanCollection } from "./routes/docs";
import {
  buscarBarbeariasPublicas,
  listarTodasBarbearias,
  listarCidades,
  obterEstatisticas,
  obterSugestoes,
  obterDetalhesBarbearia,
  listarPromocoes,
} from "./routes/diretorio";
import {
  dashboardAdmin,
  listarBarbeirosAdmin,
  criarBarbeiroAdmin,
  atualizarBarbeiroAdmin,
  removerBarbeiroAdmin,
  atualizarBarbeariaAdmin,
} from "./routes/admin";

export function createServer() {
  const app = express();

  // Configure __dirname for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Documentation
  app.get("/api/docs", mostrarDocumentacao);
  app.get("/api/docs/postman-collection", downloadPostmanCollection);
  app.get("/docs", mostrarDocumentacao);
  app.get("/", (_req, res) => res.redirect("/api/docs"));

  // Health endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.status(200).json({
      message: ping,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  app.get("/api/status", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Barbearias
  app.get("/api/barbearias", listarBarbearias);
  app.get("/api/barbearias/:id", buscarBarbearia);
  app.post("/api/barbearias", criarBarbearia);
  app.put("/api/barbearias/:id", atualizarBarbearia);
  app.delete("/api/barbearias/:id", excluirBarbearia);

  // Barbeiros
  app.get("/api/barbeiros", listarBarbeiros);
  app.get("/api/barbeiros/:id", buscarBarbeiro);
  app.post("/api/barbeiros", criarBarbeiro);
  app.put("/api/barbeiros/:id", atualizarBarbeiro);
  app.delete("/api/barbeiros/:id", excluirBarbeiro);

  // Serviços
  app.get("/api/servicos", listarServicos);
  app.get("/api/servicos/:id", buscarServico);
  app.post("/api/servicos", criarServico);
  app.put("/api/servicos/:id", atualizarServico);
  app.delete("/api/servicos/:id", excluirServico);

  // Combos
  app.get("/api/combos", listarCombos);
  app.get("/api/combos/:id", buscarCombo);
  app.post("/api/combos", criarCombo);
  app.put("/api/combos/:id", atualizarCombo);
  app.delete("/api/combos/:id", excluirCombo);

  // Diretório (públicas)
  app.get("/api/diretorio/barbearias/todas", listarTodasBarbearias);
  app.get("/api/diretorio/barbearias", buscarBarbeariasPublicas);
  app.get("/api/diretorio/cidades", listarCidades);
  app.get("/api/diretorio/estatisticas", obterEstatisticas);
  app.get("/api/diretorio/sugestoes", obterSugestoes);
  app.get("/api/diretorio/barbearia/:id/detalhes", obterDetalhesBarbearia);
  app.get("/api/diretorio/promocoes", listarPromocoes);

  // Autenticação (públicas)
  app.post("/api/auth/login/celular", loginCelular);
  app.post("/api/auth/login/google", loginGoogle);
  app.post("/api/auth/login/barbearia", loginBarbearia);
  app.post("/api/auth/login/barbeiro", loginBarbeiro);
  app.post("/api/auth/verificar-token", verificarTokenAuth);
  app.post("/api/auth/refresh-token", refreshTokenAuth);

  // Clientes
  app.get("/api/clientes", listarClientes);
  app.get("/api/clientes/me", verificarAutenticacao, buscarPerfilCliente);
  app.get("/api/clientes/:id", buscarCliente);
  app.post("/api/clientes", criarCliente);
  app.put("/api/clientes/:id", verificarAutenticacao, atualizarCliente);
  app.delete("/api/clientes/:id", verificarAutenticacao, excluirCliente);

  // Admin Barbearia (Dashboard)
  app.get(
    "/api/admin/dashboard",
    verificarAutenticacao,
    verificarAdminBarbearia,
    dashboardAdmin,
  );
  app.get(
    "/api/admin/barbeiros",
    verificarAutenticacao,
    verificarAdminBarbearia,
    listarBarbeirosAdmin,
  );
  app.post(
    "/api/admin/barbeiros",
    verificarAutenticacao,
    verificarAdminBarbearia,
    criarBarbeiroAdmin,
  );
  app.put(
    "/api/admin/barbeiros/:id",
    verificarAutenticacao,
    verificarAdminBarbearia,
    atualizarBarbeiroAdmin,
  );
  app.delete(
    "/api/admin/barbeiros/:id",
    verificarAutenticacao,
    verificarAdminBarbearia,
    removerBarbeiroAdmin,
  );
  app.put(
    "/api/admin/barbearia",
    verificarAutenticacao,
    verificarAdminBarbearia,
    atualizarBarbeariaAdmin,
  );

  // API 404 handler (only for /api/*)
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  return app;
}

export async function initializeDatabase() {
  try {
    await initDatabase();
    const tablesExist = await checkTables();
    if (!tablesExist) {
      console.log("🔧 Tabelas não encontradas, criando estrutura do banco...");
      await initializeTables();
    } else {
      console.log("✅ Estrutura do banco de dados verificada");
      console.log("🔄 Verificando tabelas de combos...");
      await initializeTables();
    }
  } catch (error) {
    console.error("Falha ao inicializar banco de dados:", error);
    process.exit(1);
  }
}

// Start server if executed directly (dev)
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = parseInt(process.env.PORT || "8080");
  (async () => {
    console.log("🚀 Starting Barbearia SaaS API...");
    if (process.env.NODE_ENV !== "test") {
      await initializeDatabase();
    }
    const app = createServer();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API Barbearia SaaS running on port ${PORT}`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
      console.log(`📚 Docs: http://localhost:${PORT}/api/docs`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/ping`);
    });
  })();
}
