"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Boxes,
  Package,
  Map,
  BarChart3,
  Megaphone,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Database,
  LogOut,
} from "lucide-react";
import { useDashboardData } from "@/dashboard/service";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DemoBanner } from "./widgets";

const NAV = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/panel/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/panel/clientes", label: "Clientes", icon: Users },
  { href: "/panel/mayoristas", label: "Mayoristas", icon: Boxes },
  { href: "/panel/productos", label: "Productos", icon: Package },
  { href: "/panel/cobertura", label: "Cobertura", icon: Map },
  { href: "/panel/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/panel/marketing", label: "Marketing", icon: Megaphone },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
];

const MOBILE_NAV = NAV.slice(0, 4).concat(NAV[8]);

/** Shell del panel: sidebar + topbar en desktop, bottom nav en mobile. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isDemo, setDemo, ready, error } = useDashboardData();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aquamar_panel_dark") === "1";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("aquamar_panel_dark", next ? "1" : "0");
  };

  const current = NAV.find(
    (n) => pathname === n.href || (n.href !== "/panel" && pathname.startsWith(n.href))
  );

  return (
    <div className="flex min-h-svh overflow-x-clip bg-bg dark:bg-[#0b1526]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-svh w-60 flex-none flex-col border-r border-border bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0e1b31] lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2" aria-label="Ir al sitio público">
          <Image
            src="/branding/aqua-mar-logo.jpg"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold text-navy dark:text-white">
              AQUA MAR
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-primary dark:text-turquesa">
              Panel interno
            </span>
          </span>
        </Link>

        <nav aria-label="Panel" className="mt-8 grid gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/panel" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-celeste/70 text-primary dark:bg-white/10 dark:text-turquesa"
                    : "text-ink-soft hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className="size-4.5" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-auto px-2 text-[10px] leading-relaxed text-ink-soft/70 dark:text-white/35">
          {isSupabaseConfigured
            ? "Panel interno de Aqua Mar. Los datos se guardan en la base compartida del equipo."
            : "Panel interno de Aqua Mar. Proteger el acceso antes de conectar datos reales."}
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-white/85 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0e1b31]/85 sm:px-6">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink dark:text-white">
            <span className="text-ink-soft dark:text-white/50">Panel / </span>
            {current?.label ?? "Dashboard"}
          </p>

          <label className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
            <input
              type="search"
              placeholder="Buscar"
              aria-label="Buscar en el panel"
              className="h-10 w-56 rounded-xl border border-border bg-mist/60 pl-9 pr-3 text-sm text-ink outline-none transition-all focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          {isSupabaseConfigured ? (
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:inline-flex dark:bg-emerald-500/15 dark:text-emerald-300">
              <Database className="size-3.5" />
              Base conectada
            </span>
          ) : (
            ready && (
              <label className="flex items-center gap-2 text-xs font-bold text-ink-soft dark:text-white/60">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setDemo(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Modo demo
              </label>
            )
          )}

          <button
            onClick={toggleDark}
            aria-label={dark ? "Activar tema claro" : "Activar tema oscuro"}
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink-soft hover:bg-mist dark:text-white/60 dark:hover:bg-white/10"
          >
            {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>

          <button
            aria-label="Notificaciones"
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink-soft hover:bg-mist dark:text-white/60 dark:hover:bg-white/10"
          >
            <Bell className="size-4.5" />
          </button>

          <span
            aria-label="Usuario"
            className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-turquesa font-display text-xs font-extrabold text-white"
          >
            AM
          </span>

          {isSupabaseConfigured && (
            <button
              onClick={() => getSupabase()?.auth.signOut()}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="inline-flex size-10 items-center justify-center rounded-xl text-ink-soft hover:bg-mist dark:text-white/60 dark:hover:bg-white/10"
            >
              <LogOut className="size-4.5" />
            </button>
          )}
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-8">
          <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-4">
            <DemoBanner visible={ready && isDemo} />
            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}
            {children}
          </div>
        </main>

        {/* Bottom navigation mobile */}
        <nav
          aria-label="Panel (mobile)"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#0e1b31]/95 lg:hidden"
        >
          {MOBILE_NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/panel" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold ${
                  active ? "text-primary dark:text-turquesa" : "text-ink-soft dark:text-white/50"
                }`}
              >
                <item.icon className="size-5" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
