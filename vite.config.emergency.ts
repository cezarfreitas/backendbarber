import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/emergency-server.ts"),
      name: "emergency",
      fileName: "emergency",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        "express",
        "cors",
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
        entryFileNames: "emergency.mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
});
