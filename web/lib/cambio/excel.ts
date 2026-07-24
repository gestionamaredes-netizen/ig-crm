import ExcelJS from "exceljs";
import type { DatosCambio } from "./datos";

const ARS = '"$"#,##0';
const USD = "#,##0.00";
const TC = "#,##0.00";

/**
 * El archivo lleva VALORES, no fórmulas. Es una foto para archivar o mandar
 * al contador: la planilla que este módulo reemplaza se rompía justamente al
 * moverla entre programas, porque el cálculo vivía en las celdas.
 */
export async function construirWorkbook(datos: DatosCambio): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "IG OS — Gestiones MA";

  const encabezar = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  const ops = wb.addWorksheet("Operaciones");
  ops.columns = [
    { header: "Fecha", key: "fecha", width: 12 },
    { header: "Tipo", key: "tipo", width: 10 },
    { header: "Cliente", key: "cliente", width: 22 },
    { header: "Emisor", key: "emisor", width: 22 },
    { header: "Receptor", key: "receptor", width: 22 },
    { header: "USD", key: "usd", width: 13, style: { numFmt: USD } },
    { header: "Pesos", key: "ars", width: 16, style: { numFmt: ARS } },
    { header: "TC", key: "tc", width: 11, style: { numFmt: TC } },
    { header: "Costos", key: "costos", width: 12, style: { numFmt: ARS } },
    { header: "Costo prom.", key: "costoPromedio", width: 13, style: { numFmt: TC } },
    { header: "Margen", key: "margen", width: 14, style: { numFmt: ARS } },
    { header: "Stock USD", key: "stock", width: 13, style: { numFmt: USD } },
    { header: "Comprobante", key: "comprobante", width: 12 },
    { header: "Notas", key: "notas", width: 30 },
  ];
  const TIPO_LABEL: Record<string, string> = { compra: "COMPRA", venta: "VENTA", carga: "CARGA" };
  for (const o of datos.operaciones) {
    ops.addRow({
      fecha: o.fecha, tipo: TIPO_LABEL[o.tipo] ?? o.tipo.toUpperCase(), cliente: o.cliente,
      emisor: o.emisor, receptor: o.receptor, usd: o.usd, ars: o.ars, tc: o.tc,
      costos: o.costos, costoPromedio: o.costoPromedio,
      margen: o.tipo === "venta" ? o.margen : null, stock: o.stock,
      comprobante: o.comprobantePath ? "Sí" : "",
      notas: o.notas,
    });
  }
  encabezar(ops);

  const cli = wb.addWorksheet("Clientes");
  cli.columns = [
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "USD comprados", key: "usdComprados", width: 15, style: { numFmt: USD } },
    { header: "USD vendidos", key: "usdVendidos", width: 15, style: { numFmt: USD } },
    { header: "Volumen USD", key: "volumen", width: 15, style: { numFmt: USD } },
    { header: "Margen", key: "margen", width: 16, style: { numFmt: ARS } },
    { header: "TC prom. compra", key: "tcPromedioCompra", width: 16, style: { numFmt: TC } },
    { header: "TC prom. venta", key: "tcPromedioVenta", width: 16, style: { numFmt: TC } },
    { header: "Operaciones", key: "operaciones", width: 12 },
  ];
  datos.clientes.forEach((c) => cli.addRow(c));
  encabezar(cli);

  const per = wb.addWorksheet("Personas");
  per.columns = [
    { header: "Persona", key: "persona", width: 26 },
    { header: "Como emisor", key: "comoEmisor", width: 15, style: { numFmt: USD } },
    { header: "Como receptor", key: "comoReceptor", width: 15, style: { numFmt: USD } },
    { header: "Volumen USD", key: "volumen", width: 15, style: { numFmt: USD } },
    { header: "Operaciones", key: "operaciones", width: 12 },
  ];
  datos.personas.forEach((p) => per.addRow(p));
  encabezar(per);

  const caj = wb.addWorksheet("Cajas");
  caj.columns = [
    { header: "Caja", key: "nombre", width: 20 },
    { header: "Moneda", key: "moneda", width: 10 },
    { header: "Saldo inicial", key: "saldoInicial", width: 16 },
    { header: "Movimientos", key: "movimientos", width: 16 },
    { header: "Ajuste", key: "ajuste", width: 14 },
    { header: "Saldo", key: "saldo", width: 16 },
  ];
  for (const s of datos.saldos) {
    const fila = caj.addRow(s);
    // El formato depende de la moneda de cada caja, así que va por fila y no
    // en la definición de la columna.
    const fmt = s.moneda === "ARS" ? ARS : USD;
    for (const col of [3, 4, 5, 6]) fila.getCell(col).numFmt = fmt;
  }
  encabezar(caj);

  const res = wb.addWorksheet("Resumen");
  res.columns = [
    { header: "Concepto", key: "k", width: 30 },
    { header: "Valor", key: "v", width: 20 },
  ];
  const r = datos.resumen;
  res.addRow({ k: "Stock de dólares (USD)", v: r.stockUsd }).getCell(2).numFmt = USD;
  res.addRow({ k: "Costo promedio del stock", v: r.costoPromedio }).getCell(2).numFmt = TC;
  res.addRow({ k: "Costo total del stock", v: r.costoTotal }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Margen acumulado", v: r.margenTotal }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Margen del mes", v: r.margenDelMes }).getCell(2).numFmt = ARS;
  res.addRow({ k: "Volumen operado (USD)", v: r.volumenUsd }).getCell(2).numFmt = USD;
  res.addRow({ k: "Cantidad de operaciones", v: r.operaciones });
  encabezar(res);

  // exceljs trae su propia declaración ambiental de `Buffer` (un
  // `interface Buffer extends ArrayBuffer {}` en su .d.ts) que choca con la
  // de @types/node y hace que el cast directo falle en tsc. En runtime
  // `writeBuffer` devuelve un Buffer de Node real; el cast pasa por
  // `unknown` para sortear el choque de tipos sin cambiar el comportamiento.
  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}
