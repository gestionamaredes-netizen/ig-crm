# 💪 EL TITÁN - Sistema de Control de Caja y Stock

Sistema web completo para gestionar caja diaria y control de inventario para la tienda de productos de limpieza **El Titán** en Ramos Mejía, Buenos Aires.

## 🚀 Características

✅ **Control de Caja Diaria**
- Registro de ventas en tiempo real
- Métodos de pago (Efectivo, Tarjeta, Cheque)
- Arqueo de caja con detección de diferencias
- Historial de transacciones

✅ **Gestión de Stock**
- ABM de productos (Alta, Baja, Modificación)
- Categorización (Limpieza general, Lavado, Superficies)
- Alertas de stock bajo automáticas
- Control de cantidad y precios

✅ **Dashboard Analítico**
- Ventas del día en tiempo real
- Gráficos de ventas últimos 7 días
- Top productos más vendidos
- Alertas de stock crítico
- KPIs principales

✅ **Reportes**
- Ventas por período personalizable
- Análisis por método de pago
- Detalle de transacciones
- Exportación a CSV

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express
- SQLite (Base de datos)
- CORS habilitado para frontend

**Frontend:**
- React 18
- Tailwind CSS (Estilos)
- Recharts (Gráficos)
- Lucide Icons (Iconografía)
- Axios (HTTP Client)

## 📦 Instalación

### Requisitos Previos
- Node.js v14+
- npm o yarn

### Backend

```bash
cd backend
npm install
npm start
```

El servidor correrá en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## 📝 Uso

1. **Registrar Productos:**
   - Ve a Productos → Nuevo Producto
   - Ingresa código, nombre, categoría, precios y stock

2. **Registrar Ventas:**
   - Ve a Registrar Venta
   - Selecciona producto y cantidad
   - Elige método de pago
   - Confirma la venta

3. **Arqueo de Caja:**
   - Ve a Arqueo Caja
   - Ingresa el monto contado
   - El sistema compara con ventas esperadas

4. **Ver Reportes:**
   - Ve a Reportes
   - Selecciona período
   - Visualiza gráficos y exporta datos

## 🗄️ Base de Datos

Se crea automáticamente con las siguientes tablas:

- `productos`: Catálogo de productos
- `ventas`: Registro de todas las transacciones
- `arqueo_caja`: Arqueos diarios
- `compras_proveedor`: Control de compras a proveedores

## 🌐 API Endpoints

### Productos
- `GET /api/productos` - Listar todos
- `POST /api/productos` - Crear nuevo
- `PUT /api/productos/:id` - Actualizar
- `DELETE /api/productos/:id` - Eliminar

### Ventas
- `GET /api/ventas` - Listar todas
- `POST /api/ventas` - Registrar nueva venta
- `GET /api/ventas/diarias/:fecha` - Ventas de un día

### Arqueo
- `POST /api/arqueo` - Registrar arqueo
- `GET /api/arqueos` - Listar arqueos

### Dashboard
- `GET /api/dashboard` - Datos del dashboard

## 📱 Acceso

- **URL:** `http://localhost:3000`
- **Usuario:** Admin (por defecto)
- **Contraseña:** Configurar según necesidad

## 🔒 Seguridad Futura

- [ ] Autenticación de usuarios
- [ ] Roles y permisos
- [ ] Validación de datos avanzada
- [ ] Auditoría de cambios
- [ ] Backup automático

## 📞 Soporte

Tienda El Titán  
Av. de Mayo 2293, Ramos Mejía, Buenos Aires  
WhatsApp: [Tu número]

---

**Desarrollado con ❤️ para El Titán**
