"use client";

import { Boton } from "./ui";

/**
 * Borrar no se deshace, así que primero pregunta. Va del lado del navegador
 * porque el aviso tiene que aparecer antes de que el formulario salga: una vez
 * que llegó al servidor ya no hay dónde arrepentirse.
 */
export function BotonBorrar({
  pregunta,
  children,
  className = "",
}: {
  pregunta: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Boton
      type="submit"
      variante="peligro"
      className={className}
      onClick={(e) => {
        if (!window.confirm(pregunta)) e.preventDefault();
      }}
    >
      {children}
    </Boton>
  );
}
