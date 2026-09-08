# 🔧 Guía de Instalación - El Titán

## Paso 1: Clonar / Descargar Proyecto

```bash
cd /ruta/del/proyecto
```

## Paso 2: Instalar Backend

```bash
cd titan/backend

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

✅ Si ves `🚀 Servidor El Titán corriendo en puerto 5000` - ¡Está listo!

## Paso 3: Instalar Frontend (otra terminal)

```bash
cd titan/frontend

# Instalar dependencias
npm install

# Iniciar aplicación
npm start
```

✅ Se abrirá automáticamente en `http://localhost:3000`

## Primer Uso

1. **Agregar Productos:**
   - Click en "Productos" en el menú lateral
   - Click en "Nuevo Producto"
   - Completa: Código, Nombre, Categoría, Precio, Stock

2. **Primera Venta:**
   - Click en "Registrar Venta"
   - Selecciona producto
   - Ingresa cantidad
   - Elige método de pago
   - Click en "Registrar Venta"

3. **Ver Dashboard:**
   - Se actualiza en tiempo real
   - Muestra ventas, alertas y gráficos

4. **Arqueo de Caja:**
   - Ingresa monto contado
   - El sistema compara automáticamente

## 🚀 Comandos Útiles

### Backend (en carpeta backend/)
```bash
npm start       # Iniciar servidor
npm run dev     # Con nodemon (reload automático)
```

### Frontend (en carpeta frontend/)
```bash
npm start       # Iniciar en desarrollo
npm run build   # Crear build para producción
```

## 🐛 Troubleshooting

**Puerto 5000 ya está en uso:**
```bash
# Cambiar puerto en backend/.env
PORT=5001
```

**Puerto 3000 ya está en uso:**
```bash
# React lo asignará automáticamente
```

**Error de conexión Backend/Frontend:**
- Verifica que ambos servidores estén corriendo
- Revisa que la URL de API sea correcta en `frontend/src/App.js`

**SQLite no se crea:**
```bash
# Asegurate que exista la carpeta backend/
# El archivo titan.db se crea automáticamente
```

## 📊 Base de Datos

La base de datos SQLite se crea automáticamente en:
```
titan/backend/titan.db
```

Para resetear la BD (CUIDADO - borra datos):
```bash
rm titan/backend/titan.db
npm start  # Crea nueva BD
```

## 🌐 Acceso Remoto

Para acceder desde otra máquina en la red:

1. Averigua tu IP local:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Accede desde otra máquina:
   ```
   http://TU_IP:3000
   ```

3. Asegúrate que el backend también escuche en la red (ya está configurado)

## 📦 Producción (Futuro)

Para desplegar en producción:

```bash
# Build frontend
cd frontend
npm run build

# Deploy con Vercel/Netlify/Heroku
```

---

¿Necesitas ayuda? Contacta al soporte 💪
