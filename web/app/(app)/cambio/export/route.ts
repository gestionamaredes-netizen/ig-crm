import { getDatosCambio } from "@/lib/cambio/datos";
import { construirWorkbook } from "@/lib/cambio/excel";

// exceljs necesita APIs de Node: no corre en el runtime edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datos = await getDatosCambio();
    const buffer = await construirWorkbook(datos);
    const fecha = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="cambio-usd-${fecha}.xlsx"`,
      },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la exportación falló:", err.message);
    return new Response("No se pudo generar el Excel.", { status: 500 });
  }
}
