"use client";

import { Boton } from "./ui";

/**
 * Imprimir es también "guardar como PDF": en el celular y en la computadora, el
 * propio navegador ofrece guardar en vez de mandar a una impresora. Por eso el
 * comprobante no se genera como archivo desde el servidor —sería otro motor de
 * PDF adentro del panel para hacer lo que el navegador ya hace bien—.
 */
export function BotonImprimir({ children }: { children: React.ReactNode }) {
  return (
    <Boton type="button" variante="secundario" onClick={() => window.print()}>
      {children}
    </Boton>
  );
}
