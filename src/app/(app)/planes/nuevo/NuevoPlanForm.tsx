"use client";

import { useState, useMemo } from "react";
import { createPlan } from "../actions";
import {
  calculateApplicationNutrients,
  evaluateNutrientBalance,
  NUTRIENT_TARGETS_PER_TCH,
  type NutrientResult,
  type NutrientKey,
} from "@/lib/nutrients";

interface Lot {
  id: number;
  displayName: string;
  areaHa: number;
  variety: string | null;
}

interface Formula {
  id: number;
  name: string;
  nPct: number;
  p2o5Pct: number;
  k2oPct: number;
  sPct: number;
  mgoPct: number;
  caoPct: number;
  kgPerSack: number;
}

interface Season {
  id: number;
  name: string;
}

interface AppState {
  formulaId: string;
  sacksPerHa: string;
  plannedDate: string;
}

const EMPTY_APP: AppState = { formulaId: "", sacksPerHa: "", plannedDate: "" };

const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  n: "N",
  p2o5: "P2O5",
  k2o: "K2O",
  s: "S",
  cao: "CaO",
  mgo: "MgO",
};

const STATUS_COLORS = {
  bajo: "text-amber-700 bg-amber-50",
  optimo: "text-emerald-700 bg-emerald-50",
  exceso: "text-red-700 bg-red-50",
};

export default function NuevoPlanForm({
  lots,
  formulas,
  seasons,
}: {
  lots: Lot[];
  formulas: Formula[];
  seasons: Season[];
}) {
  const [lotId, setLotId] = useState("");
  const [seasonId, setSeasonId] = useState(seasons[0]?.id.toString() ?? "");
  const [targetTch, setTargetTch] = useState("80");
  const [notes, setNotes] = useState("");
  const [apps, setApps] = useState<AppState[]>([
    { ...EMPTY_APP },
    { ...EMPTY_APP },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedLot = lots.find((l) => l.id === Number(lotId));

  // Live nutrient calculation
  const calculations = useMemo(() => {
    if (!selectedLot || !targetTch) return null;

    const areaHa = selectedLot.areaHa;
    const tch = Number(targetTch);
    if (!tch || tch <= 0) return null;

    const appResults: (NutrientResult | null)[] = apps.map((app) => {
      const formula = formulas.find((f) => f.id === Number(app.formulaId));
      const sacks = Number(app.sacksPerHa);
      if (!formula || !sacks || sacks <= 0) return null;
      return calculateApplicationNutrients(formula, sacks, areaHa);
    });

    // Sum all application nutrients
    const total: NutrientResult = {
      nKg: 0, p2o5Kg: 0, k2oKg: 0, sKg: 0, mgoKg: 0, caoKg: 0,
    };
    for (const r of appResults) {
      if (!r) continue;
      total.nKg += r.nKg;
      total.p2o5Kg += r.p2o5Kg;
      total.k2oKg += r.k2oKg;
      total.sKg += r.sKg;
      total.mgoKg += r.mgoKg;
      total.caoKg += r.caoKg;
    }

    const balance = evaluateNutrientBalance(total, tch, areaHa);

    return { appResults, total, balance };
  }, [lotId, targetTch, apps, formulas, lots, selectedLot]);

  const updateApp = (index: number, field: keyof AppState, value: string) => {
    setApps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validApps = apps
      .map((app, i) => ({
        applicationNumber: i + 1,
        formulaId: Number(app.formulaId),
        sacksPerHa: Number(app.sacksPerHa),
        plannedDate: app.plannedDate || null,
      }))
      .filter((a) => a.formulaId && a.sacksPerHa > 0);

    if (validApps.length === 0) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData();
    fd.set("lotId", lotId);
    fd.set("harvestSeasonId", seasonId);
    fd.set("targetTch", targetTch);
    fd.set("notes", notes);
    fd.set("applications", JSON.stringify(validApps));

    await createPlan(fd);
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Plan header fields ── */}
      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-5">
          Datos del Plan
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Lote</label>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Seleccionar lote...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.displayName} ({l.areaHa} ha)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Zafra</label>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              required
              className={inputClass}
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>TCH Meta</label>
            <input
              type="number"
              value={targetTch}
              onChange={(e) => setTargetTch(e.target.value)}
              min={30}
              max={150}
              step={5}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Area</label>
            <div className="flex h-[42px] items-center rounded-lg border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-dim)] px-3 text-sm tabular-nums text-[var(--color-on-surface-variant)]">
              {selectedLot ? `${selectedLot.areaHa} ha` : "---"}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Notas (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones del plan..."
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Applications (1st and 2nd) ── */}
      {apps.map((app, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm"
        >
          <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-5">
            {i === 0 ? "1ra Aplicacion" : "2da Aplicacion"}
            {i === 1 && (
              <span className="ml-2 text-xs font-normal text-[var(--color-on-surface-variant)]">
                (opcional)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Formula</label>
              <select
                value={app.formulaId}
                onChange={(e) => updateApp(i, "formulaId", e.target.value)}
                required={i === 0}
                className={inputClass}
              >
                <option value="">Seleccionar formula...</option>
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Sacos / ha</label>
              <input
                type="number"
                value={app.sacksPerHa}
                onChange={(e) => updateApp(i, "sacksPerHa", e.target.value)}
                min={0}
                step={0.5}
                required={i === 0}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Fecha planificada</label>
              <input
                type="date"
                value={app.plannedDate}
                onChange={(e) => updateApp(i, "plannedDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Per-application nutrient summary */}
          {calculations?.appResults[i] && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {(
                [
                  ["N", calculations.appResults[i]!.nKg],
                  ["P2O5", calculations.appResults[i]!.p2o5Kg],
                  ["K2O", calculations.appResults[i]!.k2oKg],
                  ["S", calculations.appResults[i]!.sKg],
                  ["MgO", calculations.appResults[i]!.mgoKg],
                  ["CaO", calculations.appResults[i]!.caoKg],
                ] as [string, number][]
              )
                .filter(([, v]) => v > 0)
                .map(([label, kg]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-[var(--color-surface-dim)] px-2 py-1.5 text-center"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      {label}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-[var(--color-on-surface)]">
                      {kg.toFixed(1)} kg
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {/* ── Nutrient balance summary ── */}
      {calculations && (
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-5">
            Balance Nutricional
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/20">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Nutriente
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Total (kg)
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    kg / TCH
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Rango
                  </th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                {(Object.keys(NUTRIENT_LABELS) as NutrientKey[]).map((key) => {
                  const b = calculations.balance[key];
                  const target = NUTRIENT_TARGETS_PER_TCH[key];
                  const totalMap: Record<NutrientKey, number> = {
                    n: calculations.total.nKg,
                    p2o5: calculations.total.p2o5Kg,
                    k2o: calculations.total.k2oKg,
                    s: calculations.total.sKg,
                    cao: calculations.total.caoKg,
                    mgo: calculations.total.mgoKg,
                  };
                  const totalKg = totalMap[key];
                  if (totalKg === 0) return null;
                  return (
                    <tr key={key}>
                      <td className="px-3 py-2 font-medium">
                        {NUTRIENT_LABELS[key]}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {totalKg.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {b.kgPerTch.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[var(--color-on-surface-variant)]">
                        {target.min} - {target.max}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status]}`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3">
        <a
          href="/planes"
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
          {submitting ? "Guardando..." : "Guardar Plan"}
        </button>
      </div>
    </form>
  );
}
