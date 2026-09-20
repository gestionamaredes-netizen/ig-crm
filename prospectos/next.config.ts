import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Son dos PNG chicos y propios: no vale la pena pasarlos por el optimizador
  // de imágenes, que en Netlify depende del plugin y es una fuente de fallas
  // silenciosas (el logo no aparece y no hay error en ningún lado).
  images: { unoptimized: true },
};

export default nextConfig;
