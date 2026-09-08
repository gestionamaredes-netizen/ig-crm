import { businessConfig, localSeo } from "@/config/business";

/**
 * Datos estructurados. Solo se incluyen campos con datos verificables:
 * nada de precios, stock, reseñas ni calificaciones.
 */
export function getStructuredData(): object[] {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessConfig.name,
    description: "Distribuidora oficial de Powerful.",
    url: businessConfig.siteUrl,
    logo: `${businessConfig.siteUrl}/branding/aqua-mar-logo.jpg`,
    email: businessConfig.email,
    sameAs: [businessConfig.socialLinks.instagram],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${businessConfig.name} Distribuidora`,
    description:
      "Distribuidora oficial de Powerful. Venta mayorista por bulto cerrado de 12 envases, en Zona Oeste y con envíos a todo el país.",
    url: businessConfig.siteUrl,
    telephone: `+${businessConfig.whatsapp}`,
    email: businessConfig.email,
    areaServed: [localSeo.serviceArea, localSeo.country],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
    sameAs: [businessConfig.socialLinks.instagram],
  };

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Powerful PODS 3 en 1",
    brand: { "@type": "Brand", name: "Powerful" },
    description:
      "Cápsulas para lavado de ropa 3 en 1, fragancia Ocean Mist. Presentaciones de 20 y 40 cápsulas, venta mayorista por bulto cerrado de 12 envases.",
    image: `${businessConfig.siteUrl}/products/powerful-40-envase.png`,
  };

  return [org, localBusiness, product];
}
