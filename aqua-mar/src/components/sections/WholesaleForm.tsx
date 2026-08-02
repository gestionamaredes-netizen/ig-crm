"use client";

import { useState, type FormEvent } from "react";
import { content } from "@/data/content";
import { commerceConfig } from "@/config/commerce";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/analytics/track-event";
import { Input, Textarea } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/buttons";
import { WhatsAppIcon } from "@/components/ui/icons";

type FormState = {
  nombre: string;
  empresa: string;
  ciudad: string;
  whatsapp: string;
  cantidad: string;
  mensaje: string;
  consent: boolean;
  website: string; // honeypot
};

const INITIAL: FormState = {
  nombre: "",
  empresa: "",
  ciudad: "",
  whatsapp: "",
  cantidad: "",
  mensaje: "",
  consent: false,
  website: "",
};

/** Formulario mayorista: valida, arma el mensaje y abre WhatsApp.
 * No guarda datos en servidores ni los envía a analítica. */
export function WholesaleForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const w = content.wholesale;

  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.nombre.trim()) next.nombre = "Ingresá tu nombre.";
    if (!form.ciudad.trim()) next.ciudad = "Ingresá tu ciudad o provincia.";
    if (form.whatsapp && form.whatsapp.replace(/\D/g, "").length < 8)
      next.whatsapp = "Revisá el número ingresado.";
    if (!form.consent) next.consent = "Necesitamos tu autorización para responderte.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return; // evita doble envío
    if (form.website) return; // honeypot: bot detectado, se ignora en silencio
    if (!validate()) {
      setStatus("error");
      return;
    }
    setStatus("sending");

    const lines = [
      "Hola Aqua Mar. Quiero recibir información para comprar Powerful por mayor.",
      `Nombre: ${form.nombre.trim()}`,
      form.empresa.trim() && `Comercio o emprendimiento: ${form.empresa.trim()}`,
      `Ciudad o provincia: ${form.ciudad.trim()}`,
      form.whatsapp.trim() && `WhatsApp de contacto: ${form.whatsapp.trim()}`,
      form.cantidad && `Cantidad estimada: ${form.cantidad}`,
      form.mensaje.trim() && `Mensaje: ${form.mensaje.trim()}`,
    ].filter(Boolean);

    const url = getWhatsAppUrl(lines.join("\n"));
    trackEvent({
      name: "wholesale_form_submit",
      category: "commerce",
      params: { form: "wholesale", intent: "wholesale" },
    });

    if (url) {
      window.open(url, "_blank");
      setStatus("success");
      setForm(INITIAL);
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-3xl p-7 shadow-md sm:p-9">
      <p className="mb-5 text-sm text-ink-soft">{w.formNote}</p>

      {/* honeypot invisible para bots */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          No completar
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Tu nombre"
          autoComplete="name"
          required
          error={errors.nombre}
        />
        <Input
          label="Empresa o emprendimiento"
          name="empresa"
          value={form.empresa}
          onChange={set("empresa")}
          placeholder="Nombre del comercio"
          autoComplete="organization"
        />
        <Input
          label="Ciudad o provincia"
          name="ciudad"
          value={form.ciudad}
          onChange={set("ciudad")}
          placeholder="Ej.: Morón, Buenos Aires"
          autoComplete="address-level2"
          required
          error={errors.ciudad}
        />
        <Input
          label="WhatsApp"
          name="whatsapp"
          value={form.whatsapp}
          onChange={set("whatsapp")}
          placeholder="Cod. área + número"
          autoComplete="tel"
          inputMode="tel"
          error={errors.whatsapp}
        />
      </div>

      <label className="mt-4 grid gap-1.5 text-sm font-bold text-ink" htmlFor="cantidad">
        Cantidad estimada
        <select
          id="cantidad"
          value={form.cantidad}
          onChange={set("cantidad")}
          className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] font-medium text-ink outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
        >
          <option value="">Seleccioná un rango</option>
          {commerceConfig.quantityOptions.wholesale.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <Textarea
          label="Mensaje"
          name="mensaje"
          value={form.mensaje}
          onChange={set("mensaje")}
          placeholder="Contanos sobre tu negocio"
          rows={3}
        />
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-0.5 size-4 accent-primary"
        />
        {w.consent}
      </label>
      {errors.consent && (
        <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {errors.consent}
        </p>
      )}

      <div className="mt-6">
        <SubmitButton disabled={status === "sending"}>
          <WhatsAppIcon className="size-5" />
          {w.cta}
        </SubmitButton>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-center text-sm">
        {status === "success" && <span className="font-semibold text-turquesa">{w.success}</span>}
        {status === "error" && Object.keys(errors).length > 0 && (
          <span className="font-semibold text-red-600">{w.error}</span>
        )}
      </p>
    </form>
  );
}
