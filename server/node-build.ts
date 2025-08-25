import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 80;

// Start the server - all routes are defined in ./index.ts
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 API Barbearia SaaS running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📚 Docs: http://localhost:${port}/api/docs`);
  console.log(`🌐 Health: http://localhost:${port}/api/ping`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
