# Cómo se regenera `como-entrar.png`

1. Levantar el panel con claves de prueba (nunca las reales):

   ```
   cd aquamar
   APP_SECRET=demo ADMIN_PASSWORD=kevin DEPOSITO_PASSWORD=galpon \
     npx next start -p 3300
   ```

2. Sacar las capturas y medir dónde cae cada campo:

   ```
   node docs/guia/acceso/capturar.mjs
   ```

   Deja en `guia/` el login (`t1-login.png`), los encabezados de cada rol
   (`t2-comercial.png`, `t3-deposito.png`) y las coordenadas en
   `cajas-login.json`.

3. Componer la tarjeta:

   ```
   node docs/guia/acceso/componer.mjs
   ```

Las dos scripts trabajan sobre una carpeta `guia/` relativa a donde se las
corre. La imagen final **no debe mostrar ninguna clave**: el campo se captura
vacío a propósito.
