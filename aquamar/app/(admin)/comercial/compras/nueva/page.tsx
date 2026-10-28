import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, CampoTexto, Tarjeta, Vacio } from "@/components/ui";
import { CargaCompra } from "@/components/carga-compra";
import { hoy } from "@/lib/formato";
import { ivaEsRecuperable, NOMBRE_REGIMEN, regimenActual } from "@/lib/datos/config";
import { listarProductos } from "@/lib/datos/productos";
import { listarProveedores } from "@/lib/datos/proveedores";
import { FORMAS_PAGO } from "@/lib/db/schema";
import { accionCrearCompra } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NuevaCompra({
  searchParams,
}: {
  searchParams: Promise<{ proveedor?: string; error?: string }>;
}) {
  const { proveedor, error } = await searchParams;
  const proveedores = await listarProveedores(true);
  const productos = (await listarProductos(true)).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    presentacion: p.presentacion,
    stock: p.stock,
  }));
  const regimen = await regimenActual();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/comercial/compras" className="toque text-xs font-medium text-azul-700">
          ← Compras
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Nueva compra</h1>
        <p className="text-sm text-suave">
          Queda en borrador. Lo que pasa con el depósito al confirmarla depende de lo que elijas abajo.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      {proveedores.length === 0 || productos.length === 0 ? (
        <Tarjeta>
          <Vacio>
            {proveedores.length === 0
              ? "Primero cargá un proveedor."
              : "Primero cargá productos en Depósito → Productos."}
          </Vacio>
        </Tarjeta>
      ) : (
        <form action={accionCrearCompra} className="space-y-4">
          {/*
            * La decisión de si esta factura suma stock o no va arriba de todo y
            * no escondida entre los datos: elegir mal duplica la mercadería, y
            * ese error recién se nota cuando se vende algo que no hay.
            */}
          <Tarjeta titulo="¿Esta mercadería ya está en el depósito?">
            <div className="space-y-2">
              <label className="flex cursor-pointer gap-3 rounded-xl border border-borde p-3 hover:border-celeste-300">
                <input type="radio" name="modoIngreso" value="nuevo" defaultChecked className="mt-1" />
                <span className="text-sm">
                  <strong className="block">No, es mercadería que estoy recibiendo ahora</strong>
                  <span className="text-suave">
                    Al confirmar, las unidades entran al depósito y suman al stock. Es lo habitual.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-borde p-3 hover:border-celeste-300">
                <input type="radio" name="modoIngreso" value="vinculado" className="mt-1" />
                <span className="text-sm">
                  <strong className="block">Sí, ya la conté y está cargada</strong>
                  <span className="text-suave">
                    Registra proveedor, comprobante y costos sin sumar una sola unidad. Después hay que decir qué
                    movimientos del depósito cubre esta factura, para que las mismas unidades no queden facturadas
                    dos veces.
                  </span>
                </span>
              </label>
            </div>
          </Tarjeta>

          <Tarjeta titulo="Datos de la factura">
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoSelect etiqueta="Proveedor" name="proveedorId" defaultValue={proveedor ?? ""} required>
                <option value="" disabled>
                  Elegí un proveedor
                </option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </CampoSelect>
              <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
              <Campo etiqueta="Comprobante" name="comprobante" placeholder="A 0001-00012345" />
              <CampoSelect etiqueta="Forma de pago" name="formaPago" defaultValue="transferencia">
                {FORMAS_PAGO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </CampoSelect>
              <div className="sm:col-span-2">
                <CampoTexto etiqueta="Notas" name="notas" rows={2} placeholder="Remito, condiciones, quién recibió…" />
              </div>
            </div>
            <p className="mt-3 text-xs text-suave">
              Régimen configurado: <strong className="text-tinta">{NOMBRE_REGIMEN[regimen]}</strong>. Se cambia en{" "}
              <Link href="/comercial/precios" className="text-azul-700">
                Precios
              </Link>
              .
            </p>
          </Tarjeta>

          <CargaCompra productos={productos} ivaRecuperable={ivaEsRecuperable(regimen)} />

          <Boton type="submit">Guardar borrador</Boton>
        </form>
      )}
    </div>
  );
}
