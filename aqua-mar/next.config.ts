import type { NextConfig } from "next";

// output: "export" genera un sitio 100% estático en out/, listo para
// arrastrar a Netlify o servir desde cualquier hosting sin Node.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
