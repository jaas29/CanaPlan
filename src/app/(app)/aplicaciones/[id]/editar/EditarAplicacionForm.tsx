"use client";

import { useState } from "react";
import { updateApplicationRecord } from "../../actions";

interface Formula {
  id: number;
  name: string;
}

interface RecordData {
  id: number;
  lotName: string;
  formulaId: number;
  actualDate: string;
  actualSacks: number;
  operatorName: string | null;
  observations: string | null;
  planInfo: string | null;
}

export default function EditarAplicacionForm({
  record,
  formulas,
}: {
  record: RecordData;
  formulas: Formula[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("recordId", String(record.id));
      await updateApplicationRecord(fd);
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

      {record.planInfo && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-1">
            Vinculada a plan
          </p>
          <p className="text-sm text-blue-700">{record.planInfo}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Lote</label>
            <div className="flex h-[42px] items-center rounded-lg border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-dim)] px-3 text-sm text-[var(--color-on-surface)]">
              {record.lotName}
            </div>
          </div>

          <div>
            <label className={labelClass}>Formula</label>
            <select name="formulaId" required defaultValue={record.formulaId} className={inputClass}>
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha de aplicacion</label>
            <input
              type="date"
              name="actualDate"
              required
              defaultValue={record.actualDate}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Sacos aplicados (total)</label>
            <input
              type="number"
              name="actualSacks"
              required
              min={0}
              step={0.5}
              defaultValue={record.actualSacks}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Operador (opcional)</label>
            <input
              type="text"
              name="operatorName"
              defaultValue={record.operatorName ?? ""}
              placeholder="Nombre del operador..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Observaciones (opcional)</label>
            <input
              type="text"
              name="observations"
              defaultValue={record.observations ?? ""}
              placeholder="Notas de campo..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/aplicaciones"
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
          {submitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
