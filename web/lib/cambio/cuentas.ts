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
};
