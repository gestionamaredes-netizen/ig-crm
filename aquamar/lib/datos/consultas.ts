import "server-only";
import { hoy, inicioDeMes } from "../formato";
import { saldos } from "./caja";
import { clientesConMetricas } from "./clientes";
import { cuentasPorPagar } from "./compras";
import { estimar } from "./impuestos";
import { cuentasPorCobrar } from "./pedidos";
import { bajaRotacion, indicadores, rentabilidadPorCliente, rentabilidadPorProducto, resumen } from "./reportes";
import { rotacion } from "./rotacion";
import { resumenDeposito } from "./stock";

/**
 * Las preguntas que se hace el dueño del negocio, cada una resuelta contra la
 * base. Cada respuesta trae el número y una frase armada.
 *
 * Es también la capa por la que va a entrar una IA más adelante: en vez de
 * dejarla escribir SQL contra la base, se le ofrece este catálogo cerrado de
 * preguntas y ella elige cuál corresponde. Una respuesta puede ser incómoda,
 * pero no puede ser inventada.
 */
export type Respuesta = {
  clave: string;
  pregunta: string;
  respuesta: string;
  detalle?: string;
  /** El número pelado, para cuando lo consuma algo que no sea una pantalla. */
  valor?: number;
};

const pesos = (centavos: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    centavos / 100,
  );

export type Periodo = { desde: string; hasta: string };

export function periodoDelMes(): Periodo {
  return { desde: inicioDeMes(), hasta: hoy() };
}

