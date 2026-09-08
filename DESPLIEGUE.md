# 🚀 DESPLIEGUE DE EL TITÁN

## Opción 1: Netlify (RECOMENDADO - Más fácil y automático)

### Pasos:

1. **Abre este enlace** (sin debes descargar nada):
   https://app.netlify.com/start

2. **Conecta tu cuenta de GitHub:**
   - Haz click en "Connect to Git"
   - Elige "GitHub"
   - Autoriza Netlify para acceder a tu cuenta de GitHub

3. **Selecciona el repositorio:**
   - Busca y selecciona: `gestionamaredes-netizen/ig-crm`

4. **Configura el despliegue (Netlify lo detecta automáticamente):**
   - Base directory: `titan/frontend` (ya está configurado en netlify.toml)
   - Build command: `npm run build` (ya está configurado)
   - Publish directory: `build` (ya está configurado)
   - Haz click en "Deploy site"

5. **¡Listo!** 
   - Netlify compilará y desplegará automáticamente
   - Recibirás una URL como: `https://xxxxx.netlify.app`
   - Cada vez que hagas push a GitHub, se actualiza automáticamente

---

## Opción 2: Vercel (También funciona)

### Pasos:

1. **Abre este enlace:**
   https://vercel.com/new

2. **Conecta GitHub:**
   - Haz click en "Continue with GitHub"
   - Autoriza Vercel

3. **Importa el repositorio:**
   - Busca: `gestionamaredes-netizen/ig-crm`
   - Haz click en "Import"

4. **Configura (Vercel lo detecta automáticamente):**
   - Root Directory: `titan/frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Haz click en "Deploy"

5. **¡Listo!**
   - URL: `https://xxxxx.vercel.app`
   - Actualizaciones automáticas con cada push

---

## Opción 3: GitHub Pages (Más técnico)

```bash
# En el repositorio local:
git checkout -b gh-pages

# Construir:
cd titan/frontend && npm run build

# Crear rama gh-pages con el contenido de build:
git add build/* && git commit -m "Deploy to GitHub Pages" && git push origin gh-pages
```

---

## ✅ Verificación

Una vez desplegado, tu aplicación estará en línea en:
- `https://tudominio.netlify.app` (Netlify)
- `https://tudominio.vercel.app` (Vercel)

**Todas las características funcionan:**
- ✅ Dashboard con gráficos
- ✅ Gestión de caja
- ✅ Registro de ventas
- ✅ Administración de productos
- ✅ Control de stock
- ✅ Reportes
- ✅ Tema oscuro
- ✅ Responsive (móvil, tablet, desktop)

---

**Recomendación:** Usa Netlify. Es más fácil y más automático.

Cualquier pregunta, contacta: gestionama.redes@gmail.com
