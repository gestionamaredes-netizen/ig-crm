export type Programa = {
  slug: string;
  nombre: string;
  init: string;
  categoria: string;
  descripcion: string;
  color: string;
};

export const franjaTransmision = {
  dia: "Martes",
  franja: "Martes de Buenos Aires",
  bajada: "Programación desde el oeste",
  estudio: "Estudio Ituzainwood",
  ubicacionEstudio: "Ituzaingó, Buenos Aires",
  canal: "SOMOS COMO SOMOS",
  plataforma: "YouTube",
  ubicacionCanal: "Ibiza, España",
};

export const programas: Programa[] = [
  {
    slug: "ubuntu-pymes-en-foco",
    nombre: "Ubuntu: Pymes en Foco",
    init: "UB",
    categoria: "Desarrollo empresarial",
    descripcion: "Programa de desarrollo empresarial donde entrevistamos a pymes de Argentina y España.",
    color: "#4ADE80",
  },
  {
    slug: "el-motivo",
    nombre: "El Motivo",
    init: "EM",
    categoria: "Magazine urbano · desarrollo personal",
    descripcion:
      "Magazine urbano enfocado en el desarrollo personal, donde charlamos con emprendedores, artistas y profesionales sobre el motivo que los lleva a hacer eso que los apasiona: comienzos, desafíos, misión e ideal de vida.",
    color: "#F5B13C",
  },
];
