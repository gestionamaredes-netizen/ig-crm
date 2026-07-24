"use client";
import { useState } from "react";
import { createExchangeOp, updateExchangeOp, deleteExchangeOp } from "@/app/(app)/cambio/actions";
import { createExchangeClient, createExchangePerson } from "@/app/(app)/cambio/contactos-actions";
import { importes } from "@/lib/cambio/calculo";
import type { OperacionCalculada } from "@/lib/cambio/calculo";
import { parsearMonto } from "@/lib/finanzas/montos";
import { formatearPesos } from "@/lib/formato";
import type { Moneda, TipoOperacion } from "@/lib/cambio/tipos";
import { ComboAlta } from "@/components/cambio/combo-alta";
import { ComprobanteInput } from "@/components/cambio/comprobante-input";

type BaseProps = {
  clientes: { id: string; nombre: string }[];
  personas: { id: string; nombre: string }[];
  cajas: { id: string; nombre: string; moneda: Moneda }[];
};

type OperacionFormProps = BaseProps & {
  abierto: boolean;
  onCerrar: () => void;
} & (
    | { modo: "crear"; operacion?: undefined }
    | { modo: "editar"; operacion: OperacionCalculada }
  );

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Modal + formulario de una operación de cambio, compartido entre alta y
 * edición. En "crear" arranca vacío y llama a createExchangeOp; en "editar"
 * precarga todo el estado (incluidos los combos, vía valorInicial) desde
 * `operacion` y llama a updateExchangeOp(operacion.id, ...). El componente
 * queda montado siempre (igual que antes): `abierto` solo controla si el
 * modal se dibuja, para no perder el estado en vuelo de un guardado.
 */
