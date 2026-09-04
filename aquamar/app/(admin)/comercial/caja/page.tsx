import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import { flujo, listarMovimientos, saldos } from "@/lib/datos/caja";
import { cuentasPorCobrar } from "@/lib/datos/pedidos";
import { cuentasPorPagar } from "@/lib/datos/compras";
import { resumenDeposito } from "@/lib/datos/stock";
import {
  accionEliminarMovimientoCaja,
  accionMovimientoCaja,
  accionTransferirCaja,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function Caja({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; desde?: string; hasta?: string }>;
}) {
  const { error, desde, hasta } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const saldo = await saldos();
  const periodo = await flujo(rango);
  const movimientos = await listarMovimientos({ ...rango, limite: 100 });
  const porCobrar = await cuentasPorCobrar();
  const porPagar = await cuentasPorPagar();
  const deposito = await resumenDeposito();

  const aCobrar = porCobrar.reduce((a, d) => a + d.saldoCentavos, 0);
  const aPagar = porPagar.reduce((a, d) => a + d.saldoCentavos, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Caja</h1>
        <p className="text-sm text-suave">
          Cada peso que entra y sale. Los cobros, los pagos a proveedores y los gastos se anotan solos.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
        <Kpi etiqueta="Efectivo" valor={formatearPesos(saldo.efectivo)} tono={saldo.efectivo < 0 ? "malo" : "neutro"} />
        <Kpi etiqueta="Banco" valor={formatearPesos(saldo.banco)} tono={saldo.banco < 0 ? "malo" : "neutro"} />
        <Kpi etiqueta="Disponible" valor={formatearPesos(saldo.total)} tono={saldo.total < 0 ? "malo" : "bueno"} />
      </div>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
        <Kpi etiqueta="Te deben" valor={formatearPesos(aCobrar)} detalle={`${porCobrar.length} pedidos`} />
        <Kpi etiqueta="Debés" valor={formatearPesos(aPagar)} tono={aPagar > 0 ? "malo" : "neutro"} />
        <Kpi
          etiqueta="Plata en stock"
          valor={formatearPesos(deposito.valorCosto)}
          detalle={`${deposito.unidades} unidades a costo`}
        />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
        <Boton type="submit" variante="secundario">
          Filtrar
        </Boton>
      </form>

      <Tarjeta titulo="Flujo del período">
        <dl className="space-y-1.5 text-sm">
          <Fila etiqueta="Saldo al empezar" centavos={periodo.saldoInicial.total} />
          <Fila etiqueta="Entró" centavos={periodo.ingresosCentavos} />
          <Fila etiqueta="Salió" centavos={-periodo.egresosCentavos} />
          <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
            <dt className="font-medium">Saldo al cerrar</dt>
            <dd className="tabular text-base font-semibold">{formatearPesos(periodo.saldoFinal.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-suave">
          Resultado del período:{" "}
          <strong>
            <Plata centavos={periodo.netoCentavos} tono />
          </strong>
        </p>
      </Tarjeta>

      {porCobrar.length > 0 && (
        <Tarjeta titulo="Te deben">
          <ul className="divide-y divide-[#dde7ec]">
            {porCobrar.slice(0, 12).map((d) => (
              <li key={d.pedidoId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link href={`/comercial/pedidos/${d.pedidoId}`} className="truncate text-sm text-azul-700">
                    {d.comercio}
                  </Link>
                  <span className="block text-xs text-suave">
                    #{d.numero} · {formatearFecha(d.fecha)}
                  </span>
                </div>
                <strong className="shrink-0 text-sm">
                  <Plata centavos={d.saldoCentavos} />
                </strong>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {porPagar.length > 0 && (
        <Tarjeta titulo="Debés a proveedores">
          <ul className="divide-y divide-[#dde7ec]">
            {porPagar.map((d) => (
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

      <Tarjeta titulo="Cargar movimiento">
        <p className="mb-3 text-sm text-suave">
          Para lo que no viene de un pedido, una compra o un gasto: el saldo inicial, un retiro, una diferencia de
          arqueo.
        </p>
        <form action={accionMovimientoCaja} className="grid gap-3 sm:grid-cols-2">
          <CampoSelect etiqueta="Entra o sale" name="sentido" defaultValue="ingreso">
            <option value="ingreso">Entra plata</option>
            <option value="egreso">Sale plata</option>
          </CampoSelect>
          <CampoSelect etiqueta="Medio" name="medio" defaultValue="efectivo">
            <option value="efectivo">Efectivo</option>
            <option value="banco">Banco</option>
          </CampoSelect>
          <Campo etiqueta="Importe" name="monto" inputMode="decimal" placeholder="12.500,00" required />
          <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
          <div className="sm:col-span-2">
            <Campo etiqueta="Concepto" name="concepto" placeholder="Saldo inicial, retiro de socio…" required />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Guardar movimiento</Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Pasar plata entre efectivo y banco">
        <p className="mb-3 text-sm text-suave">
          Un depósito o una extracción no cambian cuánta plata hay, cambian dónde está.
        </p>
        <form action={accionTransferirCaja} className="grid gap-3 sm:grid-cols-2">
          <CampoSelect etiqueta="Sale de" name="desde" defaultValue="efectivo">
            <option value="efectivo">Efectivo → Banco</option>
            <option value="banco">Banco → Efectivo</option>
          </CampoSelect>
          <Campo etiqueta="Importe" name="monto" inputMode="decimal" placeholder="50.000,00" required />
          <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
          <div className="sm:col-span-2">
            <Boton type="submit" variante="secundario">
              Pasar
            </Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Movimientos del período">
        {movimientos.length === 0 ? (
          <Vacio>No hubo movimientos entre esas fechas.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Concepto</Th>
                <Th>Medio</Th>
                <Th alinear="right">Importe</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mv) => (
                <tr key={mv.id}>
                  <Td className="whitespace-nowrap text-suave">{formatearFecha(mv.fecha)}</Td>
                  <Td className="max-w-[14rem]">{mv.concepto}</Td>
                  <Td className="capitalize text-suave">{mv.medio}</Td>
                  <Td alinear="right">
                    <Plata centavos={mv.montoCentavos} tono />
                  </Td>
                  <Td alinear="right">
                    {!mv.pedidoId && !mv.compraId && !mv.gastoId && (
                      <form action={accionEliminarMovimientoCaja}>
                        <input type="hidden" name="id" value={mv.id} />
                        <button className="toque text-xs font-medium text-suave hover:text-rose-700">Borrar</button>
                      </form>
                    )}
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

function Fila({ etiqueta, centavos }: { etiqueta: string; centavos: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-suave">{etiqueta}</dt>
      <dd className="tabular">{formatearPesos(centavos)}</dd>
    </div>
  );
}
