# Reclamos e incidentes

## Recepción
"Lamentamos el inconveniente. Vamos a revisar el caso para darte una
respuesta precisa."
Solicitar solo: número de pedido, nombre, descripción, fotografías si
hacen falta, estado del packaging, fecha de recepción.

## Clasificación
producto_danado · pedido_incompleto · producto_incorrecto · demora ·
problema_logistico · problema_de_pago · atencion · otro.

## Proceso
Reclamo recibido → caso registrado → evidencia revisada → responsable
asignado → solución aprobada → cliente informado → caso cerrado.
No reconocer responsabilidad legal ni prometer compensaciones sin
revisión del supervisor.

## Incidentes de seguridad del producto
Ante consultas por ingestión, contacto con ojos, reacción física, uso por
menores o daño accidental: NO improvisar recomendaciones médicas.
Indicar: "Seguí las advertencias e instrucciones del envase y buscá
asistencia profesional o de emergencias según la situación." Escalar de
inmediato. No atribuir propiedades médicas al producto.

## Registro de incidentes (técnicos u operativos)
Fecha y hora · descripción · impacto · usuarios afectados · responsable ·
acciones · resolución · causa · prevención futura. No borrar evidencia
antes de entender el incidente.

## Severidad de errores en producción
- **Crítico**: web caída, pedidos mal enviados, exposición de datos,
  error de precios, WhatsApp roto, acceso no autorizado.
- **Alto**: formulario roto, producto equivocado, problema mobile,
  analítica duplicada.
- **Medio**: texto incorrecto, desalineación, error menor de navegación.
- **Bajo**: ajustes estéticos, copy, optimizaciones.

## Caída de la web
Detectar → verificar Netlify → revisar último deploy → dominio/DNS →
logs → restaurar versión estable → confirmar → documentar causa.
Mientras tanto, sostener la atención por WhatsApp. No hacer múltiples
cambios sin identificar la causa.
