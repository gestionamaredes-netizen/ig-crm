"use server";
import { revalidatePath } from "next/cache";
import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import { createAdminClient } from "@/lib/supabase/admin";
import { usuarioAEmail, normalizarUsuario, validarUsuario, validarClave } from "@/lib/cambio/acceso";

export type ResultadoAcceso = { ok: true; usuario: string } | { ok: false; error: string };

/**
 * Crea el acceso (login) de un runner: un usuario + clave inicial que la persona
 * usa para entrar desde su celular, sin mail. Solo un admin puede hacerlo.
 *
 * Pasos: valida → confirma que quien llama es admin → crea el usuario en Auth
 * con la service role → lo vincula al runner en perfiles_cambio (rol runner).
 * El usuario "ori" entra como "ori@gestionesma.store"; nunca ve ese email.
 */
export async function crearAccesoRunner(
  runnerId: string,
  usuario: string,
  clave: string,
): Promise<ResultadoAcceso> {
  if (!runnerId) return { ok: false, error: "Falta el runner." };

  const user = normalizarUsuario(usuario);
  const errU = validarUsuario(user);
  if (errU) return { ok: false, error: errU };
  const errC = validarClave(clave);
  if (errC) return { ok: false, error: errC };

  // Solo un admin puede crear accesos. Se verifica con la sesión del que llama,
  // NO con la service role: la service role saltea todo, así que la puerta la
  // pone este chequeo.
  const perfil = await getMiPerfil();
  if (perfil?.rol !== "admin") {
    return { ok: false, error: "Solo un administrador puede crear accesos." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Falta configurar la clave de administración (SUPABASE_SERVICE_ROLE_KEY) en Vercel. Avisale a quien maneja el sistema." };
  }

  const email = usuarioAEmail(user);

  try {
    // ¿Ese runner ya tiene un acceso? Evita duplicados.
    const { data: yaTiene, error: errYa } = await admin
      .from("perfiles_cambio")
      .select("usuario")
      .eq("runner_id", runnerId)
      .limit(1)
      .maybeSingle();
    if (errYa) {
      console.error("[cambio] chequeo de acceso existente falló:", errYa.message);
      return { ok: false, error: "No se pudo verificar. Probá de nuevo." };
    }
    if (yaTiene) {
      return { ok: false, error: `Ese runner ya tiene acceso (usuario: ${yaTiene.usuario ?? "creado"}).` };
    }

    // Crear el usuario en Auth. email_confirm: true = queda confirmado sin mail.
    const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
      email,
      password: clave,
      email_confirm: true,
    });
    if (errCrear || !creado?.user) {
      const msg = errCrear?.message ?? "";
      if (/already been registered|already exists/i.test(msg)) {
        return { ok: false, error: `Ya existe un usuario "${user}". Elegí otro nombre.` };
      }
      console.error("[cambio] alta de usuario Auth falló:", msg);
      return { ok: false, error: "No se pudo crear el usuario. Probá de nuevo." };
    }

    // Vincular al runner en perfiles_cambio (con la service role, saltea RLS).
    const { error: errPerfil } = await admin.from("perfiles_cambio").insert({
      user_id: creado.user.id,
      rol: "runner",
      runner_id: runnerId,
      usuario: user,
    });
    if (errPerfil) {
      // El usuario quedó creado pero sin perfil: se borra para no dejar un
      // acceso "huérfano" que puede entrar pero sin permisos.
      await admin.auth.admin.deleteUser(creado.user.id).catch(() => {});
      console.error("[cambio] vínculo de perfil falló:", errPerfil.message);
      return { ok: false, error: "No se pudo vincular el acceso al runner. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] crearAccesoRunner falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo crear el acceso. Probá de nuevo." };
  }

  try {
    revalidatePath("/cambio/runners");
  } catch (e) {
    console.error("[cambio] acceso creado pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
  }
  return { ok: true, usuario: user };
}
