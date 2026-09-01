import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Fuera de Next, "server-only" tira error al importarse; en los tests no aporta nada.
      "server-only": path.resolve(__dirname, "test/stub-server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    // Cada archivo abre su propia base SQLite: sin aislamiento se pisan entre sí.
    fileParallelism: false,
  },
});
