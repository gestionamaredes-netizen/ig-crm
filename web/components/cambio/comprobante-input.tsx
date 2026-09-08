"use client";
import { useState } from "react";
import { subirComprobante, urlComprobante } from "@/lib/cambio/comprobantes";

type Props = {
  value: string;
  // Puede ser sincrónico (form: solo guarda el path en estado) o async (tabla:
  // persiste con setComprobante y devuelve el resultado). Si devuelve {ok:false},
  // mostramos el error acá en vez de dejar que falle en silencio.
  onChange: (path: string) => void | Promise<{ ok: boolean; error?: string } | void>;
  compacto?: boolean;
};

const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

export function ComprobanteInput({ value, onChange, compacto }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-elegir el mismo archivo
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const r = await subirComprobante(file);
    if (!r.ok) {
      setSubiendo(false);
      setError(r.error);
      return;
    }
    // El archivo ya está en Storage; ahora avisamos el path. Si onChange lo
    // persiste (tabla) y falla, lo mostramos para que el usuario no crea que
    // quedó adjuntado cuando en realidad no se guardó.
    const res = await onChange(r.path);
    setSubiendo(false);
    if (res && res.ok === false) setError(res.error ?? "No se pudo guardar el comprobante.");
  };

  const ver = async () => {
    const url = await urlComprobante(value);
    if (url) window.open(url, "_blank", "noopener");
  };

  const btn: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9,
    padding: compacto ? "5px 10px" : "9px 12px", fontSize: 12.5, color: "var(--text)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6,
  };

  return (
    <div>
      {!compacto && <label style={label}>Comprobante (opcional)</label>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label style={{ ...btn, opacity: subiendo ? 0.6 : 1 }}>
          {subiendo ? "Subiendo…" : value ? "Cambiar" : compacto ? "Adjuntar" : "Elegir archivo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={elegir}
            disabled={subiendo}
            style={{ display: "none" }}
          />
        </label>
        {value && (
          <button type="button" onClick={ver} style={{ ...btn, color: "var(--accent)", fontWeight: 600 }}>
            Ver
          </button>
        )}
      </div>
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "5px 0 0" }}>{error}</p>}
    </div>
  );
}
