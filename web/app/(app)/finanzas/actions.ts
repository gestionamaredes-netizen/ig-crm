"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Deja solo dígitos: el usuario escribe "34.000" o "$34.000". */
function aNumero(v: FormDataEntryValue | null): number {
  const limpio = String(v ?? "").replace(/[^0-9]/g, "");
  return limpio ? Number(limpio) : 0;
}

/** Un date input vacío llega como "" y en la base tiene que ser null, no "". */
function aFecha(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function createExpense(formData: FormData) {
  const concept = String(formData.get("concept") ?? "").trim();
  const unitario = aNumero(formData.get("unitAmount"));
  const quantity = Math.max(1, aNumero(formData.get("quantity")) || 1);

  // Sin concepto o sin monto la fila no dice nada: no la guardamos.
  if (!concept || unitario <= 0) return;

  const companyId = String(formData.get("companyId") ?? "");

  const sb = await createClient();
  await sb.from("expenses").insert({
    // El select ofrece "" para el gasto de agencia, que en la base es null.
    company_id: companyId || null,
    category: String(formData.get("category") ?? "otro"),
    concept,
    vendor: String(formData.get("vendor") ?? "").trim(),
    external_ref: String(formData.get("externalRef") ?? "").trim(),
    // Se persiste el TOTAL. El formulario pide el unitario porque es como
    // vienen los presupuestos ("3 chombas a $34.000"), pero el modelo guarda
    // el total para que un dominio y una chomba se sumen sin casos especiales.
    amount: unitario * quantity,
    quantity,
    paid_at: aFecha(formData.get("paidAt")),
    renews_at: aFecha(formData.get("renewsAt")),
    period: String(formData.get("period") ?? "unico"),
    notes: String(formData.get("notes") ?? "").trim(),
  });

  revalidatePath("/finanzas");
}
