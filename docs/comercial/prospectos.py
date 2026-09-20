# -*- coding: utf-8 -*-
"""Prospectos de sponsoreo — zona General San Martin, PBA.

Solo entran datos que salieron de una busqueda real, con su fuente. Ningun
telefono ni mail inventado: los campos que no se pudieron verificar quedan
vacios y el tablero los marca como pendientes para que el equipo comercial
los complete en la calle.

  ver:  "ok"        el dato salio de una fuente y esta en `fuente`
        "parcial"   hay nombre y algun dato, falta el resto
        "nombre"    solo se confirmo que el negocio existe
"""

LOCALIDADES = ["Villa Ballester", "San Martín", "San Andrés", "Villa Lynch",
               "José León Suárez", "Billinghurst", "Villa Maipú", "Sáenz Peña"]

RUBROS = ["Panadería", "Heladería", "Cervecería", "Parrilla", "Pizzería",
          "Café", "Gimnasio", "Indumentaria", "Medio local", "Rotisería",
          "Distribuidora", "Food truck", "Estética", "Servicios"]

EQUIPO = ["Sin asignar", "Fabri", "Martu", "Juli", "Nico", "Fede", "Lorena"]

ESTADOS = [
    ("nuevo",      "Sin contactar", "#7A8698"),
    ("contactado", "Contactado",    "#4DA3FF"),
    ("reunion",    "Reunión",       "#C7A45E"),
    ("propuesta",  "Propuesta",     "#2FC4E8"),
    ("cerrado",    "Cerrado",       "#50D000"),
    ("descartado", "Descartado",    "#FF3F4D"),
]

# fuentes consultadas (busqueda web, septiembre 2026)
F_IG   = "Búsqueda web · perfil de Instagram"
F_FB   = "Búsqueda web · página de Facebook"
F_DIR  = "Búsqueda web · directorio local"

P = []
def add(nombre, rubro, loc, **k):
    d = dict(nombre=nombre, rubro=rubro, localidad=loc, instagram="", facebook="",
             web="", direccion="", telefono="", mail="", seguidores="",
             contenido="", fuente="", ver="nombre", prioridad="media")
    d.update(k)
    P.append(d)

# ---- cervecerias, bares y restaurantes -------------------------------------
add("Berlina Ballester", "Cervecería", "Villa Ballester",
    instagram="berlinaballester", direccion="Lacroze 5031, Villa Ballester",
    seguidores="~20.000", ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Cervecería, bar y resto. Abre todos los días desde las 18 h. "
              "Cuenta activa y con volumen de seguidores alto para la zona: es de las "
              "marcas locales con mejor producción de contenido.")
add("Cerveza Zombiecat", "Cervecería", "Villa Ballester",
    instagram="cerveza.zombiecat", seguidores="~18.000", ver="ok", fuente=F_IG,
    prioridad="alta",
    contenido="Brewpub que hace su propia cerveza. Dom a jue de 18 a 00, vie y sáb "
              "hasta la 1. Marca con identidad propia y producto que se muestra bien "
              "en cámara: encaja con el live set.")
add("Cervelar Villa Ballester", "Cervecería", "Villa Ballester",
    instagram="cervelarvillaballester", ver="parcial", fuente=F_IG, prioridad="alta")
add("El Patio de la Cerveza — Irish Pub", "Cervecería", "Villa Ballester",
    facebook="elpatiodelacervezairishpub", ver="parcial", fuente=F_FB)
add("Varvarco Ballester", "Cervecería", "Villa Ballester",
    facebook="varvarcoballester", ver="parcial", fuente=F_FB)

# ---- parrillas, pizzerias y restaurantes -----------------------------------
add("La Dionisia", "Parrilla", "Villa Ballester",
    instagram="ladionisia__", direccion="Lacroze 5074, Villa Ballester",
    ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Parrilla, restaurante y cafetería. Está a media cuadra de Berlina: "
              "la misma recorrida sirve para las dos.")
add("Parrilla Lago di Garda", "Parrilla", "Villa Ballester",
    instagram="parrillalagodigarda", ver="parcial", fuente=F_IG,
    contenido="Bar y parrilla con delivery y take away.")
add("La Estancia Ballester", "Parrilla", "Villa Ballester",
    facebook="laestanciaballesterok", ver="parcial", fuente=F_FB)
