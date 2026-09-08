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
- MongoDB + Mongoose (Base de datos)
- CORS habilitado para frontend

**Frontend:**
- React 18
- Tailwind CSS (Estilos)
- Recharts (Gráficos)
- Lucide Icons (Iconografía)
- Axios (HTTP Client)

## 📦 Instalación

### Requisitos Previos
- Node.js v18+
- npm o yarn
- MongoDB (local) o MongoDB Atlas (cloud)

### Variables de Entorno

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/titan
NODE_ENV=development
```

### Instalación Completa

```bash
# Instalar todas las dependencias (root, backend, frontend)
npm run install-all

# O instalar manualmente:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Desarrollo Local

```bash
# Desde la carpeta raíz, ejecuta ambos servidores en paralelo
npm run dev

# Backend correrá en http://localhost:5000
# Frontend correrá en http://localhost:3000
```

### Construcción para Producción

```bash
npm run build
```

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

Usa MongoDB con Mongoose ODM. Se crean automáticamente las siguientes colecciones:

- `productos`: Catálogo de productos
- `ventas`: Registro de todas las transacciones
- `arqueos`: Arqueos diarios
- `compras`: Control de compras a proveedores

### Configuración de MongoDB

**Desarrollo local:**
```bash
# Por defecto usa: mongodb://localhost:27017/titan
# Asegúrate de tener MongoDB corriendo localmente
```

**Producción (Vercel/Netlify):**
- Configura la variable de entorno `MONGODB_URI`
- Usa MongoDB Atlas: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/titan`
- Añade la variable en el dashboard de tu proveedor de hosting

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
