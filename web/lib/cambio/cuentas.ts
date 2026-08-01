export type Cuenta = {
  id: string;
  titular: string;
  dni: string;
  cbuPesos: string;
  aliasPesos: string;
  cbuDolares: string;
  aliasDolares: string;
  notas: string;
  // Se maneja por tarjeta (no por celular). Muestra el sello "TARJETA".
  tarjeta: boolean;
  // Runner a cargo de la cuenta (opcional). `runner` es el nombre para mostrar.
  runnerId: string | null;
  runner: string;
  // Login de la cuenta (home banking / app). La clave se muestra oculta.
  usuario: string;
  clave: string;
};
