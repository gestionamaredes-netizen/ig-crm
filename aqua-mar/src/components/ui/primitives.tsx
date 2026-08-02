import type { ReactNode, ComponentProps } from "react";

/** Contenedor máximo del grid (1320px) con padding lateral. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-5 sm:px-6 lg:px-[60px] ${className}`}>{children}</div>;
}

/** Sección con espaciado vertical del sistema. */
export function Section({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 lg:py-32 ${className}`}>
      {children}
    </section>
  );
}

/** Kicker + título de sección, centrado u alineado a la izquierda. */
export function SectionTitle({
  kicker,
  title,
  text,
  align = "center",
  dark = false,
}: {
  kicker?: string;
  title: string;
  text?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {kicker && (
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-turquesa">
          {kicker}
        </p>
      )}
      <h2
        className={`font-display text-[34px] font-extrabold leading-[1.08] tracking-tight sm:text-5xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {text && (
        <p className={`mt-4 text-lg ${dark ? "text-white/75" : "text-ink-soft"}`}>{text}</p>
      )}
    </div>
  );
}

/** Insignia chica (acento amarillo solo en detalles). */
export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "sun" }) {
  const cls =
    tone === "sun"
      ? "bg-sun/15 text-[#8a6100] border-sun/40"
      : "bg-celeste/60 text-primary border-primary/15";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] ${cls}`}
    >
      {children}
    </span>
  );
}

/** Input accesible con label permanente. */
export function Input({
  label,
  error,
  ...props
}: { label: string; error?: string } & ComponentProps<"input">) {
  const id = props.id ?? props.name;
  return (
    <label className="grid gap-1.5 text-sm font-bold text-ink" htmlFor={id}>
      {label}
      <input
        id={id}
        {...props}
        aria-invalid={!!error}
        className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] font-medium text-ink placeholder:text-ink-soft/50 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
      />
      {error && (
        <span role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

/** Textarea accesible con label permanente. */
export function Textarea({
  label,
  error,
  ...props
}: { label: string; error?: string } & ComponentProps<"textarea">) {
  const id = props.id ?? props.name;
  return (
    <label className="grid gap-1.5 text-sm font-bold text-ink" htmlFor={id}>
      {label}
      <textarea
        id={id}
        {...props}
        aria-invalid={!!error}
        className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] font-medium text-ink placeholder:text-ink-soft/50 outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
      />
      {error && (
        <span role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
