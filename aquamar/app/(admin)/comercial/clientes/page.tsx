import Link from "next/link";
import { Aviso, Boton, Campo, Tarjeta, Vacio } from "@/components/ui";
import { listarClientes } from "@/lib/datos/clientes";
import { accionCrearCliente } from "../actions";

export const dynamic = "force-dynamic";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const clientes = await listarClientes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-suave">Ficha del comercio y links de acceso a su panel.</p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Nuevo comercio">
        <form action={accionCrearCliente} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre del comercio" name="comercio" required />
          <Campo etiqueta="Persona que compra" name="persona" />
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" />
          <Campo etiqueta="Email" name="email" type="email" />
          <Campo etiqueta="Dirección" name="direccion" />
          <Campo etiqueta="Redes sociales" name="redes" placeholder="@usuario (opcional)" />
          <div className="sm:col-span-2">
            <Boton type="submit">Crear ficha y link de acceso</Boton>
          </div>
        </form>
      </Tarjeta>

      {clientes.length === 0 ? (
        <Tarjeta>
          <Vacio>Todavía no hay comercios cargados.</Vacio>
        </Tarjeta>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clientes.map((c) => (
            <Link
              key={c.id}
              href={`/comercial/clientes/${c.id}`}
              className="rounded-2xl border border-borde bg-white p-4 shadow-sm transition hover:border-marea-300"
            >
              <p className="font-medium">{c.comercio}</p>
              <p className="text-sm text-suave">{c.persona || "Sin contacto cargado"}</p>
              <p className="mt-1 text-xs text-suave">
                {[c.telefono, c.direccion].filter(Boolean).join(" · ") || "Sin datos de contacto"}
              </p>
              {!c.activo && <p className="mt-2 text-xs font-medium text-rose-700">Inactivo</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
