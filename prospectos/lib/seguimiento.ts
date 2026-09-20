import "server-only";
import { db } from "./db";
import { ESTADOS, PERSONAS, type Prospecto } from "./datos";

export type Seguimiento = {
  estado: string;
  responsable: string;
  proxima: string;
  fecha: string;
  notas: string;
  editadoPor: string;
  editadoEn: number;
  historial: { quien: string; campo: string; cuando: number }[];
};

export const VACIO: Seguimiento = {
  estado: "nuevo", responsable: "Sin asignar", proxima: "", fecha: "",
  notas: "", editadoPor: "", editadoEn: 0, historial: [],
};

export const CAMPOS = ["estado", "responsable", "proxima", "fecha", "notas"] as const;
export type Campo = (typeof CAMPOS)[number];

export function esCampo(v: string): v is Campo {
  return (CAMPOS as readonly string[]).includes(v);
}

/** Valida contra las listas cerradas; el resto se limita por largo. */
export function valorValido(campo: Campo, valor: string): boolean {
  if (valor.length > 900) return false;
  if (campo === "estado") return ESTADOS.some((e) => e.k === valor);
  if (campo === "responsable") {
    return valor === "Sin asignar" || (PERSONAS as readonly string[]).includes(valor);
  }
  if (campo === "fecha") return valor === "" || /^\d{4}-\d{2}-\d{2}$/.test(valor);
  return true;
}

export async function leerTodo(): Promise<Record<string, Seguimiento>> {
  const [filas, hist] = await Promise.all([
    db.execute("SELECT * FROM seguimiento"),
    db.execute(
      "SELECT prospecto_id, quien, campo, cuando FROM historial ORDER BY cuando DESC LIMIT 400",
    ),
  ]);

  const out: Record<string, Seguimiento> = {};
  for (const f of filas.rows) {
    out[String(f.prospecto_id)] = {
      estado: String(f.estado),
      responsable: String(f.responsable),
      proxima: String(f.proxima),
      fecha: String(f.fecha),
      notas: String(f.notas),
      editadoPor: String(f.editado_por),
      editadoEn: Number(f.editado_en),
      historial: [],
    };
  }
  // Los seis más recientes por negocio: alcanza para saber quién tocó qué.
  for (const h of hist.rows) {
    const s = out[String(h.prospecto_id)];
    if (s && s.historial.length < 6) {
      s.historial.push({
        quien: String(h.quien), campo: String(h.campo), cuando: Number(h.cuando),
      });
    }
  }
  return out;
}

export async function guardar(
  id: string, campo: Campo, valor: string, quien: string,
): Promise<void> {
  const cuando = Date.now();
  // UPSERT: la fila puede no existir todavía, y el campo es de una lista
  // cerrada, así que interpolarlo acá no abre la puerta a una inyección.
  await db.execute({
    sql: `INSERT INTO seguimiento (prospecto_id, ${campo}, editado_por, editado_en)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(prospecto_id) DO UPDATE SET
            ${campo} = excluded.${campo},
            editado_por = excluded.editado_por,
            editado_en = excluded.editado_en`,
    args: [id, valor, quien, cuando],
  });
  await db.execute({
    sql: "INSERT INTO historial (prospecto_id, quien, campo, cuando) VALUES (?, ?, ?, ?)",
    args: [id, quien, campo, cuando],
  });
}

export type Agregado = Prospecto & { cargadoPor: string };

export async function leerAgregados(): Promise<Agregado[]> {
  const r = await db.execute("SELECT * FROM agregados ORDER BY creado_en DESC");
  return r.rows.map((f) => ({
    id: String(f.id),
    nombre: String(f.nombre),
    rubro: String(f.rubro),
    localidad: String(f.localidad),
    instagram: String(f.instagram),
    facebook: "",
    web: "",
    direccion: String(f.direccion),
    telefono: String(f.telefono),
    mail: String(f.mail),
    seguidores: "",
    contenido: String(f.contenido),
    fuente: `Cargado por ${String(f.cargado_por)}`,
    ver: "parcial" as const,
    prioridad: "media",
    cerca: "",
    cargadoPor: String(f.cargado_por),
  }));
}

export async function agregar(p: {
  id: string; nombre: string; rubro: string; localidad: string;
  instagram: string; direccion: string; telefono: string; mail: string;
  contenido: string; quien: string;
}): Promise<void> {
  await db.execute({
    sql: `INSERT INTO agregados
            (id, nombre, rubro, localidad, instagram, direccion, telefono, mail,
             contenido, cargado_por, creado_en)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [p.id, p.nombre, p.rubro, p.localidad, p.instagram, p.direccion,
           p.telefono, p.mail, p.contenido, p.quien, Date.now()],
  });
}
