"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import type { NuevoRegistroOrdenDelDia } from "@/lib/cambio/orden-del-dia";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

function validarFormulario(data: NuevoRegistroOrdenDelDia): string | null {
  if (!data.cuentaId?.trim()) return "Falta seleccionar una cuenta.";
  if (!Number.isFinite(data.pesosCargados) || data.pesosCargados < 0)
    return "Pesos cargados debe ser un número válido ≥ 0.";
  if (!Number.isFinite(data.usdComprados) || data.usdComprados < 0)
    return "USD comprados debe ser un número válido ≥ 0.";
  if (!data.dni?.trim()) return "Falta el DNI.";
  if (!/^\d{7,8}$/.test(data.dni.trim())) return "DNI debe ser un número de 7-8 dígitos.";
  if (!data.pin?.trim()) return "Falta el PIN.";
  if (!/^\d{4,6}$/.test(data.pin.trim())) return "PIN debe ser un número de 4-6 dígitos.";
  return null;
}

export async function crearRegistroOrdenDelDia(
  fecha: string,
  data: NuevoRegistroOrdenDelDia,
): Promise<ResultadoAccion> {
  const err = validarFormulario(data);
  if (err) return { ok: false, error: err };

  const perfil = await getMiPerfil();
  if (!perfil) return { ok: false, error: "No tiene acceso." };

  const runnerId = data.runnerId ?? perfil.runnerId;
  if (!runnerId && perfil.rol !== "admin") {
    return { ok: false, error: "Un runner debe estar asignado." };
  }

  if (perfil.rol === "runner" && runnerId !== perfil.runnerId) {
    return { ok: false, error: "Solo puede crear registros para su runner." };
  }

  const sb = await createClient();
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Falta configuración del servidor." };

  try {
    const { error: errInsert } = await admin.from("orden_del_dia").insert({
      fecha,
      cuenta_id: data.cuentaId,
      runner_id: runnerId,
      pesos_cargados: data.pesosCargados,
      usd_comprados: data.usdComprados,
      alias_pesos: data.aliasPesos ?? "",
      alias_dolares: data.aliasDolares ?? "",
      dni: data.dni,
      pin: data.pin,
    });

    if (errInsert) {
      console.error("[orden-del-dia] insert falló:", errInsert.message);
      return { ok: false, error: "No se pudo guardar el registro." };
    }

    const { error: errAudit } = await admin.from("carga_cuentas_auditoria").insert({
      fecha,
      runner_id: runnerId,
      cuenta_id: data.cuentaId,
      pesos_cargados: data.pesosCargados,
      usd_comprados: data.usdComprados,
      accion: "crear",
      datos_anteriores: {},
      datos_nuevos: {
        aliasPesos: data.aliasPesos,
        aliasDolares: data.aliasDolares,
        dni: data.dni,
        pin: data.pin,
      },
    });

    if (errAudit) {
      console.error("[orden-del-dia] auditoría falló:", errAudit.message);
    }

    revalidatePath("/cambio/orden-del-dia");
    return { ok: true };
  } catch (e) {
    console.error("[orden-del-dia] crearRegistro falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "Error al guardar." };
  }
}

export async function eliminarRegistroOrdenDelDia(registroId: string): Promise<ResultadoAccion> {
  const perfil = await getMiPerfil();
  if (!perfil) return { ok: false, error: "No tiene acceso." };
  if (perfil.rol !== "admin") {
    return { ok: false, error: "Solo admin puede eliminar registros." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Falta configuración del servidor." };

  try {
    const { data: actual, error: errGet } = await admin
      .from("orden_del_dia")
      .select("*")
      .eq("id", registroId)
      .single();

    if (errGet) {
      console.error("[orden-del-dia] lectura para eliminar falló:", errGet.message);
      return { ok: false, error: "Registro no encontrado." };
    }

    const { error: errDelete } = await admin.from("orden_del_dia").delete().eq("id", registroId);

    if (errDelete) {
      console.error("[orden-del-dia] delete falló:", errDelete.message);
      return { ok: false, error: "No se pudo eliminar el registro." };
    }

    await admin.from("carga_cuentas_auditoria").insert({
      fecha: actual.fecha,
      runner_id: actual.runner_id,
      cuenta_id: actual.cuenta_id,
      pesos_cargados: actual.pesos_cargados,
      usd_comprados: actual.usd_comprados,
      accion: "eliminar",
      datos_anteriores: {
        alias_pesos: actual.alias_pesos,
        alias_dolares: actual.alias_dolares,
        dni: actual.dni,
        pin: actual.pin,
      },
      datos_nuevos: {},
    });

    revalidatePath("/cambio/orden-del-dia");
    return { ok: true };
  } catch (e) {
    console.error("[orden-del-dia] eliminarRegistro falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "Error al eliminar." };
  }
}
