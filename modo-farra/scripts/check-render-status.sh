#!/bin/bash

# Script para verificar status de renderizado

echo "🎬 MODO FARRA - RENDER STATUS CHECK"
echo "===================================="
echo ""
echo "Fecha/Hora: $(date)"
echo ""

cd "$(dirname "$0")/.." || exit

echo "📁 Archivos en renders/final/:"
echo ""
ls -lh renders/final/ 2>/dev/null || echo "  ⚠️  Directorio aún no existe"

echo ""
echo "📊 Tamaño total:"
du -sh renders/final/ 2>/dev/null || echo "  0 bytes (renderizado no iniciado)"

echo ""
echo "📝 Log de progreso (últimas 20 líneas):"
echo "---"
tail -20 render-output.log 2>/dev/null || echo "  (sin log aún)"

echo ""
echo "✅ Verificación de videos generados:"
echo ""

for i in 1 2 3 4; do
  file="renders/final/modo-farra-loop-0${i}.mp4"
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_keys=1 "$file" 2>/dev/null || echo "?")
    echo "  ✅ Loop0${i}: $size ($duration seg)"
  else
    echo "  ⏳ Loop0${i}: Pendiente"
  fi
done

echo ""
echo "---"
echo "Para ver log en tiempo real:"
echo "  tail -f render-output.log"
echo ""
echo "Para reconectar a render (si se interrumpió):"
echo "  npm run render:all"
