import { createServer } from "./index";

// Enhanced error handling for production
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  // Don't exit immediately in production, log and continue
  console.log("🔄 Continuing execution...");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit, just log
  console.log("🔄 Continuing execution...");
});

async function startServer() {
  try {
    console.log("🚀 Starting production server...");
    console.log("📊 Environment check:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   PORT: ${process.env.PORT}`);
    console.log(
      `   DB_HOST: ${process.env.DB_HOST ? "configured" : "not set"}`,
    );
    console.log(
      `   JWT_SECRET: ${process.env.JWT_SECRET ? "configured" : "not set"}`,
    );

    const app = createServer();
    const port = process.env.PORT || 80;

    // Add basic health check that responds immediately
    app.get("/health", (_req, res) => {
      res.status(200).send("OK");
    });

    // Enhanced server startup with better error handling
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 API Barbearia SaaS running on port ${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`📚 Docs: http://localhost:${port}/api/docs`);
      console.log(`🌐 Health: http://localhost:${port}/api/ping`);
      console.log(`💚 Simple Health: http://localhost:${port}/health`);
      console.log("✅ Server startup completed successfully");
    });

    server.on("error", (error: any) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 Received SIGINT, shutting down gracefully");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    // Keep alive heartbeat
    setInterval(() => {
      console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
    }, 30000); // Every 30 seconds
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error(
      "Stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    process.exit(1);
  }
}

startServer();
