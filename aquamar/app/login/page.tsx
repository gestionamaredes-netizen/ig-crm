import { Aviso, Boton, Campo } from "@/components/ui";
import { entrarComoAdmin, entrarConCodigo } from "./actions";

const MENSAJES: Record<string, string> = {
  clave: "La clave no es correcta.",
  codigo: "Ese código no corresponde a ningún comercio activo.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="text-center">
        <p className="text-3xl font-semibold tracking-tight text-marea-700">Aqua Mar</p>
        <p className="mt-1 text-sm text-suave">Powerfull 3 en 1 · distribución mayorista</p>
      </div>

      {error && <Aviso texto={MENSAJES[error] ?? "No pudimos entrar."} />}

      <form action={entrarComoAdmin} className="space-y-3 rounded-2xl border border-borde bg-white p-5 shadow-sm">
        <h1 className="text-sm font-semibold">Administración</h1>
        <Campo etiqueta="Clave" name="clave" type="password" autoComplete="current-password" required />
        <Boton type="submit" className="w-full">
          Entrar al panel
        </Boton>
      </form>

      <form action={entrarConCodigo} className="space-y-3 rounded-2xl border border-borde bg-white p-5 shadow-sm">
        <h1 className="text-sm font-semibold">Soy un comercio</h1>
        <Campo
          etiqueta="Código de acceso"
          name="codigo"
          placeholder="Pegá acá el link que te pasamos"
          ayuda="También podés entrar directo con el link, sin escribir nada."
          required
        />
        <Boton type="submit" variante="secundario" className="w-full">
          Ver mi panel
        </Boton>
      </form>
    </main>
  );
}
