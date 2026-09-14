import { Aviso, Boton, Campo, Kpi, Tarjeta, Td, Th, Tabla } from "@/components/ui";
import { listarProspectos, resumir } from "@/lib/datos/prospeccion";
import { PAPELERAS_MATANZA } from "@/lib/datos/papeleras-matanza";
import { ESTADOS_PROSPECTO } from "@/lib/db/schema";
import { hoy } from "@/lib/formato";
import { accionCrearProspecto, accionImportarRelevamiento } from "./actions";
import { Tablero, type FilaProspecto } from "./tablero";

export const dynamic = "force-dynamic";

export default async function Prospeccion({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; importados?: string }>;
}) {
  const { error, importados } = await searchParams;
  const prospectos = await listarProspectos();
  const resumen = resumir(prospectos);
  const fecha = hoy();

  const filas: FilaProspecto[] = prospectos.map((p) => ({
    id: p.id,
    comercio: p.comercio,
    localidad: p.localidad,
    direccion: p.direccion,
    estado: p.estado,
    lat: p.lat,
    lng: p.lng,
    aproximado: p.precisionGeo === "localidad",
    telefono: p.telefono,
    whatsapp: p.whatsapp,
    email: p.email,
    instagram: p.instagram,
    prioridad: p.prioridad,
    verificado: p.verificado,
    proximaAccion: p.proximaAccion,
    proximaAccionFecha: p.proximaAccionFecha,
    ultimoContactoEn: p.ultimoContactoEn,
  }));

  const faltantes = PAPELERAS_MATANZA.filter(
    (s) => !prospectos.some((p) => p.id === s.id),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Prospección</h1>
        <p className="text-sm text-suave">
          Papeleras de La Matanza: dónde están, cómo contactarlas y en qué quedó cada una.
        </p>
      </div>

      {error && <Aviso texto={error} />}
      {importados && (
        <Aviso
          tipo="ok"
          texto={
            importados === "0"
              ? "No había papeleras nuevas para sumar: el relevamiento ya estaba cargado."
              : `Se sumaron ${importados} papeleras del relevamiento.`
          }
        />
      )}

      {prospectos.length === 0 ? (
        <Tarjeta titulo="Todavía no hay prospectos">
          <p className="text-sm text-suave">
            El relevamiento trae {PAPELERAS_MATANZA.length} papeleras de La Matanza con dirección,
            teléfono y redes, sacadas de directorios comerciales y de los perfiles públicos de cada
            comercio. Son datos para salir a confirmar: lo que se verifica llamando se corrige en la
            ficha y queda marcado.
          </p>
          <form action={accionImportarRelevamiento} className="mt-3">
            <Boton type="submit">Cargar las {PAPELERAS_MATANZA.length} papeleras</Boton>
          </form>
        </Tarjeta>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              etiqueta="Prospectos"
              valor={String(resumen.total)}
              detalle={`${resumen.porLocalidad.length} localidades`}
            />
            <Kpi
              etiqueta="Sin contactar"
              valor={String(resumen.sinContactar)}
              detalle={`${resumen.conTelefono} con teléfono para arrancar`}
            />
            <Kpi
              etiqueta="En gestión"
              valor={String(resumen.abiertos - resumen.sinContactar)}
              detalle="contactados, interesados o cotizados"
            />
            <Kpi
              etiqueta="Ya son clientes"
              valor={String(resumen.clientes)}
              detalle={
                resumen.total > 0
                  ? `${Math.round((resumen.clientes / resumen.total) * 100)}% de lo relevado`
                  : undefined
              }
              tono={resumen.clientes > 0 ? "bueno" : "neutro"}
            />
          </div>

          {resumen.vencidos > 0 && (
            <Aviso
              texto={`Hay ${resumen.vencidos} ${
                resumen.vencidos === 1 ? "prospecto con una acción" : "prospectos con acciones"
              } para hoy o atrasada${resumen.vencidos === 1 ? "" : "s"}.`}
            />
          )}

          <Tarjeta titulo="Mapa de la zona">
            <Tablero filas={filas} hoy={fecha} />
          </Tarjeta>

          <div className="grid gap-4 lg:grid-cols-2">
            <Tarjeta titulo="Embudo">
              <ul className="space-y-1.5">
                {ESTADOS_PROSPECTO.map((e) => {
                  const cantidad = resumen.porEstado[e] ?? 0;
                  const parte = resumen.total > 0 ? (cantidad / resumen.total) * 100 : 0;
                  return (
                    <li key={e} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 text-xs text-suave">{e}</span>
                      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-fondo">
                        <span
                          className="block h-full rounded-full bg-azul-500"
                          style={{ width: `${parte}%` }}
                        />
                      </span>
                      <span className="tabular w-8 shrink-0 text-right text-xs font-medium">
                        {cantidad}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Tarjeta>

            <Tarjeta titulo="Cobertura por localidad">
              <Tabla>
                <thead>
                  <tr>
                    <Th>Localidad</Th>
                    <Th alinear="right">Relevadas</Th>
                    <Th alinear="right">En juego</Th>
                    <Th alinear="right">Clientes</Th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.porLocalidad.map((l) => (
                    <tr key={l.localidad}>
                      <Td>{l.localidad || "Sin localidad"}</Td>
                      <Td alinear="right">
                        <span className="tabular">{l.total}</span>
                      </Td>
                      <Td alinear="right">
                        <span className="tabular">{l.abiertos}</span>
                      </Td>
                      <Td alinear="right">
                        <span className="tabular">{l.clientes}</span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Tarjeta>
          </div>

          <Tarjeta titulo="Sumar un prospecto">
            <form action={accionCrearProspecto} className="grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Comercio" name="comercio" required />
              <Campo etiqueta="Localidad" name="localidad" placeholder="San Justo" />
              <Campo etiqueta="Dirección" name="direccion" />
              <Campo etiqueta="Persona de contacto" name="persona" />
              <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" />
              <Campo etiqueta="WhatsApp" name="whatsapp" inputMode="tel" />
              <Campo etiqueta="Email" name="email" type="email" />
              <Campo etiqueta="Instagram" name="instagram" placeholder="https://instagram.com/…" />
              <div className="sm:col-span-2">
                <Boton type="submit">Agregar al tablero</Boton>
              </div>
            </form>
          </Tarjeta>

          {faltantes > 0 && (
            <Tarjeta>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-suave">
                  El relevamiento tiene {faltantes} {faltantes === 1 ? "papelera" : "papeleras"} que
                  todavía no {faltantes === 1 ? "está" : "están"} en el tablero.
                </p>
                <form action={accionImportarRelevamiento}>
                  <Boton type="submit" variante="secundario">
                    Importar las que faltan
                  </Boton>
                </form>
              </div>
            </Tarjeta>
          )}
        </>
      )}
    </div>
  );
}
