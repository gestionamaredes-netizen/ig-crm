import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // El logo de La 80 es SVG (placeholder hasta tener el archivo de marca real).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
