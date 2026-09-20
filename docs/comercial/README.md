# Tablero de prospectos — equipo comercial

**El tablero vive online, en el artifact:**
https://claude.ai/artifact/WXR38s8dDmhr6AQBurJ4zw

Se usa desde el celular sin instalar nada. 52 negocios de la zona de General San
Martín, con seguimiento compartido: lo que carga uno lo ven todos.

## Quién tiene acceso

Benja, Juli, Fede y Nico. Son los cuatro que aparecen en el selector de responsable
y los únicos que pueden firmar una edición.

## Puesta en marcha (una sola vez)

1. **Compartirlo con acceso de edición.** Abrir el link, menú **Share**, invitar a
   Juli, Fede y Nico **uno por uno, con permiso de edición**.

   > **No usar el link público.** Un visitante por link abierto entra en modo lectura
   > y la base compartida no lo deja escribir: vería la lista pero no podría cargar
   > seguimiento, que es justamente para lo que sirve el tablero.
2. **Cada uno lo agrega a la pantalla de inicio.** Queda con ícono propio y abre sin
   barra del navegador, como una app.
   - Android / Chrome: menú ⋮ → *Agregar a pantalla principal*
   - iPhone / Safari: botón compartir → *Añadir a pantalla de inicio*
3. **Cada uno elige su nombre la primera vez.** Arriba de todo hay una barra que
   pregunta *¿Quién sos?*. Hasta que no se elija un nombre, el tablero no deja editar
   nada. Queda guardado en ese teléfono: se elige una sola vez.
4. **Elegir responsable por negocio.** Cada ficha tiene un selector: mientras diga
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
- **Cada cambio queda firmado.** En la ficha aparece un chip azul con quién tocó por
  última vez y cuándo, y abajo del seguimiento el botón **Ver historial** muestra los
  últimos seis cambios: quién cambió qué y a qué hora. Sirve para no pisarse cuando
  dos salen a la misma zona.
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

## Si algo no anda

**"Seguimiento local · sin conectar"** — esa persona no tiene sesión iniciada o entró
por link público en vez de invitación con edición. La lista se lee igual, pero lo que
cargue queda solo en su teléfono. Se arregla invitándola con acceso de edición desde
el menú Share.

**"Elegí tu nombre arriba para poder editar"** — no eligió su nombre en la barra de
arriba. Es a propósito: sin nombre no se puede firmar quién hizo el cambio.

**Aparece el nombre de otro en la barra** — es un teléfono compartido o alguien lo
dejó puesto. Se toca **No soy yo** y se elige de nuevo.

## Regenerar el tablero

Los datos viven en `prospectos.py`. Para sumar negocios o cambiar textos:

```bash
python3 build-tablero.py <ruta-al-logo-base64>   # arma tablero-prospectos.html
```

y después se republica el archivo al mismo link del artifact, que conserva la URL y
todo el seguimiento cargado. **Ojo:** los negocios que el equipo agregó desde la
página viven en la base del artifact, no en `prospectos.py` — regenerar el HTML no
los borra.
