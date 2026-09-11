import { Aviso, Boton, Campo, CampoSelect, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { ChipVendedor } from "@/components/chip-vendedor";
import { centavosAInput, formatearPesos, hoy, inicioDeMes, textoBultos } from "@/lib/formato";
import { COLORES_VENDEDOR, MODALIDADES_VENDEDOR } from "@/lib/db/schema";
import { listarVendedores, liquidacion } from "@/lib/datos/vendedores";
import { listarListas } from "@/lib/datos/precios";
import { accionActualizarVendedor, accionCrearVendedor } from "../actions";

export const dynamic = "force-dynamic";

export default async function Vendedores({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; error?: string }>;
}) {
  const { desde, hasta, error } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const vendedores = await listarVendedores();
  const listas = (await listarListas()).filter((l) => l.activo);
  const lineas = await liquidacion(rango);
  const aPagar = lineas.reduce((acc, l) => acc + l.comisionCentavos, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Vendedores</h1>
        <p className="text-sm text-suave">
          Quién atiende a cada comercio, con qué precios y cuánto se le paga. La comisión de un pedido queda
          congelada al cargarlo.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Liquidación del período">
        <form className="mb-4 flex flex-wrap items-end gap-3">
          <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
          <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
          <Boton type="submit" variante="secundario">
            Aplicar
          </Boton>
        </form>

        {lineas.length === 0 ? (
          <Vacio>Todavía no cargaste vendedores.</Vacio>
        ) : (
          <>
            <Tabla>
              <thead>
                <tr>
                  <Th>Vendedor</Th>
                  <Th alinear="right">Comercios</Th>
                  <Th alinear="right">Entregados</Th>
                  <Th alinear="right">Vendido</Th>
                  <Th alinear="right">A pagar</Th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.vendedor.id} className={l.vendedor.activo ? "" : "opacity-50"}>
                    <Td>
                      <ChipVendedor nombre={l.vendedor.nombre} color={l.vendedor.color} />
                      <span className="mt-1 block text-xs text-suave">
                        {l.vendedor.modalidad === "comisión"
                          ? `${formatearPesos(l.vendedor.comisionPorBultoCentavos)} por bulto`
                          : "sub-distribuidor, sin comisión"}
                      </span>
                    </Td>
                    <Td alinear="right">{l.comercios}</Td>
                    <Td alinear="right">
                      {l.pedidos}
                      {l.unidades > 0 && (
                        <span className="block text-xs text-suave">{textoBultos(l.unidades, 12)}</span>
                      )}
                    </Td>
                    <Td alinear="right">
                      <Plata centavos={l.ventasCentavos} />
                    </Td>
                    <Td alinear="right">
                      {l.vendedor.modalidad === "comisión" ? <Plata centavos={l.comisionCentavos} /> : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>

            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-borde pt-3">
              <span className="text-sm font-medium">Total a pagar en comisiones</span>
              <span className="tabular text-base font-semibold">{formatearPesos(aPagar)}</span>
            </div>
            <p className="mt-2 text-xs text-suave">
              Cuenta solo pedidos entregados en el período: la comisión se gana cuando la mercadería llegó, no
              cuando se cargó el pedido.
            </p>
          </>
        )}
      </Tarjeta>

      <Tarjeta titulo="Agregar vendedor">
        <form action={accionCrearVendedor} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre" name="nombre" placeholder="Mati Titán" required />
          <CampoSelect etiqueta="Color" name="color" defaultValue="azul">
            {COLORES_VENDEDOR.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect etiqueta="Cómo trabaja" name="modalidad" defaultValue="comisión">
            {MODALIDADES_VENDEDOR.map((m) => (
              <option key={m} value={m}>
                {m === "comisión" ? "A comisión (le pagamos por bulto)" : "Sub-distribuidor (compra y revende)"}
              </option>
            ))}
          </CampoSelect>
          <Campo
            etiqueta="Comisión por bulto"
            name="comisionPorBulto"
            inputMode="decimal"
            placeholder="500,00"
            ayuda="Solo si trabaja a comisión"
          />
          <CampoSelect etiqueta="Lista de precios de sus comercios" name="listaPrecioId" defaultValue="">
            <option value="">La predeterminada</option>
            {listas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" />
          <div className="sm:col-span-2">
            <Campo etiqueta="Notas" name="notas" placeholder="Zona, días que pasa, condiciones…" />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Agregar</Boton>
          </div>
        </form>
      </Tarjeta>

      {vendedores.map((v) => (
        <Tarjeta key={v.id} className={v.activo ? "" : "opacity-60"}>
          <form action={accionActualizarVendedor} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={v.id} />
            <div className="sm:col-span-2">
              <ChipVendedor nombre={v.nombre} color={v.color} />
            </div>
            <Campo etiqueta="Nombre" name="nombre" defaultValue={v.nombre} required />
            <CampoSelect etiqueta="Color" name="color" defaultValue={v.color}>
              {COLORES_VENDEDOR.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </CampoSelect>
            <CampoSelect etiqueta="Cómo trabaja" name="modalidad" defaultValue={v.modalidad}>
              {MODALIDADES_VENDEDOR.map((m) => (
                <option key={m} value={m}>
                  {m === "comisión" ? "A comisión (le pagamos por bulto)" : "Sub-distribuidor (compra y revende)"}
                </option>
              ))}
            </CampoSelect>
            <Campo
              etiqueta="Comisión por bulto"
              name="comisionPorBulto"
              inputMode="decimal"
              defaultValue={centavosAInput(v.comisionPorBultoCentavos)}
              ayuda="Solo si trabaja a comisión"
            />
            <CampoSelect etiqueta="Lista de precios de sus comercios" name="listaPrecioId" defaultValue={v.listaPrecioId ?? ""}>
              <option value="">La predeterminada</option>
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" defaultValue={v.telefono} />
            <div className="sm:col-span-2">
              <Campo etiqueta="Notas" name="notas" defaultValue={v.notas} />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Boton type="submit" variante="secundario">
                Guardar
              </Boton>
              <Boton type="submit" name="activo" value={v.activo ? "no" : "si"} variante="secundario">
                {v.activo ? "Dar de baja" : "Reactivar"}
              </Boton>
            </div>
          </form>
          <p className="mt-3 text-xs text-suave">
            Cambiar la comisión afecta a los pedidos que se carguen de ahora en más. Los que ya están cargados
            conservan la que tenían.
          </p>
        </Tarjeta>
      ))}
    </div>
  );
}
