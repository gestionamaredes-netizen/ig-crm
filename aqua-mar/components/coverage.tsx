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

/** Silueta simplificada de Argentina con textura de puntos. */
function ArgentinaMap() {
  return (
    <svg
      viewBox="0 0 200 400"
      className="mx-auto h-72 w-auto sm:h-80"
      role="img"
      aria-label="Mapa de Argentina"
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
        <path
          d="M100 10 C118 12 130 24 134 40 C138 54 150 60 148 74 C146 86 138 92 140 104 C142 118 134 128 136 142 C138 156 128 164 130 178 C132 192 122 202 124 216 C126 230 116 240 118 254 C120 268 110 278 112 292 C114 306 104 316 106 330 C107 341 100 350 92 356 C88 368 78 374 68 372 C62 364 66 354 60 346 C54 338 58 328 52 320 C46 312 50 302 46 294 C42 286 46 276 42 268 C38 260 42 250 38 242 C34 234 38 224 36 216 C34 208 38 198 36 190 C34 182 38 172 36 164 C34 156 40 146 38 138 C36 130 42 120 42 112 C42 104 38 96 42 88 C46 80 44 70 50 62 C56 54 60 44 70 36 C80 28 88 14 100 10 Z"
          fill="url(#argfill)"
          stroke="rgb(8 196 199 / 0.7)"
          strokeWidth="1.5"
        />
        <path
          d="M100 10 C118 12 130 24 134 40 C138 54 150 60 148 74 C146 86 138 92 140 104 C142 118 134 128 136 142 C138 156 128 164 130 178 C132 192 122 202 124 216 C126 230 116 240 118 254 C120 268 110 278 112 292 C114 306 104 316 106 330 C107 341 100 350 92 356 C88 368 78 374 68 372 C62 364 66 354 60 346 C54 338 58 328 52 320 C46 312 50 302 46 294 C42 286 46 276 42 268 C38 260 42 250 38 242 C34 234 38 224 36 216 C34 208 38 198 36 190 C34 182 38 172 36 164 C34 156 40 146 38 138 C36 130 42 120 42 112 C42 104 38 96 42 88 C46 80 44 70 50 62 C56 54 60 44 70 36 C80 28 88 14 100 10 Z"
          fill="url(#dots)"
        />
        {/* Tierra del Fuego */}
        <path
          d="M74 382 C80 380 88 382 92 386 C90 392 82 394 74 392 C70 388 70 384 74 382 Z"
          fill="url(#argfill)"
          stroke="rgb(8 196 199 / 0.7)"
          strokeWidth="1.5"
        />
        {/* Pin sobre Buenos Aires */}
        <circle cx="122" cy="148" r="18" fill="rgb(253 184 19 / 0.15)">
          <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="122" cy="148" r="5.5" fill="#FDB813" stroke="#fff" strokeWidth="2" />
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
