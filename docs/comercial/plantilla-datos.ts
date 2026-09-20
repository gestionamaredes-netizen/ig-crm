// Generado desde docs/comercial/prospectos.py — no editar a mano.
// Para cambiar los datos base se edita ese archivo y se corre
//   python3 docs/comercial/exportar-ts.py
// Los negocios que el equipo carga desde la app viven en la base, no acá.

export type Prospecto = {
  id: string; nombre: string; rubro: string; localidad: string;
  instagram: string; facebook: string; web: string; direccion: string;
  telefono: string; mail: string; seguidores: string; contenido: string;
  fuente: string; ver: "ok" | "parcial" | "nombre"; prioridad: string; cerca: string;
};

