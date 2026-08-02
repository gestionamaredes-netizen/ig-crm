# Consultas minoristas: derivación

Aqua Mar vende exclusivamente al por mayor, por bulto cerrado de 12
envases. No hay venta por unidad ni al público.

Cuando alguien consulta para uso personal:

1. **Responder con claridad y amabilidad** (plantilla "respuesta
   minorista" en `src/commerce/messages.ts` y en plantillas.md):
   informar que la venta es solo mayorista por bulto cerrado.
2. **Detectar oportunidad**: si la persona tiene comercio, kiosco,
   almacén o emprendimiento, ofrecer la vía mayorista y pedir los datos
   del protocolo mayorista.
3. **Registro**: si no hay oportunidad mayorista, cerrar la consulta sin
   crear pedido. Si la hay, cargarla como consulta mayorista en el panel.

No prometer venta por unidad "por esta vez": rompe el modelo comercial y
genera reclamos.
