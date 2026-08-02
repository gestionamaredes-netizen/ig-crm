import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Aqua Mar utiliza los datos de contacto que compartís (nombre, WhatsApp,
        localidad y contenido de tu consulta) únicamente para responder
        consultas, preparar pedidos, coordinar entregas y realizar los
        seguimientos que solicites.
      </p>
      <p>
        No vendemos ni compartimos tu información con terceros, salvo los
        servicios necesarios para concretar una entrega (por ejemplo, empresas
        de transporte) o cuando la ley lo requiera.
      </p>
      <p>
        Las consultas se gestionan por WhatsApp: la conversación queda sujeta
        también a las políticas de privacidad de esa plataforma.
      </p>
      <p>
        Si querés que eliminemos tus datos de contacto de nuestros registros,
        escribinos por WhatsApp o por correo y lo hacemos a la brevedad.
      </p>
      <p className="rounded-2xl bg-mist p-4 text-sm">
        Este texto es una plantilla editable y no constituye asesoramiento
        legal. Debe ser revisado por un profesional antes de considerarse
        definitivo.
      </p>
    </LegalPage>
  );
}
