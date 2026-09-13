import Link from "next/link";
import { Aviso, Boton, Campo, Tarjeta, Vacio } from "@/components/ui";
import { listarClientes } from "@/lib/datos/clientes";
import { listarVendedores } from "@/lib/datos/vendedores";
import { ChipVendedor } from "@/components/chip-vendedor";
import { SelectorVendedor } from "@/components/selector-vendedor";
import { accionCrearCliente } from "../actions";

export const dynamic = "force-dynamic";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const clientes = await listarClientes();
  const activos = await listarVendedores(true);
  const vendedores = new Map((await listarVendedores()).map((v) => [v.id, v]));
  const elegibles = activos.map((v) => ({ id: v.id, nombre: v.nombre }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-suave">Ficha del comercio, quién lo atiende y links de acceso a su panel.</p>
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
          <SelectorVendedor vendedores={elegibles} />
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
              className="rounded-2xl border border-borde bg-white p-4 shadow-sm transition hover:border-celeste-300"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{c.comercio}</p>
                {(() => {
                  /*
                   * El color dice de un vistazo quién cobra por él. Si no cobra
                   * nadie pero alguien lo trajo, se muestra eso: el comercio no
                   * es "de la casa", es de alguien que hoy no lo atiende.
                   */
                  const v = c.comisionistaId ? vendedores.get(c.comisionistaId) : undefined;
                  if (v) return <ChipVendedor nombre={v.nombre} color={v.color} />;
                  const origen = c.vendedorOrigenId ? vendedores.get(c.vendedorOrigenId) : undefined;
                  return origen ? <span className="text-xs text-suave">lo trajo {origen.nombre}</span> : null;
                })()}
              </div>
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
