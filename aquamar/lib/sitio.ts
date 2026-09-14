/**
 * El mismo repositorio sirve dos sitios distintos, cada uno con su base de
 * datos: el panel completo, que maneja la administración, y este tablero de
 * prospección, que sale a la calle aparte.
 *
 * Con `SOLO_PROSPECCION=1` el sitio muestra únicamente la prospección: se va la
 * barra de secciones, el salto a Depósito, y toda puerta de entrada lleva
 * derecho al mapa. Sin la variable, la app es la de siempre y el panel completo
 * no se entera de que esto existe.
 *
 * Es una variable de entorno y no una rama aparte a propósito: dos ramas con el
 * mismo código se desincronizan en la tercera corrección que se hace en una y
 * se olvida en la otra.
 */
export const SOLO_PROSPECCION = process.env.SOLO_PROSPECCION === "1";
