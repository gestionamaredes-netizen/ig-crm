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
 * Botón ancho con texto ("Copiar datos") que copia un bloque completo al
 * portapapeles de un toque. Se usa en el pool del runner para llevarse
 * nombre + DNI + CBU/alias de una cuenta todo junto.
 */
export function BotonCopiarTexto({ valor, children = "Copiar datos" }: { valor: string; children?: React.ReactNode }) {
  const [copiado, setCopiado] = useState(false);
  if (!valor) return null;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1400);
    } catch {
      // Sin permiso de portapapeles: no rompe, solo no copia.
    }
  };

  return (
    <button
      type="button"
      onClick={copiar}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
        padding: "8px 12px", fontSize: 13, fontWeight: 650, color: "var(--text)",
      }}
    >
      {copiado ? <Check size={15} /> : <Copy size={15} />}
      {copiado ? "¡Copiado!" : children}
    </button>
  );
}