export async function responder(periodo: Periodo = periodoDelMes()): Promise<Respuesta[]> {
  const r = await resumen(periodo);
  const kpis = indicadores(r);
  const caja = await saldos();
  const deposito = await resumenDeposito();
  const porCobrar = await cuentasPorCobrar();
  const porPagar = await cuentasPorPagar();
  const productos = await rentabilidadPorProducto(periodo);
  const clientes = await rentabilidadPorCliente(periodo);
  const cartera = await clientesConMetricas(hoy());
  const ritmo = await rotacion();
  const quietos = await bajaRotacion(periodo);
  const impuestos = await estimar(periodo);

  const mejorProducto = [...productos].sort(
    (a, b) => b.ingresosCentavos - b.costoCentavos - (a.ingresosCentavos - a.costoCentavos),
  )[0];
  const dormidos = cartera
    .filter((c) => c.activo && c.diasSinComprar !== null && c.diasSinComprar > 45)
    .sort((a, b) => (b.diasSinComprar ?? 0) - (a.diasSinComprar ?? 0));
  const aReponer = ritmo.filter((l) => l.sugerenciaCompra > 0);
  const masCorto = ritmo.find((l) => l.diasDeStock !== null);

  return [
    {
      clave: "ventas",
      pregunta: "¿Cuánto vendimos?",
      respuesta: pesos(r.ingresosCentavos),
      detalle: `${r.unidades} unidades en ${r.pedidosEntregados} pedidos entregados`,
      valor: r.ingresosCentavos,
    },
    {
      clave: "ganancia",
      pregunta: "¿Cuánto ganamos?",
      respuesta: pesos(r.neto),
      detalle:
        r.netoPorcentual !== null
          ? `${pesos(r.margenBruto)} de margen bruto menos ${pesos(r.gastosCentavos)} de gastos · ${r.netoPorcentual.toFixed(1)}% sobre ventas`
          : "Todavía no hubo ventas en el período",
      valor: r.neto,
    },
    {
      clave: "producto",
      pregunta: "¿Qué producto deja más margen?",
      respuesta: mejorProducto?.nombre ?? "Sin ventas en el período",
      detalle: mejorProducto
        ? `${pesos(mejorProducto.ingresosCentavos - mejorProducto.costoCentavos)} de margen con ${mejorProducto.unidades} unidades`
        : undefined,
    },
    {
      clave: "clientes",
      pregunta: "¿Cuáles son los mejores clientes?",
      respuesta: clientes.length > 0 ? clientes.slice(0, 3).map((c) => c.comercio).join(", ") : "Sin ventas",
      detalle: clientes[0]
        ? `${clientes[0].comercio} lleva ${pesos(clientes[0].ingresosCentavos)} en ${clientes[0].pedidos} pedidos`
        : undefined,
    },
    {
      clave: "dormidos",
      pregunta: "¿Qué clientes dejaron de comprar?",
      respuesta:
        dormidos.length === 0
          ? "Ninguno: todos compraron hace menos de 45 días"
          : dormidos
              .slice(0, 3)
              .map((c) => `${c.comercio} (${c.diasSinComprar} días)`)
              .join(", "),
      detalle: dormidos.length > 3 ? `y ${dormidos.length - 3} más` : undefined,
      valor: dormidos.length,
    },
    {
      clave: "cobertura",
      pregunta: "¿Cuántos días de stock quedan?",
      respuesta:
        masCorto?.diasDeStock !== undefined && masCorto?.diasDeStock !== null
          ? `${masCorto.diasDeStock} días de ${masCorto.nombre}`
          : "No hay ritmo de venta para estimarlo",
      detalle: masCorto ? `${masCorto.libre} libres a ${masCorto.ventaSemanal.toFixed(1)} por semana` : undefined,
      valor: masCorto?.diasDeStock ?? undefined,
    },
    {
      clave: "comprar",
      pregunta: "¿Cuánto debería comprar?",
      respuesta:
        aReponer.length === 0
          ? "Nada por ahora: el stock cubre el período objetivo"
          : aReponer.map((l) => `${l.sugerenciaCompra} de ${l.nombre}`).join(", "),
      detalle: aReponer.length > 0 ? "Para cubrir los días configurados en Reportes" : undefined,
    },
    {
      clave: "inmovilizado",
      pregunta: "¿Cuánta plata tengo comprometida en stock?",
      respuesta: pesos(deposito.valorCosto),
      detalle:
        quietos.length > 0
          ? `${deposito.unidades} unidades a costo · ${pesos(quietos.reduce((a, q) => a + q.capitalQuietoCentavos, 0))} en mercadería que no rotó`
          : `${deposito.unidades} unidades a costo`,
      valor: deposito.valorCosto,
    },
    {
      clave: "impuestos",
      pregunta: "¿Cuánto debería reservar para impuestos?",
      respuesta: impuestos.aplica ? pesos(impuestos.reservaSugeridaCentavos) : "No aplica con el régimen configurado",
      detalle: impuestos.aplica
        ? `${pesos(impuestos.saldoIvaCentavos)} de IVA${impuestos.iibbCentavos > 0 ? ` y ${pesos(impuestos.iibbCentavos)} de Ingresos Brutos` : ""} · estimación, no liquidación`
        : "Monotributo: cuota fija, no se liquida IVA",
      valor: impuestos.reservaSugeridaCentavos,
    },
    {
      clave: "caja",
      pregunta: "¿Con cuánta plata cuento?",
      respuesta: pesos(caja.total),
      detalle:
        `${pesos(caja.efectivo)} en efectivo y ${pesos(caja.banco)} en banco · ` +
        `te deben ${pesos(porCobrar.reduce((a, d) => a + d.saldoCentavos, 0))}, ` +
        `debés ${pesos(porPagar.reduce((a, d) => a + d.saldoCentavos, 0))}`,
      valor: caja.total,
    },
    {
      clave: "ticket",
      pregunta: "¿Cuánto compra cada comercio por vez?",
      respuesta: pesos(kpis.ticketPromedioCentavos),
      detalle:
        r.pedidosEntregados > 0
          ? `${kpis.unidadesPorPedido.toFixed(1)} unidades por pedido, ${pesos(kpis.margenPorUnidadCentavos)} de margen por unidad`
          : undefined,
      valor: kpis.ticketPromedioCentavos,
    },
  ];
}
