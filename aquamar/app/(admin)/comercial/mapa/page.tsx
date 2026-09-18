import Image from "next/image";
import { Boton, BotonLink, Campo, Plata, Tabla, Tarjeta, Td, Th } from "@/components/ui";
import { CORDONES, LOCALIDADES } from "@/lib/matanza";
import { proximoSinCoordenadas } from "@/lib/datos/mapa";
import { MapaLeaflet } from "@/components/mapa-leaflet";
import { cobertura } from "@/lib/datos/mapa";
import { formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import { accionGeocodificarComercio, accionUbicarPorDireccion } from "../actions";

export const dynamic = "force-dynamic";

export default async function Mapa({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const datos = await cobertura(rango);
  const puntos = datos.localidades.flatMap((l) =>
    l.puntos.map((p) => ({
      id: p.id,
      comercio: p.comercio,
      localidad: l.localidad,
      cordon: l.cordon as string,
      lat: p.lat,
      lon: p.lon,
      exacto: p.exacto,
    })),
  );
  const aproximados = puntos.filter((p) => !p.exacto).length;
  const proximo = await proximoSinCoordenadas();
  const porCordon = CORDONES.map((c) => {
    const suyas = datos.localidades.filter((l) => l.cordon === c.id);
    return {
      cordon: c,
      localidades: suyas.length,
      cubiertas: suyas.filter((l) => l.comercios > 0).length,
      comercios: suyas.reduce((a, l) => a + l.comercios, 0),
      unidades: suyas.reduce((a, l) => a + l.unidades, 0),
      ventasCentavos: suyas.reduce((a, l) => a + l.ventasCentavos, 0),
    };
  });

  const comercios = porCordon.reduce((a, c) => a + c.comercios, 0);
  const cubiertas = porCordon.reduce((a, c) => a + c.cubiertas, 0);
  const ventas = porCordon.reduce((a, c) => a + c.ventasCentavos, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Mapa de seguimiento</h1>
        <p className="text-sm text-suave">
          Dónde llega Aqua Mar dentro del partido de La Matanza, por cordón. Cada comercio lleva su marca; los que
          cargues nuevos aparecen acá apenas les pongas la localidad.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BotonLink href="/comercial/clientes">Cargar un comercio</BotonLink>
        <span className="text-xs text-suave">Se dibuja en el mapa en cuanto tenga localidad.</span>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
        <Boton type="submit" variante="secundario">
          Aplicar
        </Boton>
        <span className="text-xs text-suave">
          Los comercios se cuentan siempre; lo vendido, solo en estas fechas.
        </span>
      </form>

      {proximo && (
        <Tarjeta titulo="Ubicación exacta de las direcciones">
          <p className="mb-3 text-sm text-suave">
            {aproximados > 0 ? (
              <>
                {aproximados} {aproximados === 1 ? "comercio está" : "comercios están"} puestos en el centro de su
                localidad. Buscándole la dirección, el pin pasa a la cuadra.
              </>
            ) : (
              <>Se le puede buscar la dirección exacta a los comercios que todavía no la tienen.</>
            )}
          </p>
          <form action={accionGeocodificarComercio} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={proximo.id} />
            <Boton type="submit">Buscar la dirección de {proximo.comercio}</Boton>
            <span className="text-xs text-suave">De a uno: el buscador de OpenStreetMap es gratuito y pide no saturarlo.</span>
          </form>
          <p className="mt-3 text-xs text-suave">
            Busca la dirección dentro de La Matanza. Si cae fuera del partido no la guarda: una calle homónima de otra
            provincia ensucia el mapa más que una dirección sin resolver.
          </p>
        </Tarjeta>
      )}

      {datos.sinUbicar > 0 && (
        <Tarjeta titulo="Comercios sin localidad">
          <p className="mb-3 text-sm text-suave">
            Hay {datos.sinUbicar} {datos.sinUbicar === 1 ? "comercio" : "comercios"} que todavía no figuran en el
            mapa porque no tienen localidad cargada.
            {datos.deducibles > 0 && (
              <>
                {" "}
                A {datos.deducibles} se {datos.deducibles === 1 ? "le" : "les"} puede deducir de la dirección.
              </>
            )}
          </p>
          {datos.deducibles > 0 ? (
            <form action={accionUbicarPorDireccion}>
              <Boton type="submit">Ubicar {datos.deducibles} por su dirección</Boton>
            </form>
          ) : (
            <p className="text-xs text-suave">
              Ninguna dirección nombra una localidad del partido: hay que elegirla a mano en cada ficha.
            </p>
          )}
          <p className="mt-3 text-xs text-suave">
            Solo toca los que están vacíos, y solo cuando la localidad aparece escrita en la dirección. El resto se
            carga desde la ficha de cada comercio.
          </p>
        </Tarjeta>
      )}

      <section className="overflow-hidden rounded-2xl border border-borde bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-borde px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Image src="/marca/logotipo.png" alt="Aqua Mar" width={132} height={30} className="h-7 w-auto" />
            <span className="text-sm font-medium text-suave">Distribuidor oficial Powerful</span>
          </div>
          <span className="text-sm text-suave">
            <strong className="text-tinta">{cubiertas}</strong> de {LOCALIDADES.length} localidades ·{" "}
            <strong className="text-tinta">{comercios}</strong> comercios
          </span>
        </header>

        <div className="p-3 sm:p-5">
          <MapaLeaflet puntos={puntos} />
        </div>

        <div className="grid gap-2 border-t border-borde px-4 py-3 sm:grid-cols-3 sm:px-5">
          {CORDONES.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              <span className="mt-1 h-3 w-3 shrink-0 rounded" style={{ backgroundColor: c.suave, border: `1.5px solid ${c.color}` }} />
              <span>
                <strong className="block text-tinta">{c.nombre}</strong>
                <span className="text-suave">{c.descripcion}</span>
              </span>
            </div>
          ))}
        </div>

        <p className="border-t border-borde px-4 py-3 text-xs text-suave sm:px-5">
          Una marca por comercio, sobre el mapa de calles de OpenStreetMap. El pin lleno está en la dirección del
          comercio; el punteado, en el centro de su localidad porque todavía no se le buscó la dirección. Los
          círculos marcan dónde queda cada localidad, no hasta dónde llega: los límites entre localidades y la
          división en cordones —que describe la distancia a CABA— no son fronteras oficiales.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {porCordon.map((c) => (
          <div key={c.cordon.id} className="rounded-2xl border border-borde bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: c.cordon.color }} />
              <h2 className="text-sm font-semibold">{c.cordon.nombre}</h2>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular">
              {c.cubiertas}
              <span className="text-base font-normal text-suave">/{c.localidades}</span>
            </p>
            <p className="text-xs text-suave">localidades con comercios</p>
            <dl className="mt-3 space-y-1 border-t border-borde pt-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-suave">Comercios</dt>
                <dd className="tabular">{c.comercios}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-suave">Vendido</dt>
                <dd>
                  <Plata centavos={c.ventasCentavos} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <Tarjeta titulo="Localidad por localidad">
        <Tabla>
          <thead>
            <tr>
              <Th>Localidad</Th>
              <Th>Cordón</Th>
              <Th alinear="right">Comercios</Th>
              <Th alinear="right">Compraron</Th>
              <Th alinear="right">Unidades</Th>
              <Th alinear="right">Vendido</Th>
            </tr>
          </thead>
          <tbody>
            {datos.localidades.map((l) => {
              const c = CORDONES.find((x) => x.id === l.cordon)!;
              return (
                <tr key={l.localidad} className={l.comercios === 0 ? "text-suave" : ""}>
                  <Td>{l.localidad}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.nombre.replace(" cordón", "")}
                    </span>
                  </Td>
                  <Td alinear="right">{l.comercios || "—"}</Td>
                  <Td alinear="right">{l.activos || "—"}</Td>
                  <Td alinear="right">{l.unidades || "—"}</Td>
                  <Td alinear="right">{l.ventasCentavos ? <Plata centavos={l.ventasCentavos} /> : "—"}</Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
        <p className="mt-3 text-xs text-suave">
          Total del período: {formatearPesos(ventas)} en {comercios} comercios.
        </p>
      </Tarjeta>
    </div>
  );
}
