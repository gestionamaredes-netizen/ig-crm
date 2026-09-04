import { Boton, Campo, Tarjeta } from "@/components/ui";
import { formatearFecha, hoy, inicioDeMes } from "@/lib/formato";
import { responder } from "@/lib/datos/consultas";

export const dynamic = "force-dynamic";

export default async function Preguntas({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const periodo = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };
  const respuestas = await responder(periodo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Preguntas</h1>
        <p className="text-sm text-suave">
          Lo que uno quiere saber del negocio, contestado con los números de{" "}
          {formatearFecha(periodo.desde)} al {formatearFecha(periodo.hasta)}.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={periodo.desde} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={periodo.hasta} />
        <Boton type="submit" variante="secundario">
          Aplicar
        </Boton>
      </form>

      <div className="space-y-3">
        {respuestas.map((r) => (
          <Tarjeta key={r.clave}>
            <p className="text-sm text-suave">{r.pregunta}</p>
            <p className="mt-1 text-[clamp(1.1rem,5vw,1.4rem)] font-semibold tracking-tight">{r.respuesta}</p>
            {r.detalle && <p className="mt-1 text-xs text-suave">{r.detalle}</p>}
          </Tarjeta>
        ))}
      </div>

      <p className="text-xs text-suave">
        Cada respuesta sale de una consulta a la base, no de una estimación. Es también la capa por la que va a
        entrar una IA más adelante: se le ofrece este catálogo de preguntas en vez de dejarla escribir contra la
        base, así una respuesta puede ser incómoda pero no inventada.
      </p>
    </div>
  );
}
