"use client";

import { useState } from "react";

interface VarietyData {
  id?: number;
  displayName: string;
  notes: string;
  isActive?: boolean;
}

export default function VarietyForm({
  action,
  initial,
  submitLabel,
  showActiveToggle = false,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: VarietyData;
  submitLabel: string;
  showActiveToggle?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: VarietyData = initial ?? {
    displayName: "",
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre de la variedad *</label>
            <input
              type="text"
              name="displayName"
              required
              defaultValue={defaults.displayName}
              placeholder="Ej: B 80-408"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <input
              type="text"
              name="notes"
              defaultValue={defaults.notes}
              placeholder="Observaciones opcionales..."
              className={inputClass}
            />
          </div>

          {showActiveToggle && (
            <div className="flex items-center gap-3">
              <label className={labelClass}>Estado</label>
              <select
                name="isActive"
                defaultValue={defaults.isActive !== false ? "true" : "false"}
                className={inputClass}
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/variedades"
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
