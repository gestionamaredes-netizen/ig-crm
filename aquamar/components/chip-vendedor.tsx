import { colorDeVendedor } from "@/lib/db/schema";

/**
 * El vendedor, de un vistazo. Lleva el nombre además del color: un color solo
 * obliga a acordarse de la convención, y en blanco y negro o para alguien que
 * no distingue bien los tonos no dice nada.
 */
export function ChipVendedor({ nombre, color }: { nombre: string; color: string }) {
  const c = colorDeVendedor(color);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.fondo, color: c.texto }}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.punto }} />
      {nombre}
    </span>
  );
}

/** Para las listas, donde el nombre completo no entra: solo el punto. */
export function PuntoVendedor({ nombre, color }: { nombre: string; color: string }) {
  const c = colorDeVendedor(color);
  return (
    <span
      title={nombre}
      aria-label={nombre}
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle"
      style={{ backgroundColor: c.punto }}
    />
  );
}
