"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLead(formData: FormData) {
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
