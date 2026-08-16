"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  createRunner,
  updateRunner,
  setRunnerActivo,
  createRunnerAccount,
  createRunnerGestion,
  createRunnerPayment,
  updateRunnerGestion,
  deleteRunnerGestion,
  updateRunnerPayment,
  deleteRunnerPayment,
} from "@/app/(app)/cambio/runners-actions";
import { crearAccesoRunner } from "@/app/(app)/cambio/accesos-actions";
import { CLAVE_INICIAL_DEFAULT, normalizarUsuario } from "@/lib/cambio/acceso";
import { hoyISO } from "@/lib/fecha";
import { formatearPesos } from "@/lib/formato";
import type { CuentaGestion, Gestion, PagoRunner, Runner, TipoGestion } from "@/lib/cambio/runners";

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
 * quedaba en true para siempre.
 */
const ERROR_RED = "No se pudo conectar con el servidor. Probá de nuevo.";

// ---------------------------------------------------------------------------
// Gestión: alta y edición comparten el mismo modal (mismo patrón que
// OperacionForm en nueva-operacion-form.tsx).
// ---------------------------------------------------------------------------

type GestionFormProps = {
  runners: Runner[];
  cuentas: CuentaGestion[];
  abierto: boolean;
  onCerrar: () => void;
} & (
  | { modo: "crear"; gestion?: undefined }
  | { modo: "editar"; gestion: Gestion }
);

/**
 * Modal + formulario de una gestión de runner, compartido entre alta y
 * edición. En "crear" arranca vacío y llama a createRunnerGestion; en
 * "editar" precarga accountId/fee/kind (el resto de los campos usa
 * defaultValue, no controlados) desde `gestion` y llama a
 * updateRunnerGestion(gestion.id, ...). El componente queda montado siempre
 * que `abierto` es true: en "editar" el padre lo desmonta al cerrar (vía
 * `key={gestion.id}`), así que no hace falta resetear ese estado acá.
 */
