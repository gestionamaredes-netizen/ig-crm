"use client";
import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

// Muestra una clave oculta (••••••) con botones para verla y copiarla. Así la
// clave no queda a la vista en una captura salvo que la persona la abra a
// propósito. La clave igual viaja al navegador (está en los datos de la
// cuenta): esto es una barrera visual, no cifrado.

const boton: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8,
  padding: "4px 6px", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--muted)",
};

export function ClaveSecreta({ valor }: { valor: string }) {
  const [ver, setVer] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!valor) return <span style={{ color: "var(--muted)" }}>—</span>;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1200);
    } catch {
      // Sin permiso de portapapeles (o navegador viejo): no rompe, solo no copia.
    }
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: ver ? "ui-monospace,Menlo,Consolas,monospace" : "inherit", letterSpacing: ver ? 0 : 2 }}>
        {ver ? valor : "••••••"}
      </span>
      <button type="button" onClick={() => setVer((v) => !v)} title={ver ? "Ocultar" : "Ver"} aria-label={ver ? "Ocultar clave" : "Ver clave"} style={boton}>
        {ver ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button type="button" onClick={copiar} title="Copiar" aria-label="Copiar clave" style={boton}>
        {copiado ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
