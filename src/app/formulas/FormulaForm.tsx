"use client";

import { useState } from "react";

interface FormulaData {
  id?: number;
  name: string;
  nPct: number;
  p2o5Pct: number;
  k2oPct: number;
  sPct: number;
  mgoPct: number;
  caoPct: number;
  kgPerSack: number;
  costPerSack: number | null;
  nitrogenSource: string;
}

export default function FormulaForm({
  initial,
  action,
  submitLabel,
}: {
  initial?: FormulaData;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      if (initial?.id) fd.set("id", String(initial.id));
      await action(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre de la formula</label>
            <input type="text" name="name" required defaultValue={initial?.name ?? ""} placeholder="Ej: 13-21.3-18-2.4(S)" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Fuente de nitrogeno (opcional)</label>
            <input type="text" name="nitrogenSource" defaultValue={initial?.nitrogenSource ?? ""} placeholder="Ej: Nitrato de amonio" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>kg / saco</label>
              <input type="number" name="kgPerSack" required min={1} step={0.1} defaultValue={initial?.kgPerSack ?? 50} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Costo / saco (CRC)</label>
              <input type="number" name="costPerSack" min={0} step={1} defaultValue={initial?.costPerSack ?? ""} placeholder="Opcional" className={inputClass} />
            </div>
          </div>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-bold text-[var(--color-on-surface)]">
          Composicion (%)
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "nPct", label: "N %", val: initial?.nPct },
            { name: "p2o5Pct", label: "P2O5 %", val: initial?.p2o5Pct },
            { name: "k2oPct", label: "K2O %", val: initial?.k2oPct },
            { name: "sPct", label: "S %", val: initial?.sPct },
            { name: "mgoPct", label: "MgO %", val: initial?.mgoPct },
            { name: "caoPct", label: "CaO %", val: initial?.caoPct },
          ].map((f) => (
            <div key={f.name}>
              <label className={labelClass}>{f.label}</label>
              <input type="number" name={f.name} min={0} max={100} step={0.01} defaultValue={f.val ?? 0} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/formulas"
          className="rounded-lg border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {submitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
