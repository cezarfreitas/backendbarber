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
} from "./utils/auth";
import { mostrarDocumentacao, downloadPostmanCollection } from "./routes/docs";
import {
  buscarBarbeariasPublicas,
  listarCidades,
  obterEstatisticas,
  obterSugestoes,
  obterDetalhesBarbearia,
  listarPromocoes,
} from "./routes/diretorio";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Documentação da API
  app.get("/api/docs", mostrarDocumentacao);
  app.get("/api/docs/postman-collection", downloadPostmanCollection);
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

  // Rotas de diretório (públicas)
  app.get("/api/diretorio/barbearias", buscarBarbeariasPublicas);
  app.get("/api/diretorio/cidades", listarCidades);
  app.get("/api/diretorio/estatisticas", obterEstatisticas);
  app.get("/api/diretorio/sugestoes", obterSugestoes);
  app.get("/api/diretorio/barbearia/:id/detalhes", obterDetalhesBarbearia);
  app.get("/api/diretorio/promocoes", listarPromocoes);

  // Rotas de autenticação (públicas)
  app.post("/api/auth/login/celular", loginCelular);
  app.post("/api/auth/login/google", loginGoogle);
  app.post("/api/auth/login/barbearia", loginBarbearia);
  app.post("/api/auth/login/barbeiro", loginBarbeiro);
  app.post("/api/auth/verificar-token", verificarTokenAuth);
  app.post("/api/auth/refresh-token", refreshTokenAuth);

  // Rotas de clientes
  app.get("/api/clientes", listarClientes); // TODO: Adicionar middleware de admin
  app.get("/api/clientes/me", verificarAutenticacao, buscarPerfilCliente);
  app.get("/api/clientes/:id", buscarCliente); // TODO: Adicionar middleware de admin ou próprio cliente
  app.post("/api/clientes", criarCliente); // Cadastro público
  app.put("/api/clientes/:id", verificarAutenticacao, atualizarCliente); // TODO: Verificar se é o próprio cliente ou admin
  app.delete("/api/clientes/:id", verificarAutenticacao, excluirCliente); // TODO: Verificar se é o próprio cliente ou admin

  // Rotas de autenticação (privadas - requer login)
  app.post(
    "/api/auth/alterar-senha",
    verificarAutenticacao,
    verificarCliente,
    alterarSenha,
  );
  app.post(
    "/api/auth/alterar-senha/barbearia",
    verificarAutenticacao,
    verificarBarbearia,
    alterarSenhaBarbearia,
  );
  app.post(
    "/api/auth/alterar-senha/barbeiro",
    verificarAutenticacao,
    verificarBarbeiro,
    alterarSenhaBarbeiro,
  );

  return app;
}

// Inicializar banco de dados ao iniciar o servidor
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await initDatabase();

      // Verificar se as tabelas existem
      const tablesExist = await checkTables();
      if (!tablesExist) {
        console.log(
          "🔧 Tabelas não encontradas, criando estrutura do banco...",
        );
        await initializeTables();
      } else {
        console.log("✅ Estrutura do banco de dados verificada");
        // Força a criação das tabelas de combos se não existirem
        console.log("🔄 Verificando tabelas de combos...");
        await initializeTables();
      }
    } catch (error) {
      console.error("Falha ao inicializar banco de dados:", error);
      process.exit(1);
    }
  })();
}
