/* Aqua Mar — el sitio es estático; esto solo arma enlaces y abre el menú. */
(function () {
  "use strict";

  var datos = window.AQUAMAR || {};

  function texto(selector, valor) {
    if (!valor) return;
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = valor;
    });
  }

  /* --- Enlaces de WhatsApp -------------------------------------------- */

  function enlaceWhatsapp(mensaje) {
    var numero = String(datos.whatsapp || "").replace(/\D/g, "");
    var texto = encodeURIComponent(mensaje || "Hola, quiero información sobre Powerfull 3 en 1.");
    return "https://wa.me/" + numero + "?text=" + texto;
  }

  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    el.href = enlaceWhatsapp(el.getAttribute("data-mensaje"));
    el.target = "_blank";
    el.rel = "noreferrer";
  });

  /* --- Resto de los datos de contacto --------------------------------- */

  texto("[data-telefono-texto]", datos.telefonoTexto);
  texto("[data-email-texto]", datos.email);
  texto("[data-horario]", datos.horario);
  texto("[data-anio]", String(new Date().getFullYear()));

  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (datos.email) {
      el.href = "mailto:" + datos.email;
      return;
    }
    var fila = el.closest("li");
    if (fila) fila.remove();
  });

  // Mientras el panel no esté publicado, estos botones no pueden llevar a
  // ningún lado: mandan a pedir el link por WhatsApp, que es lo que hoy
  // resuelve la consulta. Sin esto el cliente cae en un error del navegador.
  document.querySelectorAll("[data-panel]").forEach(function (el) {
    if (datos.panel) {
      el.href = datos.panel;
      return;
    }
    el.href = enlaceWhatsapp("Hola, ¿me pasás el link de mi panel de Aqua Mar?");
    el.target = "_blank";
    el.rel = "noreferrer";
    var alterno = el.getAttribute("data-sin-panel");
    if (alterno) el.textContent = alterno;
  });

  // Sin usuario de Instagram, el renglón se saca en vez de quedar muerto.
  document.querySelectorAll("[data-instagram]").forEach(function (el) {
    if (!datos.instagram) {
      var fila = el.closest("li");
      if (fila) fila.remove();
      return;
    }
    el.href = "https://instagram.com/" + datos.instagram;
    texto("[data-instagram-texto]", "@" + datos.instagram);
  });

  /* --- Menú del celular ------------------------------------------------ */

  var boton = document.querySelector(".hamburguesa");
  var menu = document.getElementById("menu");

  if (boton && menu) {
    boton.addEventListener("click", function () {
      var abierto = menu.getAttribute("data-abierto") === "true";
      menu.setAttribute("data-abierto", String(!abierto));
      boton.setAttribute("aria-expanded", String(!abierto));
      boton.setAttribute("aria-label", abierto ? "Abrir el menú" : "Cerrar el menú");
    });

    // Al tocar una opción el menú se cierra: si no, tapa la sección que abriste.
    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) {
        menu.setAttribute("data-abierto", "false");
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-label", "Abrir el menú");
      }
    });
  }

  /* --- Formulario: arma el mensaje y abre WhatsApp --------------------- */

  var formulario = document.getElementById("formulario");

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      if (!formulario.reportValidity()) return;

      var campos = new FormData(formulario);
      var partes = [
        "Hola, quiero pedir la lista de precios de Powerfull 3 en 1.",
        "",
        "Comercio: " + (campos.get("comercio") || "").trim(),
        "Nombre: " + (campos.get("persona") || "").trim(),
        "Zona: " + (campos.get("zona") || "").trim(),
      ];

      var mensaje = (campos.get("mensaje") || "").trim();
      if (mensaje) partes.push("", mensaje);

      window.open(enlaceWhatsapp(partes.join("\n")), "_blank", "noopener");
    });
  }
})();
