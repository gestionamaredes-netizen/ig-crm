import { requerirSesion } from "@/lib/auth";
import {
  CANTERA, CAZADEROS, ESTADOS, ESTUDIO, EQUIPO, PROSPECTOS,
} from "@/lib/datos";
import { LOCALIDADES_LIBRES, RUBROS_LIBRES } from "@/lib/listas";
import { leerAgregados, leerTodo } from "@/lib/seguimiento";
import Tablero from "@/components/Tablero";

// Los datos del equipo cambian a cada rato: nunca se sirve una copia guardada.
export const dynamic = "force-dynamic";

export default async function Pagina() {
  const yo = await requerirSesion();
  const [seguimiento, agregados] = await Promise.all([leerTodo(), leerAgregados()]);

  const rubros = Array.from(
    new Set([...RUBROS_LIBRES, ...agregados.map((a) => a.rubro)]),
  ).filter(Boolean).sort();
  const localidades = Array.from(
    new Set([...LOCALIDADES_LIBRES, ...agregados.map((a) => a.localidad)]),
  ).filter(Boolean).sort();

  return (
    <Tablero
      yo={yo}
      prospectos={[...PROSPECTOS, ...agregados]}
      seguimiento={seguimiento}
      estados={[...ESTADOS]}
      equipo={[...EQUIPO]}
      rubros={rubros}
      localidades={localidades}
      cantera={[...CANTERA]}
      cazaderos={[...CAZADEROS]}
      estudio={ESTUDIO}
    />
  );
}
