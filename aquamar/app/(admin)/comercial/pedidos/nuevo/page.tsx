import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, CampoTexto, Tarjeta, Vacio } from "@/components/ui";
import { SelectorPedido } from "@/components/selector-pedido";
import { SelectorClienteComision } from "@/components/selector-cliente-comision";
import { listarVendedores } from "@/lib/datos/vendedores";
import { hoy } from "@/lib/formato";
import { FORMAS_PAGO, TIPOS_ENTREGA } from "@/lib/db/schema";
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
  const activos = (await listarClientes()).filter((c) => c.activo);
  const vendedores = new Map((await listarVendedores()).map((v) => [v.id, v]));
  const clientes = activos.map((c) => {
    const v = c.comisionistaId ? vendedores.get(c.comisionistaId) : undefined;
    return {
      id: c.id,
      comercio: c.comercio,
      vendedor: v
        ? {
            id: v.id,
            nombre: v.nombre,
            color: v.color,
            modalidad: v.modalidad,
            comisionPorBultoCentavos: v.comisionPorBultoCentavos,
          }
        : null,
    };
  });
  const lineas = await estadoDeposito();
  const escalas = await escalasPorProducto(lineas.map((l) => l.id));

  const productos = lineas.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    presentacion: l.presentacion,
    unidadesPorBulto: l.unidadesPorBulto,
    libre: l.libre,
    precioLista: l.precioCentavos,
    costo: l.costoCentavos,
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
          Al elegir el comercio aparece quién lo atiende y cuánto se lleva. Cada renglón se carga por bulto o por
          unidad suelta, con el precio que sugiere la escala.
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
              <SelectorClienteComision clientes={clientes} defaultClienteId={cliente ?? ""} />
              <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
              <Campo etiqueta="Entrega estimada" name="fechaEntrega" type="date" />
              <CampoSelect etiqueta="Cómo se entrega" name="tipoEntrega" defaultValue="reparto propio">
                {TIPOS_ENTREGA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CampoSelect>
              <CampoSelect etiqueta="Forma de pago" name="formaPago" defaultValue="efectivo">
                {FORMAS_PAGO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </CampoSelect>
              <div className="sm:col-span-2">
                <CampoTexto etiqueta="Observaciones" name="notas" rows={2} placeholder="Horario, referencias…" />
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
