"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Map as MapaDeLeaflet, Marker } from "leaflet";
import { CORDONES, ENCUADRE, LOCALIDADES, cordonDe } from "@/lib/matanza";

export type PuntoMapa = {
  id: string;
  comercio: string;
  localidad: string;
  cordon: string;
  lat: number;
  lon: number;
  /** Si son las coordenadas de su dirección o el centro de la localidad. */
  exacto: boolean;
};

/**
 * El pin: el sello de Aqua Mar, el logo real, dentro de un aro del color del
 * cordón al que pertenece ese comercio.
 *
 * A este tamaño no se llegan a leer "DISTRIBUIDORA" ni los valores del sello
 * —la guía de marca pide 80 px para eso—, pero el logo se reconoce igual y es
 * el que corresponde mostrar: el mapa se le enseña a la fábrica.
 *
 * Los que no están geocodificados llevan el aro punteado: el mapa no puede
 * mostrar como exacto algo que se apoya en el centro de la localidad.
 */
function pinHtml(color: string, exacto: boolean): string {
  return `
  <div style="position:relative;width:46px;height:56px">
    <div style="
      width:46px;height:46px;border-radius:50%;overflow:hidden;background:#fff;
      border:3px ${exacto ? "solid" : "dashed"} ${color};
      box-shadow:0 2px 6px rgba(14,33,54,.35);box-sizing:border-box">
      <img src="/marca/sello.png" alt="Aqua Mar"
           style="width:100%;height:100%;object-fit:cover;display:block" />
    </div>
    <div style="
      position:absolute;left:50%;top:42px;transform:translateX(-50%);
      width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;
      border-top:12px solid ${color}"></div>
  </div>`;
}

/**
 * El mapa real del partido: se navega como cualquier mapa, con las calles de
 * OpenStreetMap debajo.
 *
 * Leaflet se carga recién en el navegador porque necesita el `window` que en el
 * servidor no existe, y por eso todo esto vive en un componente de cliente.
 */
export function MapaLeaflet({ puntos }: { puntos: PuntoMapa[] }) {
  // Al zoom del partido entero los pines de una misma localidad se pisan, como
  // en cualquier mapa. El conteo en el círculo evita tener que acercarse para
  // saber cuántos hay.
  const cuantos = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const p of puntos) cuenta.set(p.localidad, (cuenta.get(p.localidad) ?? 0) + 1);
    return cuenta;
  }, [puntos]);

  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaDeLeaflet | null>(null);

  useEffect(() => {
    let vivo = true;
    let marcas: Marker[] = [];

    (async () => {
      const L = (await import("leaflet")).default;
      if (!vivo || !caja.current) return;

      if (!mapa.current) {
        mapa.current = L.map(caja.current, {
          center: ENCUADRE.centro,
          zoom: ENCUADRE.zoom,
          maxBounds: ENCUADRE.limites,
          maxBoundsViscosity: 0.6,
          // La rueda hace zoom solo con Ctrl: si no, scrollear la página dentro
          // del mapa lo aleja sin querer.
          scrollWheelZoom: false,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          minZoom: 10,
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapa.current);

        // Cada localidad, con el color de su cordón. El círculo es orientativo:
        // marca dónde queda, no hasta dónde llega.
        for (const l of LOCALIDADES) {
          const c = cordonDe(l.cordon);
          L.circle([l.lat, l.lon], {
            radius: 1400,
            color: c.color,
            weight: 1.5,
            fillColor: c.color,
            fillOpacity: 0.09,
          })
            .bindTooltip(
              `<strong>${l.nombre}</strong><br>${c.nombre}<br>${
                cuantos.get(l.nombre)
                  ? `${cuantos.get(l.nombre)} ${cuantos.get(l.nombre) === 1 ? "comercio" : "comercios"}`
                  : "sin comercios"
              }`,
              { direction: "top" },
            )
            .addTo(mapa.current);
        }
      }

      // Abre mostrando el partido entero, no un rincón: es lo primero que ve
      // quien nunca vio el mapa.
      mapa.current.fitBounds(
        LOCALIDADES.map((l) => [l.lat, l.lon] as [number, number]),
        { padding: [36, 36] },
      );

      for (const m of marcas) m.remove();
      marcas = puntos.map((p) => {
        const color = CORDONES.find((c) => c.id === p.cordon)?.color ?? "#053388";
        const icono = L.divIcon({
          html: pinHtml(color, p.exacto),
          className: "",
          iconSize: [46, 56],
          iconAnchor: [23, 55],
          popupAnchor: [0, -50],
        });
        return L.marker([p.lat, p.lon], { icon: icono, title: p.comercio })
          .bindPopup(
            `<strong>${p.comercio}</strong><br>${p.localidad}` +
              (p.exacto ? "" : "<br><em>posición aproximada: falta buscar la dirección</em>"),
          )
          .addTo(mapa.current!);
      });
    })();

    return () => {
      vivo = false;
    };
  }, [puntos, cuantos]);

  useEffect(() => {
    return () => {
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  return <div ref={caja} className="h-[70vh] min-h-[420px] w-full rounded-2xl" />;
}
