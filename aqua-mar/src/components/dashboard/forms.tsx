"use client";

import { useEffect, type ReactNode, type SelectHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { X, Plus } from "lucide-react";

/** Modal simple del panel (mobile friendly, Escape cierra). */
export function PanelModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/40 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-white p-6 shadow-lg sm:rounded-3xl dark:border-white/10 dark:bg-[#0e1b31]"
      >
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold text-ink dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex size-9 items-center justify-center rounded-xl text-ink-soft hover:bg-mist dark:text-white/60 dark:hover:bg-white/10"
          >
            <X className="size-4.5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

const FIELD_CLASS =
  "h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-ink outline-none transition-all focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white";

/** Campo de texto con etiqueta. */
export function FormField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-left text-xs font-bold text-ink dark:text-white/80">
      {label}
      <input {...props} className={FIELD_CLASS} />
    </label>
  );
}

/** Selector con etiqueta. */
export function FormSelect({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="grid gap-1.5 text-left text-xs font-bold text-ink dark:text-white/80">
      {label}
      <select {...props} className={FIELD_CLASS}>
        {children}
      </select>
    </label>
  );
}

/** Área de texto con etiqueta. */
export function FormTextarea({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-1.5 text-left text-xs font-bold text-ink dark:text-white/80">
      {label}
      <textarea
        {...props}
        rows={3}
        className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

/** Botón "Nuevo …" del encabezado de cada sección. */
export function NewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover"
    >
      <Plus className="size-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}

/** Pie del formulario: error + guardar. */
export function FormFooter({
  error,
  busy,
  submitLabel = "Guardar",
}: {
  error: string | null;
  busy: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="mt-5 grid gap-2">
      {error && (
        <p role="alert" className="text-left text-xs font-semibold text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
      >
        {busy ? "Guardando…" : submitLabel}
      </button>
    </div>
  );
}
