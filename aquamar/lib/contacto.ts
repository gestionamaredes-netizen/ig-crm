/**
 * Links para salir a contactar: los arma igual el tablero en el navegador y la
 * ficha en el servidor, así que viven acá y no en el componente cliente.
 */

/**
 * Link de WhatsApp a partir de un número escrito como lo escribe cualquiera:
 * "11 3290-7503", "+54 9 11...", "011 15-6605-8150". wa.me quiere solo dígitos
 * y con código de país, así que la normalización pasa una sola vez por acá.
 *
 * Devuelve null si lo cargado no alcanza para ser un número.
 */
export function linkWhatsapp(numero: string): string | null {
  let d = numero.replace(/\D/g, "");
  if (d.length < 8) return null;

  if (!d.startsWith("54")) {
    // El 0 de larga distancia y el 15 del celular no viajan en el formato
    // internacional: "011 15-6605-8150" es, afuera, 54 9 11 6605-8150.
    d = d.replace(/^0/, "").replace(/^(\d{2,4})15(?=\d{6,})/, "$1");
    d = `549${d}`;
  } else if (!d.startsWith("549")) {
    d = `549${d.slice(2)}`;
  }
  return `https://wa.me/${d}`;
}

/** Búsqueda en Google Maps por nombre y dirección: sirve para ir manejando. */
export function linkMapa(comercio: string, direccion: string, localidad: string): string {
  const donde = [direccion, localidad, "Buenos Aires"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${comercio}, ${donde}`)}`;
}
