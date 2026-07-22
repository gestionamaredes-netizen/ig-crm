"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { seSolapan } from "@/lib/pautas/metricas";

function aNumero(fd: FormData, campo: string): number {
  const limpio = String(fd.get(campo) ?? "").replace(/[^0-9]/g, "");
  return limpio ? Number(limpio) : 0;
}

export async function crearCampana(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const cuentaId = String(formData.get("cuentaId") ?? "");
  if (!nombre || !cuentaId) return;

  const sb = await createClient();
  const { data: cuenta } = await sb.from("ad_accounts").select("company_id").eq("id", cuentaId).single();
  if (!cuenta) return;

  await sb.from("campaigns").insert({
    company_id: cuenta.company_id,
    ad_account_id: cuentaId,
    name: nombre,
    external_id: String(formData.get("externalId") ?? "").trim(),
    objective: String(formData.get("objetivo") ?? "leads"),
    status: String(formData.get("estado") ?? "borrador"),
    daily_budget: aNumero(formData, "presupuesto"),
  });

  revalidatePath("/marketing");
  revalidatePath("/dashboard");
}

export async function cargarPeriodo(formData: FormData) {
  const campanaId = String(formData.get("campanaId") ?? "");
  const desde = String(formData.get("desde") ?? "");
  const hasta = String(formData.get("hasta") ?? "");
  // Sin campaña o sin rango no hay nada que guardar; un rango invertido sería
  // un tramo negativo y rompería el reparto diario del gasto.
  if (!campanaId || !desde || !hasta || desde > hasta) return;

  const sb = await createClient();

  // Una carga manual reemplaza a otra manual del mismo tramo en vez de sumarse.
  const { data: previas } = await sb
    .from("campaign_metrics")
    .select("id,period_start,period_end")
    .eq("campaign_id", campanaId)
    .eq("source", "manual");

  const pisadas = (previas ?? []).filter((p) =>
    seSolapan({ desde: p.period_start as string, hasta: p.period_end as string }, { desde, hasta }),
  );
  if (pisadas.length) {
    await sb
      .from("campaign_metrics")
      .delete()
      .in(
        "id",
        pisadas.map((p) => p.id),
      );
  }

  await sb.from("campaign_metrics").insert({
    campaign_id: campanaId,
    period_start: desde,
    period_end: hasta,
    source: "manual",
    impressions: aNumero(formData, "impresiones"),
    clicks: aNumero(formData, "clics"),
    cost: aNumero(formData, "costo"),
    conversions: aNumero(formData, "clicsWhatsapp"),
  });

  revalidatePath("/marketing");
  revalidatePath("/dashboard");
}
