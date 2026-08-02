/**
 * Datos editables del negocio. Todo lo que se muestra en la web
 * (teléfono, redes, cobertura, medios de pago) sale de acá.
 */
export const business = {
  company: "Aqua Mar",
  slogan: "Distribuidora Oficial Powerful",
  whatsapp: "5491158100225",
  whatsappDisplay: "+54 9 11 5810-0225",
  instagram: "aqua.mar.distribuidora",
  email: "aquamar.powerful@gmail.com",
  address: "Zona Oeste, Buenos Aires",
  coverage: ["Zona Oeste", "Envíos a toda Argentina"],
  paymentMethods: ["Efectivo", "Transferencia"],
  socialLinks: {
    instagram: "https://instagram.com/aqua.mar.distribuidora",
    whatsapp: "https://wa.me/5491158100225",
  },
  /** Dominio de producción: actualizar cuando esté publicado. */
  siteUrl: "https://aquamar-distribuidora.vercel.app",
};

export const product = {
  name: "Powerful PODS 3 en 1",
  fragancia: "Ocean Mist",
  cajaMayorista: 8,
  presentaciones: [
    {
      capsulas: 40,
      etiqueta: "Balde de 40 cápsulas",
      detalle: "Rinde 40 lavados. El favorito de las familias.",
      img: "/img/powerful-40-capsulas.jpg",
      imgPos: "50% 45%",
    },
    {
      capsulas: 20,
      etiqueta: "Balde de 20 cápsulas",
      detalle: "Rinde 20 lavados. Ideal para probarlo o para hogares chicos.",
      img: "/img/powerful-20-capsulas.jpg",
      imgPos: "50% 60%",
    },
  ],
};
