import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, Boton, BotonLink, Campo, CampoTexto, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { LinkAcceso } from "@/components/link-acceso";
import { formatearFecha, formatearPesos, hoy } from "@/lib/formato";
import { historialDeCliente, listarAccesos, metricasDeCliente, obtenerCliente } from "@/lib/datos/clientes";
import { listarListas } from "@/lib/datos/precios";
import { listarVendedores } from "@/lib/datos/vendedores";
import { SelectorComisionista, VendedorDeOrigen } from "@/components/selector-comisionista";
import { estadoCobro, saldoPedido } from "@/lib/datos/pedidos";
import { Kpi, CampoSelect } from "@/components/ui";
import { TIPOS_CLIENTE } from "@/lib/db/schema";
import { baseUrl } from "@/lib/url";
import { listarPedidos } from "@/lib/datos/pedidos";
import { stockDelCliente } from "@/lib/datos/panel";
import { accionActualizarCliente, accionCambiarAcceso, accionCrearAcceso, accionRegenerarToken } from "../../actions";

export const dynamic = "force-dynamic";

export default async function FichaCliente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const cliente = await obtenerCliente(id);
  if (!cliente) notFound();

  const accesos = await listarAccesos(id);
  const vendedores = await listarVendedores(true);
  const elegibles = vendedores.map((v) => ({ id: v.id, nombre: v.nombre, color: v.color }));
  const origen = cliente.vendedorOrigenId
    ? ((await listarVendedores()).find((v) => v.id === cliente.vendedorOrigenId) ?? null)
    : null;
  const base = await baseUrl();
  const pedidos = await listarPedidos({ clienteId: id });
  const stock = await stockDelCliente(id);
  const metricas = await metricasDeCliente(id, hoy());
  const historial = await historialDeCliente(id);
  const listas = await listarListas(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/comercial/clientes" className="toque text-xs font-medium text-azul-700">
            ← Clientes
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{cliente.comercio}</h1>
          <p className="text-sm text-suave">{cliente.persona || "Sin contacto cargado"}</p>
        </div>
        <BotonLink href={`/comercial/pedidos/nuevo?cliente=${cliente.id}`}>Cargar pedido</BotonLink>
      </div>

      {error && <Aviso texto={error} />}

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        <Kpi
          etiqueta="Total comprado"
          valor={formatearPesos(metricas.totalCompradoCentavos)}
          detalle={`${metricas.pedidos} pedidos · ${metricas.unidades} unidades`}
        />
        <Kpi
          etiqueta="Saldo pendiente"
          valor={formatearPesos(metricas.saldoCentavos)}
          tono={metricas.saldoCentavos > 0 ? "malo" : "bueno"}
          detalle={metricas.saldoCentavos > 0 ? "de pedidos entregados" : "no debe nada"}
        />
        <Kpi
          etiqueta="Ticket promedio"
          valor={formatearPesos(metricas.ticketPromedioCentavos)}
          detalle={
            metricas.diasEntreCompras !== null ? `compra cada ${metricas.diasEntreCompras} días` : "un solo pedido"
          }
        />
        <Kpi
          etiqueta="Última compra"
          valor={metricas.ultimaCompra ? formatearFecha(metricas.ultimaCompra) : "—"}
          detalle={
            metricas.diasSinComprar === null
              ? "todavía no compró"
              : metricas.diasSinComprar === 0
                ? "hoy"
                : `hace ${metricas.diasSinComprar} días`
          }
          tono={metricas.diasSinComprar !== null && metricas.diasSinComprar > 60 ? "malo" : "neutro"}
        />
      </div>

      <Tarjeta titulo="Ficha">
        <form action={accionActualizarCliente} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={cliente.id} />
          <Campo etiqueta="Nombre del comercio" name="comercio" defaultValue={cliente.comercio} required />
          <Campo etiqueta="Persona que compra" name="persona" defaultValue={cliente.persona} />
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" defaultValue={cliente.telefono} />
          <Campo etiqueta="Email" name="email" type="email" defaultValue={cliente.email} />
          <Campo etiqueta="Dirección" name="direccion" defaultValue={cliente.direccion} />
          <Campo etiqueta="Redes sociales" name="redes" defaultValue={cliente.redes} placeholder="Opcional" />
          <Campo etiqueta="Razón social" name="razonSocial" defaultValue={cliente.razonSocial} placeholder="Opcional" />
          <Campo etiqueta="CUIT o DNI" name="cuit" inputMode="numeric" defaultValue={cliente.cuit} />
          <CampoSelect etiqueta="Condición fiscal" name="condicionFiscal" defaultValue={cliente.condicionFiscal}>
            <option value="">Sin especificar</option>
            {["Responsable Inscripto", "Monotributo", "Exento", "Consumidor final"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect etiqueta="Tipo de cliente" name="tipo" defaultValue={cliente.tipo}>
            {TIPOS_CLIENTE.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </CampoSelect>
          <VendedorDeOrigen vendedores={elegibles} actual={origen} />
          <SelectorComisionista vendedores={elegibles} defaultValue={cliente.comisionistaId ?? ""} />
          <CampoSelect etiqueta="Lista de precios" name="listaPrecioId" defaultValue={cliente.listaPrecioId ?? ""}>
            <option value="">La del vendedor, o la predeterminada</option>
            {listas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </CampoSelect>
          <div className="sm:col-span-2">
            <CampoTexto etiqueta="Notas" name="notas" rows={2} defaultValue={cliente.notas} />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" name="activo" defaultChecked={cliente.activo} className="size-5 accent-[#053388]" />
            Cliente activo
          </label>
          <div className="sm:col-span-2">
            <Boton type="submit">Guardar ficha</Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Accesos al panel">
        <p className="mb-3 text-sm text-suave">
          Cada link entra directo al panel del comercio. Sumá uno aparte para el representante que gestiona los pedidos:
          si deja de trabajar con vos, lo desactivás sin tocar el del dueño.
        </p>

        <ul className="space-y-3">
          {accesos.map((a) => (
            <li key={a.id} className="rounded-xl border border-borde p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {a.nombre} <span className="text-xs font-normal text-suave">({a.rol})</span>
                  </p>
                  <p className="text-xs text-suave">
                    {a.ultimoAccesoEn ? `Último ingreso: ${formatearFecha(a.ultimoAccesoEn)}` : "Todavía no ingresó"}
                  </p>
                </div>
                {!a.activo && <span className="text-xs font-medium text-rose-700">Revocado</span>}
              </div>

              {a.activo && <LinkAcceso url={`${base}/acceso/${a.token}`} />}

              <div className="mt-2 flex gap-3">
                <form action={accionCambiarAcceso}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="clienteId" value={cliente.id} />
                  <input type="hidden" name="activo" value={a.activo ? "0" : "1"} />
                  <button className="toque text-xs font-medium text-suave hover:text-azul-700">
                    {a.activo ? "Revocar acceso" : "Reactivar"}
                  </button>
                </form>
                <form action={accionRegenerarToken}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="clienteId" value={cliente.id} />
                  <button className="toque text-xs font-medium text-suave hover:text-azul-700">Generar link nuevo</button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form action={accionCrearAcceso} className="mt-4 flex flex-wrap items-end gap-3 border-t border-borde pt-4">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="min-w-[200px] flex-1">
            <Campo etiqueta="Nombre del representante" name="nombre" placeholder="Ej: Vendedor de zona norte" required />
          </div>
          <Boton type="submit" variante="secundario">
            Sumar acceso
          </Boton>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Stock en el comercio">
        {stock.length === 0 ? (
          <Vacio>Todavía no recibió entregas.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th alinear="right">Recibido</Th>
                <Th alinear="right">Vendido</Th>
                <Th alinear="right">Disponible</Th>
              </tr>
            </thead>
            <tbody>
              {stock.map((l) => (
                <tr key={l.productoId}>
                  <Td>{l.nombre}</Td>
                  <Td alinear="right">{l.recibido}</Td>
                  <Td alinear="right">{l.vendido}</Td>
                  <Td alinear="right" className="font-medium">
                    {l.disponible}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta titulo="Pedidos">
        {pedidos.length === 0 ? (
          <Vacio>Sin pedidos todavía.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th alinear="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-azul-700">
                      #{p.numero}
                    </Link>
                  </Td>
                  <Td>{formatearFecha(p.fecha)}</Td>
                  <Td>
                    <Estado valor={p.estado} />
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={p.totalCentavos} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>
    <Tarjeta titulo="Historial de compras">
        {historial.length === 0 ? (
          <Vacio>Todavía no le cargaste ningún pedido.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th alinear="right">Unid.</Th>
                <Th alinear="right">Total</Th>
                <Th alinear="right">Saldo</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${h.id}`} className="font-medium text-azul-700">
                      #{h.numero}
                    </Link>
                    <span className="block text-xs text-suave">{formatearFecha(h.fecha)}</span>
                  </Td>
                  <Td alinear="right" className="tabular">
                    {h.unidades}
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={h.totalCentavos} />
                  </Td>
                  <Td alinear="right">
                    {h.estado === "entregado" ? (
                      <Plata centavos={saldoPedido(h)} />
                    ) : (
                      <span className="text-suave">—</span>
                    )}
                  </Td>
                  <Td>
                    <Estado valor={h.estado === "entregado" ? estadoCobro(h) : h.estado} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>
    </div>
  );
}