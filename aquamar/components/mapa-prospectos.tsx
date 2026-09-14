"use client";

import { useEffect, useRef } from "react";
import type { Map as MapaLeaflet, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_MATANZA } from "@/lib/datos/papeleras-matanza";

export type PuntoProspecto = {
  id: string;
  comercio: string;
  localidad: string;
  direccion: string;
  estado: string;
  lat: number | null;
  lng: number | null;
  aproximado: boolean;
};

/**
 * Un color por escalón del embudo, del frío al cálido y cerrando en verde: de
 * un vistazo se ve si la zona está sin tocar o si hay gestión andando.
 *
 * "Sin contactar" va hueco a propósito —borde sin relleno—, que es lo que
 * distingue lo que nadie tocó todavía de lo que se descartó.
 */
export const COLOR_ESTADO: Record<string, string> = {
  "sin contactar": "#FFFFFF",
  contactado: "#055AB4",
  interesado: "#0C85A2",
  "visita agendada": "#EDB730",
  "muestra entregada": "#E07B1F",
  cotizado: "#C2410C",
  cliente: "#059669",
  descartado: "#B6C2D2",
};

const BORDE_ESTADO: Record<string, string> = {
  "sin contactar": "#5A7290",
};

function colorDe(estado: string): string {
  return COLOR_ESTADO[estado] ?? "#5A7290";
}

/**
 * El pin se dibuja con HTML, no con las imágenes que Leaflet trae de fábrica:
 * esas se piden a una ruta que el empaquetador reescribe y terminan rotas. Con
 * un div también se colorea por estado sin generar un PNG por color.
 */
function htmlPin(estado: string, aproximado: boolean, activo: boolean): string {
  const relleno = colorDe(estado);
  const borde = BORDE_ESTADO[estado] ?? relleno;
  const anillo = aproximado ? "border-style:dashed;" : "";
  const halo = activo ? "box-shadow:0 0 0 4px rgba(5,90,180,.28);" : "";
  return `<span style="display:block;width:16px;height:16px;border-radius:9999px;
    background:${relleno};border:2.5px solid ${borde};${anillo}${halo}
    box-sizing:border-box;"></span>`;
}

/**
 * Mapa de los prospectos. Usa OpenStreetMap: se comporta como el de Google
 * —arrastrar, zoom, pin con ficha— sin pedir clave de API ni tarjeta, que es lo
 * único que hacía falta resolver acá.
 */
export function MapaProspectos({
  puntos,
  seleccionado,
  onSeleccionar,
  alto = "26rem",
}: {
  puntos: PuntoProspecto[];
  seleccionado?: string | null;
  onSeleccionar?: (id: string) => void;
  alto?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const marcadores = useRef<Map<string, Marker>>(new Map());
  // El callback cambia en cada render del padre; guardarlo evita rehacer los
  // pines cada vez solo porque la función es nueva.
  const alTocar = useRef(onSeleccionar);
  useEffect(() => {
    alTocar.current = onSeleccionar;
  }, [onSeleccionar]);

  // Leaflet toca `window` al importarse, así que entra recién en el navegador.
  useEffect(() => {
    let vivo = true;
    let mapaLocal: MapaLeaflet | null = null;
    const puestos = marcadores.current;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (!vivo || !caja.current || mapa.current) return;

      mapaLocal = L.map(caja.current, { scrollWheelZoom: false }).setView(
        [CENTRO_MATANZA.lat, CENTRO_MATANZA.lng],
        12,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapaLocal);
      mapa.current = mapaLocal;
    })();

    return () => {
      vivo = false;
      mapaLocal?.remove();
      mapa.current = null;
      puestos.clear();
    };
  }, []);

  // Redibuja los pines cuando cambia el filtro o el estado de un prospecto.
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const L = (await import("leaflet")).default;
      const m = mapa.current;
      if (!vivo || !m) return;

      for (const marcador of marcadores.current.values()) marcador.remove();
      marcadores.current.clear();

      const ubicables = puntos.filter((p) => p.lat != null && p.lng != null);
      for (const p of ubicables) {
        const marcador = L.marker([p.lat as number, p.lng as number], {
          icon: L.divIcon({
            html: htmlPin(p.estado, p.aproximado, p.id === seleccionado),
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
          title: p.comercio,
          // El seleccionado va arriba de los demás cuando se superponen.
          zIndexOffset: p.id === seleccionado ? 1000 : 0,
        });

        const direccion = [p.direccion, p.localidad].filter(Boolean).join(", ");
        const consulta = encodeURIComponent(`${p.comercio}, ${direccion || "La Matanza"}, Buenos Aires`);
        marcador.bindPopup(
          `<div style="min-width:180px">
             <strong>${escapar(p.comercio)}</strong><br>
             <span style="color:#5A7290">${escapar(direccion || "Sin dirección cargada")}</span><br>
             ${p.aproximado ? '<em style="color:#5A7290;font-size:11px">Ubicación aproximada</em><br>' : ""}
             <a href="https://www.google.com/maps/search/?api=1&query=${consulta}"
                target="_blank" rel="noopener">Abrir en Google Maps</a>
           </div>`,
        );
        marcador.on("click", () => alTocar.current?.(p.id));
        marcador.addTo(m);
        marcadores.current.set(p.id, marcador);
      }

      // Encuadra lo que quedó filtrado, para que no haya que buscarlo a mano.
      if (ubicables.length > 1) {
        m.fitBounds(
          L.latLngBounds(ubicables.map((p) => [p.lat as number, p.lng as number])),
          { padding: [36, 36], maxZoom: 15 },
        );
      } else if (ubicables.length === 1) {
        m.setView([ubicables[0].lat as number, ubicables[0].lng as number], 15);
      }
    })();

    return () => {
      vivo = false;
    };
  }, [puntos, seleccionado]);

  // Centra y abre la ficha del que se eligió en la lista de al lado.
  useEffect(() => {
    if (!seleccionado) return;
    const marcador = marcadores.current.get(seleccionado);
    const m = mapa.current;
    if (!marcador || !m) return;
    m.setView(marcador.getLatLng(), Math.max(m.getZoom(), 15), { animate: true });
    marcador.openPopup();
  }, [seleccionado]);

  const sinUbicar = puntos.filter((p) => p.lat == null || p.lng == null).length;

  return (
    <div className="min-w-0">
      <div
        ref={caja}
        style={{ height: alto }}
        className="w-full overflow-hidden rounded-2xl border border-borde bg-fondo"
      />
      {sinUbicar > 0 && (
        <p className="mt-2 text-xs text-suave">
          {sinUbicar} {sinUbicar === 1 ? "prospecto no tiene" : "prospectos no tienen"} ubicación y no
          {sinUbicar === 1 ? " aparece" : " aparecen"} en el mapa.
        </p>
      )}
    </div>
  );
}

/** El popup se arma con HTML: el nombre del comercio va escapado. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ReferenciaEstados({ estados }: { estados: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
      {estados.map((e) => (
        <li key={e} className="flex items-center gap-1.5 text-xs text-suave">
          <span
            aria-hidden
            className="inline-block h-3 w-3 shrink-0 rounded-full border-2"
            style={{
              background: COLOR_ESTADO[e] ?? "#5A7290",
              borderColor: BORDE_ESTADO[e] ?? COLOR_ESTADO[e] ?? "#5A7290",
            }}
          />
          {e}
        </li>
      ))}
    </ul>
  );
}