function GestionForm({ runners, cuentas, abierto, onCerrar, modo, gestion }: GestionFormProps) {
  const [accountId, setAccountId] = useState(gestion?.cuentaId ?? "");
  const [fee, setFee] = useState(gestion ? String(gestion.pago) : "");
  const [kind, setKind] = useState<TipoGestion>(gestion?.tipo ?? "retiro");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cerrar = () => {
    setError(null);
    setGuardando(false);
    if (modo === "crear") {
      // accountId, fee y kind son estado controlado que vive en este
      // componente, no en el DOM del modal: si no se resetean acá, la próxima
      // apertura arranca con la cuenta y el pago de la gestión anterior
      // todavía cargados. En "editar" no aplica: el padre desmonta este
      // componente al cerrar.
      setAccountId("");
      setFee("");
      setKind("retiro");
    }
    onCerrar();
  };

  const eliminar = async () => {
    if (modo !== "editar" || guardando || eliminando) return;
    if (!window.confirm("¿Eliminar? No se puede deshacer.")) return;
    setEliminando(true);
    setError(null);
    try {
      const r = await deleteRunnerGestion(gestion.id);
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
              {modo === "editar" ? "Editar gestión" : "Nueva gestión"}
            </h2>

            <form
              action={async (formData) => {
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                formData.set("accountId", accountId);
                formData.set("fee", fee);
                formData.set("kind", kind);
                try {
                  const r =
                    modo === "editar"
                      ? await updateRunnerGestion(gestion.id, formData)
                      : await createRunnerGestion(formData);
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
                  <input type="date" name="gestionDate" defaultValue={gestion?.fecha ?? hoyISO()} required style={field} />
                </div>
                <div>
                  <label style={label}>Runner</label>
                  <select name="runnerId" required defaultValue={gestion?.runnerId ?? ""} style={field}>
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
                <input
                  name="amount"
                  inputMode="numeric"
                  style={field}
                  placeholder="452.500"
                  defaultValue={gestion && gestion.monto !== 0 ? String(gestion.monto) : undefined}
                />
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} defaultValue={gestion?.notas} />
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

export function NuevaGestionButton({ runners, cuentas }: { runners: Runner[]; cuentas: CuentaGestion[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonDorado}>
        Nueva gestión
      </button>
      <GestionForm
        runners={runners}
        cuentas={cuentas}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        modo="crear"
      />
    </>
  );
}

/**
 * Editor de una gestión existente, para montar desde el historial junto al
 * lápiz de cada fila. A diferencia de NuevaGestionButton no dibuja su propio
 * disparador: el padre decide cuándo mostrarlo (typicamente guardando la
 * gestión elegida en estado y montando esto con `key={gestion.id}`).
 */
export function EditarGestionButton({
  gestion,
  runners,
  cuentas,
  abierto,
  onCerrar,
}: {
  gestion: Gestion;
  runners: Runner[];
  cuentas: CuentaGestion[];
  abierto: boolean;
  onCerrar: () => void;
}) {
  return (
    <GestionForm
      modo="editar"
      gestion={gestion}
      runners={runners}
      cuentas={cuentas}
      abierto={abierto}
      onCerrar={onCerrar}
    />
  );
}

// ---------------------------------------------------------------------------
// Pago a runner: alta y edición comparten el mismo modal.
// ---------------------------------------------------------------------------

type PagoFormProps = {
  runners: Runner[];
  abierto: boolean;
  onCerrar: () => void;
} & (
  | { modo: "crear"; pago?: undefined }
  | { modo: "editar"; pago: PagoRunner }
);

function PagoForm({ runners, abierto, onCerrar, modo, pago }: PagoFormProps) {
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
      const r = await deleteRunnerPayment(pago.id);
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
              {modo === "editar" ? "Editar pago" : "Registrar pago"}
            </h2>

            <form
              action={async (formData) => {
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                try {
                  const r =
                    modo === "editar"
                      ? await updateRunnerPayment(pago.id, formData)
                      : await createRunnerPayment(formData);
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
                  <input type="date" name="paymentDate" defaultValue={pago?.fecha ?? hoyISO()} required style={field} />
                </div>
                <div>
                  <label style={label}>Runner</label>
                  <select name="runnerId" required defaultValue={pago?.runnerId ?? ""} style={field}>
                    <option value="" disabled>Elegir…</option>
                    {runners.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={label}>Monto</label>
                <input
                  name="amount"
                  required
                  inputMode="numeric"
                  style={field}
                  placeholder="452.500"
                  defaultValue={pago ? String(pago.monto) : undefined}
                />
              </div>

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} defaultValue={pago?.notas} />
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

export function RegistrarPagoButton({ runners }: { runners: Runner[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)} style={botonSecundario}>
        Registrar pago
      </button>
      <PagoForm runners={runners} abierto={abierto} onCerrar={() => setAbierto(false)} modo="crear" />
    </>
  );
}

/**
 * Editor de un pago existente, mismo criterio que EditarGestionButton: el
 * padre decide cuándo mostrarlo y lo monta con `key={pago.id}`.
 */
export function EditarPagoButton({
  pago,
  runners,
  abierto,
  onCerrar,
}: {
  pago: PagoRunner;
  runners: Runner[];
  abierto: boolean;
  onCerrar: () => void;
}) {
  return <PagoForm modo="editar" pago={pago} runners={runners} abierto={abierto} onCerrar={onCerrar} />;
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

/**
 * Fila de un runner en la config: muestra el nombre y permite renombrarlo
 * (lápiz → input inline) y activarlo/desactivarlo. No se borra: desactivar lo
 * saca de las listas sin romper su historial de gestiones/pagos/cargas.
 */
function FilaRunner({ runner, acceso }: { runner: Runner; acceso?: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(runner.nombre);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Alta de acceso (login) para este runner.
  const [creandoAcceso, setCreandoAcceso] = useState(false);
  const [usuario, setUsuario] = useState(normalizarUsuario(runner.nombre));
  const [clave, setClave] = useState(CLAVE_INICIAL_DEFAULT);
  const [okAcceso, setOkAcceso] = useState<string | null>(null);

  const crearAcceso = async () => {
    if (ocupado) return;
    setOcupado(true); setError(null); setOkAcceso(null);
    try {
      const r = await crearAccesoRunner(runner.id, usuario, clave);
      if (r.ok) { setCreandoAcceso(false); setOkAcceso(`Acceso creado: usuario "${r.usuario}", clave "${clave}".`); router.refresh(); }
      else setError(r.error);
    } catch { setError(ERROR_RED); }
    finally { setOcupado(false); }
  };

  const guardarNombre = async () => {
    if (ocupado) return;
    const limpio = nombre.trim();
    if (!limpio) { setError("Falta el nombre."); return; }
    if (limpio === runner.nombre) { setEditando(false); return; }
    setOcupado(true); setError(null);
    try {
      const fd = new FormData();
      fd.set("name", limpio);
      const r = await updateRunner(runner.id, fd);
      if (r.ok) { setEditando(false); router.refresh(); }
      else setError(r.error);
    } catch { setError(ERROR_RED); }
    finally { setOcupado(false); }
  };

  const toggleActivo = async () => {
    if (ocupado) return;
    if (runner.activo && !window.confirm(`¿Desactivar a ${runner.nombre}? Deja de aparecer en las listas. Podés reactivarlo cuando quieras.`)) return;
    setOcupado(true); setError(null);
    try {
      const r = await setRunnerActivo(runner.id, !runner.activo);
      if (r.ok) router.refresh();
      else setError(r.error);
    } catch { setError(ERROR_RED); }
    finally { setOcupado(false); }
  };

  const iconBtn: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "5px 7px", display: "inline-flex", alignItems: "center", cursor: "pointer", color: "var(--muted)",
  };

  return (
    <div style={{ padding: "7px 4px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: runner.activo ? 1 : 0.5 }}>
        {editando ? (
          <>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
              style={{ ...field, flex: 1, minWidth: 0, padding: "6px 9px" }}
              onKeyDown={(e) => { if (e.key === "Enter") guardarNombre(); if (e.key === "Escape") { setEditando(false); setNombre(runner.nombre); } }}
            />
            <button type="button" onClick={guardarNombre} disabled={ocupado} style={{ ...botonDorado, padding: "6px 12px" }}>
              {ocupado ? "…" : "Guardar"}
            </button>
            <button type="button" onClick={() => { setEditando(false); setNombre(runner.nombre); setError(null); }} disabled={ocupado} style={{ ...iconBtn, padding: "6px 10px" }}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {runner.nombre}{!runner.activo && <span style={{ color: "var(--muted)" }}> · inactivo</span>}
            </span>
            <button type="button" title="Renombrar" onClick={() => setEditando(true)} disabled={ocupado} style={iconBtn}>
              <Pencil size={14} />
            </button>
            <button type="button" onClick={toggleActivo} disabled={ocupado} style={{ ...iconBtn, color: runner.activo ? "var(--warn)" : "var(--accent)", fontWeight: 700, fontSize: 12 }}>
              {runner.activo ? "Desactivar" : "Activar"}
            </button>
          </>
        )}
      </div>

      {/* Acceso (login) del runner: si ya tiene, se muestra el usuario; si no,
          botón para crearlo con la clave inicial por defecto. */}
      {!editando && (
        <div style={{ marginTop: 6 }}>
          {acceso !== undefined ? (
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
              🔑 Acceso: <b style={{ color: "var(--text)" }}>{acceso || "creado"}</b>
            </span>
          ) : creandoAcceso ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 8 }}>
              <div>
                <label style={{ ...label, marginBottom: 3 }}>Usuario</label>
                <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoCapitalize="none" style={{ ...field, padding: "6px 9px", minWidth: 120 }} placeholder="ej: ori" />
              </div>
              <div>
                <label style={{ ...label, marginBottom: 3 }}>Clave inicial</label>
                <input value={clave} onChange={(e) => setClave(e.target.value)} style={{ ...field, padding: "6px 9px", minWidth: 120 }} />
              </div>
              <button type="button" onClick={crearAcceso} disabled={ocupado} style={{ ...botonDorado, padding: "7px 12px", alignSelf: "flex-end" }}>
                {ocupado ? "…" : "Crear"}
              </button>
              <button type="button" onClick={() => { setCreandoAcceso(false); setError(null); }} disabled={ocupado} style={{ ...iconBtn, padding: "7px 10px", alignSelf: "flex-end" }}>
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => { setCreandoAcceso(true); setUsuario(normalizarUsuario(runner.nombre)); setClave(CLAVE_INICIAL_DEFAULT); setError(null); setOkAcceso(null); }} disabled={ocupado} style={{ ...iconBtn, fontSize: 11.5, fontWeight: 700, color: "var(--accent)" }}>
              🔑 Crear acceso
            </button>
          )}
        </div>
      )}

      {okAcceso && <p style={{ color: "var(--accent)", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{okAcceso}</p>}
      {error && <p style={{ color: "var(--warn)", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
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

export function CuentasRunnerButton({ cuentas, runners, accesos }: { cuentas: CuentaGestion[]; runners: Runner[]; accesos: Record<string, string> }) {
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
                <FilaRunner key={r.id} runner={r} acceso={r.id in accesos ? accesos[r.id] : undefined} />
              ))}
            </div>
            <FormNuevoRunner />
          </div>
        </div>
      )}
    </>
  );
}
