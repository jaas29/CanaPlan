"use client";

import { useState } from "react";

interface VarietyOption {
  id: number;
  displayName: string;
}

interface LotData {
  id?: number;
  displayName: string;
  farmGroup: string;
  varietyId: string;
  areaHa: string;
  lifecycleStatus: string;
  harvestCycleCount: string;
  soilReferenceZone: string;
  notes: string;
}

const LIFECYCLE_OPTIONS = [
  { value: "planta", label: "Planta" },
  { value: "soca", label: "Soca" },
  { value: "barbecho", label: "Barbecho" },
];

export default function LotForm({
  action,
  initial,
  submitLabel,
  varieties,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: LotData;
  submitLabel: string;
  varieties: VarietyOption[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: LotData = initial ?? {
    displayName: "",
    farmGroup: "ARAZAM",
    varietyId: "",
    areaHa: "",
    lifecycleStatus: "soca",
    harvestCycleCount: "0",
    soilReferenceZone: "",
    notes: "",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
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
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>Nombre del lote *</label>
            <input
              type="text"
              name="displayName"
              required
              defaultValue={defaults.displayName}
              placeholder="Ej: Nicolas Garcia"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Grupo / Finca</label>
            <input
              type="text"
              name="farmGroup"
              defaultValue={defaults.farmGroup}
              placeholder="Ej: ARAZAM"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Variedad</label>
            <select name="varietyId" defaultValue={defaults.varietyId} className={inputClass}>
              <option value="">Sin especificar</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>{v.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Area (ha) *</label>
            <input
              type="number"
              name="areaHa"
              required
              min={0.01}
              step={0.01}
              defaultValue={defaults.areaHa}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Estado del ciclo</label>
            <select name="lifecycleStatus" defaultValue={defaults.lifecycleStatus} className={inputClass}>
              {LIFECYCLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Numero de cosechas</label>
            <input
              type="number"
              name="harvestCycleCount"
              min={0}
              defaultValue={defaults.harvestCycleCount}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Zona de referencia de suelo</label>
            <input
              type="text"
              name="soilReferenceZone"
              defaultValue={defaults.soilReferenceZone}
              placeholder="Ej: F40L8A"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Notas</label>
            <input
              type="text"
              name="notes"
              defaultValue={defaults.notes}
              placeholder="Observaciones del lote..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/lotes"
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
