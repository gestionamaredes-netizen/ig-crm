# El Titán - Guía de Desarrollo

## 🚀 Descripción General

Sistema profesional de control de caja y stock para tienda de productos de limpieza, construido con React 18 + TypeScript.

## 📋 Características Principales

✅ **Dashboard Analítico**
- Visualización en tiempo real de ventas del día
- Gráficos de tendencias últimos 7 días
- Top productos más vendidos
- Alertas de stock bajo automáticas
- KPIs principales

✅ **Gestión de Caja Diaria**
- Arqueo de caja con detección automática de diferencias
- Desglose por método de pago (Efectivo, Tarjeta, Cheque, Transferencia)
- Histórico de arqueos
- Cálculo automático de diferencias

✅ **Registro de Ventas**
- Interface intuitiva para registrar ventas
- Selección de producto y cantidad
- Métodos de pago disponibles
- Listado de ventas del día
- Eliminación de transacciones

✅ **Gestión de Stock**
- Monitoreo de inventario en tiempo real
- Alertas de stock bajo
- Valor total del inventario
- Búsqueda y filtrado de productos

✅ **Administración de Productos**
- ABM (Alta, Baja, Modificación) completo
- Gestión de categorías
- Cálculo automático de márgenes de ganancia
- Código de producto para identificación

✅ **Gestión de Clientes**
- Base de datos de clientes
- Información de contacto completa
- Estado activo/inactivo

✅ **Sistema de Reportes**
- Generación de reportes por período
- Exportación a CSV
- Análisis de ganancias
- Filtros por fecha

✅ **Administración de Usuarios**
- Gestión de usuarios del sistema
- Roles (Vendedor, Gerente, Administrador)
- Cambio de contraseñas
- Estado activo/inactivo

✅ **Configuración del Sistema**
- Información del negocio
- Preferencias de zona horaria e idioma
- Gestión de notificaciones
- Respaldo automático de datos

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18 - Framework UI
- TypeScript - Tipado estático
- Tailwind CSS 3 - Estilos y diseño responsive
- Lucide React - Iconografía
- Recharts - Visualización de datos
- React Router - Navegación (preparado para futuro)

**Tooling:**
- React Scripts - Build tool
- PostCSS - Procesamiento de CSS
- ESLint - Linting de código

## 📦 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Navigation.tsx
│   └── Table.tsx
├── pages/               # Páginas de la aplicación
│   ├── Dashboard.tsx
│   ├── Caja.tsx
│   ├── Ventas.tsx
│   ├── Stock.tsx
│   ├── Productos.tsx
│   ├── Categorias.tsx
│   ├── Clientes.tsx
│   ├── Reportes.tsx
│   ├── Usuarios.tsx
│   └── Configuracion.tsx
├── data/                # Datos de demostración
│   └── mockData.ts
├── types/               # Definiciones TypeScript
│   └── index.ts
├── utils/               # Funciones utilitarias
│   └── format.ts
├── App.tsx              # Componente principal
├── index.tsx            # Entrada de la aplicación
└── index.css            # Estilos globales
```

## 🎨 Diseño Responsive

### Breakpoints
- **Móvil**: 320-767px - Bottom navigation, interfaz optimizada para touch
- **Tablet**: 768-1023px - Layout intermedio
- **Desktop**: 1024px+ - Sidebar completo, layout de 2+ columnas

### Características Móviles
- Bottom navigation con 5 opciones principales
- Padding seguro para dispositivos con notch
- Fonts redimensionadas para legibilidad
- Botones grandes para facilidad de toque
- Scroll optimizado para small screens

## 🚀 Configuración y Uso

### Requisitos Previos
- Node.js v18+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Development
npm start

# Build para producción
npm run build

# Testing
npm test
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

## 🎯 Funcionalidades Clave

### Dashboard
- Cálculo en tiempo real de ventas
- Gráficos interactivos con Recharts
- Alertas de stock crítico
- Tabla de últimas transacciones

### Sistema de Navegación
- Sidebar fijo en desktop (56px ancho)
- Bottom navigation en móvil (5 opciones principales)
- Navegación por estado compartido en App.tsx
- Transiciones suaves entre páginas

### State Management
- React Hooks (useState) para estado local
- Lifting state en App.tsx para navegación
- Data flow unidireccional

### Datos Mock
- Sistema completo de datos de demostración
- 10 productos con categorías
- 10 ventas del día actual
- 3 arqueos históricos
- 4 usuarios con roles
- 2 clientes ejemplo

## 📊 Formato de Datos

### Producto
```typescript
{
  id: string,
  codigo: string,
  nombre: string,
  descripcion: string,
  categoria: string,
  precio_costo: number,
  precio_venta: number,
  stock_actual: number,
  stock_minimo: number,
  proveedor: string,
  creado_en: Date
}
```

### Venta
```typescript
{
  id: string,
  fecha: Date,
  hora: string,
  producto_id: string,
  cantidad: number,
  precio_unitario: number,
  monto_total: number,
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'CHEQUE' | 'TRANSFERENCIA'
}
```

## 🔧 Desarrollo

### Agregar una Nueva Página
1. Crear archivo en `src/pages/NombrePagina.tsx`
2. Exportar componente: `export const NombrePagina: React.FC = () => { ... }`
3. Agregar ruta en `Navigation.tsx` si aplica
4. Importar en `App.tsx` y agregar al switch

### Agregar un Nuevo Componente
1. Crear archivo en `src/components/Componente.tsx`
2. Exportar componente reusable
3. Importar y usar en páginas

### Agregar Estilos
- Usar Tailwind CSS classes
- Definir colores personalizados en `tailwind.config.js`
- Variables CSS en `index.css` para temas

## 🌙 Modo Oscuro

El sistema soporta tema oscuro completo:
- Toggle en header
- Aplicado globalmente con clase `dark`
- Colores adaptados en todos los componentes
- Estilos CSS con `dark:` prefix

## 📱 PWA Ready

El proyecto está preparado para ser convertido a PWA:
- Metadatos en `index.html`
- Viewport config para mobile
- Safe area support
- Apple mobile web app meta tags

## 🔐 Seguridad (Futuro)

- Validación de datos en frontend
- Preparado para JWT authentication
- CORS configurado en backend
- Inputs sanitizados

## 📈 Performance

- Build optimizado: 172KB gzipped
- Tree shaking activo
- CSS combinado en single file
- Código splitting preparado

## 🚀 Deployment

### Vercel
1. Push a rama
2. Vercel detecta automáticamente
3. Build y deploy automático
4. Configurar variables de entorno en dashboard

### Netlify
Similar a Vercel, soporta React apps sin configuración

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📝 Notas de Desarrollo

- Los datos mock se regeneran con cada recarga
- Las operaciones CRUD afectan solo el estado local
- No hay persistencia en base de datos (mock data only)
- Las URLs de API están configuradas pero no usadas en demo

## 🎓 Próximos Pasos

1. Conectar a backend real (Express.js + MongoDB)
2. Implementar autenticación
3. Agregar validación de formularios
4. Implementar paginación en tablas
5. Agregar filtros y búsqueda avanzada
6. PWA completo con service workers
7. Tests unitarios y de integración
8. Analytics y tracking
9. Multilenguaje (i18n)
10. Soporte offline

## 📞 Soporte

Para ayuda o preguntas sobre desarrollo, consultar documentación de:
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org

---

**Desarrollado para El Titán - Productos de Limpieza**
Ramos Mejía, Buenos Aires
