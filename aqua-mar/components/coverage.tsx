import { Truck, Package, MapPin } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/wa";
import { Reveal } from "./reveal";
import { Bubbles } from "./bubbles";

const LOCALIDADES = [
  { name: "San Miguel", pos: "left-[58%] top-[8%]" },
  { name: "Moreno", pos: "left-[6%] top-[26%]" },
  { name: "Hurlingham", pos: "left-[64%] top-[36%]" },
  { name: "Merlo", pos: "left-[10%] top-[62%]" },
  { name: "Ituzaingó", pos: "left-[34%] top-[84%]" },
  { name: "Morón", pos: "left-[68%] top-[68%]" },
  { name: "Ramos Mejía", pos: "left-[72%] top-[48%]" },
  { name: "Castelar", pos: "left-[22%] top-[42%]" },
];

/**
 * Mapa de Argentina con las Islas Malvinas, generado a partir de
 * cartografia real (Natural Earth via world-atlas, proyeccion Mercator).
 */
const ARG_PATH =
  "M55.11,354.99L58.46,361.74L62.85,372.80L74.27,381.81L86.56,385.58L82.61,393.24L74.27,394L69.81,388.60L64.50,388.18L55.11,388.16ZM151.77,88.03L149.56,96.20L147.22,106.79L147.32,117.15L145.39,119.5L144.72,126.31L144.12,131.84L155.28,141.01L154.08,148.47L159.55,153.20L159.11,158.55L150.67,172.74L137.64,178.76L120.04,181.11L110.4,179.98L112.26,186.72L110.46,195.27L112.07,201.09L106.79,205.18L97.81,206.79L89.37,202.54L85.96,205.59L87.19,217.25L93.14,220.82L97.94,217.09L100.53,223.26L92.47,226.96L85.42,234.44L84.13,246.73L82.04,253.35L73.76,253.39L66.87,259.77L64.34,269.23L72.97,278.61L81.38,281.21L78.34,292.93L67.97,300.39L62.29,316.16L54.26,321.57L50.68,328.02L53.50,342.60L59.35,350.87L55.65,350.14L47.52,347.88L26.28,345.97L22.65,337.72L22.84,327.25L16.99,328.14L13.89,323.13L13.13,308.71L19.86,302.80L22.65,294.38L21.60,287.74L26.28,276.70L29.47,259.90L28.53,252.57L32.38,250.22L31.43,245.57L27.36,243.12L30.26,237.99L26.28,233.4L24.23,219.57L27.77,217.17L26.28,202.89L28.34,191.10L30.71,180.97L35.95,176.88L33.30,166.00L33.27,155.88L39.91,148.76L39.68,139.73L44.71,129.32L44.74,119.60L42.47,117.68L38.42,99.76L43.82,89.26L42.97,79.45L46.13,70.34L51.89,61.00L58.08,54.86L55.46,51.00L57.29,47.85L57.01,31.65L66.55,26.91L69.59,16.96L68.51,14.57L75.81,6L87.32,8.30L92.47,15.17L95.92,7.53L105.91,7.92L107.33,9.96L123.48,25.53L130.66,26.97L141.37,34.11L150.41,37.89L151.68,42.19L143.05,57.08L151.90,59.76L161.76,61.28L168.72,59.69L176.68,52.13L178.10,43.51L182.47,41.63L186.86,47.26L186.67,55.10L179.27,60.54L173.39,64.59L163.47,74.27Z";
const MALVINAS_PATH =
  "M120.38,343.71L130.91,335.25L138.37,338.77L143.65,333.14L150.67,339.46L148.04,344.43L136.19,348.71L132.24,343.71L124.78,350.14Z";

function ArgentinaMap() {
  return (
    <svg
      viewBox="0 0 200 400"
      className="mx-auto h-72 w-auto sm:h-80"
      role="img"
      aria-label="Mapa de Argentina con las Islas Malvinas"
    >
      <defs>
        <pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.15" fill="rgb(8 196 199 / 0.55)" />
        </pattern>
        <linearGradient id="argfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(8 196 199 / 0.28)" />
          <stop offset="100%" stopColor="rgb(0 78 168 / 0.32)" />
        </linearGradient>
      </defs>
      <g>
        <path d={ARG_PATH} fill="url(#argfill)" stroke="rgb(8 196 199 / 0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={ARG_PATH} fill="url(#dots)" />
        {/* Islas Malvinas */}
        <path d={MALVINAS_PATH} fill="url(#argfill)" stroke="rgb(8 196 199 / 0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Pin sobre Buenos Aires / Zona Oeste */}
        <circle cx="143.2" cy="134.7" r="16" fill="rgb(253 184 19 / 0.15)">
          <animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="143.2" cy="134.7" r="5" fill="#FDB813" stroke="#fff" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

export function Coverage() {
  return (
    <section
      id="cobertura"
      className="relative overflow-hidden bg-deep py-24 text-white lg:py-32"
    >
      {/* Fondo tecnológico */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-32 top-0 size-[460px] rounded-full bg-brand/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-[460px] rounded-full bg-mar/20 blur-3xl" />
      </div>
      <Bubbles light />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Cobertura
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            De Zona Oeste a todo el país
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Zona Oeste */}
          <Reveal>
            <div className="glass-dark h-full rounded-[2rem] p-8 sm:p-10">
              <div className="mb-2 flex items-center gap-2 text-mar">
                <MapPin className="size-5" />
                <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
                  Zona Oeste
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                Distribuimos Powerful en toda Zona Oeste.
              </h3>
              <p className="mt-3 text-white/70">
                Entregas rápidas y atención personalizada, de comerciante a
                comerciante y puerta a puerta.
              </p>

              {/* Radar de localidades */}
              <div className="relative mx-auto mt-8 aspect-square max-w-sm">
                <div aria-hidden className="absolute inset-0">
                  <div className="absolute inset-0 rounded-full border border-mar/20" />
                  <div className="absolute inset-[16%] rounded-full border border-mar/25" />
                  <div className="absolute inset-[32%] rounded-full border border-mar/30" />
                  <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mar shadow-glow" />
                  <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-mar/25 [animation-duration:2.6s]" />
                </div>
                {LOCALIDADES.map((l) => (
                  <span
                    key={l.name}
                    className={`absolute ${l.pos} whitespace-nowrap rounded-full bg-mar/90 px-3 py-1 text-[11px] font-extrabold text-deep shadow-soft`}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Todo el país */}
          <Reveal delay={0.12}>
            <div className="glass-dark flex h-full flex-col rounded-[2rem] p-8 sm:p-10">
              <div className="mb-2 flex items-center gap-2 text-mar">
                <Truck className="size-5" />
                <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
                  Todo el país
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                También llegamos a todo el país.
              </h3>
              <p className="mt-3 text-white/70">
                Realizamos envíos a cualquier punto de Argentina mediante
                transporte y logística.
              </p>

              <div className="my-6 flex-1">
                <ArgentinaMap />
              </div>

              <ul className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {[
                  { icon: Truck, label: "Transporte a todo el país" },
                  { icon: Package, label: "Embalaje seguro" },
                  { icon: MapPin, label: "Seguimiento del envío" },
                ].map((f) => (
                  <li key={f.label} className="flex flex-col items-center gap-2 text-center">
                    <f.icon className="size-6 text-mar" strokeWidth={1.9} />
                    <span className="text-xs font-semibold text-white/75">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
          <a
            href={waLink(WA_MESSAGES.cobertura)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full bg-mar px-7 py-3.5 text-[15px] font-bold text-deep transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            Consultar por mi zona
          </a>
        </Reveal>
      </div>
    </section>
  );
}
