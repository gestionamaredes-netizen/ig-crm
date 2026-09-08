"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, RotateCcw, Send } from "lucide-react";
import { assistantConfig } from "@/config/assistant";
import { assistantProvider } from "@/ai/provider";
import { INITIAL_STATE, type ConversationState } from "@/ai/assistant/conversation";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/analytics/track-event";
import { WhatsAppIcon } from "@/components/ui/icons";

type Message = { role: "assistant" | "user"; text: string };

const INITIAL_MESSAGES: Message[] = [{ role: "assistant", text: assistantConfig.welcome }];
const INITIAL_REPLIES = [
  "Ver presentaciones",
  "Comprar para uso personal",
  "Consultar por mayor",
  "Consultar cobertura",
  "Hablar por WhatsApp",
];

/** Aqua IA: asistente comercial con reglas locales. No almacena
 * conversaciones; todo vive en memoria durante la sesión. */
export function AquaAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [state, setState] = useState<ConversationState>(INITIAL_STATE);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_REPLIES);
  const [waMessage, setWaMessage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openChat() {
    setOpen(true);
    trackEvent({ name: "assistant_open", category: "assistant" });
  }
  function close() {
    setOpen(false);
    trackEvent({ name: "assistant_close", category: "assistant" });
  }
  function reset() {
    setMessages(INITIAL_MESSAGES);
    setState(INITIAL_STATE);
    setQuickReplies(INITIAL_REPLIES);
    setWaMessage(null);
    trackEvent({ name: "assistant_reset", category: "assistant" });
  }

  async function send(text: string, fromQuickReply = false) {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setQuickReplies([]);
    setWaMessage(null);
    setTyping(true);
    if (fromQuickReply) {
      trackEvent({ name: "assistant_quick_reply", category: "assistant", label: clean });
    }

    const res = await assistantProvider.generateResponse({ text: clean, state });
    await new Promise((r) => setTimeout(r, 450));
    setTyping(false);
    setMessages((m) => [...m, ...res.messages.map((t) => ({ role: "assistant" as const, text: t }))]);
    setState(res.state);
    setQuickReplies(res.quickReplies ?? []);
    setWaMessage(res.whatsappMessage ?? null);
    if (res.intent) {
      trackEvent({ name: "assistant_intent", category: "assistant", label: res.intent });
    }
    if (res.handoff) {
      trackEvent({ name: "assistant_handoff", category: "assistant" });
    }
  }

  function openWhatsApp() {
    if (!waMessage) return;
    const url = getWhatsAppUrl(waMessage);
    trackEvent({ name: "assistant_whatsapp_click", category: "assistant" });
    if (url) {
      window.open(url, "_blank");
    } else {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "El canal de WhatsApp todavía no está configurado. Podés utilizar el formulario de contacto.",
        },
      ]);
    }
  }

  if (!assistantConfig.enabled) return null;

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={openChat}
          aria-label={`Abrir ${assistantConfig.name}, ${assistantConfig.descriptor}`}
          className="fixed bottom-5 left-5 z-50 inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-navy px-5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
        >
          <Sparkles className="size-4.5 text-turquesa" />
          {assistantConfig.name}
        </button>
      )}

      {/* Ventana */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${assistantConfig.name}, ${assistantConfig.descriptor}`}
          className="fixed inset-0 z-[75] flex flex-col bg-white sm:inset-auto sm:bottom-5 sm:left-5 sm:h-[600px] sm:max-h-[80svh] sm:w-[380px] sm:rounded-3xl sm:border sm:border-border sm:shadow-xl"
        >
          {/* Header */}
          <header className="flex items-center gap-3 rounded-t-none border-b border-border bg-navy px-4 py-3.5 text-white sm:rounded-t-3xl">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="size-5 text-turquesa" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-extrabold">{assistantConfig.name}</p>
              <p className="text-[11px] text-white/60">{assistantConfig.descriptor}</p>
            </div>
            <button
              onClick={reset}
              aria-label="Reiniciar conversación"
              className="inline-flex size-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={close}
              aria-label="Cerrar asistente"
              className="inline-flex size-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </header>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-bg px-4 py-4">
            <p className="mb-3 rounded-2xl bg-mist px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
              {assistantConfig.privacyNote}
            </p>
            <div className="grid gap-2.5">
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "justify-self-end rounded-br-lg bg-primary text-white"
                      : "justify-self-start rounded-bl-lg border border-border bg-white text-ink shadow-xs"
                  }`}
                >
                  {m.text}
                </p>
              ))}
              {typing && (
                <p
                  aria-label="Aqua IA está escribiendo"
                  className="justify-self-start rounded-3xl rounded-bl-lg border border-border bg-white px-4 py-3 shadow-xs"
                >
                  <span className="inline-flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-ink-soft/50 [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-ink-soft/50 [animation-delay:120ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-ink-soft/50 [animation-delay:240ms]" />
                  </span>
                </p>
              )}
            </div>

            {/* Botón de WhatsApp cuando hay mensaje preparado */}
            {waMessage && !typing && (
              <button
                onClick={openWhatsApp}
                className="mt-3 inline-flex w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#25d366] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
              >
                <WhatsAppIcon className="size-5" />
                Continuar por WhatsApp
              </button>
            )}

            {/* Respuestas rápidas */}
            {quickReplies.length > 0 && !typing && (
              <div className="mt-3 flex flex-wrap gap-2">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q, true)}
                    className="rounded-full border border-primary/25 bg-white px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-celeste/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border bg-white p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta"
              aria-label="Escribí tu consulta para Aqua IA"
              maxLength={300}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-mist/50 px-4 text-sm text-ink outline-none transition-all focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!input.trim() || typing}
              className="inline-flex size-12 flex-none items-center justify-center rounded-2xl bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              <Send className="size-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
