import Image from "next/image";
import { PERSONAS } from "@/lib/datos";
import { entrar } from "./actions";

const MENSAJES: Record<string, string> = {
  clave: "Esa clave no es la del equipo.",
  nombre: "Elegí tu nombre de la lista.",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login">
      <Image src="/marca/nexo.png" alt="Nexo Studios" width={260} height={115} priority />
      <h1>Prospectos</h1>
      <p className="sub">General San Martín · Equipo comercial</p>

      {error && <p className="err">{MENSAJES[error] ?? "No pudimos entrar."}</p>}

      <form action={entrar}>
        <label>
          <span className="lab">¿Quién sos?</span>
          <select name="nombre" defaultValue="" required>
            <option value="" disabled>
              Elegí tu nombre…
            </option>
            {PERSONAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="lab">Clave del equipo</span>
          <input name="clave" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">
          Entrar
        </button>
      </form>

      <p className="pie">
        Tu nombre queda firmado en cada cambio que hagas. Si es un teléfono
        compartido, cerrá sesión al terminar.
      </p>
    </main>
  );
}
