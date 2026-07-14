import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase para el servidor, ligado a la sesión (cookies) del usuario.
// Las queries corren como el usuario autenticado → respetan RLS.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Llamado desde un Server Component: se ignora (el middleware refresca la sesión).
          }
        },
      },
    }
  );
}
