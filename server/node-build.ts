import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 80;

// Backend-only server - no frontend serving
// Just handle API routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Barbearia SaaS",
    status: "online",
    version: "1.0.0",
    docs: "/api/docs",
  });
});

app.listen(port, () => {
  console.log(`🚀 API Barbearia SaaS running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📚 Docs: http://localhost:${port}/api/docs`);
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
