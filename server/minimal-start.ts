import { createServer } from "./index";

console.log("🚀 MINIMAL STARTUP - Barbearia API for EasyPanel");
console.log("=================================================");

// Log key environment variables
console.log("Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST || "NOT_SET",
  DB_USER: process.env.DB_USER || "NOT_SET",
  DB_NAME: process.env.DB_NAME || "NOT_SET",
});

// Simple error handling
process.on("uncaughtException", (error) => {
  console.error("❌ UNCAUGHT EXCEPTION:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
  process.exit(1);
});

async function start() {
  try {
    console.log("📦 Creating Express app...");
    const app = createServer();

    const port = parseInt(process.env.PORT || "80");

    console.log("🌐 Starting server on port", port);

    const server = app.listen(port, "0.0.0.0", () => {
      console.log("✅ SUCCESS! Server running on port", port);
      console.log("🔗 Health: http://localhost:" + port + "/health");
      console.log("🔗 API: http://localhost:" + port + "/api/ping");
      console.log("=================================================");
    });

    server.on("error", (error: any) => {
      console.error("❌ SERVER ERROR:", error.code, error.message);
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ STARTUP FAILED:", error);
    process.exit(1);
  }
}

start();
