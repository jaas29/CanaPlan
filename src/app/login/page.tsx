"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Contrasena incorrecta");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)]">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-emerald-600">
                eco
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
                  CanaP<span className="text-emerald-600">lan</span>
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Gestion de Fertilizacion
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Ingrese la contrasena"
                className="w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-3 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] text-[var(--color-on-surface-variant)]">
            ARAZAM &middot; v0.2
          </p>
        </div>
      </div>
    </div>
  );
}
