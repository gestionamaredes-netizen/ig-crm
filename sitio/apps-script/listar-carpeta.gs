/**
 * Lista los archivos de una carpeta de Drive y los devuelve como JSON.
 *
 * Sirve como reemplazo de la API de Google Cloud: Apps Script es gratis,
 * no pide tarjeta, y corre con los permisos de quien lo implementa, así
 * que ve la carpeta completa.
 *
 * Cómo publicarlo:
 *   1. script.google.com → Proyecto nuevo
 *   2. Pegar este código, reemplazando lo que haya
 *   3. Implementar → Nueva implementación → tipo "Aplicación web"
 *        Ejecutar como:      Yo
 *        Quién tiene acceso: Cualquier persona
 *   4. Autorizar cuando lo pida (es el permiso de leer tu Drive)
 *   5. Copiar la URL que termina en /exec y pasársela a la página
 */

/** Carpetas que la página tiene permitido pedir. Sin esta lista,
 *  cualquiera con la URL podría listar cualquier carpeta tuya. */
var PERMITIDAS = [
  "1OqBDl-xHmwEvhaXvb7c6TOc3HKPtauiu",   // Viernes 14
  "1c6aX-X54jDPtFl1MeJzQMuGX_GAMnEu3",   // Sábado 15 · celular
  "1VWfvHxCdQMEGxyDxN1aK8zni_81EsEG5",   // Sábado 15 · fotógrafo
  "1VmfmxumH-qG_-IQOmy5efbdK9HSVmFuB"    // Sábado 15 · FOTOS
];

function doGet(e) {
  var pedida = (e && e.parameter && e.parameter.carpeta) || "";
  var salida = { archivos: [] };

  if (PERMITIDAS.indexOf(pedida) === -1) {
    salida.error = "carpeta no habilitada";
    return responder(salida);
  }

  try {
    var archivos = DriveApp.getFolderById(pedida).getFiles();
    while (archivos.hasNext()) {
      var f = archivos.next();
      var tipo = f.getMimeType();
      if (tipo.indexOf("image/") !== 0 && tipo.indexOf("video/") !== 0) continue;
      salida.archivos.push({
        id:       f.getId(),
        name:     f.getName(),
        mimeType: tipo,
        size:     String(f.getSize())
      });
    }
    salida.archivos.sort(function(a, b){ return a.name.localeCompare(b.name); });
  } catch (err) {
    salida.error = String(err);
  }

  return responder(salida);
}

function responder(datos) {
  return ContentService
    .createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}
