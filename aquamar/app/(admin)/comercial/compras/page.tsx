import Link from "next/link";
import { Aviso, BotonLink, Estado, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { cuentasPorPagar, estadoPago, listarCompras, saldoCompra } from "@/lib/datos/compras";
import { listarProveedores } from "@/lib/datos/proveedores";

export const dynamic = "force-dynamic";

export default async function Compras({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const compras = await listarCompras();
  const proveedores = await listarProveedores(true);
  const deudas = await cuentasPorPagar();

  const confirmadas = compras.filter((c) => c.estado === "confirmada");
  const invertido = confirmadas.reduce((acc, c) => acc + c.totalCentavos, 0);
  const aPagar = deudas.reduce((acc, d) => acc + d.saldoCentavos, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Compras</h1>
          <p className="text-sm text-suave">
            Cada factura de proveedor. Al confirmarla entra la mercadería al depósito y se recalcula el costo.
          </p>
        </div>
        <div className="flex gap-2">
          <BotonLink href="/comercial/proveedores" variante="secundario">
            Proveedores
          </BotonLink>
          {proveedores.length > 0 && <BotonLink href="/comercial/compras/nueva">Nueva compra</BotonLink>}
        </div>
      </div>

      {error && <Aviso texto={error} />}

      {proveedores.length === 0 && (
        <Aviso
          tipo="ok"
          texto="Antes de cargar una compra necesitás al menos un proveedor. Entrá a Proveedores y agregá uno."
        />
      )}

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        <Kpi etiqueta="Comprado (confirmado)" valor={formatearPesos(invertido)} detalle={`${confirmadas.length} facturas`} />
        <Kpi etiqueta="A pagar a proveedores" valor={formatearPesos(aPagar)} tono={aPagar > 0 ? "malo" : "neutro"} />
      </div>

      {deudas.length > 0 && (
        <Tarjeta titulo="Saldo por proveedor">
          <ul className="divide-y divide-[#dde7ec]">
            {deudas.map((d) => (
              <li key={d.proveedorId} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-sm">{d.proveedor}</span>
                <strong className="shrink-0 text-sm">
                  <Plata centavos={d.saldoCentavos} />
                </strong>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta titulo="Historial">
        {compras.length === 0 ? (
          <Vacio>Todavía no cargaste ninguna compra.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Compra</Th>
                <Th>Proveedor</Th>
                <Th alinear="right">Unid.</Th>
                <Th alinear="right">Total</Th>
                <Th alinear="right">Saldo</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <Link href={`/comercial/compras/${c.id}`} className="font-medium text-azul-700">
                      #{c.numero}
                    </Link>
                    <span className="block text-xs text-suave">
                      {formatearFecha(c.fecha)}
                      {c.comprobante && ` · ${c.comprobante}`}
                    </span>
                  </Td>
                  <Td className="max-w-[10rem] truncate">{c.proveedor}</Td>
                  <Td alinear="right" className="tabular">
                    {c.unidades}
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={c.totalCentavos} />
                  </Td>
                  <Td alinear="right">
                    {c.estado === "confirmada" ? <Plata centavos={saldoCompra(c)} /> : <span className="text-suave">—</span>}
                  </Td>
                  <Td>
                    <Estado valor={c.estado === "confirmada" ? estadoPago(c) : c.estado} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>
    </div>
  );
}
