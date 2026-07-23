import { createClient } from "@/lib/supabase/server";
import { accessTier } from "@/lib/auth-config";

/**
 * ¿El usuario actual tiene acceso completo al CRM? Los Server Actions que
 * mutan datos fuera de la caja de cambio tienen que llamarlo: el middleware
 * bloquea la navegación por pathname, pero un Server Action se despacha por un
 * ID global que no pasa por esa verificación, así que cada acción sensible
 * necesita su propio candado. Con login apagado (dev local) pasan todos.
 */
export async function tieneAccesoCompleto(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== "true") return true;
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return accessTier(user?.email) === "full";
}
