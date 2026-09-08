# 🚀 Guía de Deployment - El Titán

## Opción 1: Vercel (RECOMENDADO - Gratis)

### Paso 1: Crear cuenta en Vercel
1. Visita https://vercel.com
2. Haz click en "Sign Up"
3. Usa tu cuenta de GitHub (vincula el repo)

### Paso 2: Desplegar el Proyecto

#### Opción A: Desde GitHub (Más fácil)
```bash
1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub: gestionamaredes-netizen/ig-crm
3. Vercel detectará automáticamente la estructura
4. En "Root Directory" selecciona: titan
5. Haz click en "Deploy"
```

#### Opción B: Desde CLI
```bash
# Instala Vercel CLI
npm i -g vercel

# En la carpeta titan/
cd titan
vercel

# Sigue los prompts y acepta la configuración
```

### Paso 3: Variables de Entorno (Importante!)

En el panel de Vercel:
1. Ve a Settings → Environment Variables
2. Agrega:
   ```
   NODE_ENV = production
   FRONTEND_URL = tu-dominio.vercel.app
   ```

3. Redeploya el proyecto

### Resultado
- **Frontend + Backend en:** `https://tu-app.vercel.app`
- **API automáticamente en:** `https://tu-app.vercel.app/api`

---

## Opción 2: Netlify (Alternativa)

### Paso 1: Crear cuenta Netlify
1. Visita https://app.netlify.com
2. "Sign up with GitHub"
3. Autoriza el acceso

### Paso 2: Conectar Repositorio
```bash
1. Click en "Add new site" → "Import an existing project"
2. Selecciona GitHub y elige: gestionamaredes-netizen/ig-crm
3. En "Base directory": titan
4. Build command: npm run build
5. Publish directory: frontend/build
6. Click "Deploy site"
```

### Paso 3: Backend en Netlify Functions (Alternativo)
- Requiere configuración adicional
- Recomendamos Vercel para este caso

---

## Opción 3: Heroku (Alternativa, requiere tarjeta)

```bash
# Instala Heroku CLI
brew install heroku  # Mac
# o descargar desde https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crea app
heroku create eltitan-app

# Deploy
git push heroku claude/claude-rc-txicjp:main

# Ver logs
heroku logs --tail
```

---

## Verificar Deployment

Una vez deployado, prueba:

```bash
# Health check
curl https://tu-app.vercel.app/health

# API test
curl https://tu-app.vercel.app/api/productos
```

Deberías recibir respuesta JSON.

---

## Configuración de Base de Datos

⚠️ **IMPORTANTE:** SQLite no persiste en Vercel/Netlify

### Solución 1: Usar Base de Datos en la Nube
Recomendamos cambiar a **PostgreSQL** en Vercel:

```bash
# Instala postgres driver
npm install pg

# En backend/database.js cambiar sqlite3 por pg
# Crear BD en Vercel Postgres (gratis en Vercel)
```

### Solución 2: Usar Data con Vercel
```bash
# Vercel ofrece almacenamiento persistente
# Ir a Storage → Create Database → Postgres
```

### Solución 3: MongoDB Atlas (Gratis)
```bash
# Crear cuenta en https://www.mongodb.com/cloud/atlas
# Crear cluster gratis
# Cambiar BD en backend
```

---

## Dominio Personalizado

### En Vercel:
1. Settings → Domains
2. Agrega tu dominio
3. Sigue instrucciones de DNS

### En Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Actualiza DNS en tu registrador

---

## Variables de Entorno en Producción

### Vercel Dashboard:
```
Settings → Environment Variables
```

### Para Backend:
- `NODE_ENV=production`
- `PORT=5000` (automático en Vercel)
- `DATABASE_URL=` (si usas PostgreSQL)

### Para Frontend:
- `REACT_APP_API_URL=https://tu-app.vercel.app/api`

---

## Monitoreo

### Vercel:
- Analytics automático incluido
- Logs en Time → Function Logs

### Netlify:
- Analytics en Site Settings
- Build logs visibles

---

## Troubleshooting

### "API no responde"
```bash
# Verifica CORS
# Verifica variables de entorno
# Revisa logs en Vercel/Netlify
```

### "Build falla"
```bash
# Verifica package.json en ambas carpetas
# Revisa que existan todas las dependencias
npm install  # Nuevamente
```

### "BD no persiste"
```bash
# Cambiar a PostgreSQL o MongoDB
# SQLite no funciona en serverless
```

---

## Deploy Automático

Vercel y Netlify despliegan automáticamente cuando:
1. Haces push a la rama principal
2. Creas un Pull Request
3. Merges a main

No necesitas hacer nada más! 🎉

---

## Soporte

Para problemas:
- **Vercel:** https://vercel.com/support
- **Netlify:** https://support.netlify.com
- **GitHub Issues:** Abre un issue en el repo

---

**¡Tu app está en internet! 🚀**
