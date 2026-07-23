"use client";
import { useState } from "react";
import { filtrarOpciones, hayCoincidenciaExacta, valorASubmit, type OpcionCombo } from "@/lib/cambio/combo";
import type { ResultadoContacto } from "@/app/(app)/cambio/contactos-actions";

type ComboAltaProps = {
  name: string;
  label: string;
  opciones: OpcionCombo[];
  permitirLibre: boolean;
  placeholder?: string;
  onCrear?: (nombre: string) => Promise<ResultadoContacto>;
};

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

export function ComboAlta({ name, label: etiqueta, opciones, permitirLibre, placeholder, onCrear }: ComboAltaProps) {
  const [lista, setLista] = useState<OpcionCombo[]>(opciones);
  const [texto, setTexto] = useState("");
  const [sel, setSel] = useState<OpcionCombo | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtradas = filtrarOpciones(lista, texto);
  const exacta = hayCoincidenciaExacta(lista, texto);
  const puedeCrear = !!onCrear && texto.trim() !== "" && !exacta;
  const valor = valorASubmit(sel, texto, permitirLibre);

  const elegir = (o: OpcionCombo) => {
    setSel(o);
    setTexto(o.nombre);
    setAbierto(false);
    setError(null);
  };

  const crear = async () => {
    if (!onCrear || creando) return;
    setCreando(true);
    setError(null);
    const r = await onCrear(texto.trim());
    setCreando(false);
    if (r.ok) {
      const nueva = { value: r.id, nombre: r.nombre };
      setLista((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      elegir(nueva);
    } else {
      setError(r.error);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <label style={label}>{etiqueta}</label>
      {/* El valor real que lee el formulario. */}
      <input type="hidden" name={name} value={valor} readOnly />
      <input
        value={texto}
        placeholder={placeholder}
        onChange={(e) => {
          setTexto(e.target.value);
          setSel(null); // al reescribir, se deselecciona; el valor vuelve a texto/""
          setAbierto(true);
          setError(null);
        }}
        onFocus={() => setAbierto(true)}
        // Se cierra con un pequeño delay para que el click en una opción llegue.
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        style={field}
        autoComplete="off"
      />
      {abierto && (filtradas.length > 0 || puedeCrear) && (
        <div
          style={{
            position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, marginTop: 4,
            background: "var(--card)", border: "1px solid var(--border-2)", borderRadius: 10,
            maxHeight: 190, overflowY: "auto", boxShadow: "0 16px 40px -16px #000",
          }}
        >
          {filtradas.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => elegir(o)}
              style={{
                display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "9px 11px", fontSize: 13, color: "var(--text)", cursor: "pointer",
              }}
            >
              {o.nombre}
            </button>
          ))}
          {puedeCrear && (
            <button
              type="button"
              onClick={crear}
              disabled={creando}
              style={{
                display: "block", width: "100%", textAlign: "left", background: "none",
                border: "none", borderTop: filtradas.length ? "1px solid var(--border)" : "none",
                padding: "9px 11px", fontSize: 13, color: "var(--accent)", fontWeight: 600, cursor: "pointer",
              }}
            >
              {creando ? "Agregando…" : `+ Nuevo: "${texto.trim()}"`}
            </button>
          )}
        </div>
      )}
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "5px 0 0" }}>{error}</p>}
    </div>
  );
}
