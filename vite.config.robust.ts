import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/robust-production.ts"),
      name: "server",
      fileName: "robust",
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
        "querystring",
        "child_process",
      ],
      output: {
        format: "es",
        entryFileNames: "robust.mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
});
