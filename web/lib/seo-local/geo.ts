export type Coordenada = { lat: number; lng: number };

const RADIO_TIERRA_M = 6_371_000;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en metros entre dos coordenadas (fórmula de haversine). */
export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(h));
}

/**
 * Reparte círculos de barrido a lo largo del tramo A→B.
 *
 * La cantidad no la manda solo la cobertura geométrica: dos círculos alcanzarían
 * para cubrir el tramo de Gorriti, pero Places devuelve como máximo 20 resultados
 * por consulta. En una calle comercial densa eso se llena y perdés negocios.
 * Por eso la densidad es de un círculo cada `radioMetros` de tramo, no cada 2.
 *
 * Los centros quedan en t = (i + 0.5) / n, o sea repartidos parejo con medio
 * paso de margen en cada punta.
 */
export function puntosDeBarrido(a: Coordenada, b: Coordenada, radioMetros: number): Coordenada[] {
  if (radioMetros <= 0) throw new Error("El radio de barrido debe ser mayor a 0");

  const largo = distanciaMetros(a, b);
  const cantidad = Math.max(2, Math.ceil(largo / radioMetros));

  return Array.from({ length: cantidad }, (_, i) => {
    const t = (i + 0.5) / cantidad;
    return {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
    };
  });
}
