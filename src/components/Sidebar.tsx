"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/",             label: "Panel",         icon: "dashboard" },
  { href: "/lotes",        label: "Lotes",         icon: "grass" },
  { href: "/planes",       label: "Planes",        icon: "assignment" },
  { href: "/aplicaciones", label: "Aplicaciones",  icon: "agriculture" },
  { href: "/planes/comparar", label: "Plan vs Real", icon: "compare_arrows" },
  { href: "/resultados",   label: "Resultados",    icon: "trending_up" },
  { href: "/simulador",    label: "Simulador",     icon: "tune" },
  { href: "/formulas",     label: "Formulas",      icon: "science" },
  { href: "/reportes",     label: "Reportes",      icon: "bar_chart" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)]">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
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

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-0.5 px-3">
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
  );
}
