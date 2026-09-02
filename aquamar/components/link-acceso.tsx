"use client";

import { useState } from "react";

/** El link que se le pasa al comercio, con botón para copiarlo o mandarlo por WhatsApp. */
export function LinkAcceso({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles el texto igual queda a la vista para copiar a mano.
      setCopiado(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* En el celular el link ocupa su propia línea; los botones caen abajo. */}
      <code className="min-w-0 basis-full truncate rounded-lg bg-azul-50 px-2 py-1.5 text-xs text-azul-700 sm:flex-1 sm:basis-auto">
        {url}
      </code>
      <button
        type="button"
        onClick={copiar}
        className="toque min-h-10 rounded-lg border border-borde px-3 text-xs font-medium hover:bg-azul-50"
      >
        {copiado ? "¡Copiado!" : "Copiar"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Este es tu acceso a Aqua Mar: ${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="toque min-h-10 rounded-lg border border-borde px-3 text-xs font-medium hover:bg-azul-50"
      >
        WhatsApp
      </a>
    </div>
  );
}
