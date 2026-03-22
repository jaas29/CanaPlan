"use client";

import { useState } from "react";
import { createApplicationRecord } from "../actions";

interface Lot {
  id: number;
  displayName: string;
  areaHa: number;
}

interface Formula {
  id: number;
  name: string;
}

interface Prefill {
  planApplicationId: number;
  lotId: number;
  lotName: string;
  formulaId: number;
  formulaName: string;
  plannedSacks: number;
  sacksPerHa: number;
  applicationNumber: number;
  seasonName: string;
}

export default function RegistrarAplicacionForm({
  lots,
  formulas,
  prefill,
}: {
  lots: Lot[];
  formulas: Formula[];
  prefill: Prefill | null;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await createApplicationRecord(fd);
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5";

  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden field for plan link */}
      {prefill && (
        <input type="hidden" name="planApplicationId" value={prefill.planApplicationId} />
      )}

      {/* Reference info when linked to a plan */}
      {prefill && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-1">
            Aplicacion planificada
          </p>
          <p className="text-sm text-blue-700">
            {prefill.formulaName} &middot; {prefill.sacksPerHa} sacos/ha &middot; {prefill.plannedSacks.toFixed(0)} sacos total
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-5">
          Datos de la Aplicacion
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Lote</label>
            {prefill ? (
              <>
                <input type="hidden" name="lotId" value={prefill.lotId} />
                <div className="flex h-[42px] items-center rounded-lg border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-dim)] px-3 text-sm text-[var(--color-on-surface)]">
                  {prefill.lotName}
                </div>
              </>
            ) : (
              <select name="lotId" required className={inputClass}>
                <option value="">Seleccionar lote...</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayName} ({l.areaHa} ha)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Formula</label>
            {prefill ? (
              <>
                <input type="hidden" name="formulaId" value={prefill.formulaId} />
                <div className="flex h-[42px] items-center rounded-lg border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-dim)] px-3 text-sm text-[var(--color-on-surface)]">
                  {prefill.formulaName}
                </div>
              </>
            ) : (
              <select name="formulaId" required className={inputClass}>
                <option value="">Seleccionar formula...</option>
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Fecha de aplicacion</label>
            <input
              type="date"
              name="actualDate"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Sacos aplicados (total)
              {prefill && (
                <span className="ml-1 font-normal normal-case text-[var(--color-on-surface-variant)]">
                  &middot; planificado: {prefill.plannedSacks.toFixed(0)}
                </span>
              )}
            </label>
            <input
              type="number"
              name="actualSacks"
              required
              min={0}
              step={0.5}
              defaultValue={prefill ? prefill.plannedSacks.toFixed(0) : ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Operador (opcional)</label>
            <input
              type="text"
              name="operatorName"
              placeholder="Nombre del operador..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Observaciones (opcional)</label>
            <input
              type="text"
              name="observations"
              placeholder="Notas de campo..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
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
          <span className="material-symbols-outlined text-[18px]">check</span>
          {submitting ? "Guardando..." : "Registrar Aplicacion"}
        </button>
      </div>
    </form>
  );
}
