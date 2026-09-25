# Relevamiento de rastros de IA

`rastros-ia.py` recorre todos los módulos de contenido de `docs/` y marca los
tics que delatan un texto generado por una máquina.

**No corrige: marca.** Qué se reescribe lo decide quien escribe.

```bash
python3 rastros-ia.py                 # todo docs/
python3 rastros-ia.py ../produccion   # una carpeta
python3 rastros-ia.py --detalle       # con la frase de cada hallazgo
```

## Qué busca

| Tic | Peso | Ejemplo |
|---|---|---|
| `guion-aside` | 3 | «cinco miradas —distintas edades, distintas historias— y una conversación» |
| `no-solo-sino` | 3 | «no solo incluye equipamiento, sino también un equipo humano» |
| `apertura-epica` | 3 | «En un mundo donde el contenido es cada vez más relevante…» |
| `consultora` | 3 | propuesta de valor, sinergia, potenciar, llevarlo al siguiente nivel |
| `andamiaje` | 2 | cabe destacar, asimismo, en definitiva, por otro lado |
| `relleno` | 2 | factor clave, es fundamental, juega un papel |
| `verbo-hueco` | 2 | busca ser, está diseñado para, tiene como objetivo |
| `desde-hasta` | 2 | «desde la preproducción hasta la entrega final» |
| `ritmo-plano` | 2 | frases casi todas del mismo largo |
| `tanto-como` | 1 | «tanto con marcas consolidadas como con emprendedores» |
| `intensificador` | 1 | cada vez más, 100%, totalmente |
| `arranque-repetido` | 1 | más del 12% de las frases empiezan con la misma palabra |

## Cómo leer el puntaje

Lo que compara es la **densidad**, no el puntaje crudo: un documento largo
acumula más hallazgos sin ser peor. La columna `c/100fr` es puntaje cada cien
frases.

Para que el número signifique algo hay un control negativo: un texto escrito a
propósito con todos los tics da alrededor de **560 cada 100 frases**. Los
documentos de Nexo dan **0,0**.

## Qué NO detecta

Conviene saberlo antes de confiarle una revisión entera:

- **Ideas genéricas bien escritas.** Un párrafo sin un solo dato propio pasa
  limpio si evita las muletillas.
- **Datos inventados.** No verifica nada de lo que el texto afirma.
- **Voz.** No sabe si suena a Nexo o a cualquier productora.

Para eso no hay script: hay que leerlo.

## Decisiones tomadas al afinarlo

- **Los docstrings no cuentan.** No salen impresos en el PDF.
- **`clave` como sustantivo es castellano normal.** «Los puntos clave» o «la
  clave no es la pregunta» no son tics; sí lo es «un factor clave».
- **Arrancar frases con «Si», «No» o «Se» tampoco.** La primera versión marcaba
  65 casos que eran todos falsos positivos; ahora sólo cuenta si la palabra
  dice algo y se repite en más del 12% de las frases.
- **El guión largo como separador de ficha se deja.** «Rodecaster Pro II —
  audio multipista» es tipografía de tabla, no un inciso. El detector sólo
  marca el inciso cerrado, `—texto—`.
