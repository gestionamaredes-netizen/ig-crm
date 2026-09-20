# Tablero de prospectos — equipo comercial

**El tablero vive online, en el artifact:**
https://claude.ai/artifact/WXR38s8dDmhr6AQBurJ4zw

Se usa desde el celular sin instalar nada. 52 negocios de la zona de General San
Martín, con seguimiento compartido: lo que carga uno lo ven todos.

## Puesta en marcha (una sola vez)

1. **Compartirlo.** Abrir el link, menú **Share**, y dar acceso de edición a Nico,
   Juli, Fede, Martu y Lorena. Hasta que no se haga esto el link no le abre a nadie
   más que a Fabri.
2. **Cada uno lo agrega a la pantalla de inicio.** Queda con ícono propio y abre sin
   barra del navegador, como una app.
   - Android / Chrome: menú ⋮ → *Agregar a pantalla principal*
   - iPhone / Safari: botón compartir → *Añadir a pantalla de inicio*
3. **Elegir responsable por negocio.** Cada ficha tiene un selector: mientras diga
   "Sin asignar", nadie lo está trabajando.

## Cómo se usa

- El **embudo** de arriba cuenta por estado y además filtra: tocás "Contactado" y
  quedan solo esos.
- El **filtro por localidad** sirve para salir a la calle: elegís Villa Ballester y
  tenés la lista de esa zona nada más.
- Cada ficha abre con el contacto, qué contenido viene haciendo el negocio, de dónde
  salió el dato y qué falta conseguir.
- El bloque de **seguimiento** (estado, responsable, próxima acción, fecha, notas) se
  guarda solo y lo ve todo el equipo.
- **"Dónde están todos juntos"** es la sección más útil para prospectar: la cuadra de
  Lacroze 5000, el corredor de Lavalle, las ferias y los cuatro medios locales.
- El formulario del final agrega negocios nuevos desde el celular.

## Lo que hay que saber de los datos

- **Ningún teléfono ni mail está inventado.** Los mails de comercios chicos no son
  públicos: se consiguen en el mostrador o por mensaje directo.
- El chip de color de cada ficha dice cuánto está verificado: verde *datos ok*,
  amarillo *faltan datos*, rojo *solo el nombre*.
- Tres distribuidoras de bebidas figuran por dirección y sin nombre de fantasía,
  porque el directorio no lo da. Hay que pasar y preguntar.
- El teléfono de Pizzería Piccirillo salió de una publicación del propio negocio:
  confirmarlo antes de llamar.

## Si el tablero dice "Seguimiento local · sin conectar"

Significa que esa persona no tiene sesión iniciada o no tiene acceso de edición. La
lista se lee igual, pero lo que cargue queda solo en su teléfono. Se arregla
iniciando sesión y verificando que tenga acceso de edición en el menú Share.

## Regenerar el tablero

Los datos viven en `prospectos.py`. Para sumar negocios o cambiar textos:

```bash
python3 build-tablero.py <ruta-al-logo-base64>   # arma tablero-prospectos.html
```

y después se republica el archivo al mismo link del artifact, que conserva la URL y
todo el seguimiento cargado. **Ojo:** los negocios que el equipo agregó desde la
página viven en la base del artifact, no en `prospectos.py` — regenerar el HTML no
los borra.
