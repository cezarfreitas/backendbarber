import { defineConfig } from "vite";
import path from "path";

// Stable build configuration for EasyPanel (no health check dependencies)
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/stable-start.ts"), // Use stable startup
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs", "path", "url", "http", "https", "os", "crypto", "stream", 
        "util", "events", "buffer", "querystring", "child_process",
        // External dependencies
        "express", "cors", "mysql2", "jsonwebtoken", "bcryptjs", 
        "uuid", "dotenv", "zod",
      ],
      output: {
        format: "es",
        entryFileNames: "production.mjs",
        banner: "// Barbearia SaaS - Stable Build (No Health Check)\n// Built: " + new Date().toISOString(),
      },
    },
    minify: false, // Keep readable for debugging
    sourcemap: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  plugins: [
    {
      name: "stable-build-validator",
      closeBundle() {
        console.log("✅ Stable build completed");
        console.log("📦 Output: dist/server/production.mjs");
        console.log("🔥 No health check dependencies");
        console.log("🚀 Ready for EasyPanel (stable version)");
      },
    },
  ],
});
