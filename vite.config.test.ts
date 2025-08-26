import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/test-fix.ts"),
      name: "test",
      fileName: "test-fix",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        "express",
        "cors",
        "mysql2",
        "jsonwebtoken",
        "bcryptjs",
        "uuid",
        "dotenv",
        "zod",
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
      ],
      output: {
        format: "es",
        entryFileNames: "test-fix.mjs",
      },
    },
    minify: false,
    sourcemap: false,
  },
});
