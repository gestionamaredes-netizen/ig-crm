"use client";

import { useState, type FormEvent } from "react";
import { Boxes, TrendingUp, Truck } from "lucide-react";
import { waLink } from "@/lib/wa";
import { Reveal } from "./reveal";
import { WhatsAppIcon } from "./whatsapp-icon";

const PERKS = [
  { icon: Boxes, text: "Caja cerrada de 8 envases, precintada de fábrica" },
  { icon: TrendingUp, text: "Precio escalonado: a más volumen, mejor precio" },
  { icon: Truck, text: "Despacho por expreso a tu localidad" },
];

const inputClass =
  "w-full rounded-2xl border-2 border-deep/10 bg-white px-4 py-3 text-[15px] font-medium text-deep placeholder:text-deep/35 outline-none transition-colors focus:border-mar";

export function Wholesale() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    ciudad: "",
    telefono: "",
    mensaje: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const lineas = [
      "Hola Aqua Mar! Quiero información mayorista de Powerful.",
      form.nombre && `Nombre: ${form.nombre}`,
      form.empresa && `Empresa/comercio: ${form.empresa}`,
      form.ciudad && `Ciudad: ${form.ciudad}`,
      form.telefono && `Teléfono: ${form.telefono}`,
      form.mensaje && `Mensaje: ${form.mensaje}`,
    ].filter(Boolean);
    window.open(waLink(lineas.join("\n")), "_blank");
  }

  return (
    <section
      id="mayoristas"
      className="relative overflow-hidden bg-gradient-to-br from-ice via-white to-mar/10 py-24 lg:py-32"
    >
      <div
        aria-hidden
        className="absolute right-[-12%] top-10 size-[420px] rounded-full bg-mar/15 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-20 lg:px-6">
        <div>
          <Reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
              Mayoristas
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-deep sm:text-5xl">
              ¿Querés vender <span className="text-brand">Powerful</span>?
            </h2>
            <p className="mt-5 max-w-md text-lg text-deep/70">
              Completá el formulario y nuestro equipo comercial se comunica con
              vos con la lista de precios vigente.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-4">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-3.5">
                  <span className="inline-flex size-11 flex-none items-center justify-center rounded-2xl bg-white text-brand shadow-soft">
                    <p.icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="font-semibold text-deep/85">{p.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <form
            onSubmit={onSubmit}
            className="glass rounded-[2rem] p-7 shadow-soft sm:p-9"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-deep">
                Nombre
                <input
                  required
                  value={form.nombre}
                  onChange={set("nombre")}
                  placeholder="Tu nombre"
                  className={inputClass}
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-deep">
                Empresa
                <input
                  value={form.empresa}
                  onChange={set("empresa")}
                  placeholder="Nombre del comercio"
                  className={inputClass}
                  autoComplete="organization"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-deep">
                Ciudad
                <input
                  required
                  value={form.ciudad}
                  onChange={set("ciudad")}
                  placeholder="Ciudad / localidad"
                  className={inputClass}
                  autoComplete="address-level2"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-deep">
                Teléfono
                <input
                  value={form.telefono}
                  onChange={set("telefono")}
                  placeholder="Cod. área + número"
                  className={inputClass}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
            </div>
            <label className="mt-4 grid gap-1.5 text-sm font-bold text-deep">
              Mensaje
              <textarea
                value={form.mensaje}
                onChange={set("mensaje")}
                placeholder="Contanos qué cantidad te interesa"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </label>
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-4 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-deep"
            >
              <WhatsAppIcon className="size-5" />
              Solicitar información
            </button>
            <p className="mt-3 text-center text-xs text-deep/50">
              El formulario se envía por WhatsApp. Respondemos en el día.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
