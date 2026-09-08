import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Este sitio pertenece a Aqua Mar, distribuidora de productos Powerful
        para Zona Oeste con envíos a todo el país. La información publicada
        tiene carácter comercial e informativo.
      </p>
      <p>
        Los pedidos y consultas se coordinan por WhatsApp. Los precios,
        disponibilidad, medios de pago y condiciones de entrega se confirman
        en cada conversación y pueden variar sin previo aviso.
      </p>
      <p>
        Powerful es una marca de sus respectivos titulares. Aqua Mar
        comercializa y distribuye productos originales conforme a la
        información comercial disponible.
      </p>
      <p>
        El uso del producto debe realizarse siguiendo las instrucciones
        impresas en el envase.
      </p>
      <p className="rounded-2xl bg-mist p-4 text-sm">
        Este texto es una plantilla editable y no constituye asesoramiento
        legal. Debe ser revisado por un profesional antes de considerarse
        definitivo.
      </p>
    </LegalPage>
  );
}
