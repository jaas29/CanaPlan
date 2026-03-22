"use client";

import { useState } from "react";
import { linkLotToSoilReference } from "../actions";

export default function LinkLotForm({
  soilRefId,
  lots,
}: {
  soilRefId: number;
  lots: { id: number; displayName: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5";

  return (
    <form
      className="mt-4 rounded-lg border border-dashed border-[var(--color-outline-variant)]/40 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
          const fd = new FormData(e.currentTarget);
          await linkLotToSoilReference(fd);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error al vincular");
          setSubmitting(false);
        }
      }}
    >
      <input type="hidden" name="soilRefId" value={soilRefId} />

      <h3 className="text-xs font-bold text-[var(--color-on-surface)] mb-3">
        Vincular un lote a este analisis de referencia
      </h3>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Lote *</label>
          <select name="lotId" required className={inputClass}>
            <option value="">Seleccionar lote...</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>{l.displayName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Observacion de similitud</label>
          <input
            type="text"
            name="mappingNote"
            placeholder="Ej: Suelos similares, misma zona"
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            {submitting ? "Vinculando..." : "Vincular"}
          </button>
        </div>
      </div>
    </form>
  );
}
