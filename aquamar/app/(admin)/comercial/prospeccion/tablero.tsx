"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { MapaProspectos, ReferenciaEstados, type PuntoProspecto } from "@/components/mapa-prospectos";
import { linkMapa, linkWhatsapp } from "@/lib/contacto";
import { ESTADOS_PROSPECTO } from "@/lib/db/schema";
import { accionGuardarUbicacion } from "./actions";

export type FilaProspecto = PuntoProspecto & {
  telefono: string;
  whatsapp: string;
  email: string;
  instagram: string;
  prioridad: number;
  verificado: boolean;
  proximaAccion: string;
  proximaAccionFecha: string | null;
  ultimoContactoEn: string | null;
};

const claseFiltro =
  "min-h-11 w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100 sm:min-h-10";

export function Tablero({ filas, hoy }: { filas: FilaProspecto[]; hoy: string }) {
  const [busqueda, setBusqueda] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [estado, setEstado] = useState("");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [ubicando, setUbicando] = useState<{ hechos: number; total: number } | null>(null);
  const [, empezar] = useTransition();

  const localidades = useMemo(
    () => [...new Set(filas.map((f) => f.localidad).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [filas],
  );

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return filas.filter((f) => {
      if (localidad && f.localidad !== localidad) return false;
      if (estado && f.estado !== estado) return false;
      if (soloPendientes && !(f.proximaAccionFecha && f.proximaAccionFecha <= hoy)) return false;
      if (!texto) return true;
      return `${f.comercio} ${f.direccion} ${f.localidad}`.toLowerCase().includes(texto);
    });
  }, [filas, busqueda, localidad, estado, soloPendientes, hoy]);

  /**
   * Convierte las direcciones en puntos usando el geocodificador público de
   * OpenStreetMap, de a una por segundo, que es lo que su política de uso
   * admite. Corre en el navegador y a pedido: no es algo que deba pasar solo
   * cada vez que alguien abre el tablero.
   */
  async function ubicarDirecciones() {
    const pendientes = visibles.filter((f) => f.aproximado && f.direccion);
    if (pendientes.length === 0) return;

    setUbicando({ hechos: 0, total: pendientes.length });
    for (const [i, p] of pendientes.entries()) {
      try {
        const consulta = `${p.direccion}, ${p.localidad}, La Matanza, Buenos Aires, Argentina`;
        const respuesta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(consulta)}`,
          { headers: { Accept: "application/json" } },
        );
        const datos: { lat: string; lon: string }[] = await respuesta.json();
        const punto = datos[0];
        if (punto) {
          const lat = Number(punto.lat);
          const lng = Number(punto.lon);
          empezar(() => void accionGuardarUbicacion(p.id, lat, lng));
        }
      } catch {
        // Una dirección que el geocodificador no entiende no frena a las demás:
        // queda con el pin de la localidad y se corrige a mano.
      }
      setUbicando({ hechos: i + 1, total: pendientes.length });
      if (i < pendientes.length - 1) await new Promise((r) => setTimeout(r, 1100));
    }
    setUbicando(null);
  }

  const aproximados = visibles.filter((f) => f.aproximado && f.direccion).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className={claseFiltro}
          placeholder="Buscar comercio o calle"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar comercio o calle"
        />
        <select
          className={claseFiltro}
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          aria-label="Filtrar por localidad"
        >
          <option value="">Todas las localidades</option>
          {localidades.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          className={claseFiltro}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PROSPECTO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <label className="toque gap-2 text-sm text-suave">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
            className="h-4 w-4 rounded border-borde"
          />
          Solo con acción vencida
        </label>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-3">
          <MapaProspectos
            puntos={visibles}
            seleccionado={seleccionado}
            onSeleccionar={setSeleccionado}
            alto="30rem"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ReferenciaEstados estados={ESTADOS_PROSPECTO} />
            {aproximados > 0 && (
              <button
                type="button"
                onClick={() => void ubicarDirecciones()}
                disabled={ubicando !== null}
                className="inline-flex min-h-10 items-center rounded-xl border border-borde bg-white px-3 py-2 text-xs font-medium transition hover:bg-azul-50 disabled:opacity-50"
              >
                {ubicando
                  ? `Ubicando ${ubicando.hechos} de ${ubicando.total}…`
                  : `Ubicar ${aproximados} ${aproximados === 1 ? "dirección" : "direcciones"} en el mapa`}
              </button>
            )}
          </div>
          <p className="text-xs text-suave">
            El pin con borde punteado está puesto en el centro del barrio, no en la puerta: todavía
            nadie ubicó esa dirección.
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-suave">
            {visibles.length} de {filas.length} prospectos
          </p>
          <ul className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
            {visibles.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSeleccionado(f.id)}
                  className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm transition ${
                    seleccionado === f.id
                      ? "border-azul-600 ring-2 ring-azul-100"
                      : "border-borde hover:border-celeste-300"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{f.comercio}</span>
                      <span className="block truncate text-xs text-suave">
                        {[f.direccion, f.localidad].filter(Boolean).join(", ") || "Sin dirección"}
                      </span>
                    </span>
                    <PuntoEstado estado={f.estado} />
                  </span>

                  {f.proximaAccion && (
                    <span
                      className={`mt-2 block text-xs ${
                        f.proximaAccionFecha && f.proximaAccionFecha <= hoy
                          ? "font-medium text-rose-700"
                          : "text-suave"
                      }`}
                    >
                      {f.proximaAccion}
                      {f.proximaAccionFecha ? ` · ${f.proximaAccionFecha.split("-").reverse().join("/")}` : ""}
                    </span>
                  )}
                </button>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-3 text-xs">
                  <Link href={`/comercial/prospeccion/${f.id}`} className="toque font-medium text-azul-700">
                    Ficha
                  </Link>
                  {f.whatsapp && linkWhatsapp(f.whatsapp) && (
                    <a
                      className="toque text-[#128C4B]"
                      href={linkWhatsapp(f.whatsapp) as string}
                      target="_blank"
                      rel="noopener"
                    >
                      WhatsApp
                    </a>
                  )}
                  {f.telefono && (
                    <a className="toque text-suave" href={`tel:${f.telefono.replace(/[^\d+]/g, "")}`}>
                      Llamar
                    </a>
                  )}
                  {f.email && (
                    <a className="toque text-suave" href={`mailto:${f.email}`}>
                      Mail
                    </a>
                  )}
                  <a
                    className="toque text-suave"
                    href={linkMapa(f.comercio, f.direccion, f.localidad)}
                    target="_blank"
                    rel="noopener"
                  >
                    Cómo llegar
                  </a>
                </div>
              </li>
            ))}
            {visibles.length === 0 && (
              <li className="rounded-2xl border border-borde bg-white p-4 text-center text-sm text-suave">
                Ningún prospecto coincide con el filtro.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PuntoEstado({ estado }: { estado: string }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-borde bg-fondo px-2 py-0.5 text-[11px] text-suave">
      {estado}
    </span>
  );
}
