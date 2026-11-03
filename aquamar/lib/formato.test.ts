import { describe, it, expect } from "vitest";
import {
  centavosAInput,
  desdeBultos,
  enBultos,
  formatearFecha,
  hoy,
  inicioDeMes,
  inicioDeSemana,
  parsearEntero,
  resolverPeriodo,
  parsearMonto,
  porcentajesQueSuman,
  precioPorUnidad,
  textoBultos,
} from "./formato";

describe("parsearMonto", () => {
  it("lee formato argentino con miles y decimales", () => {
    expect(parsearMonto("1.234,50")).toBe(123450);
    expect(parsearMonto("$ 1.234,50")).toBe(123450);
    expect(parsearMonto("12.500")).toBe(1250000);
  });

  it("lee números simples", () => {
    expect(parsearMonto("1500")).toBe(150000);
    expect(parsearMonto("1500,5")).toBe(150050);
    expect(parsearMonto("0,99")).toBe(99);
  });

  it("acepta el punto como decimal cuando no puede ser miles", () => {
    expect(parsearMonto("12.5")).toBe(1250);
    expect(parsearMonto("12.50")).toBe(1250);
  });

  it("rechaza basura en vez de inventar un número", () => {
    expect(parsearMonto("")).toBeNull();
    expect(parsearMonto("abc")).toBeNull();
    expect(parsearMonto("1,2,3")).toBeNull();
    expect(parsearMonto("1.2345")).toBeNull();
  });
});

describe("parsearEntero", () => {
  it("lee cantidades", () => {
    expect(parsearEntero("12")).toBe(12);
    expect(parsearEntero("1.200")).toBe(1200);
    expect(parsearEntero("x")).toBeNull();
    expect(parsearEntero("")).toBeNull();
  });
});

describe("formato de salida", () => {
  it("da vuelta la fecha ISO", () => {
    expect(formatearFecha("2026-09-01")).toBe("01/09/2026");
  });

  it("convierte centavos a texto de input", () => {
    expect(centavosAInput(123450)).toBe("1234,50");
  });
});

describe("bultos", () => {
  it("parte las unidades en bultos y sueltas", () => {
    expect(textoBultos(480, 12)).toBe("40 bultos");
    expect(textoBultos(485, 12)).toBe("40 bultos + 5");
    expect(textoBultos(7, 12)).toBe("7 sueltas");
    // Un producto sin stock dice "0", no "0 sueltas": eso se lee como ruido.
    expect(textoBultos(0, 12)).toBe("0");
  });

  it("convierte bultos a unidades", () => {
    expect(desdeBultos(40, 12)).toBe(480);
    expect(desdeBultos(3, 20)).toBe(60);
  });

  /*
   * Un producto que se vende suelto tiene 1 unidad por bulto. Sin este caso, la
   * cuenta diría "480 bultos + 0" para algo que no viene en bultos, y peor: con
   * cero quedaría dividiendo por cero.
   */
  it("no inventa bultos cuando el producto se vende suelto", () => {
    expect(textoBultos(480, 1)).toBe("480");
    expect(textoBultos(480, 0)).toBe("480");
    expect(desdeBultos(5, 0)).toBe(5);
    expect(enBultos(480, 1)).toEqual({ bultos: 480, sueltas: 0 });
    expect(precioPorUnidad(750000, 1)).toBe(750000);
    expect(precioPorUnidad(750000, 0)).toBe(750000);
  });

  it("baja el precio del bulto al precio de una unidad", () => {
    // Un bulto de doce a $9.000 son $750 el envase.
    expect(precioPorUnidad(900000, 12)).toBe(75000);
    expect(precioPorUnidad(1500000, 20)).toBe(75000);
  });

  /*
   * Un precio de bulto que no divide exacto no puede quedar en un decimal: el
   * pedido guarda centavos enteros. Se redondea y el formulario muestra el
   * precio unitario que resulta, así el total que se ve es el que se guarda.
   */
  it("redondea el precio unitario cuando el bulto no divide exacto", () => {
    expect(precioPorUnidad(100000, 12)).toBe(8333);
    expect(precioPorUnidad(100007, 12)).toBe(8334);
  });

  /*
   * La cuenta que le importa a quien vende: cotizó diez bultos a $9.000 y el
   * pedido, que por dentro está en unidades, tiene que dar los mismos $90.000.
   * Si la conversión de cantidad y la de precio se desincronizaran, el total
   * cambiaría solo y nadie sabría por qué.
   */
  it("un pedido cargado por bulto vale lo que se cotizó", () => {
    const unidades = desdeBultos(10, 12);
    const precio = precioPorUnidad(900000, 12);
    expect(unidades).toBe(120);
    expect(unidades * precio).toBe(10 * 900000);
  });
});

