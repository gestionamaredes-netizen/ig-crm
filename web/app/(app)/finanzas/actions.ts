"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tieneAccesoCompleto } from "@/lib/auth-guard";
import { parsearMonto, parsearCantidad, validarTotal } from "@/lib/finanzas/montos";
import type { CategoriaGasto, PeriodoGasto } from "@/lib/finanzas/tipos";

// Las mismas uniones de tipos.ts, como array para poder validar un valor de
// FormData (que llega como string suelto) en runtime. Si tipos.ts agrega o
// saca un valor, este array se tiene que actualizar a mano — TypeScript no
// puede derivar un array de miembros a partir de una unión de string literals.
const CATEGORIAS: CategoriaGasto[] = ["dominio", "hosting", "herramienta", "merch", "servicio", "otro"];
const PERIODOS: PeriodoGasto[] = ["unico", "mensual", "anual"];

function esCategoriaValida(v: string): v is CategoriaGasto {
  return (CATEGORIAS as string[]).includes(v);
}

function esPeriodoValido(v: string): v is PeriodoGasto {
  return (PERIODOS as string[]).includes(v);
}

/** Un date input vacío llega como "" y en la base tiene que ser null, no "". */
function aFecha(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

export async function createExpense(formData: FormData): Promise<ResultadoAlta> {
  // El middleware bloquea la navegación por pathname, pero este Server Action
  // se despacha por un ID global que no pasa por ahí: un usuario "cambio"
  // parado en /cambio podría invocarlo directamente. Se revalida acá, antes
  // de tocar cualquier dato.
  if (!(await tieneAccesoCompleto())) {
    return { ok: false, error: "No tenés permiso para esta acción." };
  }

  const concept = String(formData.get("concept") ?? "").trim();
  if (!concept) return { ok: false, error: "Falta el concepto." };

  const unitario = parsearMonto(String(formData.get("unitAmount") ?? ""));
  if (unitario === null) {
    return {
      ok: false,
      error:
        "El precio unitario no es un monto válido. Escribilo a la argentina, con coma decimal (ej: 1.500,50).",
    };
  }

  const quantity = parsearCantidad(String(formData.get("quantity") ?? ""));
  if (quantity === null) {
    return { ok: false, error: "La cantidad no es un número entero válido." };
  }

  // Sin CHECK constraint en la tabla, Postgres acepta cualquier string acá.
  // Un <select> del formulario nunca manda un valor fuera de estos sets, pero
  // un server action recibe FormData arbitrario — se valida contra la misma
  // fuente de verdad que usa la lectura (tipos.ts) en vez de confiar en el
  // origen del pedido.
  const category = String(formData.get("category") ?? "");
  if (!esCategoriaValida(category)) {
    return { ok: false, error: "La categoría no es válida." };
  }

  const period = String(formData.get("period") ?? "");
  if (!esPeriodoValido(period)) {
    return { ok: false, error: "El período no es válido." };
  }

  // Se persiste el TOTAL. El formulario pide el unitario porque es como
  // vienen los presupuestos ("3 chombas a $34.000"), pero el modelo guarda
  // el total para que un dominio y una chomba se sumen sin casos especiales.
  // Cada factor ya fue validado por separado, pero el producto no: dos
  // valores en rango pueden multiplicarse más allá del techo del módulo, así
  // que se revalida el total. Se redondea a centavos antes: son pesos, no
  // hace falta la precisión de punto flotante de "0,1 × 3".
  const total = validarTotal(Math.round(unitario * quantity * 100) / 100);
  if (total === null) {
    return { ok: false, error: "El total del gasto es demasiado grande." };
  }

  const companyId = String(formData.get("companyId") ?? "");

  // Todo lo que puede tirar una excepción real durante el guardado (creación
  // del cliente, el insert) vive dentro de este único try/catch: el error
  // puede llegar como { error } (constraint, RLS) o como una promesa
  // rechazada (falla de red, el fetch subyacente tira una excepción). Sin
  // que ambas llamadas estén adentro, cualquiera de ellas se escapa de
  // createExpense entero y el usuario no ve ningún mensaje en vez de "no se
  // pudo guardar" — el ResultadoAlta tiene que valer siempre.
  try {
    const sb = await createClient();

    const { error } = await sb.from("expenses").insert({
      // El select ofrece "" para el gasto de agencia, que en la base es null.
      company_id: companyId || null,
      category,
      concept,
      vendor: String(formData.get("vendor") ?? "").trim(),
      external_ref: String(formData.get("externalRef") ?? "").trim(),
      amount: total,
      quantity,
      paid_at: aFecha(formData.get("paidAt")),
      renews_at: aFecha(formData.get("renewsAt")),
      period,
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

  // El insert ya commiteó en este punto. revalidatePath es best-effort: si
  // tira, el gasto igual quedó guardado, así que no puede compartir el
  // try/catch de arriba — ese catch devuelve { ok: false }, y reportar como
  // fallida un alta que ya ocurrió hace que el usuario reintente y duplique
  // el gasto. Se aísla en su propio try/catch que solo loguea.
  try {
    revalidatePath("/finanzas");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[finanzas] el gasto se guardó pero revalidatePath falló:", err.message);
  }

  return { ok: true };
}
