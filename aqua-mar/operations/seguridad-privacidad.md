# Seguridad, privacidad y backups

## Control de acceso
Usuario individual por persona cuando exista autenticación. No compartir
contraseñas, tokens, códigos de recuperación ni accesos (Netlify,
analítica, Meta, Google). Principio de mínimo acceso. No otorgar acceso
administrativo completo durante la capacitación inicial.

## Protección de datos
No registrar: contraseñas de clientes, datos bancarios completos,
información médica, documentos innecesarios, conversaciones privadas no
operativas. Los datos del cliente se usan solo para responder,
presupuestar, preparar pedidos, coordinar entregas y seguimientos
autorizados.

## Backups
- Código y configuración: Git (GitHub).
- Fotos originales y material de marca: versionados en Git + copia local.
- Datos operativos (cuando existan): export diario o automatizado.
- Variables de entorno: gestor de secretos del equipo, nunca en el repo.
Verificar periódicamente que los backups se puedan restaurar.

## Secretos
Nada con prefijo NEXT_PUBLIC_ puede contener secretos. Claves privadas
(Supabase service role, APIs de IA) solo del lado servidor y solo cuando
existan esas integraciones.
