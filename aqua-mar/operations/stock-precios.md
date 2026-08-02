# Stock y precios

## Stock
Única fuente de verdad (hoy: `src/data/products.ts`; mañana: sistema
central). Estados: disponible · bajo · consultar · sin_stock ·
proximamente. No mostrar cantidades públicas sin sincronización.
Flujo: ingreso → control → registro → actualización de disponibilidad →
publicación interna → actualización web cuando corresponda.

## Precios
Se actualizan solo desde configuración o sistema central. Cada cambio
registra: producto, precio anterior, precio nuevo, fecha, responsable,
vigencia. Ante la duda, la web muestra "Consultar precio". La web nunca
muestra precios desactualizados.
