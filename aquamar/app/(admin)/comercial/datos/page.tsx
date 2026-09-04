import Link from "next/link";
import { Aviso, Kpi, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, hoy, inicioDeMes } from "@/lib/formato";
import { EXPORTABLES, inventarioDeDatos, type Exportable } from "@/lib/datos/exportar";
import { listarBitacora } from "@/lib/datos/bitacora";
import { hayUsuarioDeposito } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NOMBRE_ACTOR: Record<string, string> = {
  admin: "Administración",
  deposito: "Depósito",
};

export default async function Datos({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const inventario = await inventarioDeDatos();
  const anotaciones = await listarBitacora({ limite: 60 });
  const conDeposito = hayUsuarioDeposito();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Datos y respaldo</h1>
        <p className="text-sm text-suave">
          Bajarte una copia de todo, y ver quién tocó qué.
        </p>
      </div>

      <Tarjeta titulo="Bajar una copia">
        <p className="mb-3 text-sm text-suave">
          Un archivo CSV por tabla. Se abren con Excel o Google Sheets: el separador es punto y coma y los importes
          van con coma decimal, como espera un Excel en español.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(EXPORTABLES) as Exportable[]).map((clave) => (
            <li key={clave}>
              <a
                href={`/exportar/${clave}`}
                className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-borde px-3 py-2 text-sm transition hover:border-azul-600 hover:text-azul-700"
              >
                <span>{EXPORTABLES[clave]}</span>
                <span className="text-xs text-suave">CSV ↓</span>
              </a>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Qué hay guardado">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi etiqueta="Productos" valor={String(inventario.productos)} />
          <Kpi etiqueta="Comercios" valor={String(inventario.clientes)} />
          <Kpi etiqueta="Pedidos" valor={String(inventario.pedidos)} />
          <Kpi etiqueta="Compras" valor={String(inventario.compras)} />
          <Kpi etiqueta="Gastos" valor={String(inventario.gastos)} />
          <Kpi etiqueta="Mov. de caja" valor={String(inventario.movimientosDeCaja)} />
          <Kpi etiqueta="Mov. de stock" valor={String(inventario.movimientosDeStock)} />
          <Kpi etiqueta="Renglones de compra" valor={String(inventario.renglonesDeCompra)} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Copia de seguridad automática">
        <Aviso
          tipo="ok"
          texto="La base vive en Turso, que guarda el historial de cambios y permite volver a un momento anterior. Esa es la copia automática; la exportación de acá arriba es para tener los datos afuera, en tu computadora."
        />
        <p className="mt-3 text-sm text-suave">
          Conviene bajar la copia cada tanto —fin de mes, por ejemplo— y guardarla donde no dependa de ninguna
          cuenta: si algún día se pierde el acceso al servicio, esos archivos siguen siendo tuyos y se abren con
          cualquier planilla.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Nada se borra sin dejar rastro">
        <ul className="space-y-2 text-sm text-suave">
          <li>
            <strong className="text-tinta">El stock</strong> solo se mueve por el libro del depósito: cada unidad
            que entra o sale deja su fila con el motivo y el saldo que quedó.
          </li>
          <li>
            <strong className="text-tinta">La caja</strong> igual: el saldo es la suma de los movimientos, no un
            número guardado que se pueda pisar.
          </li>
          <li>
            <strong className="text-tinta">Una compra confirmada</strong> no se borra: se anula con motivo, y eso
            devuelve la mercadería y deshace el costo promedio.
          </li>
          <li>
            <strong className="text-tinta">Un movimiento de caja</strong> que nació de un cobro, un pago o un gasto
            no se puede borrar a mano: se deshace desde donde se originó.
          </li>
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Quién hizo qué">
        {!conDeposito && (
          <p className="mb-3 text-xs text-suave">
            Hoy hay un solo usuario. Para que el depósito entre con su propia clave —y no vea costos ni márgenes—
            definí <code className="rounded bg-fondo px-1">DEPOSITO_PASSWORD</code> en las variables del servidor.
          </p>
        )}
        {anotaciones.length === 0 ? (
          <Vacio>Todavía no hay nada anotado.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Quién</Th>
                <Th>Qué hizo</Th>
              </tr>
            </thead>
            <tbody>
              {anotaciones.map((a) => (
                <tr key={a.id}>
                  <Td className="whitespace-nowrap text-suave">{formatearFecha(a.fecha)}</Td>
                  <Td className="whitespace-nowrap">{NOMBRE_ACTOR[a.actor] ?? a.actor}</Td>
                  <Td>
                    <span className="font-medium">{a.accion}</span>
                    {a.detalle && <span className="block text-xs text-suave">{a.detalle}</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      <p className="text-xs text-suave">
        ¿Buscabas los números? Están en{" "}
        <Link href={`/comercial/reportes?desde=${rango.desde}&hasta=${rango.hasta}`} className="text-azul-700">
          Reportes
        </Link>{" "}
        y en{" "}
        <Link href="/comercial/preguntas" className="text-azul-700">
          Preguntas
        </Link>
        .
      </p>
    </div>
  );
}
