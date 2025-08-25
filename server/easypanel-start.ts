import { createServer } from "./index";

// Enhanced startup specifically for EasyPanel with comprehensive error handling
console.log("🚀 EasyPanel Startup - Barbearia SaaS API");
console.log("==========================================");

// Log environment for debugging
console.log("📊 Environment Check:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(`   PORT: ${process.env.PORT || "not set"}`);
console.log(`   DB_HOST: ${process.env.DB_HOST || "not set"}`);
console.log(`   DB_USER: ${process.env.DB_USER || "not set"}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || "not set"}`);
console.log(
  `   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
);

// Enhanced error handling for production
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:");
  console.error("   Error:", error.message);
  console.error("   Stack:", error.stack);
  console.error("   Time:", new Date().toISOString());

  // In EasyPanel, exit on uncaught exceptions
  console.log("🛑 Exiting due to uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:");
  console.error("   Promise:", promise);
  console.error("   Reason:", reason);
  console.error("   Time:", new Date().toISOString());

  // In EasyPanel, exit on unhandled rejections
  console.log("🛑 Exiting due to unhandled rejection");
  process.exit(1);
});

async function startServer() {
  try {
    console.log("🔧 Creating server instance...");
    const app = createServer();
    const port = parseInt(process.env.PORT || "80");

    console.log("🔌 Setting up health endpoints...");

    // Ultra-simple health endpoint for EasyPanel
    app.get("/health", (_req, res) => {
      res.status(200).send("OK");
    });

    // Detailed health endpoint
    app.get("/api/health", (_req, res) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        version: process.version,
      });
    });

    console.log("🌐 Starting server on port", port);

    // Enhanced server startup with comprehensive error handling
    const server = app.listen(port, "0.0.0.0", () => {
      console.log("�� Server started successfully!");
      console.log(`🚀 API Barbearia SaaS running on port ${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
      console.log(`📚 Docs: http://localhost:${port}/api/docs`);
      console.log(`🌐 Health: http://localhost:${port}/health`);
      console.log(`💚 API Health: http://localhost:${port}/api/health`);
      console.log("==========================================");

      // Send ready signal to EasyPanel
      console.log("🎯 READY - Service is ready to accept connections");
    });

    server.on("error", (error: any) => {
      console.error("❌ Server error:");
      console.error("   Code:", error.code);
      console.error("   Message:", error.message);
      console.error("   Port:", port);

      if (error.code === "EADDRINUSE") {
        console.error(`💥 Port ${port} is already in use`);
        process.exit(1);
      } else if (error.code === "EACCES") {
        console.error(`💥 Permission denied for port ${port}`);
        process.exit(1);
      } else {
        console.error("💥 Unknown server error");
        process.exit(1);
      }
    });

    server.on("listening", () => {
      const address = server.address();
      console.log("🎧 Server listening on:", address);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully`);
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.log("⏰ Force closing server");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Keep alive heartbeat for EasyPanel monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      console.log(
        `💓 Heartbeat - ${new Date().toISOString()} - Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      );
    }, 60000); // Every 60 seconds

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error("   Error:", error instanceof Error ? error.message : error);
    console.error(
      "   Stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    console.error("   Time:", new Date().toISOString());

    console.log("💥 STARTUP FAILED - Exiting");
    process.exit(1);
  }
}

// Start the server
console.log("🏁 Initiating startup sequence...");
startServer()
  .then(() => {
    console.log("🎉 Startup sequence completed");
  })
  .catch((error) => {
    console.error("💥 Startup sequence failed:", error);
    process.exit(1);
  });
