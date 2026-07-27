"use client";
import { useState } from "react";
import {
  createPhone,
  updatePhone,
  deletePhone,
  createPhoneAccount,
  updatePhoneAccount,
  deletePhoneAccount,
} from "@/app/(app)/cambio/celulares-actions";
import type { Celular, CuentaOperativa } from "@/lib/cambio/celulares";
import type { Runner } from "@/lib/cambio/runners";

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
 * quedaba en true para siempre. Mismo criterio que runner-forms.tsx.
 */
const ERROR_RED = "No se pudo conectar con el servidor. Probá de nuevo.";

// ---------------------------------------------------------------------------
// Celular: alta y edición comparten el mismo modal (mismo patrón que
// GestionForm en runner-forms.tsx).
// ---------------------------------------------------------------------------

type CelularFormProps = {
  runners: Runner[];
  abierto: boolean;
  onCerrar: () => void;
} & (
  | { modo: "crear"; celular?: undefined }
  | { modo: "editar"; celular: Celular }
);

/**
 * Modal + formulario de un celular, compartido entre alta y edición. El
 * estado (activo/fuera de uso) es un toggle controlado, no un checkbox
 * nativo: la action espera "false" explícito para dar de baja y nada (o
 * "true") para dejarlo operativo, así que se setea a mano en el submit en
 * vez de depender de si un checkbox viene marcado en el FormData.
 */
function CelularForm({ runners, abierto, onCerrar, modo, celular }: CelularFormProps) {
  const [activo, setActivo] = useState(celular?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cerrar = () => {
    setError(null);
    setGuardando(false);
    if (modo === "crear") {
      // activo vive en este componente, no en el DOM del modal: sin
      // resetearlo acá, la próxima apertura arranca con el estado del
      // celular anterior. En "editar" no aplica: el padre desmonta este
      // componente al cerrar.
      setActivo(true);
    }
    onCerrar();
  };

  const eliminar = async () => {
    if (modo !== "editar" || guardando || eliminando) return;
    if (!window.confirm("¿Eliminar? No se puede deshacer.")) return;
    setEliminando(true);
    setError(null);
    try {
      const r = await deletePhone(celular.id);
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
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(480px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>
              {modo === "editar" ? "Editar celular" : "Nuevo celular"}
            </h2>

            <form
              action={async (formData) => {
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                formData.set("active", activo ? "true" : "false");
                try {
                  const r =
                    modo === "editar"
                      ? await updatePhone(celular.id, formData)
                      : await createPhone(formData);
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
              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Alias</label>
                  <input name="alias" required style={field} defaultValue={celular?.alias} placeholder="Owen 1" />
                </div>
                <div>
                  <label style={label}>Modelo</label>
                  <input name="model" style={field} defaultValue={celular?.modelo} placeholder="Samsung A54" />
                </div>
              </div>

              <div>
                <label style={label}>Runner a cargo</label>
                <select name="runnerId" defaultValue={celular?.runnerId ?? ""} style={field}>
                  <option value="">— sin runner —</option>
                  {runners.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={label}>Estado</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {([true, false] as const).map((valor) => (
                    <button
                      key={String(valor)}
                      type="button"
                      onClick={() => setActivo(valor)}
                      style={{
                        padding: "11px 10px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${activo === valor ? "var(--accent)" : "var(--border)"}`,
                        background: activo === valor ? "var(--card)" : "transparent",
                        color: activo === valor ? "var(--text)" : "var(--muted)",
                      }}
                    >
                      {valor ? "Activo" : "Fuera de uso"}
                    </button>
                  ))}
                </div>
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

export function NuevoCelularButton({ runners }: { runners: Runner[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonDorado}>
        Nuevo celular
      </button>
      <CelularForm runners={runners} abierto={abierto} onCerrar={() => setAbierto(false)} modo="crear" />
    </>
  );
}

/**
 * Editor de un celular existente. Igual que EditarGestionButton en
 * runner-forms.tsx: no dibuja su propio disparador, el padre decide cuándo
 * mostrarlo (guardando el celular elegido en estado y montando esto con
 * `key={celular.id}`).
 */
export function EditarCelularButton({
  celular,
  runners,
  abierto,
  onCerrar,
}: {
  celular: Celular;
  runners: Runner[];
  abierto: boolean;
  onCerrar: () => void;
}) {
  return (
    <CelularForm modo="editar" celular={celular} runners={runners} abierto={abierto} onCerrar={onCerrar} />
  );
}

// ---------------------------------------------------------------------------
// Cuenta operativa: alta y edición comparten el mismo modal.
// ---------------------------------------------------------------------------

type CuentaFormProps = {
  abierto: boolean;
  onCerrar: () => void;
} & (
  | { modo: "crear"; celularId: string; cuenta?: undefined }
  | { modo: "editar"; cuenta: CuentaOperativa; celularId?: undefined }
);

/**
 * Modal + formulario de una cuenta operativa, compartido entre alta y
 * edición. El celular dueño de la cuenta (phoneId) no es un campo del
 * formulario: en "crear" viene de la prop `celularId` del botón que abre el
 * modal, en "editar" ya está en `cuenta.celularId`. Cualquiera de los dos
 * se manda explícito en el submit, así `camposDeCuenta` en la action nunca
 * lo ve vacío.
 */
function CuentaForm({ abierto, onCerrar, modo, cuenta, celularId }: CuentaFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const phoneId = modo === "editar" ? cuenta.celularId : celularId;

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
      const r = await deletePhoneAccount(cuenta.id);
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
              {modo === "editar" ? "Editar cuenta operativa" : "Nueva cuenta operativa"}
            </h2>

            <form
              action={async (formData) => {
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                formData.set("phoneId", phoneId);
                try {
                  const r =
                    modo === "editar"
                      ? await updatePhoneAccount(cuenta.id, formData)
                      : await createPhoneAccount(formData);
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
                  <input name="holderName" required style={field} defaultValue={cuenta?.titular} placeholder="Juan Pérez" />
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
                <label style={label}>Estado</label>
                <select name="status" defaultValue={cuenta?.estado ?? "activa"} style={field}>
                  <option value="activa">Activa</option>
                  <option value="bloqueada">Bloqueada</option>
                </select>
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

export function NuevaCuentaButton({ celularId }: { celularId: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonSecundario}>
        Nueva cuenta
      </button>
      <CuentaForm celularId={celularId} abierto={abierto} onCerrar={() => setAbierto(false)} modo="crear" />
    </>
  );
}

/**
 * Editor de una cuenta operativa existente, mismo criterio que
 * EditarCelularButton: el padre decide cuándo mostrarlo y lo monta con
 * `key={cuenta.id}`.
 */
export function EditarCuentaButton({
  cuenta,
  abierto,
  onCerrar,
}: {
  cuenta: CuentaOperativa;
  abierto: boolean;
  onCerrar: () => void;
}) {
  return <CuentaForm modo="editar" cuenta={cuenta} abierto={abierto} onCerrar={onCerrar} />;
}
