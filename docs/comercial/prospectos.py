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

# ---- rotiserias y comidas ----------------------------------------------------
add("Delicias Caseras", "Rotisería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    prioridad="alta",
    contenido="Aparece primera en los directorios de rotisería y comidas para llevar de "
              "Ballester. Rubro sin nadie cargado todavía: conviene abrirlo con la más fuerte.")
add("Parrilla y Rotisería Alvear", "Rotisería", "Villa Ballester", ver="nombre", fuente=F_DIR)
add("Como Reyes Delivery", "Rotisería", "Villa Ballester", ver="nombre", fuente=F_DIR)
add("Bouquet Garni Recetas", "Rotisería", "Villa Ballester", ver="nombre", fuente=F_DIR,
    contenido="Viandas y comidas preparadas.")

# ---- distribuidoras de bebidas ----------------------------------------------
# el directorio las lista por direccion y no por nombre: se camina y se pregunta
add("Distribuidora de bebidas — Savio 2750", "Distribuidora", "San Martín",
    direccion="Savio 2750, San Martín", ver="nombre", fuente=F_DIR, prioridad="alta",
    contenido="El directorio la lista por dirección, sin nombre de fantasía. Hay que pasar "
              "y preguntar cómo se llama y quién decide.")
add("Distribuidora de bebidas — Balbín 2822", "Distribuidora", "Billinghurst",
    direccion="Av. Dr. Ricardo Balbín 2822, Billinghurst", ver="nombre", fuente=F_DIR,
    contenido="Misma situación: dirección sin nombre. Primera entrada a Billinghurst.")
add("Distribuidora mayorista — Gral. Hornos 836", "Distribuidora", "Villa Lynch",
    direccion="Gral. Hornos 836, Villa Lynch", ver="nombre", fuente=F_DIR,
    contenido="Mayorista: vende por pallet y pack cerrado —aguas, cervezas, gaseosas—. "
              "Por volumen es la que mejor puede bancar un canje grande.")

# ---- estetica, barberias y peluquerias ---------------------------------------
add("Fuego", "Estética", "Villa Ballester",
    direccion="Boulevard Ballester, Villa Ballester", ver="parcial",
    fuente="Nota de Infobae", prioridad="alta",
    contenido="Centro de estética atendido por mujeres trans, con cobertura en medios "
              "nacionales. Peluquería, barbería y uñas. Tiene una historia propia fuerte: "
              "encaja mejor como invitada de un programa que como PNT.")
add("Barbería San Martín", "Estética", "San Martín",
    instagram="barberiasanmartin", seguidores="~585", ver="ok", fuente=F_IG,
    contenido="Barbería clásica mezclada con estilos actuales. Cuenta chica pero activa.")
add("Barber San Andrés", "Estética", "San Andrés", ver="nombre", fuente=F_DIR,
    contenido="Corte y barba. Primera entrada a San Andrés.")
add("Gringo Barbería", "Estética", "Villa Ballester", ver="nombre", fuente=F_DIR)
add("Franco Peluquería", "Estética", "Villa Ballester", ver="nombre", fuente=F_DIR)
add("We Love Hair", "Estética", "Villa Ballester", ver="nombre", fuente=F_DIR)

# ---- veterinarias y mascotas --------------------------------------------------
add("Centro Médico Vet Suárez", "Servicios", "José León Suárez",
    instagram="cmvetesuarez", direccion="Independencia 7181, José León Suárez",
    ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Clínica, cirugía, radiología, especialistas, farmacia, pet shop y peluquería "
              "canina. Servicio completo y con cuenta propia: primera entrada a José León "
              "Suárez y rubro con público muy fiel.")
add("Clínica Veterinaria San Martín", "Servicios", "San Martín",
    instagram="clinicaveterinariasanmartin", ver="parcial", fuente=F_IG)
add("Hospital Veterinario San Martín", "Servicios", "San Martín",
    instagram="clinicaveterinaria_sanmartin", ver="parcial", fuente=F_IG)
add("EVN Veterinarias", "Servicios", "José León Suárez",
    facebook="evn.veterinarias", direccion="Diagonal José León Suárez 7143",
    ver="parcial", fuente=F_FB)
add("Pet Shop y Veterinaria Natural Life", "Servicios", "Villa Ballester",
    ver="nombre", fuente=F_DIR,
    contenido="Pet shop grande y veterinaria en una esquina visible de Ballester.")

