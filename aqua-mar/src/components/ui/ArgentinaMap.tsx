/** Contorno real de Argentina con Islas Malvinas (Natural Earth,
 * proyección Mercator) y pin sobre Buenos Aires por coordenadas. */
const ARG_PATH =
  "M55.11,354.99L58.46,361.74L62.85,372.80L74.27,381.81L86.56,385.58L82.61,393.24L74.27,394L69.81,388.60L64.50,388.18L55.11,388.16ZM151.77,88.03L149.56,96.20L147.22,106.79L147.32,117.15L145.39,119.5L144.72,126.31L144.12,131.84L155.28,141.01L154.08,148.47L159.55,153.20L159.11,158.55L150.67,172.74L137.64,178.76L120.04,181.11L110.4,179.98L112.26,186.72L110.46,195.27L112.07,201.09L106.79,205.18L97.81,206.79L89.37,202.54L85.96,205.59L87.19,217.25L93.14,220.82L97.94,217.09L100.53,223.26L92.47,226.96L85.42,234.44L84.13,246.73L82.04,253.35L73.76,253.39L66.87,259.77L64.34,269.23L72.97,278.61L81.38,281.21L78.34,292.93L67.97,300.39L62.29,316.16L54.26,321.57L50.68,328.02L53.50,342.60L59.35,350.87L55.65,350.14L47.52,347.88L26.28,345.97L22.65,337.72L22.84,327.25L16.99,328.14L13.89,323.13L13.13,308.71L19.86,302.80L22.65,294.38L21.60,287.74L26.28,276.70L29.47,259.90L28.53,252.57L32.38,250.22L31.43,245.57L27.36,243.12L30.26,237.99L26.28,233.4L24.23,219.57L27.77,217.17L26.28,202.89L28.34,191.10L30.71,180.97L35.95,176.88L33.30,166.00L33.27,155.88L39.91,148.76L39.68,139.73L44.71,129.32L44.74,119.60L42.47,117.68L38.42,99.76L43.82,89.26L42.97,79.45L46.13,70.34L51.89,61.00L58.08,54.86L55.46,51.00L57.29,47.85L57.01,31.65L66.55,26.91L69.59,16.96L68.51,14.57L75.81,6L87.32,8.30L92.47,15.17L95.92,7.53L105.91,7.92L107.33,9.96L123.48,25.53L130.66,26.97L141.37,34.11L150.41,37.89L151.68,42.19L143.05,57.08L151.90,59.76L161.76,61.28L168.72,59.69L176.68,52.13L178.10,43.51L182.47,41.63L186.86,47.26L186.67,55.10L179.27,60.54L173.39,64.59L163.47,74.27Z";
const MALVINAS_PATH =
  "M120.38,343.71L130.91,335.25L138.37,338.77L143.65,333.14L150.67,339.46L148.04,344.43L136.19,348.71L132.24,343.71L124.78,350.14Z";

export function ArgentinaMap({ className = "mx-auto h-72 w-auto sm:h-80" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 400"
      className={className}
      role="img"
      aria-label="Mapa de Argentina con las Islas Malvinas"
    >
      <defs>
        <pattern id="arg-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.15" fill="rgb(0 201 216 / 0.55)" />
        </pattern>
        <linearGradient id="arg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(0 201 216 / 0.28)" />
          <stop offset="100%" stopColor="rgb(0 88 217 / 0.32)" />
        </linearGradient>
      </defs>
      <g>
        <path d={ARG_PATH} fill="url(#arg-fill)" stroke="rgb(0 201 216 / 0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={ARG_PATH} fill="url(#arg-dots)" />
        <path d={MALVINAS_PATH} fill="url(#arg-fill)" stroke="rgb(0 201 216 / 0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="143.2" cy="134.7" r="16" fill="rgb(253 184 19 / 0.15)">
          <animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="143.2" cy="134.7" r="5" fill="#FDB813" stroke="#fff" strokeWidth="1.8" />
      </g>
    </svg>
  );
}
