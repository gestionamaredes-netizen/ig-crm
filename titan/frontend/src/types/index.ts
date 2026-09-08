export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  activo: boolean;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor: string;
  creado_en: Date;
}

export interface Venta {
  id: string;
  fecha: Date;
  hora: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  monto_total: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'CHEQUE' | 'TRANSFERENCIA';
  usuario_id?: string;
}

export interface Arqueo {
  id: string;
  fecha: Date;
  monto_esperado: number;
  monto_real: number;
  diferencia: number;
  observaciones?: string;
  usuario_id?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  activo: boolean;
}

export interface Compra {
  id: string;
  fecha: Date;
  proveedor: string;
  productos: Array<{
    producto_id: string;
    cantidad: number;
    precio: number;
  }>;
  monto_total: number;
  observaciones?: string;
}

export interface Reporte {
  id: string;
  tipo: 'ventas' | 'stock' | 'caja' | 'clientes';
  fecha_inicio: Date;
  fecha_fin: Date;
  datos: any;
}

export interface DashboardData {
  ventasHoy: number;
  ventasUltimos7Dias: number;
  totalProductos: number;
  stockBajo: number;
  movimiento_caja: {
    entradas: number;
    salidas: number;
  };
  metodos_pago: {
    efectivo: number;
    tarjeta: number;
    cheque: number;
    transferencia: number;
  };
  top_productos: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    monto: number;
  }>;
  alertas_stock: Producto[];
}
