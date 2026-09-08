#!/bin/bash
set -e

echo "📦 Instalando dependencias..."
cd titan/frontend
npm ci --legacy-peer-deps

echo "🔨 Compilando aplicación..."
npm run build

echo "✅ Build completado exitosamente"
