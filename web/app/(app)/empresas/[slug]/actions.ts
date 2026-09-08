"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tieneAccesoCompleto } from "@/lib/auth-guard";

export async function createLead(formData: FormData) {
  // El middleware bloquea la navegación por pathname, pero este Server Action
  // se despacha por un ID global que no pasa por ahí: un usuario "cambio"
  // parado en /cambio podría invocarlo directamente. Se revalida acá, antes
  // de tocar cualquier dato. La acción no devuelve un resultado discriminado,
  // así que el candado usa el mismo mecanismo que ya usa: un `return;`
  // silencioso.
  if (!(await tieneAccesoCompleto())) return;

  const slug = String(formData.get("slug") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const valueRaw = String(formData.get("value") ?? "").replace(/[^0-9]/g, "");
  const channel = String(formData.get("channel") ?? "otro");
  const campaignId = String(formData.get("campaignId") ?? "");
  const gclid = String(formData.get("gclid") ?? "").trim();

  if (!slug || !name) return;

  const sb = await createClient();
  const { data: company } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!company) return;

  await sb.from("leads").insert({
    company_id: company.id,
    stage_id: stageId || null,
    name,
    description,
    value: valueRaw ? Number(valueRaw) : 0,
    channel,
    campaign_id: campaignId || null,
    gclid,
  });

  revalidatePath(`/empresas/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/marketing");
}
