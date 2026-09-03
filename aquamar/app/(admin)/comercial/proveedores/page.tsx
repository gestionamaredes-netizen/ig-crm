import { Aviso, Boton, Campo, CampoSelect, Tarjeta, Vacio } from "@/components/ui";
import { listarProveedores } from "@/lib/datos/proveedores";
import { accionActualizarProveedor, accionCrearProveedor } from "../actions";

export const dynamic = "force-dynamic";

const CONDICIONES = ["Responsable Inscripto", "Monotributo", "Exento", "Consumidor final"];

export default async function Proveedores({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const proveedores = await listarProveedores();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Proveedores</h1>
        <p className="text-sm text-suave">A quién le comprás la mercadería. Cada compra se carga contra uno de estos.</p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Agregar proveedor">
        <form action={accionCrearProveedor} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre o razón social" name="nombre" placeholder="Powerful SA" required />
          <Campo etiqueta="CUIT" name="cuit" inputMode="numeric" placeholder="30-12345678-9" />
          <CampoSelect etiqueta="Condición fiscal" name="condicionFiscal" defaultValue="">
            <option value="">Sin especificar</option>
            {CONDICIONES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" />
          <Campo etiqueta="Email" name="email" type="email" />
          <Campo etiqueta="Dirección" name="direccion" />
          <div className="sm:col-span-2">
            <Campo etiqueta="Notas" name="notas" placeholder="Días de entrega, contacto, condiciones…" />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Agregar</Boton>
          </div>
        </form>
      </Tarjeta>

      {proveedores.length === 0 ? (
        <Tarjeta>
          <Vacio>Todavía no cargaste ningún proveedor.</Vacio>
        </Tarjeta>
      ) : (
        <div className="space-y-3">
          {proveedores.map((p) => (
            <Tarjeta key={p.id} className={p.activo ? "" : "opacity-60"}>
              <form action={accionActualizarProveedor} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={p.id} />
                <Campo etiqueta="Nombre o razón social" name="nombre" defaultValue={p.nombre} required />
                <Campo etiqueta="CUIT" name="cuit" inputMode="numeric" defaultValue={p.cuit} />
                <CampoSelect etiqueta="Condición fiscal" name="condicionFiscal" defaultValue={p.condicionFiscal}>
                  <option value="">Sin especificar</option>
                  {CONDICIONES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CampoSelect>
                <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" defaultValue={p.telefono} />
                <Campo etiqueta="Email" name="email" type="email" defaultValue={p.email} />
                <Campo etiqueta="Dirección" name="direccion" defaultValue={p.direccion} />
                <div className="sm:col-span-2">
                  <Campo etiqueta="Notas" name="notas" defaultValue={p.notas} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                  <label className="toque gap-2 text-sm text-suave">
                    <input type="checkbox" name="activo" defaultChecked={p.activo} className="size-5" />
                    Activo
                  </label>
                  <Boton type="submit">Guardar</Boton>
                </div>
              </form>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
