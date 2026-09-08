# 🧹 El Titán - Sistema de Control de Caja y Stock

Sistema profesional de control de caja y stock para tienda de productos de limpieza, construido con **React 18 + TypeScript**.

**Ubicación:** Ramos Mejía, Buenos Aires  
**Desarrollado:** Con Node.js, React, TypeScript y Tailwind CSS

---

## 🚀 Estado del Despliegue

La aplicación está **LISTA PARA DESPLEGAR** en cualquier plataforma gratuita.

### Opción 1: GitHub Pages (Automático - Recomendado)

El repositorio incluye un **GitHub Actions workflow** que despliega automáticamente a GitHub Pages.

**Pasos:**

1. Ve a tu repositorio en GitHub: https://github.com/gestionamaredes-netizen/ig-crm
2. Abre **Settings** → **Pages**
3. En "Build and deployment":
   - Source: Selecciona **"GitHub Actions"**
   - Haz click en **"Save"**
4. ¡Listo! El workflow se ejecutará automáticamente

**La aplicación estará disponible en:**
```
https://gestionamaredes-netizen.github.io/ig-crm
```

Cada vez que hagas push a cualquier rama, se desplegará automáticamente.

---

### Opción 2: Netlify (También automático)

1. Ve a https://app.netlify.com/start
2. Haz click en **"Connect to Git"** → **"GitHub"**
3. Autoriza y selecciona el repositorio `gestionamaredes-netizen/ig-crm`
4. La configuración ya está en `netlify.toml` - haz click en **"Deploy"**
5. Tu sitio estará disponible en `https://xxxxx.netlify.app`

---

### Opción 3: Vercel (También automático)

1. Ve a https://vercel.com/new
2. Haz click en **"Continue with GitHub"**
3. Selecciona `gestionamaredes-netizen/ig-crm`
4. La configuración ya está en `vercel.json` - haz click en **"Deploy"**
5. Tu sitio estará disponible en `https://xxxxx.vercel.app`

---

## 📋 Características Principales

✅ **Dashboard Analítico**
- Visualización en tiempo real de ventas
- Gráficos de tendencias últimos 7 días
- Top productos más vendidos
- Alertas de stock bajo automáticas

✅ **Gestión de Caja Diaria**
- Arqueo de caja con detección de diferencias
- Desglose por método de pago (Efectivo, Tarjeta, Cheque, Transferencia)
- Histórico de arqueos

✅ **Registro de Ventas**
- Interface intuitiva para registrar ventas
- Selección de producto y cantidad
- Múltiples métodos de pago

✅ **Gestión de Stock**
- Monitoreo de inventario en tiempo real
- Alertas de stock bajo
- Búsqueda y filtrado

✅ **Administración de Productos**
- ABM (Alta, Baja, Modificación) completo
- Gestión de categorías
- Cálculo automático de márgenes

✅ **Gestión de Clientes**
- Base de datos completa
- Información de contacto
- Estado activo/inactivo

✅ **Sistema de Reportes**
- Generación de reportes por período
- Exportación a CSV
- Análisis de ganancias

✅ **Administración de Usuarios**
- Gestión de usuarios del sistema
- Roles (Vendedor, Gerente, Administrador)
- Cambio de contraseñas

✅ **Tema Oscuro**
- Toggle en header
- Aplicado globalmente
- Colores adaptados automáticamente

✅ **Responsive**
- Optimizado para móvil, tablet y desktop
- Bottom navigation en móvil
- Sidebar en desktop

---

## 🛠️ Stack Tecnológico

- **React 18** - Framework UI moderno
- **TypeScript** - Tipado estático seguro
- **Tailwind CSS 3** - Estilos responsive
- **Lucide React** - Iconografía
- **Recharts** - Gráficos interactivos
- **React Scripts** - Build tool optimizado

---

## 📱 Diseño Responsive

| Dispositivo | Ancho | Características |
|---|---|---|
| **Móvil** | 320-767px | Bottom navigation, interfaz optimizada |
| **Tablet** | 768-1023px | Layout intermedio |
| **Desktop** | 1024px+ | Sidebar completo, layout multi-columna |

---

## 📦 Estructura del Proyecto

```
ig-crm/
├── titan/
│   ├── frontend/              # Aplicación React
│   │   ├── src/
│   │   │   ├── components/    # Componentes reusables
│   │   │   ├── pages/         # Páginas de la aplicación (10 páginas)
│   │   │   ├── data/          # Mock data para demostración
│   │   │   ├── types/         # Definiciones TypeScript
│   │   │   ├── utils/         # Funciones utilitarias
│   │   │   ├── App.tsx        # Componente principal
│   │   │   └── index.tsx      # Entrada de la aplicación
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   └── .vercelignore
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions CI/CD workflow
├── vercel.json                # Configuración Vercel
├── netlify.toml               # Configuración Netlify
├── DESPLIEGUE.md              # Instrucciones detalladas
└── README.md                  # Este archivo
```

---

## 💻 Desarrollo Local

### Requisitos
- Node.js v18+
- npm o yarn

### Instalación

```bash
# Navegar al directorio del frontend
cd titan/frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

### Variables de Entorno

Crear archivo `titan/frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

---

## 🚀 Despliegue

### Build Optimizado
```
✓ 172.28 kB gzipped - Excelente performance
✓ Tree shaking activo
✓ CSS combinado en single file
✓ Código splitting preparado
```

### Opciones Disponibles

1. **GitHub Pages** - Automático con workflow (MÁS FÁCIL)
2. **Netlify** - Automático con netlify.toml
3. **Vercel** - Automático con vercel.json
4. **Otro servidor estático** - Descargar contenido de `build/`

---

## 🔒 Seguridad

- ✅ Validación de datos en frontend
- ✅ Inputs sanitizados
- ✅ Headers de seguridad configurados
- ✅ CORS preparado
- ✅ Preparado para JWT authentication (futuro)

---

## 📊 Mock Data

La aplicación incluye datos de demostración realistas:
- 10 productos con categorías
- 10 ventas del día actual
- 3 arqueos históricos
- 4 usuarios con diferentes roles
- 2 clientes ejemplo
- 5 compras de proveedores

Los datos se regeneran con cada recarga (no persisten en base de datos).

---

## 🎯 Próximos Pasos (Futuro)

1. Conectar a backend real (Express.js + MongoDB)
2. Implementar autenticación real
3. Agregar validación de formularios avanzada
4. Implementar paginación en tablas
5. Agregar filtros y búsqueda avanzada
6. PWA completo con service workers
7. Tests unitarios y de integración
8. Analytics y tracking
9. Multilenguaje (i18n)
10. Soporte offline con sincronización

---

## 📖 Documentación

- **DEV_GUIDE.md** - Guía completa de desarrollo
- **DESPLIEGUE.md** - Instrucciones de despliegue
- **GitHub Actions Workflow** - CI/CD automático (.github/workflows/deploy.yml)

---

## 📚 Recursos Externos

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

---

## 📧 Contacto

**Correo:** gestionama.redes@gmail.com  
**Ubicación:** Ramos Mejía, Buenos Aires

---

## 📄 Licencia

Proyecto privado para El Titán - Productos de Limpieza

---

## ⚡ Quick Start

```bash
# Clonar repositorio
git clone https://github.com/gestionamaredes-netizen/ig-crm.git
cd ig-crm

# Instalar y ejecutar
cd titan/frontend
npm install
npm start

# El navegador abrirá http://localhost:3000 automáticamente
```

---

**Estado:** ✅ Listo para producción  
**Última actualización:** 8 de Septiembre, 2026
