# 15 ideas de contenido — Fabricio Benjamín Ortega

Guion de videos cortos para redes sobre **el oficio de producir**: qué decide, qué
resuelve y qué sostiene un productor general. Cada idea es un video de **hasta 1
minuto** con gancho de retención.

El eje son decisiones y problemas resueltos, no equipamiento. El fierro puede aparecer
de fondo en el plano, nunca como tema: nadie contrata una cámara, contratan a alguien
que sabe qué hacer con ella.

**Entregable:** `Nexo-15-ideas-de-contenido.pdf` — 17 páginas, 1080×1920 px,
vertical y con tipografía grande para leerlo desde el celular mientras se graba.

| Página | Contenido |
|---|---|
| 1 | Portada |
| 2 | El método: seis reglas que valen para las 15 |
| 3–17 | Una idea por pantalla |

Cada idea trae: número y categoría, duración sugerida, título, **el gancho textual
para los primeros 3 segundos**, el desarrollo, qué se ve en cámara y la frase de
cierre. Al pie, qué servicio vende esa pieza.

Los acentos rotan entre azul, rojo y dorado para dar ritmo al pasar las pantallas.

## De dónde sale el contenido

Las 15 situaciones salen de lo que ya está documentado en este repo, no de supuestos:
la escaleta y los minutajes de la biblia de Tercer Tiempo (`../tercer-tiempo-formato.md`),
el protocolo de menores de Pequeños Grandes Sabios, la co-conducción en tres husos de
El Motivo, la lógica de bloques patrocinables de la carpeta de programación y la mesa
de seis de Tercer Tiempo.

## Las 15, por eje

| Eje | Ideas |
|---|---|
| El rol y su rutina | 01 · 04 · 14 |
| Decisiones y criterio | 06 · 10 · 11 |
| Formato y casting | 05 · 07 |
| Crisis y vivo | 02 · 03 · 13 |
| Especializaciones | 08 (menores) · 09 (multi-país) · 12 (talento) |
| Prueba de volumen | 15 |

## Regenerar el PDF

```bash
./build-ideas.sh                  # usa el Chromium de /opt/pw-browsers
./build-ideas.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **las 15 ideas y el método**. Único archivo a tocar para editar texto.
- `ideas.py` — maquetación.
- `estilos.css` — sistema visual.

Las fuentes y el logo se leen de `../carpeta-programacion/assets/`.
**No agregues `filter:` al CSS:** Chromium rasteriza los elementos filtrados al
imprimir y el PDF se dispara de peso.
