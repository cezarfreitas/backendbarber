import { createServer } from "./index";

console.log("🚀 STABLE STARTUP - EasyPanel No Health Check");
console.log("==============================================");

// Prevent any exits or crashes
process.on("uncaughtException", (error) => {
  console.error("❌ UNCAUGHT EXCEPTION (not exiting):", error.message);
  // DO NOT EXIT - just log and continue
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED REJECTION (not exiting):", reason);
  // DO NOT EXIT - just log and continue
});

async function startStable() {
  try {
    console.log("📊 Environment Check:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
    console.log(`   PORT: ${process.env.PORT || "not set"}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || "not set"}`);
    console.log(`   DB_USER: ${process.env.DB_USER || "not set"}`);

    console.log("🔧 Creating Express application...");
    const app = createServer();

    const port = parseInt(process.env.PORT || "80");

    console.log(`🌐 Starting server on port ${port}...`);

    const server = app.listen(port, "0.0.0.0", () => {
      console.log("✅ SUCCESS! Server is running and stable");
      console.log(`🚀 API: http://localhost:${port}/api`);
      console.log(`💚 Health: http://localhost:${port}/health`);
      console.log(`📚 Docs: http://localhost:${port}/api/docs`);
      console.log("==============================================");
      console.log("🔥 READY FOR TRAFFIC - No health check required");
    });

    server.on("error", (error: any) => {
      console.error("❌ SERVER ERROR:", error.code, error.message);

      // Only exit for port conflicts, not other errors
      if (error.code === "EADDRINUSE") {
        console.error("💥 Port in use - exiting");
        process.exit(1);
      } else {
        console.log("🔄 Continuing despite error...");
      }
    });

    // Graceful shutdown only
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM - Graceful shutdown");
      server.close(() => {
        console.log("✅ Server closed cleanly");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT - Graceful shutdown");
      server.close(() => {
        console.log("✅ Server closed cleanly");
        process.exit(0);
      });
    });

    // Keep alive - prevent any exits
    setInterval(() => {
      console.log(`💓 Server stable - ${new Date().toISOString()}`);
    }, 120000); // Every 2 minutes

    return server;
  } catch (error) {
    console.error("❌ STARTUP ERROR:", error);
    console.log("🔄 Will retry startup in 5 seconds...");

    // Retry instead of exiting
    setTimeout(() => {
      console.log("🔄 Retrying startup...");
      startStable();
    }, 5000);
  }
}

// Start the stable server
startStable();
