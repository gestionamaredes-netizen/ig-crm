"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { filtrarOpciones, hayCoincidenciaExacta, valorASubmit, opcionNueva, type OpcionCombo } from "@/lib/cambio/combo";
import type { ResultadoContacto } from "@/app/(app)/cambio/contactos-actions";

type ComboAltaProps = {
  name: string;
  label: string;
  opciones: OpcionCombo[];
  permitirLibre: boolean;
  placeholder?: string;
  onCrear?: (nombre: string) => Promise<ResultadoContacto>;
  /** Precarga (edición): arranca con esta opción ya elegida en vez de vacío. */
  valorInicial?: { value: string; nombre: string };
};

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

export function ComboAlta({ name, label: etiqueta, opciones, permitirLibre, placeholder, onCrear, valorInicial }: ComboAltaProps) {
  const router = useRouter();
  // Solo las opciones creadas desde ESTA instancia. `opciones` (prop) se
  // actualiza cuando router.refresh() trae datos frescos del servidor; hasta
  // que eso llega, `agregadas` cubre el instante para que el nuevo contacto
  // aparezca de inmediato acá. El merge deduplicado evita que quede
  // duplicado una vez que `opciones` también lo incluye.
  const [agregadas, setAgregadas] = useState<OpcionCombo[]>([]);
  const [texto, setTexto] = useState(valorInicial?.nombre ?? "");
  const [sel, setSel] = useState<OpcionCombo | null>(() => valorInicial ?? null);
  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lista = useMemo(() => {
    const vistos = new Set(opciones.map((o) => o.value));
    return [...opciones, ...agregadas.filter((a) => !vistos.has(a.value))].sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }, [opciones, agregadas]);

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
    try {
      const r = await onCrear(texto.trim());
      if (r.ok) {
        const nueva = opcionNueva(r, permitirLibre);
        setAgregadas((prev) => [...prev, nueva]);
        elegir(nueva);
        router.refresh();
      } else {
        setError(r.error);
      }
    } catch {
      // La action puede rechazar (corte de red, action ID viejo tras un
      // redeploy) en vez de devolver {ok:false}. Sin este catch, `creando`
      // quedaba en true para siempre y el botón se trababa en "Agregando…".
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setCreando(false);
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
