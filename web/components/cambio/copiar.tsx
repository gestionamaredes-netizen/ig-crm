"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Botón chico para copiar un dato al portapapeles (CBU, DNI, nombre…). Muestra
// un tilde por un instante cuando copió. Si el navegador no da permiso de
// portapapeles, no rompe: simplemente no copia.

const boton: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8,
  padding: "4px 6px", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--muted)", flexShrink: 0,
};

export function BotonCopiar({ valor, titulo = "Copiar" }: { valor: string; titulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  if (!valor) return null;

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
    <button type="button" onClick={copiar} title={titulo} aria-label={titulo} style={boton}>
      {copiado ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

/**
 * Fila "Etiqueta: valor [copiar]". Si el valor está vacío muestra un guion y no
 * ofrece copiar. Se usa para los datos de cada cuenta en el pool del runner.
 */
export function DatoCopiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, minWidth: 0 }}>
      <span style={{ color: "var(--muted)", flexShrink: 0 }}>{etiqueta}:</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{valor || "—"}</span>
      {valor && <BotonCopiar valor={valor} titulo={`Copiar ${etiqueta.toLowerCase()}`} />}
    </div>
  );
}
