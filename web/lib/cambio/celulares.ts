export type Celular = {
  id: string;
  alias: string;
  modelo: string;
  runnerId: string | null;
  runner: string;
  activo: boolean;
};

export type CuentaOperativa = {
  id: string;
  celularId: string;
  titular: string;
  dni: string;
  cbuPesos: string;
  aliasPesos: string;
  cbuDolares: string;
  aliasDolares: string;
  estado: string;
  notas: string;
  // Login de la cuenta (home banking / app). La clave se muestra oculta.
  usuario: string;
  clave: string;
};
