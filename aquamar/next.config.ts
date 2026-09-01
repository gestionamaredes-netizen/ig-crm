import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 es un módulo nativo: se carga en runtime, no se empaqueta.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
