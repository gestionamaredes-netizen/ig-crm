import Link from "next/link";
import { Kpi, Plata, Tarjeta } from "@/components/ui";
import { formatearPesos, formatearPorcentaje } from "@/lib/formato";
import type { Cascada } from "@/lib/datos/reportes";

/**
 * La rentabilidad del período, en un solo componente.
 *
 * Vive acá y no repetido en cada pantalla porque el Dashboard y Reportes
 * tienen que decir lo mismo. Compartir el cálculo no alcanzaba: con dos
 * presentaciones distintas igual se podía redondear o etiquetar distinto, y
 * entonces hay que adivinar cuál de las dos pantallas miente.
 */

export type DatosResultado = Cascada & {
  gastosOperativos: number;
  gastosLogisticos: number;
  impuestosPagadosCentavos: number;
  gastosImputadosAPedidos: number;
  unidades: number;
  pedidosEntregados: number;
};

const pct = (v: number | null) => formatearPorcentaje(v);
const sobreVentas = (v: number | null) => {
  const t = pct(v);
  return t === null ? undefined : `${t} sobre ventas sin IVA`;
};

/**
 * Los tres números que contestan "cuánto ganamos".
 *
 * El de después de IIBB va más grande y solo en su fila: es el resultado del
 * negocio, el que hay que mirar primero. Los otros dos explican cómo se llegó.
 */
export function ResultadoEnTarjetas({ r }: { r: DatosResultado }) {
  return (
    <div className="space-y-3">
      <Kpi
        etiqueta="Resultado neto después de IIBB"
        valor={formatearPesos(r.resultadoDespuesIIBBCentavos)}
        tono={r.resultadoDespuesIIBBCentavos >= 0 ? "bueno" : "malo"}
        detalle={sobreVentas(r.resultadoDespuesIIBBPorcentual) ?? "Todavía no hubo ventas en el período"}
        destacado
      />
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        <Kpi
          etiqueta="Ganancia bruta"
          valor={formatearPesos(r.margenBrutoCentavos)}
          tono={r.margenBrutoCentavos >= 0 ? "bueno" : "malo"}
          detalle={sobreVentas(r.margenBrutoPorcentual) ?? "Venta menos costo de mercadería"}
        />
        <Kpi
          etiqueta="Resultado operativo"
          valor={formatearPesos(r.resultadoOperativoCentavos)}
          tono={r.resultadoOperativoCentavos >= 0 ? "bueno" : "malo"}
          detalle={sobreVentas(r.resultadoOperativoPorcentual) ?? "Ganancia bruta menos gastos"}
        />
      </div>
    </div>
  );
}

/** Cómo se llega a esos tres números, renglón por renglón. */
export function ResultadoDetallado({ r, conEnlaceACaja = false }: { r: DatosResultado; conEnlaceACaja?: boolean }) {
  return (
    <Tarjeta titulo="De lo que se vendió a lo que queda">
      <dl className="space-y-1 text-sm">
        <Fila etiqueta="Ventas entregadas (facturado)" centavos={r.ventaBrutaCentavos} />
        <Fila etiqueta="IVA débito fiscal" centavos={-r.ivaDebitoCentavos} />
        <Subtotal etiqueta="Ventas sin IVA" centavos={r.ventaNetaCentavos} />

        <Fila etiqueta="Costo de la mercadería" centavos={-r.costoCentavos} />
        <Subtotal etiqueta="Ganancia bruta" centavos={r.margenBrutoCentavos} porcentaje={r.margenBrutoPorcentual} tono />

        <Fila etiqueta="Gastos operativos" centavos={-r.gastosOperativos} />
        <Fila etiqueta="Gastos logísticos" centavos={-r.gastosLogisticos} />
        <Subtotal
          etiqueta="Resultado operativo"
          centavos={r.resultadoOperativoCentavos}
          porcentaje={r.resultadoOperativoPorcentual}
          tono
        />

        <Fila
          etiqueta={`Ingresos Brutos estimado${r.alicuotaIIBB > 0 ? ` (${(r.alicuotaIIBB / 100).toString().replace(".", ",")}%)` : ""}`}
          centavos={-r.iibbCentavos}
        />
        <div className="flex items-baseline justify-between gap-3 border-t-2 border-azul-600 pt-2">
          <dt className="font-semibold">
            Resultado neto después de IIBB
            {r.resultadoDespuesIIBBPorcentual !== null && (
              <span className="ml-2 text-xs font-normal text-suave">{pct(r.resultadoDespuesIIBBPorcentual)}</span>
            )}
          </dt>
          <dd className="tabular text-base font-semibold">
            <Plata centavos={r.resultadoDespuesIIBBCentavos} tono />
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-suave">
        Todos los porcentajes van sobre la venta sin IVA, que es la plata de Aqua Mar: el IVA se le cobra al
        comercio y se le entrega a AFIP, y por eso queda afuera de la rentabilidad y se mira en impuestos
        estimados.
      </p>
      {r.gastosImputadosAPedidos > 0 && (
        <p className="mt-2 text-xs text-suave">
          De los gastos de arriba, {formatearPesos(r.gastosImputadosAPedidos)} están además imputados a pedidos
          puntuales. Cuentan una sola vez: acá pesan sobre el resultado del período, y en la tabla de pedidos se
          muestran contra el margen del pedido que los generó. Son dos vistas del mismo gasto, no dos gastos.
        </p>
      )}
      {r.impuestosPagadosCentavos > 0 && (
        <p className="mt-2 text-xs text-suave">
          Aparte se registraron {formatearPesos(r.impuestosPagadosCentavos)} de impuestos pagados. No se restan
          acá: Ingresos Brutos ya está descontado arriba como estimación, y contarlo dos veces hundiría el
          resultado sin que hubiera pasado nada.
        </p>
      )}
      {conEnlaceACaja && (
        <p className="mt-2 text-xs text-suave">
          Esto es la ganancia, no la plata en mano. Lo que hay disponible para operar está en{" "}
          <Link href="/comercial/caja" className="text-azul-700">
            Caja
          </Link>
          .
        </p>
      )}
    </Tarjeta>
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

function Subtotal({
  etiqueta,
  centavos,
  porcentaje,
  tono = false,
}: {
  etiqueta: string;
  centavos: number;
  porcentaje?: number | null;
  tono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1 font-medium">
      <dt>
        {etiqueta}
        {porcentaje !== undefined && porcentaje !== null && (
          <span className="ml-2 text-xs font-normal text-suave">{pct(porcentaje)}</span>
        )}
      </dt>
      <dd className="tabular">{tono ? <Plata centavos={centavos} tono /> : formatearPesos(centavos)}</dd>
    </div>
  );
}
