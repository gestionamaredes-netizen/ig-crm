/**
 * Configuración central del negocio. Todo dato comercial de la web sale
 * de acá — nunca se escribe hardcodeado en un componente.
 * Los valores pueden sobreescribirse por variables de entorno.
 */
export const businessConfig = {
  name: "Aqua Mar",
  descriptor: "Distribuidora Oficial Powerful",
  claim: "La limpieza comienza con la confianza.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491158100225",
  whatsappDisplay: "+54 9 11 5810-0225",
  instagram: "aqua.mar.distribuidora",
  email: "aquamar.powerful@gmail.com",
  address: "Zona Oeste, Buenos Aires",
  coverage: {
    local: "Zona Oeste",
    national: "Envíos a todo el país",
  },
  productPresentations: ["20 cápsulas", "40 cápsulas"],
  socialLinks: {
    instagram: "https://instagram.com/aqua.mar.distribuidora",
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aquamar-distruibidora.netlify.app",
};

export const localSeo = {
  serviceArea: "Zona Oeste, Provincia de Buenos Aires",
  country: "Argentina",
  cities: [] as string[],
  physicalAddress: "",
};
