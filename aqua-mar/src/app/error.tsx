"use client";

/** Error boundary de página: falla de forma segura, sin trazas técnicas. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 text-center">
      <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
        Algo no salió como esperábamos.
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Podés reintentar o volver al inicio. Si el problema continúa,
        escribinos por WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-[52px] items-center rounded-[18px] bg-primary px-8 text-[15px] font-bold text-white transition-all hover:bg-primary-hover"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="inline-flex min-h-[52px] items-center rounded-[18px] border-2 border-primary/25 bg-white px-8 text-[15px] font-bold text-primary transition-all hover:border-primary"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
