import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Aviso,
  Boton,
  Campo,
  CampoSelect,
  CampoTexto,
  Tarjeta,
  Vacio,
} from "@/components/ui";
import { MapaProspectos } from "@/components/mapa-prospectos";
import { linkMapa, linkWhatsapp } from "@/lib/contacto";
import { SOLO_PROSPECCION } from "@/lib/sitio";
import { listarContactos, obtenerProspecto } from "@/lib/datos/prospeccion";
import { CANALES_CONTACTO, ESTADOS_PROSPECTO } from "@/lib/db/schema";
import { formatearFecha, hoy } from "@/lib/formato";
import {
  accionConvertirEnCliente,
  accionGuardarFicha,
  accionRegistrarContacto,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function FichaProspecto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const prospecto = await obtenerProspecto(id);
  if (!prospecto) notFound();

  const contactos = await listarContactos(id);
  const wa = prospecto.whatsapp ? linkWhatsapp(prospecto.whatsapp) : null;
  const vencida =
    prospecto.proximaAccionFecha !== null && prospecto.proximaAccionFecha <= hoy();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/comercial/prospeccion" className="toque text-xs text-suave">
            ← Prospección
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{prospecto.comercio}</h1>
          <p className="text-sm text-suave">
            {[prospecto.direccion, prospecto.localidad].filter(Boolean).join(", ") ||
              "Sin dirección cargada"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-borde bg-white px-3 py-1 text-xs font-medium">
            {prospecto.estado}
          </span>
          {!prospecto.verificado && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">
              Datos sin confirmar
            </span>
          )}
        </div>
      </div>

      {error && <Aviso texto={error} />}

      {prospecto.clienteId && !SOLO_PROSPECCION ? (
        <Aviso
          tipo="ok"
          texto="Este prospecto ya es cliente. Los pedidos y la cuenta se manejan desde su ficha."
        />
      ) : null}

      {prospecto.proximaAccion && (
        <Tarjeta titulo="Próxima acción">
          <p className={`text-sm ${vencida ? "font-medium text-rose-700" : ""}`}>
            {prospecto.proximaAccion}
            {prospecto.proximaAccionFecha && ` · ${formatearFecha(prospecto.proximaAccionFecha)}`}
            {vencida && " (vencida)"}
          </p>
        </Tarjeta>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Contacto">
          <dl className="space-y-2 text-sm">
            <Dato etiqueta="Persona" valor={prospecto.persona} />
            <Dato etiqueta="Teléfono" valor={prospecto.telefono}>
              {prospecto.telefono && (
                <a className="toque text-azul-700" href={`tel:${prospecto.telefono.replace(/[^\d+]/g, "")}`}>
                  {prospecto.telefono}
                </a>
              )}
            </Dato>
            <Dato etiqueta="WhatsApp" valor={prospecto.whatsapp}>
              {wa && (
                <a className="toque text-[#128C4B]" href={wa} target="_blank" rel="noopener">
                  {prospecto.whatsapp}
                </a>
              )}
            </Dato>
            <Dato etiqueta="Email" valor={prospecto.email}>
              {prospecto.email && (
                <a className="toque text-azul-700" href={`mailto:${prospecto.email}`}>
                  {prospecto.email}
                </a>
              )}
            </Dato>
            <Dato etiqueta="Sitio" valor={prospecto.web}>
              {prospecto.web && (
                <a className="toque break-all text-azul-700" href={prospecto.web} target="_blank" rel="noopener">
                  {prospecto.web.replace(/^https?:\/\//, "")}
                </a>
              )}
            </Dato>
            <Dato etiqueta="Instagram" valor={prospecto.instagram}>
              {prospecto.instagram && (
                <a className="toque text-azul-700" href={prospecto.instagram} target="_blank" rel="noopener">
                  {prospecto.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
                </a>
              )}
            </Dato>
            <Dato etiqueta="Facebook" valor={prospecto.facebook}>
              {prospecto.facebook && (
                <a className="toque text-azul-700" href={prospecto.facebook} target="_blank" rel="noopener">
                  Perfil
                </a>
              )}
            </Dato>
            <Dato etiqueta="Horario" valor={prospecto.horario} />
            <Dato etiqueta="Último contacto" valor={prospecto.ultimoContactoEn ? formatearFecha(prospecto.ultimoContactoEn) : ""} />
            <Dato etiqueta="Fuente del dato" valor={prospecto.fuente} />
          </dl>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              className="inline-flex min-h-10 items-center rounded-xl border border-borde bg-white px-3 text-sm font-medium transition hover:bg-azul-50"
              href={linkMapa(prospecto.comercio, prospecto.direccion, prospecto.localidad)}
              target="_blank"
              rel="noopener"
            >
              Cómo llegar
            </a>
            {/*
              * Convertir abre una ficha de cliente, y los clientes se llevan en
              * el panel completo, contra otra base. En el sitio de prospección
              * eso dejaría una ficha que nadie más ve: acá el comercio ganado
              * se marca con el estado "cliente" al registrar el contacto, que
              * es lo que cuenta el embudo.
              */}
            {!SOLO_PROSPECCION && !prospecto.clienteId && (
              <form action={accionConvertirEnCliente}>
                <input type="hidden" name="id" value={prospecto.id} />
                <Boton type="submit" variante="secundario">
                  Convertir en cliente
                </Boton>
              </form>
            )}
            {!SOLO_PROSPECCION && prospecto.clienteId && (
              <Link
                href={`/comercial/clientes/${prospecto.clienteId}`}
                className="inline-flex min-h-10 items-center rounded-xl bg-azul-600 px-3 text-sm font-medium text-white transition hover:bg-azul-700"
              >
                Ver ficha de cliente
              </Link>
            )}
          </div>

          {prospecto.notas && <p className="mt-3 border-t border-borde pt-3 text-sm text-suave">{prospecto.notas}</p>}
        </Tarjeta>

        <Tarjeta titulo="Dónde queda">
          <MapaProspectos
            puntos={[
              {
                id: prospecto.id,
                comercio: prospecto.comercio,
                localidad: prospecto.localidad,
                direccion: prospecto.direccion,
                estado: prospecto.estado,
                lat: prospecto.lat,
                lng: prospecto.lng,
                aproximado: prospecto.precisionGeo === "localidad",
              },
            ]}
            alto="18rem"
          />
          {prospecto.precisionGeo === "localidad" && (
            <p className="mt-2 text-xs text-suave">
              El pin está en el centro de {prospecto.localidad || "la localidad"}, no en la puerta.
              Se ubica exacto desde el mapa del tablero.
            </p>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Registrar contacto">
        <form action={accionRegistrarContacto} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="prospectoId" value={prospecto.id} />
          <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
          <CampoSelect etiqueta="Canal" name="canal" defaultValue="visita">
            {CANALES_CONTACTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect etiqueta="En qué quedó" name="estado" defaultValue={prospecto.estado}>
            {ESTADOS_PROSPECTO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </CampoSelect>
          <Campo
            etiqueta="Próxima acción"
            name="proximaAccion"
            placeholder="Volver con la lista de precios"
            defaultValue={prospecto.proximaAccion}
          />
          <Campo
            etiqueta="Cuándo"
            name="proximaAccionFecha"
            type="date"
            defaultValue={prospecto.proximaAccionFecha ?? ""}
          />
          <div className="sm:col-span-2">
            <CampoTexto etiqueta="Qué pasó" name="detalle" rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Guardar el contacto</Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Historial">
        {contactos.length === 0 ? (
          <Vacio>Todavía nadie tocó esta puerta.</Vacio>
        ) : (
          <ul className="space-y-3">
            {contactos.map((c) => (
              <li key={c.id} className="border-b border-borde pb-3 last:border-0 last:pb-0">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-suave">
                  <span className="font-medium text-tinta">{formatearFecha(c.fecha)}</span>
                  <span>·</span>
                  <span>{c.canal}</span>
                  <span>·</span>
                  <span>quedó en {c.estado}</span>
                  {c.registradoPor && <span>· {c.registradoPor}</span>}
                </p>
                {c.detalle && <p className="mt-1 text-sm">{c.detalle}</p>}
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta titulo="Corregir la ficha">
        <form action={accionGuardarFicha} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={prospecto.id} />
          <Campo etiqueta="Comercio" name="comercio" defaultValue={prospecto.comercio} required />
          <Campo etiqueta="Localidad" name="localidad" defaultValue={prospecto.localidad} />
          <Campo etiqueta="Dirección" name="direccion" defaultValue={prospecto.direccion} />
          <Campo etiqueta="Persona de contacto" name="persona" defaultValue={prospecto.persona} />
          <Campo etiqueta="Teléfono" name="telefono" defaultValue={prospecto.telefono} inputMode="tel" />
          <Campo etiqueta="WhatsApp" name="whatsapp" defaultValue={prospecto.whatsapp} inputMode="tel" />
          <Campo etiqueta="Email" name="email" defaultValue={prospecto.email} type="email" />
          <Campo etiqueta="Sitio" name="web" defaultValue={prospecto.web} />
          <Campo etiqueta="Instagram" name="instagram" defaultValue={prospecto.instagram} />
          <Campo etiqueta="Facebook" name="facebook" defaultValue={prospecto.facebook} />
          <Campo etiqueta="Horario" name="horario" defaultValue={prospecto.horario} />
          <CampoSelect etiqueta="Prioridad" name="prioridad" defaultValue={String(prospecto.prioridad)}>
            <option value="1">1 · alta</option>
            <option value="2">2 · media</option>
            <option value="3">3 · baja</option>
          </CampoSelect>
          <div className="sm:col-span-2">
            <CampoTexto etiqueta="Notas" name="notas" rows={3} defaultValue={prospecto.notas} />
          </div>
          <label className="toque gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="verificado"
              defaultChecked={prospecto.verificado}
              className="h-4 w-4 rounded border-borde"
            />
            Los datos de contacto están confirmados con el comercio
          </label>
          <div className="sm:col-span-2">
            <Boton type="submit">Guardar la ficha</Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  children,
}: {
  etiqueta: string;
  valor: string;
  children?: React.ReactNode;
}) {
  if (!valor) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="w-28 shrink-0 text-xs text-suave">{etiqueta}</dt>
      <dd className="min-w-0 flex-1">{children ?? valor}</dd>
    </div>
  );
}
