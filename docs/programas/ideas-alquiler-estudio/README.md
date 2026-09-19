# Alquilá el estudio — 15 ideas de contenido

Plan de contenido para mostrar **Nexo Studios como espacio de alquiler**: podcast,
streaming en vivo y live set. Repartido entre cinco personas del equipo, tres videos
cada una, de hasta 1 minuto y con gancho de retención.

**Entregable:** `Nexo-alquila-el-estudio-15-ideas.pdf` — 18 páginas, 1080×1920 px,
vertical y con tipografía grande para leerlo desde el celular mientras se graba.

| Página | Contenido |
|---|---|
| 1 | Portada |
| 2 | El método: seis reglas que valen para las 15 |
| 3 | El reparto: quién graba qué y desde qué ángulo |
| 4–18 | Una idea por pantalla |

## El reparto

Cada uno habla desde su rol, no del estudio en general. Así no se pisan y no suenan
a cinco personas leyendo el mismo folleto.

| Quién | Ángulo | Ideas | Color |
|---|---|---|---|
| **Fabricio** · Producción General | La jornada, qué traer, cuánto rinde el piso | 01–03 | azul |
| **Nico** · Dirección General | El criterio detrás del espacio | 04–06 | rojo |
| **Fede** · Dirección General | La mirada visual: luz y planos | 07–09 | dorado |
| **Juli** · Dirección de Marketing | Qué pasa después de grabar | 10–12 | verde |
| **Guido** · rol a confirmar | Primera vez en un estudio y live set | 13–15 | cian |

**Dos cosas a revisar antes de repartir:**

- **Guido no figura en el staff** documentado en el repo, así que le asigné el bloque
  menos dependiente del cargo. Si su rol es otro, se cambia el ángulo en `contenido.py`.
- **Nico y Fede comparten Dirección General.** Los separé por criterio de espacio (Nico)
  y criterio visual (Fede). Si en la práctica se reparten distinto, conviene intercambiar
  los bloques antes de grabar.

## Cobertura por uso

Podcast 6 · Estudio 4 · Streaming 3 · Live set 2. Si el live set es prioridad comercial,
conviene sumarle ideas: es el uso con menos piezas.

## Regenerar el PDF

```bash
./build-ideas.sh                  # usa el Chromium de /opt/pw-browsers
./build-ideas.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **las 15 ideas, el equipo y el método**. Único archivo a tocar.
- `ideas.py` — maquetación · `estilos.css` — sistema visual.

Las fuentes y el logo se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al imprimir
y el PDF se dispara de peso.
