"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createExpense } from "@/app/(app)/finanzas/actions";

type Empresa = { id: string; nombre: string };

export function NuevoGastoButton({ empresas }: { empresas: Empresa[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field: React.CSSProperties = {
    width: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "var(--grad)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "9px 14px",
          fontSize: 12.5,
          fontWeight: 650,
          cursor: "pointer",
        }}
      >
        <Plus size={15} /> Nuevo gasto
      </button>

      {open && (
        <div
          onClick={() => {
            setError(null);
            setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(3px)",
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <form
            action={async (fd) => {
              setError(null);
              const resultado = await createExpense(fd);
              // El modal solo se cierra si el gasto realmente se guardó: si
              // se cierra igual con un error, el usuario cree que guardó algo
              // que nunca llegó a la base.
              if (resultado.ok) {
                setOpen(false);
              } else {
                setError(resultado.error);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 460,
              maxWidth: "100%",
              background: "var(--panel-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 30px 70px -20px #000",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <b style={{ fontSize: 16, fontWeight: 720 }}>Nuevo gasto</b>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOpen(false);
                }}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(245,177,60,.14)",
                  border: "1px solid var(--warn)",
                  color: "var(--warn)",
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input name="concept" placeholder="Concepto (ej: nyproimports.com)" required style={field} />

              <div style={{ display: "flex", gap: 11 }}>
                <select name="category" style={{ ...field, flex: 1 }} defaultValue="dominio">
                  <option value="dominio">Dominio</option>
                  <option value="hosting">Hosting</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="merch">Merch</option>
                  <option value="servicio">Servicio</option>
                  <option value="otro">Otro</option>
                </select>
                <select name="companyId" style={{ ...field, flex: 1 }} defaultValue="">
                  <option value="">Iniciativa Global (agencia)</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 11 }}>
                <input name="quantity" placeholder="Cantidad" inputMode="numeric" defaultValue="1" style={{ ...field, flex: 1 }} />
                <input name="unitAmount" placeholder="Precio unitario ($)" inputMode="numeric" required style={{ ...field, flex: 2 }} />
              </div>

              <div style={{ display: "flex", gap: 11 }}>
                <input name="vendor" placeholder="Proveedor (ej: Donweb)" style={{ ...field, flex: 2 }} />
                <input name="externalRef" placeholder="Ref. (#6138993)" style={{ ...field, flex: 1 }} />
              </div>

              <label style={{ fontSize: 11, color: "var(--faint)" }}>
                Fecha de pago — dejar vacía si todavía no se pagó
                <input name="paidAt" type="date" style={{ ...field, marginTop: 5 }} />
              </label>

              <div style={{ display: "flex", gap: 11 }}>
                <label style={{ fontSize: 11, color: "var(--faint)", flex: 2 }}>
                  Renueva el — vacío si es un gasto único
                  <input name="renewsAt" type="date" style={{ ...field, marginTop: 5 }} />
                </label>
                <label style={{ fontSize: 11, color: "var(--faint)", flex: 1 }}>
                  Período
                  <select name="period" style={{ ...field, marginTop: 5 }} defaultValue="unico">
                    <option value="unico">Único</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </label>
              </div>

              <input name="notes" placeholder="Notas (opcional)" style={field} />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOpen(false);
                }}
                style={{
                  flex: 1,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: 11,
                  padding: "11px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "var(--grad)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 11,
                  padding: "11px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Guardar gasto
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
