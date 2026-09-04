import { NextResponse } from "next/server";
import { esAdmin } from "@/lib/auth";
import { EXPORTABLES, exportar, type Exportable } from "@/lib/datos/exportar";
import { hoy } from "@/lib/formato";

/**
 * Descarga de una tabla en CSV. Solo administración: acá salen costos, márgenes
 * y datos de clientes.
 */
export async function GET(_pedido: Request, ctx: { params: Promise<{ que: string }> }) {
  if (!(await esAdmin())) return new NextResponse("No autorizado", { status: 401 });

  const { que } = await ctx.params;
  if (!(que in EXPORTABLES)) return new NextResponse("No existe esa exportación", { status: 404 });

  const csv = await exportar(que as Exportable);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aquamar-${que}-${hoy()}.csv"`,
    },
  });
}
