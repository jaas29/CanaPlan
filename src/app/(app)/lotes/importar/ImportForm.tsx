"use client";

import { useState } from "react";
import { parseExcel, importLots, type ParsedLot } from "./actions";

export default function ImportForm() {
  const [preview, setPreview] = useState<ParsedLot[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setParsing(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await parseExcel(fd);
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al leer archivo");
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("lots", JSON.stringify(preview));
      await importLots(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
      setImporting(false);
    }
  };

  const validCount = preview?.filter((l) => !l.error && !l.isDuplicate).length ?? 0;
  const dupCount = preview?.filter((l) => l.isDuplicate).length ?? 0;
  const errorCount = preview?.filter((l) => l.error).length ?? 0;

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-primary)]";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-2">
          1. Seleccionar archivo
        </h2>
        <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
          Formato esperado: columnas ID, Nom_Finca, Cosechas, Variedad, Area (ha)
        </p>
        <form onSubmit={handleParse} className="flex items-end gap-3">
          <div className="flex-1">
            <input type="file" name="file" accept=".xlsx,.xls,.csv" required className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={parsing}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            {parsing ? "Leyendo..." : "Leer Archivo"}
          </button>
        </form>
      </div>

      {/* Step 2: Preview */}
      {preview && (
        <>
          <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--color-on-surface)]">
                2. Vista previa ({preview.length} filas)
              </h2>
              <div className="flex gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {validCount} nuevos
                </span>
                {dupCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    {dupCount} duplicados
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    {errorCount} errores
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/20">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Fila</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Nombre</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Grupo</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Variedad</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Area</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Cosechas</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Estado</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                  {preview.map((lot) => (
                    <tr
                      key={`${lot.rowNum}-${lot.displayName}`}
                      className={
                        lot.error
                          ? "bg-red-50/50"
                          : lot.isDuplicate
                          ? "bg-amber-50/50"
                          : ""
                      }
                    >
                      <td className="px-3 py-2 text-[var(--color-on-surface-variant)]">{lot.rowNum}</td>
                      <td className="px-3 py-2 font-medium">{lot.displayName}</td>
                      <td className="px-3 py-2 text-[var(--color-on-surface-variant)]">{lot.farmGroupId || "-"}</td>
                      <td className="px-3 py-2">{lot.variety || "-"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{lot.areaHa.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center tabular-nums">{lot.harvestCycleCount}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {lot.lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {lot.error ? (
                          <span className="text-xs text-red-600">{lot.error}</span>
                        ) : lot.isDuplicate ? (
                          <span className="text-xs text-amber-600">Ya existe</span>
                        ) : (
                          <span className="text-xs text-emerald-600">Nuevo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3: Import */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-[var(--color-on-surface)]">
                3. Confirmar importacion
              </h2>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Se importaran {validCount} lote(s) nuevo(s).
                {dupCount > 0 && ` ${dupCount} duplicado(s) seran omitidos.`}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/lotes"
                className="rounded-lg border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
              >
                Cancelar
              </a>
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {importing ? "Importando..." : `Importar ${validCount} Lotes`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