describe("porcentajes", () => {
  it("siempre suman 100", () => {
    // 50.000 y 30.000 dan 62,5% y 37,5%: redondeando cada uno por su cuenta
    // quedaba 63 y 38, que suma 101 y se lee como un error de cuentas.
    expect(porcentajesQueSuman([5000000, 3000000])).toEqual([63, 37]);
    expect(porcentajesQueSuman([1, 1, 1])).toEqual([34, 33, 33]);
    expect(porcentajesQueSuman([1, 1, 1, 1, 1, 1])).toEqual([17, 17, 17, 17, 16, 16]);
  });

  it("le da el sobrante a las partes más grandes", () => {
    const p = porcentajesQueSuman([100, 100, 1]);
    expect(p.reduce((a, x) => a + x, 0)).toBe(100);
    expect(p[0]).toBeGreaterThanOrEqual(p[2]);
  });

  it("no divide por cero cuando no hubo nada", () => {
    expect(porcentajesQueSuman([0, 0])).toEqual([0, 0]);
    expect(porcentajesQueSuman([])).toEqual([]);
  });
});

describe("períodos del panel", () => {
  it("entiende los tres atajos", () => {
    expect(resolverPeriodo({ periodo: "hoy" })).toMatchObject({ desde: hoy(), hasta: hoy() });
    expect(resolverPeriodo({ periodo: "mes" })).toMatchObject({ desde: inicioDeMes(), hasta: hoy() });
    expect(resolverPeriodo({ periodo: "semana" }).hasta).toBe(hoy());
  });

  it("arranca la semana el lunes", () => {
    // 2026-11-02 es lunes; 2026-11-08, el domingo siguiente.
    expect(inicioDeSemana("2026-11-04")).toBe("2026-11-02");
    expect(inicioDeSemana("2026-11-02")).toBe("2026-11-02");
    expect(inicioDeSemana("2026-11-08")).toBe("2026-11-02");
  });

  it("respeta un período personalizado", () => {
    expect(resolverPeriodo({ periodo: "personalizado", desde: "2026-01-01", hasta: "2026-03-31" })).toEqual({
      periodo: "personalizado",
      desde: "2026-01-01",
      hasta: "2026-03-31",
    });
  });

  it("cae en el mes si el personalizado viene incompleto o al revés", () => {
    // Un rango vacío o invertido no devuelve nada y parece que el sistema
    // perdió los datos: mejor el mes en curso, que es lo que se mira siempre.
    expect(resolverPeriodo({ periodo: "personalizado", desde: "2026-01-01" }).periodo).toBe("mes");
    expect(resolverPeriodo({ periodo: "personalizado", desde: "2026-05-01", hasta: "2026-01-01" }).periodo).toBe("mes");
  });

  it("sin nada elegido, muestra el mes en curso", () => {
    expect(resolverPeriodo({}).periodo).toBe("mes");
  });

  it("toma las fechas sueltas como un personalizado", () => {
    expect(resolverPeriodo({ desde: "2026-02-01", hasta: "2026-02-28" }).periodo).toBe("personalizado");
  });
});
