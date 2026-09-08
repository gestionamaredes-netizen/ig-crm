"use client";
import { useState } from "react";
import type { OrdenDelDiaRegistro, CargaCuentasAuditoria } from "@/lib/cambio/orden-del-dia";
import type { Perfil } from "@/lib/cambio/perfiles";
import type { Cuenta } from "@/lib/cambio/cuentas";
import type { Runner } from "@/lib/cambio/runners";
import {
  crearRegistroOrdenDelDia,
  actualizarRegistroOrdenDelDia,
  eliminarRegistroOrdenDelDia,
} from "@/app/(app)/cambio/orden-del-dia-actions";

type Props = {
  registros: OrdenDelDiaRegistro[];
  auditoria: CargaCuentasAuditoria[];
  cuentas: Cuenta[];
  runners: Runner[];
  perfil: Perfil | null;
};

export function OrdenDelDiaPanel({
  registros,
  auditoria,
  cuentas,
  runners,
  perfil,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cuentaId: "",
    runnerId: perfil?.runnerId ?? "",
    pesosCargados: 0,
    usdComprados: 0,
    aliasPesos: "",
    aliasDolares: "",
    dni: "",
    pin: "",
  });

  const esAdmin = perfil?.rol === "admin";
  const miRunnerId = perfil?.runnerId;

  // Filtrar cuentas visibles según rol
  const cuentasVisibles = esAdmin ? cuentas : cuentas.filter((c) => c.runnerId === miRunnerId);

  // Filtrar registros visibles
  const registrosVisibles = esAdmin ? registros : registros.filter((r) => r.runnerId === miRunnerId);

  // Obtener cuenta seleccionada para pre-llenar datos
  const cuentaSeleccionada = cuentas.find((c) => c.id === formData.cuentaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await crearRegistroOrdenDelDia(new Date().toISOString().split("T")[0], formData);
      if (result.ok) {
        setSuccess("Registro creado exitosamente.");
        setFormData({
          cuentaId: "",
          runnerId: perfil?.runnerId ?? "",
          pesosCargados: 0,
          usdComprados: 0,
          aliasPesos: "",
          aliasDolares: "",
          dni: "",
          pin: "",
        });
        setShowForm(false);
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (registroId: string) => {
    if (!confirm("¿Confirmar eliminación?")) return;
    setError(null);
    setLoading(true);

    try {
      const result = await eliminarRegistroOrdenDelDia(registroId);
      if (result.ok) {
        setSuccess("Registro eliminado.");
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: "var(--glass)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "10px 8px",
    fontSize: 13,
    borderTop: "1px solid var(--border)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Orden del Día</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Cuentas disponibles y movimientos del día
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowAudit(!showAudit)}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {showAudit ? "Ocultar" : "Ver"} Auditoría
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
            }}
          >
            {showForm ? "Cancelar" : "Cargar Cuenta"}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div
          style={{
            background: "var(--warn-bg, rgba(220,38,38,0.1))",
            border: "1px solid var(--warn, #dc2626)",
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
            color: "var(--warn, #dc2626)",
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            background: "var(--ok-bg, rgba(34,197,94,0.1))",
            border: "1px solid var(--ok, #22c55e)",
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
            color: "var(--ok, #22c55e)",
          }}
        >
          {success}
        </div>
      )}

      {/* Formulario de carga */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ ...panelStyle }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                Cuenta
              </label>
              <select
                value={formData.cuentaId}
                onChange={(e) => {
                  setFormData({ ...formData, cuentaId: e.target.value });
                  const cuenta = cuentas.find((c) => c.id === e.target.value);
                  if (cuenta) {
                    setFormData((prev) => ({
                      ...prev,
                      aliasPesos: cuenta.aliasPesos,
                      aliasDolares: cuenta.aliasDolares,
                      dni: cuenta.dni,
                    }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              >
                <option value="">Seleccionar</option>
                {cuentasVisibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titular} - {c.banco}
                  </option>
                ))}
              </select>
            </div>

            {esAdmin && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                  Runner
                </label>
                <select
                  value={formData.runnerId}
                  onChange={(e) => setFormData({ ...formData, runnerId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--input-bg)",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                >
                  <option value="">Sin asignar</option>
                  {runners.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                Pesos Cargados
              </label>
              <input
                type="number"
                value={formData.pesosCargados}
                onChange={(e) => setFormData({ ...formData, pesosCargados: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                USD Comprados
              </label>
              <input
                type="number"
                value={formData.usdComprados}
                onChange={(e) => setFormData({ ...formData, usdComprados: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                Alias Pesos
              </label>
              <input
                type="text"
                value={formData.aliasPesos}
                onChange={(e) => setFormData({ ...formData, aliasPesos: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                Alias Dólares
              </label>
              <input
                type="text"
                value={formData.aliasDolares}
                onChange={(e) => setFormData({ ...formData, aliasDolares: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                DNI
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej: 12345678"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
                PIN
              </label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                placeholder="Ej: 1234"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 16,
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Guardando..." : "Guardar Registro"}
          </button>
        </form>
      )}

      {/* Tabla de registros */}
      <div style={panelStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>
          Registros del Día ({registrosVisibles.length})
        </h3>
        {registrosVisibles.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin registros.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Titular</th>
                  <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Banco</th>
                  <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Pesos</th>
                  <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>USD</th>
                  <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Alias $</th>
                  <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Alias USD</th>
                  <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>DNI</th>
                  {esAdmin && <th style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {registrosVisibles.map((r) => (
                  <tr key={r.id}>
                    <td style={tableCellStyle}>{r.titular}</td>
                    <td style={tableCellStyle}>{r.banco}</td>
                    <td className="tnum" style={{ ...tableCellStyle, textAlign: "right" }}>
                      {r.pesosCargados.toLocaleString("es-AR")}
                    </td>
                    <td className="tnum" style={{ ...tableCellStyle, textAlign: "right" }}>
                      {r.usdComprados.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                    </td>
                    <td style={tableCellStyle}>{r.aliasPesos || "—"}</td>
                    <td style={tableCellStyle}>{r.aliasDolares || "—"}</td>
                    <td style={tableCellStyle}>{r.dni}</td>
                    {esAdmin && (
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={loading}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--warn, #dc2626)",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auditoría */}
      {showAudit && (
        <div style={panelStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Auditoría ({auditoria.length})</h3>
          {auditoria.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin registros de auditoría.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Runner</th>
                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Acción</th>
                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Cambios</th>
                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "0 8px 10px" }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((a) => (
                    <tr key={a.id}>
                      <td style={tableCellStyle}>{a.runnerNombre || "Sin asignar"}</td>
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            background: a.accion === "crear" ? "var(--ok-bg)" : a.accion === "eliminar" ? "var(--warn-bg)" : "var(--muted)",
                            color: a.accion === "crear" ? "var(--ok)" : a.accion === "eliminar" ? "var(--warn)" : "var(--text)",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {a.accion}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {a.accion === "crear" && "Nueva carga"}
                        {a.accion === "actualizar" && "Datos modificados"}
                        {a.accion === "eliminar" && "Registro removido"}
                      </td>
                      <td style={{ ...tableCellStyle, fontSize: 12 }}>
                        {new Date(a.creadaEn).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
