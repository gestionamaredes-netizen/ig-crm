"use client";
import { useState } from "react";
import { createCuenta, updateCuenta, deleteCuenta } from "@/app/(app)/cambio/cuentas-actions";
import type { Cuenta } from "@/lib/cambio/cuentas";

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11,
  padding: "10px 18px", fontSize: 13, fontWeight: 650, cursor: "pointer",
};
const botonSecundario: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11,
  padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
};
const botonEliminar: React.CSSProperties = {
  background: "transparent", border: "1px solid var(--warn)", borderRadius: 11,
  padding: "10px 16px", fontSize: 13, fontWeight: 650, color: "var(--warn)", marginRight: "auto",
};

/**
 * Mensaje uniforme para el catch de red: la action puede rechazar la
 * promesa en vez de devolver {ok:false} (un action ID viejo tras un
 * redeploy, un corte de red a mitad del POST). Sin este catch, "guardando"
 * quedaba en true para siempre. Mismo criterio que celular-forms.tsx.
 */
const ERROR_RED = "No se pudo conectar con el servidor. Probá de nuevo.";

// ---------------------------------------------------------------------------
// Cuenta bancaria: alta y edición comparten el mismo modal (mismo patrón que
// CuentaForm en celular-forms.tsx). Esta es la cuenta bancaria del sector
// Cuentas (titular + CBU/alias en pesos y dólares), no la cuenta operativa
// de un celular: por eso NO reusa NuevaCuentaButton/EditarCuentaButton.
// ---------------------------------------------------------------------------

type CuentaFormProps = {
  abierto: boolean;
  onCerrar: () => void;
} & (
  | { modo: "crear"; cuenta?: undefined }
  | { modo: "editar"; cuenta: Cuenta }
);

function CuentaForm({ abierto, onCerrar, modo, cuenta }: CuentaFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cerrar = () => {
    setError(null);
    setGuardando(false);
    onCerrar();
  };

  const eliminar = async () => {
    if (modo !== "editar" || guardando || eliminando) return;
    if (!window.confirm("¿Eliminar? No se puede deshacer.")) return;
    setEliminando(true);
    setError(null);
    try {
      const r = await deleteCuenta(cuenta.id);
      if (r.ok) onCerrar();
      else setError(r.error);
    } catch {
      setError(ERROR_RED);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => {
            if (guardando || eliminando) return;
            cerrar();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>
              {modo === "editar" ? "Editar cuenta" : "Nueva cuenta"}
            </h2>

            <form
              action={async (formData) => {
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                try {
                  const r =
                    modo === "editar"
                      ? await updateCuenta(cuenta.id, formData)
                      : await createCuenta(formData);
                  if (r.ok) cerrar();
                  else setError(r.error);
                } catch {
                  setError(ERROR_RED);
                } finally {
                  setGuardando(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Titular</label>
                  <input name="titular" required style={field} defaultValue={cuenta?.titular} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label style={label}>DNI</label>
                  <input name="dni" style={field} defaultValue={cuenta?.dni} placeholder="30111222" />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", margin: "4px 0 0", textTransform: "uppercase" }}>
                  Cuenta en pesos
                </h3>
                <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={label}>CBU/CVU</label>
                    <input name="cbuPesos" style={field} defaultValue={cuenta?.cbuPesos} />
                  </div>
                  <div>
                    <label style={label}>Alias</label>
                    <input name="aliasPesos" style={field} defaultValue={cuenta?.aliasPesos} />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", margin: "4px 0 0", textTransform: "uppercase" }}>
                  Cuenta en dólares
                </h3>
                <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={label}>CBU/CVU</label>
                    <input name="cbuDolares" style={field} defaultValue={cuenta?.cbuDolares} />
                  </div>
                  <div>
                    <label style={label}>Alias</label>
                    <input name="aliasDolares" style={field} defaultValue={cuenta?.aliasDolares} />
                  </div>
                </div>
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} defaultValue={cuenta?.notas} />
              </div>

              {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                {modo === "editar" && (
                  <button
                    type="button"
                    onClick={eliminar}
                    disabled={guardando || eliminando}
                    style={{ ...botonEliminar, cursor: guardando || eliminando ? "not-allowed" : "pointer", opacity: guardando || eliminando ? 0.6 : 1 }}
                  >
                    {eliminando ? "Eliminando…" : "Eliminar"}
                  </button>
                )}
                <button type="button" onClick={cerrar} disabled={guardando || eliminando} style={{ ...botonSecundario, cursor: guardando || eliminando ? "not-allowed" : "pointer", opacity: guardando || eliminando ? 0.6 : 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando || eliminando} style={{ ...botonDorado, padding: "10px 20px", opacity: guardando || eliminando ? 0.6 : 1 }}>
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function NuevaCuentaBancariaButton({}: Record<string, never>) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonDorado}>
        Nueva cuenta
      </button>
      <CuentaForm abierto={abierto} onCerrar={() => setAbierto(false)} modo="crear" />
    </>
  );
}

/**
 * Editor de una cuenta bancaria existente, mismo criterio que
 * EditarCuentaButton en celular-forms.tsx: el padre decide cuándo mostrarlo
 * y lo monta con `key={cuenta.id}`.
 */
export function EditarCuentaBancariaButton({
  cuenta,
  abierto,
  onCerrar,
}: {
  cuenta: Cuenta;
  abierto: boolean;
  onCerrar: () => void;
}) {
  return <CuentaForm modo="editar" cuenta={cuenta} abierto={abierto} onCerrar={onCerrar} />;
}
