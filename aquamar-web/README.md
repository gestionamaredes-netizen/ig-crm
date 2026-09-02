# Sitio web de Aqua Mar

Una página, sin build ni dependencias: HTML, CSS y un archivo de JavaScript.
Se abre haciendo doble clic en `index.html` y se publica arrastrando la carpeta.

## Lo primero: poné tus datos

Abrí **`js/datos.js`** y cambiá los valores. Es el único archivo que necesitás
tocar para que el sitio quede funcionando con lo tuyo:

El WhatsApp y el Instagram **ya están cargados** con los datos de tus piezas de
marca. Quedan dos por completar, marcados con ⚠️ en el archivo:

```js
window.AQUAMAR = {
  whatsapp: "5491158100225",              // ✅ el tuyo
  telefonoTexto: "+54 9 11 5810-0225",    // ✅
  email: "hola@aquamar.com.ar",           // ⚠️ poné tu casilla real
  instagram: "aqua.mar.distribuidora",    // ✅
  panel: "https://panel.aquamar.com.ar",  // ⚠️ la dirección real del sistema de gestión
  horario: "Lunes a viernes, 9 a 18 h",   // ⚠️ confirmá tu horario
};
```

Con eso se actualizan solos: los botones de WhatsApp, el formulario de contacto,
el mail, Instagram, el horario, el año del pie y los enlaces al panel.

**El número de WhatsApp** va con código de país y sin el 15. Para un celular de
Buenos Aires 11 5555-4444, se escribe `5491155554444`.

## Después: revisá los textos

Todo el texto está en `index.html`, en castellano y a la vista. Lo que tomé de
tus piezas de marca ya está puesto: "Distribuidora oficial Powerful", "Zona
Oeste · Envíos a toda Argentina" y "Calidad · Confianza · Compromiso".

Lo que conviene mirar antes de publicar, porque quedó genérico a propósito:

- **Pedido mínimo y formas de pago.** Están contestados sin números.
- **Presentaciones del producto.** Si vendés caja x 30, ponelo.
- **Qué más distribuís.** El sello dice "Limpieza · Hogar", así que el sitio
  habla de las dos cosas, pero el único producto detallado es Powerful 3 en 1.
  Si tenés más líneas, se suman como tarjetas en la sección "El producto".
- **La ortografía de Powerful.** Tu sello dice POWERFUL con una L; el sitio la
  sigue. Si va con doble L, es buscar y reemplazar.

No inventé precios ni direcciones: donde hacía falta un dato tuyo, quedó un
texto neutro o un valor marcado con ⚠️ en `js/datos.js`.

## Publicarlo en Netlify

**La forma rápida:** entrá a [app.netlify.com/drop](https://app.netlify.com/drop)
y arrastrá esta carpeta. En unos segundos tenés el sitio en línea.

**Desde el repositorio:** conectá el repo, poné esta carpeta como directorio base
y dejá el comando de build vacío. El `netlify.toml` ya trae la configuración.

Después, en el panel de Netlify podés conectar tu dominio propio.

## Qué hay en cada archivo

```
index.html          La página entera. Acá están todos los textos.
css/estilos.css     Estilos. Los colores están arriba de todo, como variables.
js/datos.js         TUS DATOS. Es lo único que hay que editar para arrancar.
js/main.js          Arma los enlaces de WhatsApp, abre el menú y manda el formulario.
img/                Logotipo, sello, favicon, ícono de iOS e imagen para compartir.
netlify.toml        Configuración de publicación.
robots.txt          Permite que Google indexe el sitio.
MARCA.md            Cómo se usan el logo, los colores y la tipografía.
```

## Cómo funciona el formulario

No hay servidor ni base de datos. Cuando alguien completa el formulario, se abre
su WhatsApp con el mensaje ya escrito y los datos ordenados. Vos lo recibís como
un mensaje normal.

La ventaja es que no hay nada que mantener y no se pierde ninguna consulta en un
buzón que nadie mira. Si más adelante querés que las consultas queden guardadas,
Netlify tiene formularios propios y se puede cambiar sin rehacer el sitio.

## Detalles que ya están resueltos

- **Celular primero.** Probado a 320, 360, 390, 768, 1280 y 1440 px: sin scroll
  horizontal en ningún ancho y con todo lo que se toca a 44px o más.
- **Sin zoom molesto en iPhone.** Los campos van a 16px, que es lo que evita que
  Safari haga zoom solo al tocarlos.
- **Se comparte bien.** Al pegar el link en WhatsApp o Instagram sale la imagen
  de `img/og.jpg` con el nombre y la bajada.
- **Accesible.** Navegable con teclado, con enlace para saltar al contenido,
  textos alternativos y respeto por "reducir movimiento".
- **Liviano.** No carga tipografías externas, ni librerías, ni rastreadores.

## Sobre el logo y los colores

El logotipo y el sello salieron de las imágenes que pasaste, recortados con
fondo transparente. Los colores del sitio se muestrearon píxel por píxel de esos
mismos archivos: el azul de "AQUA", el celeste de "MAR" y el dorado del sol.

Si tenés los originales en vectores (SVG, AI o PDF), pasámelos y los cambio: van
a verse más nítidos en pantallas grandes y sirven para imprenta. Los detalles de
uso y la paleta completa están en `MARCA.md`.