# ---- automotriz ----------------------------------------------------------------
add("Lubricentro San Martín", "Servicios", "San Martín",
    instagram="lubrimosconi", facebook="Lubrisanmartin",
    direccion="Av. Mosconi 2949", ver="parcial", fuente=F_IG,
    contenido="Lubricentro y taller mecánico. Confirmar que la dirección de Mosconi sea la "
              "de San Martín y no la homónima de Capital antes de salir.")
add("GP Lubricentro", "Servicios", "San Martín",
    facebook="GPSERVICEINTEGRAL", ver="parcial", fuente=F_FB)

# ---- almacen y carniceria --------------------------------------------------------
add("Tienda de Sabores Villa Ballester", "Servicios", "Villa Ballester",
    instagram="tienda_desaboresballester", ver="ok", fuente=F_IG, prioridad="alta",
    contenido="Carnicería y almacén que ya publica contenido propio de producto, con piezas "
              "apuntadas a la parrilla. Es el perfil exacto que la propuesta describe: hace "
              "contenido y le falta nivel.")

# ---- medios locales: socios de difusion, no sponsors clasicos --------------------
add("Que Pasa Web", "Medio local", "San Martín",
    web="https://www.quepasaweb.com.ar", ver="parcial", fuente="Sitio propio",
    prioridad="alta",
    contenido="Portal de noticias de San Martín, con secciones por localidad. Cubre ferias, "
              "polos gastronómicos y comercios: sirve para canje de difusión y como fuente "
              "para encontrar negocios nuevos todas las semanas.")
add("Reflejos de la Ciudad", "Medio local", "San Martín",
    web="https://www.reflejosdelaciudad.com.ar", ver="parcial", fuente="Sitio propio")
add("SN Online — Servicio de Noticias", "Medio local", "San Martín",
    web="https://www.snonline.com.ar/san-martin", ver="parcial", fuente="Sitio propio")
add("SM Noticias", "Medio local", "San Martín",
    web="https://www.smnoticias.com/distrito/sanmartin", ver="parcial", fuente="Sitio propio")

# la cantera: donde hay que salir a buscar para llegar a 50 y pasar de largo
CANTERA = [
    ("Rotisería", "4 cargadas, sin datos de contacto", 4),
    ("Distribuidora de bebidas", "3 cargadas, todas sin nombre", 4),
    ("Food truck", "Ninguno cargado: salen de las ferias", 4),
    ("Indumentaria", "1 cargada", 5),
    ("San Andrés", "1 negocio cargado", 5),
    ("Villa Lynch", "1 negocio cargado", 4),
    ("Billinghurst", "1 negocio cargado", 4),
    ("Villa Maipú y Sáenz Peña", "Sin cobertura", 5),
]

# donde estan todos juntos: sale mas barato caminar esto que buscar de a uno
CAZADEROS = [
    ("La cuadra de Lacroze 5000",
     "Berlina (5031), La Dionisia (5074) y Muscle Factory (5068) están a metros. "
     "Tres prospectos de prioridad alta en cincuenta metros, y alrededor está el "
     "corredor gastronómico entero.",
     "Villa Ballester · cualquier día"),
    ("Lavalle entre Lacroze y Boulevard",
     "Es la zona de mayor movimiento comercial de Ballester, pegada a la estación. "
     "Una recorrida de dos cuadras da para una tarde de prospección.",
     "Villa Ballester · horario comercial"),
    ("Polo Gastronómico de Lacroze",
     "Evento al aire libre con food trucks, feria de artesanos, música y pintura en "
     "vivo, armado alrededor de los emprendedores de la zona. Es donde están juntos "
     "todos los food trucks que no aparecen en ningún directorio.",
     "Villa Ballester · por edición"),
    ("Feria Sabores de Ballester",
     "Ituzaingó y Capdevilla. Gastronomía argentina y de Brasil, Haití, España y "
     "México, con shows en vivo y artesanos. Puestos chicos, decisión rápida.",
     "Villa Ballester · fin de semana"),
    ("Expoclásicos Ballester",
     "Autos clásicos, gastronomía y food trucks en el Liceo Militar General San "
     "Martín, San Lorenzo 3800. Evento solidario y con público familiar.",
     "Villa Ballester · abril"),
    ("Los medios locales, todas las semanas",
     "Que Pasa Web, Reflejos de la Ciudad, SN Online y SM Noticias publican cada "
     "apertura, feria y movida comercial del partido. Es la fuente que se renueva "
     "sola: el negocio que sale en la nota hoy está buscando visibilidad hoy.",
     "Todo el partido · semanal"),
]
