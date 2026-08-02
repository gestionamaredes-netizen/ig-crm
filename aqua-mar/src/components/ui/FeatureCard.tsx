import type { ComponentType, ReactNode } from "react";

/** Tarjeta estándar: ícono arriba, título, descripción. */
export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="group h-full rounded-3xl border border-border bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-celeste/60 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <h3 className="mt-5 font-display text-lg font-extrabold text-ink">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
