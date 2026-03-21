"use client";

import { useState } from "react";
import { createYieldResult } from "../actions";

interface Lot { id: number; displayName: string; areaHa: number }
interface Season { id: number; name: string }

export default function ResultadoForm({
  lots,
  seasons,
  prefillLotId,
  prefillSeasonId,
  prefillTargetTch,
}: {
  lots: Lot[];
  seasons: Season[];
  prefillLotId: string;
  prefillSeasonId: string;
  prefillTargetTch: number | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      await createYieldResult(fd);
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>Lote</label>
            <select name="lotId" required defaultValue={prefillLotId} className={inputClass}>
              <option value="">Seleccionar lote...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>{l.displayName} ({l.areaHa} ha)</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Zafra</label>
            <select name="harvestSeasonId" required defaultValue={prefillSeasonId} className={inputClass}>
              <option value="">Seleccionar zafra...</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>TCH Real</label>
            <input type="number" name="actualTch" required min={1} step={0.1} className={inputClass} />
            {prefillTargetTch && (
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                Meta planificada: {prefillTargetTch} TCH
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Fecha de cosecha</label>
            <input type="date" name="harvestDate" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Notas</label>
            <input type="text" name="notes" placeholder="Observaciones..." className={inputClass} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/resultados"
          className="rounded-lg border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">check</span>
          {submitting ? "Guardando..." : "Registrar Resultado"}
        </button>
      </div>
    </form>
  );
}
