"use client";
import { useState } from "react";
import { createExchangeOp } from "@/app/(app)/cambio/actions";
import { createExchangeClient, createExchangePerson } from "@/app/(app)/cambio/contactos-actions";
import { importes } from "@/lib/cambio/calculo";
import { parsearMonto } from "@/lib/finanzas/montos";
import { formatearPesos } from "@/lib/formato";
import type { Moneda, TipoOperacion } from "@/lib/cambio/tipos";
import { ComboAlta } from "@/components/cambio/combo-alta";
import { ComprobanteInput } from "@/components/cambio/comprobante-input";

type Props = {
  clientes: { id: string; nombre: string }[];
  personas: { id: string; nombre: string }[];
  cajas: { id: string; nombre: string; moneda: Moneda }[];
};

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 11px", fontSize: 13, color: "var(--text)",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NuevaOperacionButton({ clientes, personas, cajas }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoOperacion>("compra");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [monto, setMonto] = useState("");
  const [tc, setTc] = useState("");
  const [comprobante, setComprobante] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // La cuenta que el usuario ya no tiene que hacer a mano. Se recalcula en
  // cada tecla para que vea el otro importe antes de confirmar.
  const montoNum = parsearMonto(monto);
  const tcNum = parsearMonto(tc);
  const previo =
    montoNum !== null && tcNum !== null ? importes({ monto: montoNum, moneda, tc: tcNum }) : null;

  const cajasArs = cajas.filter((c) => c.moneda === "ARS");
  const cajasUsd = cajas.filter((c) => c.moneda === "USD");

  const cerrar = () => {
    setAbierto(false);
    setError(null);
    setMonto("");
    setTc("");
    setComprobante("");
    // tipo y moneda también se resetean: el componente no se desmonta al
    // cerrar, así que sin esto una VENTA en dólares queda pegada como default
    // en la próxima carga y puede invertir el sentido de un movimiento real.
    setTipo("compra");
    setMoneda("ARS");
    // Si cerrar() se llama después de que el guardado terminó (éxito o
    // error), guardando ya está en false; esto solo importa si algún día se
    // agrega un cierre que no pasa por el guard de "guardando en vuelo".
    setGuardando(false);
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 18px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
      >
        Nueva operación
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => {
            // Con un guardado en vuelo, cerrar acá no cancela nada: el pedido
            // ya salió y va a llegar igual al servidor. Si el modal se
            // cerrara, el usuario cree que canceló y vuelve a cargar la
            // operación a mano -> queda duplicada en la caja.
            if (guardando) return;
            cerrar();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Nueva operación</h2>

            <form
              action={async (formData) => {
                // disabled={guardando} en el botón depende de que React ya
                // haya re-renderizado antes del segundo click; este guard no
                // depende de eso y corta un doble submit sin importar timing.
                if (guardando) return;
                setGuardando(true);
                setError(null);
                formData.set("kind", tipo);
                formData.set("amountCurrency", moneda);
                formData.set("comprobantePath", comprobante);
                try {
                  const r = await createExchangeOp(formData);
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["compra", "venta"] as TipoOperacion[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{
                      padding: "13px 10px", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${tipo === t ? "var(--accent)" : "var(--border)"}`,
                      background: tipo === t ? "var(--card)" : "transparent",
                      color: tipo === t ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {t === "compra" ? "COMPRA" : "VENTA"}
                    <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, marginTop: 3 }}>
                      {t === "compra" ? "entrego pesos, recibo dólares" : "recibo pesos, entrego dólares"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Fecha</label>
                  <input type="date" name="opDate" defaultValue={hoy()} required style={field} />
                </div>
                <ComboAlta
                  name="clientId"
                  label="Cliente"
                  permitirLibre={false}
                  placeholder="Buscar o agregar…"
                  opciones={clientes.map((c) => ({ value: c.id, nombre: c.nombre }))}
                  onCrear={createExchangeClient}
                />
              </div>

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <ComboAlta
                  name="sender"
                  label="Emisor (quien manda los fondos)"
                  permitirLibre
                  placeholder="Buscar, escribir o agregar…"
                  opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                  onCrear={createExchangePerson}
                />
                <ComboAlta
                  name="receiver"
                  label="Receptor (quien los recibe)"
                  permitirLibre
                  placeholder="Buscar, escribir o agregar…"
                  opciones={personas.map((p) => ({ value: p.nombre, nombre: p.nombre }))}
                  onCrear={createExchangePerson}
                />
              </div>

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Monto</label>
                  <input name="amount" value={monto} onChange={(e) => setMonto(e.target.value)} required inputMode="numeric" style={field} placeholder="452.500" />
                </div>
                <div>
                  <label style={label}>Moneda</label>
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} style={field}>
                    <option value="ARS">Pesos</option>
                    <option value="USD">Dólares</option>
                  </select>
                </div>
                <div>
                  <label style={label}>TC ($ por USD)</label>
                  <input name="rate" value={tc} onChange={(e) => setTc(e.target.value)} required inputMode="numeric" style={field} placeholder="1520" />
                </div>
              </div>

              {previo && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{tipo === "compra" ? "Entregás" : "Recibís"} </span>
                  <b className="tnum">{formatearPesos(previo.ars)}</b>
                  <span style={{ color: "var(--muted)" }}> y {tipo === "compra" ? "recibís" : "entregás"} </span>
                  <b className="tnum">USD {previo.usd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </div>
              )}

              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Caja de pesos</label>
                  <select name="arsAccountId" style={field}>
                    <option value="">—</option>
                    {cajasArs.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Caja de dólares</label>
                  <select name="usdAccountId" style={field}>
                    <option value="">—</option>
                    {cajasUsd.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Costos</label>
                  <input name="fees" inputMode="numeric" style={field} placeholder="0" />
                </div>
              </div>

              <ComprobanteInput value={comprobante} onChange={setComprobante} />

              <div>
                <label style={label}>Notas</label>
                <input name="notes" style={field} />
              </div>

              {error && (
                <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={guardando}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, color: "var(--text)", cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 20px", fontSize: 13, fontWeight: 650, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
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
