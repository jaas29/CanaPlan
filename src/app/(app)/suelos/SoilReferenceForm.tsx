"use client";

import { useState } from "react";

interface SoilData {
  id?: number;
  sourceType: string;
  sourceName: string;
  sourceLotCode: string;
  analysisDate: string;
  year: string;
  ph: string;
  organicMatterPct: string;
  phosphorus: string;
  potassium: string;
  calcium: string;
  magnesium: string;
  acidity: string;
  iron: string;
  copper: string;
  zinc: string;
  manganese: string;
  notes: string;
}

export default function SoilReferenceForm({
  action,
  initial,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: SoilData;
  submitLabel: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: SoilData = initial ?? {
    sourceType: "ingenio",
    sourceName: "Ingenio Cutris",
    sourceLotCode: "",
    analysisDate: "",
    year: "",
    ph: "",
    organicMatterPct: "",
    phosphorus: "",
    potassium: "",
    calcium: "",
    magnesium: "",
    acidity: "",
    iron: "",
    copper: "",
    zinc: "",
    manganese: "",
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

      {/* Source info */}
      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-[20px] text-amber-600">info</span>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Este es un analisis de <strong>referencia</strong>. Registre la fuente original y los valores que se usaran como proxy para sus lotes.
          </p>
        </div>

        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4">Fuente del Analisis</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Tipo de fuente *</label>
            <select name="sourceType" defaultValue={defaults.sourceType} className={inputClass}>
              <option value="ingenio">Ingenio</option>
              <option value="externo">Laboratorio Externo</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Nombre de la fuente *</label>
            <input
              type="text"
              name="sourceName"
              required
              defaultValue={defaults.sourceName}
              placeholder="Ej: Ingenio Cutris"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Codigo lote origen</label>
            <input
              type="text"
              name="sourceLotCode"
              defaultValue={defaults.sourceLotCode}
              placeholder="Ej: F40L8A"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ano</label>
            <input
              type="number"
              name="year"
              defaultValue={defaults.year}
              placeholder="Ej: 2025"
              min={2000}
              max={2100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fecha del analisis</label>
            <input
              type="date"
              name="analysisDate"
              defaultValue={defaults.analysisDate}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Soil values */}
      <div className="mt-6 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4">Valores del Analisis (opcionales)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { name: "ph", label: "pH", placeholder: "Ej: 5.8" },
            { name: "organicMatterPct", label: "M.O. (%)", placeholder: "Ej: 3.5" },
            { name: "phosphorus", label: "P (mg/L)", placeholder: "Ej: 12.5" },
            { name: "potassium", label: "K (cmol/L)", placeholder: "Ej: 0.35" },
            { name: "calcium", label: "Ca (cmol/L)", placeholder: "Ej: 8.2" },
            { name: "magnesium", label: "Mg (cmol/L)", placeholder: "Ej: 2.1" },
            { name: "acidity", label: "Acidez (cmol/L)", placeholder: "Ej: 0.45" },
            { name: "iron", label: "Fe (mg/L)", placeholder: "Ej: 120" },
            { name: "copper", label: "Cu (mg/L)", placeholder: "Ej: 8.5" },
            { name: "zinc", label: "Zn (mg/L)", placeholder: "Ej: 3.2" },
            { name: "manganese", label: "Mn (mg/L)", placeholder: "Ej: 45" },
          ].map((field) => (
            <div key={field.name}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="number"
                name={field.name}
                step="any"
                defaultValue={(defaults as unknown as Record<string, string>)[field.name]}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <div>
          <label className={labelClass}>Notas / Observaciones</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={defaults.notes}
            placeholder="Observaciones sobre este analisis de referencia, supuestos de similitud, etc."
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <a
          href="/suelos"
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
