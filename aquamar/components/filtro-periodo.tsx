import Link from "next/link";
import { Boton, Campo } from "@/components/ui";
import { NOMBRE_PERIODO, PERIODOS, formatearFecha, type RangoElegido } from "@/lib/formato";

/**
 * Elegir qué período se está mirando.
 *
 * Los tres atajos son enlaces y no un formulario a propósito: "este mes" es un
 * toque, no tres campos de fecha. El personalizado aparece solo cuando se lo
 * pide, para que la pantalla de todos los días no arranque con un formulario
 * encima de los números.
 *
 * El rango queda en la URL, así que se puede guardar en favoritos y compartir:
 * el link lleva al mismo período.
 */
export function FiltroPeriodo({ base, rango }: { base: string; rango: RangoElegido }) {
  return (
    <div className="rounded-2xl border border-borde bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODOS.map((p) => {
          const elegido = p === rango.periodo;
          const destino = p === "personalizado" ? `${base}?periodo=personalizado&desde=${rango.desde}&hasta=${rango.hasta}` : `${base}?periodo=${p}`;
          return (
            <Link
              key={p}
              href={destino}
              className={`toque rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                elegido ? "bg-azul-600 text-white" : "border border-borde text-tinta hover:bg-azul-50"
              }`}
            >
              {NOMBRE_PERIODO[p]}
            </Link>
          );
        })}
        <span className="text-xs text-suave">
          {formatearFecha(rango.desde)}
          {rango.desde !== rango.hasta && ` al ${formatearFecha(rango.hasta)}`}
        </span>
      </div>

      {rango.periodo === "personalizado" && (
        <form className="mt-3 flex flex-wrap items-end gap-3 border-t border-borde pt-3">
          <input type="hidden" name="periodo" value="personalizado" />
          <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
          <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
          <Boton type="submit" variante="secundario">
            Aplicar
          </Boton>
        </form>
      )}
    </div>
  );
}