export function OperacionForm({ clientes, personas, cajas, abierto, onCerrar, modo, operacion }: OperacionFormProps) {
  const [tipo, setTipo] = useState<TipoOperacion>(operacion?.tipo ?? "compra");
  const [moneda, setMoneda] = useState<Moneda>(operacion?.moneda ?? "ARS");
  const [monto, setMonto] = useState(operacion ? String(operacion.monto) : "");
  const [tc, setTc] = useState(operacion ? String(operacion.tc) : "");
  const [comprobante, setComprobante] = useState(operacion?.comprobantePath ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // La cuenta que el usuario ya no tiene que hacer a mano. Se recalcula en
  // cada tecla para que vea el otro importe antes de confirmar.
  const montoNum = parsearMonto(monto);
  const tcNum = parsearMonto(tc);
  const previo =
    montoNum !== null && tcNum !== null ? importes({ monto: montoNum, moneda, tc: tcNum }) : null;

  const cajasArs = cajas.filter((c) => c.moneda === "ARS");
  const cajasUsd = cajas.filter((c) => c.moneda === "USD");

  const cerrar = () => {
    setError(null);
    setGuardando(false);
    if (modo === "crear") {
      // En editar no hay un "vacío" al que volver -- `operacion` es fija para
      // toda la vida de este componente -- así que el reset a blanco solo
      // aplica al alta. tipo y moneda también se resetean: el componente no
      // se desmonta al cerrar, así que sin esto una VENTA en dólares queda
      // pegada como default en la próxima carga y puede invertir el sentido
      // de un movimiento real.
      setMonto("");
      setTc("");
      setComprobante("");
      setTipo("compra");
      setMoneda("ARS");
    }
    onCerrar();
  };

  const eliminar = async () => {
    if (modo !== "editar" || guardando || eliminando) return;
    if (!window.confirm("¿Eliminar esta operación? No se puede deshacer.")) return;
    setEliminando(true);
    setError(null);
    try {
      const r = await deleteExchangeOp(operacion.id);
      if (r.ok) onCerrar();
      else setError(r.error);
    } catch {
      setError("No se pudo conectar con el servidor. Probá de nuevo.");
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
            // Con un guardado (o una eliminación) en vuelo, cerrar acá no
            // cancela nada: el pedido ya salió y va a llegar igual al
            // servidor. Si el modal se cerrara, el usuario cree que canceló
            // y puede repetir la acción -> duplicado o error confuso.
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
              {modo === "editar" ? "Editar operación" : "Nueva operación"}
            </h2>

            <form
              action={async (formData) => {
                // disabled={guardando} en el botón depende de que React ya
                // haya re-renderizado antes del segundo click; este guard no
                // depende de eso y corta un doble submit sin importar timing.
                if (guardando || eliminando) return;
                setGuardando(true);
                setError(null);
                formData.set("kind", tipo);
                formData.set("amountCurrency", moneda);
                formData.set("comprobantePath", comprobante);
                if (tipo === "carga") {
                  // Una carga es plata propia entrando al stock: no hay
                  // contraparte (cliente/emisor/receptor) ni caja de pesos
                  // involucrada, así que esos campos no viajan aunque el
                  // usuario haya dejado algo cargado de un tipo anterior.
                  formData.set("clientId", "");
                  formData.set("sender", "");
                  formData.set("receiver", "");
                  formData.set("arsAccountId", "");
                }
                try {
                  const r =
                    modo === "editar"
                      ? await updateExchangeOp(operacion.id, formData)
                      : await createExchangeOp(formData);
                  // Solo se cierra si guardó: si falla, el error se muestra
                  // acá con los datos todavía cargados.
                  if (r.ok) cerrar();
                  else setError(r.error);
                } catch {
                  // La action puede lanzar en vez de devolver {ok:false} (un
                  // action ID viejo tras un redeploy, un corte de red a mitad
                  // del POST). Sin este catch, guardando quedaba en true para
                  // siempre: el botón trababa en "Guardando…" y ni cerrar y
                  // reabrir lo destrababa.
                  setError("No se pudo conectar con el servidor. Probá de nuevo.");
                } finally {
                  setGuardando(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {(["compra", "venta", "carga"] as TipoOperacion[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTipo(t);
                      // Una carga es siempre dólares propios: si el usuario
                      // venía de compra/venta en pesos, forzamos USD acá para
                      // que no quede "Pesos" seleccionado mostrando un campo
                      // oculto/deshabilitado con el valor incorrecto.
                      if (t === "carga") setMoneda("USD");
                    }}
                    style={{
                      padding: "13px 10px", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${tipo === t ? "var(--accent)" : "var(--border)"}`,
                      background: tipo === t ? "var(--card)" : "transparent",
                      color: tipo === t ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {t === "compra" ? "COMPRA" : t === "venta" ? "VENTA" : "CARGA"}
                    <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, marginTop: 3 }}>
                      {t === "compra" ? "entrego pesos, recibo dólares" : t === "venta" ? "recibo pesos, entrego dólares" : "dólares propios al stock"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: tipo === "carga" ? "1fr" : "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Fecha</label>
                  <input type="date" name="opDate" defaultValue={operacion?.fecha ?? hoy()} required style={field} />
                </div>
                {tipo !== "carga" && (
                  <ComboAlta
                    name="clientId"
                    label="Cliente"
                    permitirLibre={false}
                    placeholder="Buscar o agregar…"
                    opciones={clientes.map((c) => ({ value: c.id, nombre: c.nombre }))}
                    onCrear={createExchangeClient}
                    valorInicial={
                      operacion ? { value: operacion.clienteId ?? "", nombre: operacion.cliente } : undefined
                    }
                  />
                )}
              </div>

              {tipo !== "carga" && (
                <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <ComboAlta
                    name="sender"
                    label="Emisor (quien manda los fondos)"
                    permitirLibre
                    placeholder="Buscar, escribir o agregar…"
                    opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                    onCrear={createExchangePerson}
                    valorInicial={operacion ? { value: operacion.emisor, nombre: operacion.emisor } : undefined}
                  />
                  <ComboAlta
                    name="receiver"
                    label="Receptor (quien los recibe)"
                    permitirLibre
                    placeholder="Buscar, escribir o agregar…"
                    opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                    onCrear={createExchangePerson}
                    valorInicial={operacion ? { value: operacion.receptor, nombre: operacion.receptor } : undefined}
                  />
                </div>
              )}

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: tipo === "carga" ? "1.2fr 1fr" : "1.2fr .8fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>{tipo === "carga" ? "Dólares a cargar" : "Monto"}</label>
                  <input name="amount" value={monto} onChange={(e) => setMonto(e.target.value)} required inputMode="numeric" style={field} placeholder="452.500" />
                </div>
                {tipo !== "carga" && (
                  <div>
                    <label style={label}>Moneda</label>
                    <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} style={field}>
                      <option value="ARS">Pesos</option>
                      <option value="USD">Dólares</option>
                    </select>
                  </div>
                )}
                <div>
                  <label style={label}>{tipo === "carga" ? "Costo por dólar" : "TC ($ por USD)"}</label>
                  <input name="rate" value={tc} onChange={(e) => setTc(e.target.value)} required inputMode="numeric" style={field} placeholder="1520" />
                </div>
              </div>

              {previo && tipo !== "carga" && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{tipo === "compra" ? "Entregás" : "Recibís"} </span>
                  <b className="tnum">{formatearPesos(previo.ars)}</b>
                  <span style={{ color: "var(--muted)" }}> y {tipo === "compra" ? "recibís" : "entregás"} </span>
                  <b className="tnum">USD {previo.usd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              )}

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: tipo === "carga" ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                {tipo !== "carga" && (
                  <div>
                    <label style={label}>Caja de pesos</label>
                    <select name="arsAccountId" defaultValue={operacion?.cajaArsId ?? ""} style={field}>
                      <option value="">—</option>
                      {cajasArs.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={label}>Caja de dólares</label>
                  <select name="usdAccountId" defaultValue={operacion?.cajaUsdId ?? ""} style={field}>
                    <option value="">—</option>
                    {cajasUsd.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                {tipo !== "carga" && (
                  <div>
                    <label style={label}>Costos</label>
                    <input name="fees" defaultValue={operacion ? String(operacion.costos) : undefined} inputMode="numeric" style={field} placeholder="0" />
                  </div>
                )}
              </div>

              <ComprobanteInput value={comprobante} onChange={setComprobante} />

              <div>
                <label style={label}>Notas</label>
                <input name="notes" defaultValue={operacion?.notas} style={field} />
              </div>

              {error && (
                <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                {modo === "editar" && (
                  <button
                    type="button"
                    onClick={eliminar}
                    disabled={guardando || eliminando}
                    style={{
                      background: "transparent", border: "1px solid var(--warn)", borderRadius: 11,
                      padding: "10px 16px", fontSize: 13, fontWeight: 650, color: "var(--warn)",
                      cursor: guardando || eliminando ? "not-allowed" : "pointer",
                      opacity: guardando || eliminando ? 0.6 : 1, marginRight: "auto",
                    }}
                  >
                    {eliminando ? "Eliminando…" : "Eliminar"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={guardando || eliminando}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, color: "var(--text)", cursor: guardando || eliminando ? "not-allowed" : "pointer", opacity: guardando || eliminando ? 0.6 : 1 }}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando || eliminando} style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 20px", fontSize: 13, fontWeight: 650, cursor: "pointer", opacity: guardando || eliminando ? 0.6 : 1 }}>
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

export function NuevaOperacionButton({ clientes, personas, cajas }: BaseProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 18px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
      >
        Nueva operación
      </button>

      <OperacionForm
        clientes={clientes}
        personas={personas}
        cajas={cajas}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        modo="crear"
      />
    </>
  );
}
