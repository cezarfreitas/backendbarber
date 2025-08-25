import { createServer, initializeDatabase } from "./index.js";

const PORT = parseInt(process.env.PORT || "80");

async function startServer() {
  console.log("🚀 Starting Barbearia SaaS API...");
  
  // Inicializar banco de dados em produção
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
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
