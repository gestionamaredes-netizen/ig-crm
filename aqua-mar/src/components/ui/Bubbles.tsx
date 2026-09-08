/** Burbujas decorativas con posiciones fijas (SSR-safe). */
const BUBBLES = [
  { left: "6%", size: 14, delay: 0, duration: 16, opacity: 0.3, drift: "26px" },
  { left: "16%", size: 8, delay: 4, duration: 13, opacity: 0.4, drift: "-18px" },
  { left: "28%", size: 20, delay: 9, duration: 19, opacity: 0.2, drift: "32px" },
  { left: "41%", size: 10, delay: 2, duration: 14, opacity: 0.35, drift: "-24px" },
  { left: "55%", size: 16, delay: 7, duration: 17, opacity: 0.25, drift: "20px" },
  { left: "68%", size: 9, delay: 1, duration: 12, opacity: 0.4, drift: "-14px" },
  { left: "79%", size: 22, delay: 5, duration: 20, opacity: 0.18, drift: "28px" },
  { left: "90%", size: 12, delay: 10, duration: 15, opacity: 0.3, drift: "-22px" },
];

export function Bubbles({ light = false }: { light?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-40px] animate-bubble rounded-full"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            background: light
              ? "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.12))"
              : "radial-gradient(circle at 30% 30%, rgb(0 201 216 / 0.5), rgb(0 88 217 / 0.1))",
            ["--bubble-opacity" as string]: b.opacity,
            ["--bubble-drift" as string]: b.drift,
          }}
        />
      ))}
    </div>
  );
}
