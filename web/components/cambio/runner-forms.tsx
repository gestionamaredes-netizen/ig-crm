"use client";
import { useRef, useState } from "react";
import {
  createRunner,
  createRunnerAccount,
  createRunnerGestion,
  createRunnerPayment,
} from "@/app/(app)/cambio/runners-actions";
import { hoyISO } from "@/lib/fecha";
import { formatearPesos } from "@/lib/formato";
import type { CuentaGestion, Runner, TipoGestion } from "@/lib/cambio/runners";

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

/**
 * Mensaje uniforme para el catch de red: la action puede rechazar la
 * promesa en vez de devolver {ok:false} (un action ID viejo tras un
 * redeploy, un corte de red a mitad del POST). Sin este catch, "guardando"
 * quedaba en true para siempre.
 */
const ERROR_RED = "No se pudo conectar con el servidor. Probá de nuevo.";

// ---------------------------------------------------------------------------
// Nueva gestión
// ---------------------------------------------------------------------------

export function NuevaGestionButton({ runners, cuentas }: { runners: Runner[]; cuentas: CuentaGestion[] }) {
  const [abierto, setAbierto] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [fee, setFee] = useState("");
  const [kind, setKind] = useState<TipoGestion>("retiro");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cerrar = () => {
    setAbierto(false);
    setError(null);
    // accountId, fee y kind son estado controlado que vive en este
    // componente, no en el DOM del modal: si no se resetean acá, la próxima
    // apertura arranca con la cuenta y el pago de la gestión anterior todavía
    // cargados.
    setAccountId("");
    setFee("");
    setKind("retiro");
    setGuardando(false);
  };

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonDorado}>
        Nueva gestión
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => {
            if (guardando) return;
            cerrar();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Nueva gestión</h2>

            <form
              action={async (formData) => {
                if (guardando) return;
                setGuardando(true);
                setError(null);
                formData.set("accountId", accountId);
                formData.set("fee", fee);
                formData.set("kind", kind);
                try {
                  const r = await createRunnerGestion(formData);
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
                  <label style={label}>Fecha</label>
                  <input type="date" name="gestionDate" defaultValue={hoyISO()} required style={field} />
                </div>
                <div>
                  <label style={label}>Runner</label>
                  <select name="runnerId" required defaultValue="" style={field}>
                    <option value="" disabled>Elegir…</option>
                    {runners.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Cuenta</label>
                  <select
                    value={accountId}
                    onChange={(e) => {
                      const elegida = e.target.value;
                      setAccountId(elegida);
                      // El pago de la cuenta es el punto de partida: se
                      // autocompleta pero queda editable porque la gestión
                      // puntual puede haber cobrado distinto.
                      const cuenta = cuentas.find((c) => c.id === elegida);
                      if (cuenta) setFee(cuenta.pago.toLocaleString("es-AR"));
                    }}
                    required
                    style={field}
                  >
                    <option value="" disabled>Elegir…</option>
                    {cuentas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Pago</label>
                  <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="numeric" style={field} placeholder="0" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["retiro", "transferencia"] as TipoGestion[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    style={{
                      padding: "11px 10px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${kind === k ? "var(--accent)" : "var(--border)"}`,
                      background: kind === k ? "var(--card)" : "transparent",
                      color: kind === k ? "var(--text)" : "var(--muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div>
                <label style={label}>Monto movido (opcional)</label>
                <input name="amount" inputMode="numeric" style={field} placeholder="452.500" />
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} />
              </div>

              {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={cerrar} disabled={guardando} style={{ ...botonSecundario, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} style={{ ...botonDorado, padding: "10px 20px", opacity: guardando ? 0.6 : 1 }}>
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

// ---------------------------------------------------------------------------
// Registrar pago a runner
// ---------------------------------------------------------------------------

export function RegistrarPagoButton({ runners }: { runners: Runner[] }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cerrar = () => {
    setAbierto(false);
    setError(null);
    setGuardando(false);
  };

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonSecundario}>
        Registrar pago
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => {
            if (guardando) return;
            cerrar();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(480px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Registrar pago</h2>

            <form
              action={async (formData) => {
                if (guardando) return;
                setGuardando(true);
                setError(null);
                try {
                  const r = await createRunnerPayment(formData);
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
                  <label style={label}>Fecha</label>
                  <input type="date" name="paymentDate" defaultValue={hoyISO()} required style={field} />
                </div>
                <div>
                  <label style={label}>Runner</label>
                  <select name="runnerId" required defaultValue="" style={field}>
                    <option value="" disabled>Elegir…</option>
                    {runners.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={label}>Monto</label>
                <input name="amount" required inputMode="numeric" style={field} placeholder="452.500" />
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} />
              </div>

              {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={cerrar} disabled={guardando} style={{ ...botonSecundario, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} style={{ ...botonDorado, padding: "10px 20px", opacity: guardando ? 0.6 : 1 }}>
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

// ---------------------------------------------------------------------------
// Configuración: cuentas de gestión y runners
// ---------------------------------------------------------------------------

/**
 * Alta de cuenta y alta de runner viven dentro del modal de configuración,
 * que no se cierra al guardar (el usuario puede querer cargar varias
 * seguidas). Por eso, a diferencia de los otros dos modales, acá el "reset"
 * después de un alta exitosa no pasa por cerrar() sino por form.reset()
 * sobre una ref: los campos son no controlados y el form no se desmonta.
 */
function FormNuevaCuenta() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (guardando) return;
        setGuardando(true);
        setError(null);
        try {
          const r = await createRunnerAccount(formData);
          if (r.ok) formRef.current?.reset();
          else setError(r.error);
        } catch {
          setError(ERROR_RED);
        } finally {
          setGuardando(false);
        }
      }}
      style={{ display: "grid", gridTemplateColumns: "1.4fr .8fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 10 }}
    >
      <div>
        <label style={label}>Nombre</label>
        <input name="name" required style={field} placeholder="Caja Owen" />
      </div>
      <div>
        <label style={label}>Moneda</label>
        <select name="currency" defaultValue="ARS" style={field}>
          <option value="ARS">Pesos</option>
          <option value="USD">Dólares</option>
        </select>
      </div>
      <div>
        <label style={label}>Pago</label>
        <input name="fee" inputMode="numeric" style={field} placeholder="0" />
      </div>
      <button
        type="submit"
        disabled={guardando}
        style={{ ...botonDorado, padding: "9px 16px", opacity: guardando ? 0.6 : 1 }}
      >
        {guardando ? "…" : "Agregar"}
      </button>
      {error && <p style={{ gridColumn: "1 / -1", color: "var(--warn)", fontSize: 12, margin: 0 }}>{error}</p>}
    </form>
  );
}

function FormNuevoRunner() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (guardando) return;
        setGuardando(true);
        setError(null);
        try {
          const r = await createRunner(formData);
          if (r.ok) formRef.current?.reset();
          else setError(r.error);
        } catch {
          setError(ERROR_RED);
        } finally {
          setGuardando(false);
        }
      }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      <input name="name" required style={{ ...field, flex: 1, minWidth: 160 }} placeholder="Nombre del runner" />
      <button
        type="submit"
        disabled={guardando}
        style={{ ...botonDorado, padding: "9px 16px", opacity: guardando ? 0.6 : 1 }}
      >
        {guardando ? "…" : "Agregar"}
      </button>
      {error && <p style={{ flexBasis: "100%", color: "var(--warn)", fontSize: 12, margin: 0 }}>{error}</p>}
    </form>
  );
}

export function CuentasRunnerButton({ cuentas, runners }: { cuentas: CuentaGestion[]; runners: Runner[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonSecundario}>
        Cuentas y runners
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => setAbierto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(620px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 740, margin: 0 }}>Cuentas y runners</h2>
              <button
                onClick={() => setAbierto(false)}
                style={{ marginLeft: "auto", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Cuentas de gestión</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              {cuentas.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Todavía no hay cuentas.</p>}
              {cuentas.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", borderBottom: "1px solid var(--border)", fontSize: 13, opacity: c.activa ? 1 : 0.45 }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</span>
                  <span style={{ color: "var(--muted)" }}>{c.moneda}</span>
                  <b className="tnum">{formatearPesos(c.pago)}</b>
                </div>
              ))}
            </div>
            <FormNuevaCuenta />

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "20px 0 10px" }}>Runners</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 140, overflowY: "auto", marginBottom: 10 }}>
              {runners.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Todavía no hay runners.</p>}
              {runners.map((r) => (
                <div key={r.id} style={{ padding: "7px 4px", borderBottom: "1px solid var(--border)", fontSize: 13, opacity: r.activo ? 1 : 0.45 }}>
                  {r.nombre}
                </div>
              ))}
            </div>
            <FormNuevoRunner />
          </div>
        </div>
      )}
    </>
  );
}
