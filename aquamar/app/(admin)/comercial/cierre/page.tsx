import Link from "next/link";
import { Aviso, Boton, Campo, CampoTexto, Tarjeta } from "@/components/ui";
import { BotonImprimir } from "@/components/boton-imprimir";
import { ResumenCierreImpreso } from "@/components/resumen-cierre";
import { PALABRA_DE_CONFIRMACION, listarCierres, resumenDelPeriodo } from "@/lib/datos/cierre";
import { formatearFecha, hoy } from "@/lib/formato";
import { accionCerrarPeriodo } from "../actions";

export const dynamic = "force-dynamic";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function Cierre({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const resumen = await resumenDelPeriodo();
  const anteriores = await listarCierres();

  const ahora = new Date(`${hoy()}T00:00:00`);
  const sugerido = `${MESES[ahora.getMonth()][0].toUpperCase()}${MESES[ahora.getMonth()].slice(1)} ${ahora.getFullYear()}`;

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link href="/comercial/datos" className="toque text-xs font-medium text-azul-700">
          ← Datos y respaldo
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Cerrar el período</h1>
        <p className="text-sm text-suave">
          Guarda el comprobante de todo lo que se movió y deja el sistema listo para empezar un mes nuevo desde cero.
        </p>
      </div>

      {error && (
        <div className="print:hidden">
          <Aviso texto={error} />
        </div>
      )}

      <div className="print:hidden">
        <Tarjeta titulo="Antes de cerrar, guardá esto">
          <ol className="ml-4 list-decimal space-y-1.5 text-sm">
            <li>
              Imprimí o guardá como PDF el comprobante de acá abajo. Es lo único que va a quedar del período.
            </li>
            <li>
              Bajá una copia completa desde <Link href="/comercial/datos" className="font-medium text-azul-700">Datos y respaldo</Link>,
              por si mañana hace falta consultar un pedido puntual.
            </li>
            <li>Recontá el depósito: el stock queda en cero y hay que cargarlo de nuevo.</li>
          </ol>
          <div className="mt-4">
            <BotonImprimir>Imprimir o guardar como PDF</BotonImprimir>
          </div>
        </Tarjeta>
      </div>

      <ResumenCierreImpreso resumen={resumen} periodo={sugerido} />

      <div className="print:hidden">
        <Tarjeta titulo="Cerrar y empezar de cero">
          <p className="mb-1 text-sm">Al confirmar, el sistema:</p>
          <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-suave">
            <li>borra pedidos, compras, movimientos de depósito, caja, gastos y pagos de comisión;</li>
            <li>pone en cero el stock, los costos y los precios de todos los productos;</li>
            <li>conserva las fichas: comercios con sus links, productos, vendedores y proveedores;</li>
            <li>guarda este comprobante para poder volver a verlo cuando quieras.</li>
          </ul>
          <p className="mb-4 rounded-xl bg-[#fbe2e5] p-3 text-sm text-rose-900">
            <strong>No se puede deshacer.</strong> Lo que deben los comercios y lo que se le debe a los vendedores
            deja de figurar: queda asentado en el comprobante y se reclama con eso en la mano.
          </p>

          <form action={accionCerrarPeriodo} className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Qué período estás cerrando" name="periodo" defaultValue={sugerido} required />
            <Campo
              etiqueta={`Escribí ${PALABRA_DE_CONFIRMACION} para confirmar`}
              name="confirmacion"
              placeholder={PALABRA_DE_CONFIRMACION}
              autoComplete="off"
              required
            />
            <div className="sm:col-span-2">
              <CampoTexto etiqueta="Nota" name="nota" rows={2} placeholder="Opcional: por qué se cierra, qué cambia." />
            </div>
            <div className="sm:col-span-2">
              <Boton type="submit" variante="peligro">
                Cerrar el período y empezar de cero
              </Boton>
            </div>
          </form>
        </Tarjeta>
      </div>

      {anteriores.length > 0 && (
        <div className="print:hidden">
          <Tarjeta titulo="Cierres anteriores">
            <ul className="space-y-2">
              {anteriores.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/comercial/cierre/${c.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-borde px-3 py-2 text-sm hover:border-celeste-300"
                  >
                    <span className="font-medium">{c.periodo}</span>
                    <span className="text-xs text-suave">
                      {formatearFecha(c.hasta)} · lo cerró {c.hechoPor}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </div>
      )}
    </div>
  );
}
