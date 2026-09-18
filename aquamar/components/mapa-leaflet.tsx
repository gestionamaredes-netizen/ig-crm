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
 * El pin: la onda del logotipo sobre una gota del color de su cordón. El sello
 * completo no entra —a este tamaño no se leen "DISTRIBUIDORA" ni los valores—,
 * así que se usa lo que sí sobrevive de la marca en chico.
 *
 * Los que no están geocodificados llevan el borde punteado: el mapa no puede
 * mostrar como exacto algo que se apoya en el centro de la localidad.
 */
function pinSvg(color: string, exacto: boolean): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44" width="34" height="44">
    <path d="M17 43C17 43 32 26.5 32 16.5 32 8 25.3 1.5 17 1.5S2 8 2 16.5C2 26.5 17 43 17 43Z"
          fill="${color}" stroke="#ffffff" stroke-width="2.5"
          ${exacto ? "" : 'stroke-dasharray="3 2.5"'} />
    <circle cx="17" cy="16.5" r="10.5" fill="#ffffff" />
    <path d="M8.5 15c2.4 0 2.4-2.8 4.8-2.8s2.4 2.8 4.8 2.8 2.4-2.8 4.8-2.8 2.4 2.8 4.8 2.8"
          fill="none" stroke="#053388" stroke-width="2.6" stroke-linecap="round"
          transform="translate(-0.7 0)" />
    <path d="M8.5 21c2.4 0 2.4-2.8 4.8-2.8s2.4 2.8 4.8 2.8 2.4-2.8 4.8-2.8 2.4 2.8 4.8 2.8"
          fill="none" stroke="#3FC6E0" stroke-width="2.6" stroke-linecap="round"
          transform="translate(-0.7 0)" />
  </svg>`;
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
          html: pinSvg(color, p.exacto),
          className: "",
          iconSize: [34, 44],
          iconAnchor: [17, 43],
          popupAnchor: [0, -38],
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