add("Pizzería Piccirillo", "Pizzería", "Villa Ballester",
    facebook="pizzeriapiccirillo", telefono="4768-1333", ver="parcial", fuente=F_FB,
    contenido="Reparte en Villa Ballester, San Andrés, Chilavert y San Martín. "
              "El teléfono salió de su propia publicación: confirmarlo antes de llamar.")

# ---- panaderias y pastelerias ----------------------------------------------
add("Las Delicias Ballester", "Panadería", "Villa Ballester",
    instagram="lasdelicias.ballester", ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Panadería y confitería con envío a domicilio sin cargo. Tiene cuenta "
              "propia y publica producto: el rubro más fácil de mostrar al aire.")
add("Panadería El Molino", "Panadería", "Villa Ballester",
    facebook="PanaderiaElMolino", ver="parcial", fuente=F_FB,
    contenido="Panadería, confitería y cafetería.")
add("Panadería 25 de Mayo", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Abierta las 24 horas.")
add("Catuli Pastelería", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Tortas de cumpleaños.")
add("La Nueva Panecillos", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Facturas y tortas.")
add("Panadería Don Luis", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Pan artesanal.")
add("La Pana de Rodríguez", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Chipas.")
add("Tutto e Pane", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR)
add("Panadería San Francisco", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Facturas y medialunas.")
add("Tartas Artesanales Silvia", "Panadería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Tartas caseras.")

# ---- heladerias -------------------------------------------------------------
add("Heladerías Chinin", "Heladería", "San Martín",
    facebook="chininhelados", ver="parcial", fuente=F_FB, prioridad="alta",
    contenido="Helado artesanal y café, con sucursales en San Martín y Villa Ballester. "
              "Toma pedidos online y por WhatsApp. Al tener más de un local, da para "
              "una acción de temporada y no una mención suelta.")
add("Heladería CR Villa Ballester", "Heladería", "Villa Ballester",
    direccion="Pacífico Rodríguez 4749, Villa Ballester", ver="parcial", fuente=F_DIR,
    contenido="Heladería artesanal.")
add("Heladería San Martín", "Heladería", "San Martín",
    instagram="san_martin_gelato_artesanal", ver="parcial", fuente=F_IG,
    contenido="Gelato artesanal.")

# ---- gimnasios ---------------------------------------------------------------
add("Muscle Factory", "Gimnasio", "Villa Ballester",
    instagram="gimnasio.musclefactory", direccion="Lacroze 5068, Villa Ballester",
    ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Gimnasio sobre Lacroze, en la misma cuadra que Berlina y La Dionisia. "
              "Rubro con contenido propio constante y público fiel.")
add("ObeliX Cross Training", "Gimnasio", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Entrenamiento funcional / cross training.")

# ---- cafe --------------------------------------------------------------------
add("Café Martínez San Martín", "Café", "San Martín",
    instagram="cafemartinezsanmartin", direccion="Bonifacini 2098, San Martín",
    ver="ok", fuente=F_IG,
    contenido="Sucursal de cadena: la decisión de sponsoreo puede depender de la "
              "franquicia y no del local. Confirmar quién decide antes de invertir "
              "tiempo comercial.")

# ---- medios y cuentas de nicho de la zona ------------------------------------
add("Ballester Gastronomía", "Medio local", "Villa Ballester",
    instagram="ballestergastronomia", seguidores="~12.000", ver="ok", fuente=F_IG,
    prioridad="alta",
    contenido="Cuenta de gastronomía de Ballester y todo San Martín. No es un sponsor "
              "clásico: es un socio de difusión. Conviene tratarla como partner de "
              "medios y no venderle un paquete.")

# ---- indumentaria ------------------------------------------------------------
add("La Tienda San Martín", "Indumentaria", "San Martín",
    facebook="LaTiendaSanMartin", ver="parcial", fuente=F_FB)

# la cantera: donde hay que salir a buscar para llegar a 50 y pasar de largo
CANTERA = [
    ("Rotisería", "Ninguna cargada todavía", 5),
    ("Distribuidora de bebidas", "Ninguna cargada todavía", 4),
    ("Food truck", "Ninguno cargado todavía", 3),
    ("Estética y bienestar", "Ninguna cargada todavía", 4),
    ("Servicios y oficios", "Ninguno cargado todavía", 5),
    ("Indumentaria", "1 cargada", 4),
    ("José León Suárez", "Sin cobertura", 5),
    ("Villa Lynch", "Sin cobertura", 4),
    ("Billinghurst", "Sin cobertura", 3),
    ("Villa Maipú y Sáenz Peña", "Sin cobertura", 4),
]
