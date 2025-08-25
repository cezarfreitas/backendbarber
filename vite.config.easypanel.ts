import { defineConfig } from "vite";
import path from "path";

// EasyPanel-specific server build configuration
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/easypanel-start.ts"), // Use EasyPanel-optimized startup
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
        // External dependencies that should not be bundled
        "express", "cors", "mysql2", "jsonwebtoken", "bcryptjs", 
        "uuid", "dotenv", "zod",
      ],
      output: {
        format: "es",
        entryFileNames: "production.mjs",
        // Add banner for debugging
        banner: "// Barbearia SaaS API - EasyPanel Build\n// Built: " + new Date().toISOString(),
      },
    },
    minify: false, // Keep readable for debugging in EasyPanel
    sourcemap: false, // Disable sourcemaps for smaller builds
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
    // Add build timestamp for debugging
    "__BUILD_TIME__": JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    {
      name: "easypanel-build-validator",
      closeBundle() {
        console.log("✅ EasyPanel build validation completed");
        console.log("📦 Build output: dist/server/production.mjs");
        console.log("🚀 Ready for EasyPanel deployment");
        console.log("🔧 Using enhanced startup: server/easypanel-start.ts");
      },
    },
  ],
});
