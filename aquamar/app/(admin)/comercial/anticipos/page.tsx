import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, hoy } from "@/lib/formato";
import { listarAnticipos, pagadosSinEntregar, saldoDeAnticipos } from "@/lib/datos/anticipos";
import { listarClientes } from "@/lib/datos/clientes";
import { FORMAS_COBRO } from "@/lib/db/schema";
import { accionEliminarAnticipo, accionRegistrarAnticipo } from "../actions";

export const dynamic = "force-dynamic";

export default async function Anticipos({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cliente?: string }>;
}) {
  const { error, cliente } = await searchParams;
  const comercios = (await listarClientes()).filter((c) => c.activo);
  const lista = await listarAnticipos(cliente ? { clienteId: cliente } : {});
  const saldo = await saldoDeAnticipos(cliente || undefined);
  const esperando = await pagadosSinEntregar();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Anticipos</h1>
        <p className="text-sm text-suave">
          Plata que un comercio deja antes de que haya nada entregado. Entra a la caja el día que la deja, y se
          aplica al pedido desde la ficha del pedido.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
        <Kpi etiqueta="Recibido" valor={formatearPesos(saldo.recibidoCentavos)} detalle={`${lista.length} anticipos`} />
        <Kpi etiqueta="Ya aplicado" valor={formatearPesos(saldo.aplicadoCentavos)} detalle="A pedidos cobrados" />
        <Kpi
          etiqueta="Sin aplicar"
          valor={formatearPesos(saldo.disponibleCentavos)}
          tono={saldo.disponibleCentavos > 0 ? "malo" : "neutro"}
          detalle="Plata en caja que tiene dueño"
        />
      </div>

      {saldo.disponibleCentavos > 0 && (
        <Aviso
          tipo="ok"
          texto={`De la plata que hay en caja, ${formatearPesos(saldo.disponibleCentavos)} son anticipos todavía sin entregar: no es ganancia, es mercadería que se debe.`}
        />
      )}

      <Tarjeta titulo="Registrar un anticipo">
        <form action={accionRegistrarAnticipo} className="grid gap-3 sm:grid-cols-2">
          <CampoSelect etiqueta="Comercio" name="clienteId" defaultValue={cliente ?? ""} required>
            <option value="" disabled>
              Elegí un comercio
            </option>
            {comercios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.comercio}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
          {/*
            * Dos importes y no uno: el mayorista que adelanta suele dejar una
            * parte en mano y transferir el resto. Cada uno cae en su caja.
            */}
          <Campo etiqueta="En efectivo" name="efectivo" inputMode="decimal" placeholder="0,00" />
          <CampoSelect etiqueta="El resto, por" name="formaResto" defaultValue="transferencia">
            {FORMAS_COBRO.filter((f) => f !== "efectivo").map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Ese resto" name="resto" inputMode="decimal" placeholder="0,00" />
          <Campo etiqueta="Nota" name="notas" placeholder="Para el pedido de 50 bultos" />
          <div className="sm:col-span-2">
            <Boton type="submit">Registrar anticipo</Boton>
          </div>
        </form>
        <p className="mt-3 text-xs text-suave">
          Podés llenar uno de los dos importes o los dos. Se guarda un anticipo por cada forma, para que la caja
          sepa de qué cajón salió cada peso.
        </p>
      </Tarjeta>

      {esperando.length > 0 && (
        <Tarjeta titulo="Ya pagaron y todavía no recibieron">
          <p className="mb-3 text-sm text-suave">
            Pedidos cobrados por completo que siguen sin entregar. Es la mercadería que Aqua Mar debe.
          </p>
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Comercio</Th>
                <Th>Estado</Th>
                <Th alinear="right">Pagado</Th>
              </tr>
            </thead>
            <tbody>
              {esperando.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-azul-700">
                      #{p.numero}
                    </Link>
                    <span className="block text-xs text-suave">{formatearFecha(p.fecha)}</span>
                  </Td>
                  <Td>{p.comercio}</Td>
                  <Td className="text-suave">{p.estado}</Td>
                  <Td alinear="right">
                    <Plata centavos={p.cobradoCentavos} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Tarjeta>
      )}

      <Tarjeta titulo="Anticipos recibidos">
        {lista.length === 0 ? (
          <Vacio>Todavía no se cargó ningún anticipo.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Comercio</Th>
                <Th alinear="right">Monto</Th>
                <Th alinear="right">Sin usar</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <Td className="whitespace-nowrap text-suave">{formatearFecha(a.fecha)}</Td>
                  <Td>
                    <span className="font-medium">{a.comercio}</span>
                    <span className="block text-xs text-suave">
                      {a.forma}
                      {a.notas && ` · ${a.notas}`}
                    </span>
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={a.montoCentavos} />
                  </Td>
                  <Td alinear="right">
                    {a.disponibleCentavos > 0 ? (
                      <strong>
                        <Plata centavos={a.disponibleCentavos} />
                      </strong>
                    ) : (
                      <span className="text-xs text-suave">aplicado</span>
                    )}
                  </Td>
                  <Td alinear="right">
                    {a.aplicadoCentavos === 0 && (
                      <form action={accionEliminarAnticipo}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="toque text-xs font-medium text-rose-700">
                          Borrar
                        </button>
                      </form>
                    )}
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
