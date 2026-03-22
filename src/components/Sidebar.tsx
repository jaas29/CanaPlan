"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/",             label: "Panel",         icon: "dashboard" },
  { href: "/lotes",        label: "Lotes",         icon: "grass" },
  { href: "/planes",       label: "Planes",        icon: "assignment" },
  { href: "/aplicaciones/rapida", label: "Registro Rapido", icon: "bolt" },
  { href: "/aplicaciones", label: "Aplicaciones",  icon: "agriculture" },
  { href: "/planes/comparar", label: "Plan vs Real", icon: "compare_arrows" },
  { href: "/resultados",   label: "Resultados",    icon: "trending_up" },
  { href: "/simulador",    label: "Simulador",     icon: "tune" },
  { href: "/formulas",     label: "Formulas",      icon: "science" },
  { href: "/variedades",  label: "Variedades",    icon: "park" },
  { href: "/suelos",      label: "Suelos Ref.",   icon: "landscape" },
  { href: "/compras",      label: "Compras",       icon: "shopping_cart" },
  { href: "/reportes",     label: "Reportes",      icon: "bar_chart" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 bg-[var(--color-sidebar)] px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-white hover:bg-white/10 transition-colors"
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <span className="material-symbols-outlined text-[22px] text-emerald-300">eco</span>
        <h1 className="text-base font-extrabold tracking-tight text-white">
          CanaP<span className="text-emerald-300">lan</span>
        </h1>
      </div>

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] transition-transform duration-200 ease-in-out",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0 lg:z-30"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-emerald-300">
              eco
            </span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                CanaP<span className="text-emerald-300">lan</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400/70">
                Gestion de Fertilizacion
              </p>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Cerrar menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : href === "/planes/comparar"
                  ? pathname === "/planes/comparar"
                  : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-sidebar-hover)] text-[var(--color-sidebar-text-active)]"
                    : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs text-emerald-400/50">ARAZAM &middot; v0.1</p>
        </div>
      </aside>
    </>
  );
}
