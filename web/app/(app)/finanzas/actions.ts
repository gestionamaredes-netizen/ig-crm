"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto, parsearCantidad } from "@/lib/finanzas/montos";

/** Un date input vacío llega como "" y en la base tiene que ser null, no "". */
function aFecha(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

export async function createExpense(formData: FormData): Promise<ResultadoAlta> {
  const concept = String(formData.get("concept") ?? "").trim();
  if (!concept) return { ok: false, error: "Falta el concepto." };

  const unitario = parsearMonto(String(formData.get("unitAmount") ?? ""));
  if (unitario === null) {
    return { ok: false, error: "El precio unitario no es un monto válido." };
  }

  const quantity = parsearCantidad(String(formData.get("quantity") ?? ""));
  if (quantity === null) {
    return { ok: false, error: "La cantidad no es un número entero válido." };
  }

  const companyId = String(formData.get("companyId") ?? "");

  const sb = await createClient();

  // El insert puede fallar de dos formas distintas: la promesa resuelve con
  // un { error } (constraint, RLS) o la promesa rechaza (falla de red real,
  // el fetch subyacente tira una excepción). Sin el try/catch, el segundo
  // caso se escapa de createExpense entero y el usuario no ve ningún mensaje
  // en vez de "no se pudo guardar" — el ResultadoAlta tiene que valer siempre.
  try {
    const { error } = await sb.from("expenses").insert({
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

    // Una inserción que falla en silencio se ve, desde el modal, igual que
    // una que funcionó: el usuario cierra el form pensando que el gasto
    // quedó guardado. Se loguea igual que las lecturas fallidas en datos.ts.
    if (error) {
      console.error("[finanzas] alta de gasto falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el gasto. Probá de nuevo." };
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[finanzas] alta de gasto falló:", err.message, "");
    return { ok: false, error: "No se pudo guardar el gasto. Probá de nuevo." };
  }

  revalidatePath("/finanzas");
  return { ok: true };
}
