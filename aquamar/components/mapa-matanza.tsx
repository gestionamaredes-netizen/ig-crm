import {
  CORDONES,
  LOCALIDADES,
  MARCAS_POR_LOCALIDAD,
  ALTO,
  centroDeBanda,
  cordonDe,
  franjaDe,
  nidoDe,
  posicionDe,
} from "@/lib/matanza";
import type { CoberturaLocalidad } from "@/lib/datos/mapa";

const MARCA = 3.6;

/**
 * La onda del logotipo, que es lo que sobrevive de la marca en chico. El sello
 * completo no se puede usar acá: abajo de 80 px no se leen "DISTRIBUIDORA" ni
 * los valores, y meterlo igual sería romper la propia guía de marca.
 */
function MarcaAquaMar({ x, y, titulo }: { x: number; y: number; titulo: string }) {
  const r = MARCA / 2;
  return (
    <g transform={`translate(${x - r} ${y - r}) scale(${MARCA / 64})`}>
      <title>{titulo}</title>
      <rect width="64" height="64" rx="14" fill="#053388" stroke="#ffffff" strokeWidth="5" />
      <path
        d="M8 29c5.5 0 5.5-6.5 11-6.5S24.5 29 30 29s5.5-6.5 11-6.5S46.5 29 52 29"
        fill="none"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M8 44c5.5 0 5.5-6.5 11-6.5S24.5 44 30 44s5.5-6.5 11-6.5S46.5 44 52 44"
        fill="none"
        stroke="#3FC6E0"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
  );
}

export function MapaMatanza({ cobertura }: { cobertura: CoberturaLocalidad[] }) {
  const porNombre = new Map(cobertura.map((c) => [c.localidad, c]));

  return (
    <svg
      viewBox={`-17 -10 121 ${ALTO + 14}`}
      role="img"
      aria-label="Mapa de cobertura de Aqua Mar en el partido de La Matanza, por cordón"
      className="block w-full"
    >
      {CORDONES.map((c) => (
        <path key={c.id} d={franjaDe(c.id)} fill={c.suave} stroke={c.color} strokeWidth="0.4" />
      ))}

      {/* CABA queda afuera del partido: es la referencia que ordena el resto. */}
      <text x="102" y="-4.5" textAnchor="end" fontSize="3.2" fontWeight="700" fill="#0e2136" opacity="0.45">
        ← hacia CABA
      </text>

      {/* Cada franja dice su nombre: el color solo no alcanza para nombrarla. */}
      {CORDONES.map((c) => (
        <text
          key={c.id}
          x={centroDeBanda(c.id, 7)}
          y="7"
          textAnchor="middle"
          fontSize="3"
          fontWeight="700"
          fill={c.color}
        >
          {c.nombre.toUpperCase()}
        </text>
      ))}

      {LOCALIDADES.map((l) => {
        const centro = posicionDe(l.nombre);
        const puntos = porNombre.get(l.nombre)?.puntos ?? [];
        const color = cordonDe(l.cordon).color;
        const visibles = puntos.slice(0, MARCAS_POR_LOCALIDAD);

        return (
          <g key={l.nombre}>
            {puntos.length === 0 ? (
              <circle
                cx={centro.x}
                cy={centro.y}
                r="1.5"
                fill="#ffffff"
                stroke={color}
                strokeWidth="0.4"
                strokeDasharray="0.9 0.7"
              />
            ) : (
              <>
                <circle cx={centro.x} cy={centro.y} r={MARCA * 1.5} fill={color} opacity="0.1" />
                {visibles.map((punto, i) => {
                  const d = nidoDe(i, MARCA * 0.92);
                  return (
                    <MarcaAquaMar
                      key={punto.id}
                      x={centro.x + d.x}
                      y={centro.y + d.y}
                      titulo={`${punto.comercio} — ${l.nombre}`}
                    />
                  );
                })}
                {puntos.length > visibles.length && (
                  <text
                    x={centro.x + MARCA * 2.6}
                    y={centro.y + 1}
                    textAnchor="middle"
                    fontSize="2.6"
                    fontWeight="700"
                    fill={color}
                  >
                    +{puntos.length - visibles.length}
                  </text>
                )}
              </>
            )}

            <text
              x={centro.x}
              y={centro.y + (puntos.length ? MARCA * 2 + 1.9 : 4.4)}
              textAnchor="middle"
              fontSize="2.6"
              fontWeight={puntos.length ? 700 : 400}
              fill={puntos.length ? "#0e2136" : "#5a7290"}
            >
              {l.nombre}
              {puntos.length > 0 && (
                <tspan fill={color} fontWeight="700">{` (${puntos.length})`}</tspan>
              )}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
