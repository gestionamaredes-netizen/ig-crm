import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonImprimir } from "@/components/boton-imprimir";
import { ResumenCierreImpreso } from "@/components/resumen-cierre";
import { obtenerCierre } from "@/lib/datos/cierre";

export const dynamic = "force-dynamic";

export default async function VerCierre({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cierre = await obtenerCierre(id);
  if (!cierre) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/comercial/cierre" className="toque text-xs font-medium text-azul-700">
          ← Cierres
        </Link>
        <BotonImprimir>Imprimir o guardar como PDF</BotonImprimir>
      </div>

      <ResumenCierreImpreso
        resumen={cierre.datos}
        periodo={cierre.periodo}
        hechoPor={cierre.hechoPor}
        nota={cierre.nota}
        cuando={cierre.creadoEn}
      />
    </div>
  );
}
