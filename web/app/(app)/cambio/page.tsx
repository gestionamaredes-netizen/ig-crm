import Link from "next/link";
import { getDatosCambio, getClientesParaOperacion, getCajasParaOperacion, getPersonasParaOperacion, getContactos, hoyISO } from "@/lib/cambio/datos";
import { formatearPesos } from "@/lib/formato";
import { TablaOperaciones } from "@/components/cambio/tabla-operaciones";
import { Rankings } from "@/components/cambio/rankings";
import { margenPorDia, resumenDelDia, saldosDeCajas, rankingClientes, rankingPersonas } from "@/lib/cambio/reportes";
import { NuevaOperacionButton } from "@/components/cambio/nueva-operacion-form";
import { ContactosButton } from "@/components/cambio/contactos-modal";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";
import { SelectorDia } from "@/components/cambio/selector-dia";

export const dynamic = "force-dynamic";

// Branding Gestiones MA (dorado). Los valores son los de lib/companies.ts,
// slug "gestiones". Se aplican como override de las CSS vars sobre esta
// pantalla: la caja es una herramienta de Gestiones MA, así que su acento y
// sus botones van en dorado en vez del violeta general del CRM.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function CambioPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hoy = hoyISO();
  const sp = await searchParams;
  const dia = typeof sp.dia === "string" && sp.dia ? sp.dia : hoy;

  // `getDatosCambio` ahora también devuelve `cajas` (las cajas crudas, para
  // recalcular saldos a una fecha de corte): se renombra a `cajasSaldos`
  // porque más abajo ya existe `cajas`, la lista {id,nombre,moneda} que arma
  // `getCajasParaOperacion` para el form y la tabla de operaciones. Son dos
  // cosas distintas con el mismo nombre en el tipo de origen; si no se
  // renombra acá, uno tapa al otro.
  const [{ operaciones, cajas: cajasSaldos }, clientes, cajas, personasAlta, contactos] =
    await Promise.all([
      getDatosCambio(hoy),
      getClientesParaOperacion(),
      getCajasParaOperacion(),
      getPersonasParaOperacion(),
      getContactos(),
    ]);

  const opsDelDia = operaciones.filter((o) => o.fecha === dia);
  const opsHastaDia = operaciones.filter((o) => o.fecha <= dia);
  const rd = resumenDelDia(operaciones, dia);
  // Cajas y stock al CIERRE del día que se está mirando (acumulativo hasta esa
  // fecha), a diferencia de las operaciones/rankings de abajo que son solo del día.
  const saldosDia = saldosDeCajas(opsHastaDia, cajasSaldos);

  // Cuánto de los dólares está en USDT: el saldo de la caja USDT. USDT se
  // trata 1:1 con el dólar, así que ya cuenta dentro del stock de dólares;
  // este KPI muestra aparte la porción que quedó en cripto.
  const stockUsdt = saldosDia
    .filter((s) => s.nombre.trim().toUpperCase() === "USDT")
    .reduce((acc, s) => acc + s.saldo, 0);

  const rankClientesDia = rankingClientes(opsDelDia);
  const rankPersonasDia = rankingPersonas(opsDelDia);

  // "Stock de pesos" se sacó a propósito: los pesos que entran en una venta son
  // de PASO (se usan para comprar los dólares, o van directo emisor→receptor),
  // así que sumarlos daba volumen de manejo, no stock real que quede.
  const kpis = [
    { label: "Stock de dólares", valor: rd.stockUsd.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
    { label: "Stock de USDT", valor: `USDT ${stockUsdt.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` },
    { label: "Costo promedio", valor: formatearPesos(rd.costoPromedio) },
    { label: "Margen del día", valor: formatearPesos(rd.margenDia) },
    { label: "Margen acumulado", valor: formatearPesos(rd.margenAcumulado) },
    { label: "Comisiones del día", valor: formatearPesos(rd.comisionesDia) },
    { label: "Volumen del día (pesos)", valor: formatearPesos(rd.volumenPesosDia) },
  ];

  const dias = margenPorDia(operaciones);

  return (
    <div
      style={{
        ["--accent" as string]: GM_ACCENT,
        ["--grad" as string]: GM_GRAD,
      }}
    >
      <MobileTopBar />
      <div
        className="cambio-page"
        style={{
          padding: "26px 30px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
      <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cambio</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Compra y venta de dólares de Gestiones MA.
          </p>
        </div>
        <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link
            href="/cambio/ayuda"
            title="Cómo funciona la plataforma"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Ayuda
          </Link>
          <ContactosButton clientes={contactos.clientes} personas={contactos.personas} />
          <Link
            href="/cambio/runners"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Runners
          </Link>
          <Link
            href="/cambio/celulares"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Celulares
          </Link>
          {/* Sin prefetch={false}, Next.js prefetchearía este route handler al entrar en viewport/hover,
              ejecutando la lectura completa de Supabase sin que el usuario haya hecho clic. */}
          <Link
            href="/cambio/export"
            prefetch={false}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Descargar Excel
          </Link>
          <NuevaOperacionButton clientes={clientes} personas={personasAlta} cajas={cajas} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <SelectorDia dia={dia} />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          Mostrando: {dia.split("-").reverse().join("/")}
        </span>
        {dia !== hoy && (
          <Link href="/cambio" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
            Volver a hoy
          </Link>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Cajas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {saldosDia.map((s) => (
            <div key={s.id}>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.nombre}</div>
              {/* Caja en descubierto = falta cargar una operación o hay plata mal imputada. Se marca en vez de disimularse. */}
              <b
                className="tnum"
                style={{ fontSize: 16, display: "block", marginTop: 4, color: s.saldo < 0 ? "var(--warn)" : undefined }}
              >
                {s.moneda === "ARS"
                  ? formatearPesos(s.saldo)
                  : `USD ${s.saldo.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
              </b>
            </div>
          ))}
        </div>
      </div>

      {dias.length > 0 && (
        <div style={panel}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Margen por día</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px" }}>Fecha</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px", whiteSpace: "nowrap" }}>Margen</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px", whiteSpace: "nowrap" }}>Comisiones</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px" }}>Ops</th>
                </tr>
              </thead>
              <tbody>
                {dias.map((d) => (
                  <tr key={d.fecha}>
                    <td style={{ textAlign: "left", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                      <Link href={`/cambio?dia=${d.fecha}`} style={{ color: "var(--text)" }}>
                        {d.fecha.split("-").reverse().join("/")}
                      </Link>
                    </td>
                    <td className="tnum" style={{ textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", color: d.margen > 0 ? "var(--ok)" : d.margen < 0 ? "var(--warn)" : "var(--muted)" }}>
                      {formatearPesos(d.margen)}
                    </td>
                    <td className="tnum" style={{ textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                      {formatearPesos(d.comisiones)}
                    </td>
                    <td className="tnum" style={{ textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                      {d.operaciones}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={panel}>
        <Rankings clientes={rankClientesDia} personas={rankPersonasDia} />
      </div>

      <div style={panel}>
        <TablaOperaciones filas={opsDelDia} clientes={clientes} personas={personasAlta} cajas={cajas} />
      </div>
      </div>
    </div>
  );
}
