import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, CampoTexto, Tarjeta, Vacio } from "@/components/ui";
import { SelectorPedido } from "@/components/selector-pedido";
import { hoy } from "@/lib/formato";
import { listarClientes } from "@/lib/datos/clientes";
import { escalasPorProducto } from "@/lib/datos/precios";
import { estadoDeposito } from "@/lib/datos/stock";
import { accionCrearPedido } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NuevoPedido({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; error?: string }>;
}) {
  const { cliente, error } = await searchParams;
  const clientes = (await listarClientes()).filter((c) => c.activo);
  const lineas = await estadoDeposito();
  const escalas = await escalasPorProducto(lineas.map((l) => l.id));

  const productos = lineas.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    presentacion: l.presentacion,
    libre: l.libre,
    precioLista: l.precioCentavos,
    escalas: (escalas.get(l.id)?.escalas ?? [])
      .filter((e) => e.activo)
      .map((e) => ({ desdeCantidad: e.desdeCantidad, precioCentavos: e.precioCentavos, nombre: e.nombre })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/comercial/pedidos" className="toque text-xs font-medium text-azul-700">
          ← Pedidos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Nuevo pedido</h1>
        <p className="text-sm text-suave">
          El precio lo sugiere la escala que corresponde por cantidad. Se puede pisar a mano y queda congelado.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      {clientes.length === 0 || productos.length === 0 ? (
        <Tarjeta>
          <Vacio>
            {clientes.length === 0
              ? "Primero cargá un comercio en Clientes."
              : "Primero cargá productos en Depósito → Productos."}
          </Vacio>
        </Tarjeta>
      ) : (
        <form action={accionCrearPedido} className="space-y-4">
          <Tarjeta titulo="Datos">
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoSelect etiqueta="Comercio" name="clienteId" defaultValue={cliente ?? ""} required>
                <option value="" disabled>
                  Elegí un comercio
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.comercio}
                  </option>
                ))}
              </CampoSelect>
              <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
              <div className="sm:col-span-2">
                <CampoTexto etiqueta="Notas" name="notas" rows={2} placeholder="Horario de entrega, forma de pago…" />
              </div>
            </div>
          </Tarjeta>

          <SelectorPedido productos={productos} />

          <Boton type="submit">Crear pedido</Boton>
        </form>
      )}
    </div>
  );
}
