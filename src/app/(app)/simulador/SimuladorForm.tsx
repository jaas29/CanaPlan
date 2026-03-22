"use client";

import { useState, useMemo } from "react";
import {
  calculateApplicationNutrients,
  evaluateNutrientBalance,
  NUTRIENT_TARGETS_PER_TCH,
  type NutrientKey,
} from "@/lib/nutrients";

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
  costPerSack: number | null;
}

interface Lot {
  id: number;
  displayName: string;
  areaHa: number;
}

const TCH_PRESETS = [60, 70, 80, 90, 100];

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

export default function SimuladorForm({
  formulas,
  lots,
}: {
  formulas: Formula[];
  lots: Lot[];
}) {
  const [lotId, setLotId] = useState(lots[0]?.id.toString() ?? "");
  const [formulaId1, setFormulaId1] = useState("");
  const [sacksPerHa1, setSacksPerHa1] = useState("4");
  const [formulaId2, setFormulaId2] = useState("");
  const [sacksPerHa2, setSacksPerHa2] = useState("");
  const [targetTch, setTargetTch] = useState(80);

  const selectedLot = lots.find((l) => l.id === Number(lotId));
  const areaHa = selectedLot?.areaHa ?? 0;

  const scenarios = useMemo(() => {
    if (!areaHa) return [];

    return TCH_PRESETS.concat(
      TCH_PRESETS.includes(targetTch) ? [] : [targetTch]
    )
      .sort((a, b) => a - b)
      .map((tch) => {
        const nRequired = tch * 1.2 * areaHa;

        const f1 = formulas.find((f) => f.id === Number(formulaId1));
        const s1 = Number(sacksPerHa1) || 0;
        const f2 = formulas.find((f) => f.id === Number(formulaId2));
        const s2 = Number(sacksPerHa2) || 0;

        const app1 = f1 && s1 > 0 ? calculateApplicationNutrients(f1, s1, areaHa) : null;
        const app2 = f2 && s2 > 0 ? calculateApplicationNutrients(f2, s2, areaHa) : null;

        const totalN = (app1?.nKg ?? 0) + (app2?.nKg ?? 0);
        const totalSacks1 = s1 * areaHa;
        const totalSacks2 = s2 * areaHa;

        const cost1 = f1?.costPerSack ? totalSacks1 * f1.costPerSack : 0;
        const cost2 = f2?.costPerSack ? totalSacks2 * f2.costPerSack : 0;
        const totalCost = cost1 + cost2;

        // For the selected target, compute full balance
        let balance = null;
        if (tch === targetTch && (app1 || app2)) {
          const totalNutrients = {
            nKg: (app1?.nKg ?? 0) + (app2?.nKg ?? 0),
            p2o5Kg: (app1?.p2o5Kg ?? 0) + (app2?.p2o5Kg ?? 0),
            k2oKg: (app1?.k2oKg ?? 0) + (app2?.k2oKg ?? 0),
            sKg: (app1?.sKg ?? 0) + (app2?.sKg ?? 0),
            mgoKg: (app1?.mgoKg ?? 0) + (app2?.mgoKg ?? 0),
            caoKg: (app1?.caoKg ?? 0) + (app2?.caoKg ?? 0),
          };
          balance = evaluateNutrientBalance(totalNutrients, tch, areaHa);
        }

        return {
          tch,
          nRequired,
          totalN,
          nDeficit: nRequired - totalN,
          totalSacks: totalSacks1 + totalSacks2,
          totalCost,
          isSelected: tch === targetTch,
          balance,
        };
      });
  }, [lotId, formulaId1, sacksPerHa1, formulaId2, sacksPerHa2, targetTch, formulas, lots, areaHa]);

  const inputClass =
    "w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5";

  const selectedScenario = scenarios.find((s) => s.isSelected);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-5">Parametros</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Lote</label>
            <select value={lotId} onChange={(e) => setLotId(e.target.value)} className={inputClass}>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>{l.displayName} ({l.areaHa} ha)</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>TCH Meta</label>
            <div className="flex gap-1">
              {TCH_PRESETS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetTch(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    targetTch === t
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-dim)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>1ra Formula</label>
            <select value={formulaId1} onChange={(e) => setFormulaId1(e.target.value)} className={inputClass}>
              <option value="">Seleccionar...</option>
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sacos/ha (1ra)</label>
            <input type="number" value={sacksPerHa1} onChange={(e) => setSacksPerHa1(e.target.value)} min={0} step={0.5} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-start-3">
            <label className={labelClass}>2da Formula (opcional)</label>
            <select value={formulaId2} onChange={(e) => setFormulaId2(e.target.value)} className={inputClass}>
              <option value="">Seleccionar...</option>
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sacos/ha (2da)</label>
            <input type="number" value={sacksPerHa2} onChange={(e) => setSacksPerHa2(e.target.value)} min={0} step={0.5} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Scenarios comparison table */}
      {scenarios.length > 0 && (formulaId1 || formulaId2) && (
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-4">
            Comparacion por Meta TCH
            {selectedLot && <span className="ml-2 text-sm font-normal text-[var(--color-on-surface-variant)]">{selectedLot.displayName} ({areaHa} ha)</span>}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/20">
                  {["TCH", "N Requerido", "N Aportado", "Deficit N", "Sacos Total", "Costo Est."].map((h) => (
                    <th key={h} className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                {scenarios.map((s) => (
                  <tr
                    key={s.tch}
                    className={s.isSelected
                      ? "bg-[var(--color-primary)]/5 font-medium"
                      : "hover:bg-[var(--color-surface-container-high)] transition-colors"
                    }
                  >
                    <td className="px-3 py-2 font-bold">
                      {s.tch}
                      {s.isSelected && (
                        <span className="ml-1 text-xs text-[var(--color-primary)]">*</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.nRequired.toFixed(0)} kg</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.totalN.toFixed(0)} kg</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      <span className={s.nDeficit > 0 ? "text-red-700" : "text-emerald-700"}>
                        {s.nDeficit > 0 ? "-" : "+"}{Math.abs(s.nDeficit).toFixed(0)} kg
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.totalSacks.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {s.totalCost > 0 ? `${s.totalCost.toLocaleString("es-CR")} CRC` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nutrient balance for selected scenario */}
      {selectedScenario?.balance && (
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-4">
            Balance Nutricional para {targetTch} TCH
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/20">
                  {["Nutriente", "kg / TCH", "Rango Optimo", "Estado"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                {(Object.keys(NUTRIENT_LABELS) as NutrientKey[]).map((key) => {
                  const b = selectedScenario.balance![key];
                  const target = NUTRIENT_TARGETS_PER_TCH[key];
                  if (b.kgPerTch === 0) return null;
                  return (
                    <tr key={key}>
                      <td className="px-3 py-2 font-medium">{NUTRIENT_LABELS[key]}</td>
                      <td className="px-3 py-2 tabular-nums font-medium">{b.kgPerTch.toFixed(2)}</td>
                      <td className="px-3 py-2 tabular-nums text-[var(--color-on-surface-variant)]">{target.min} - {target.max}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status]}`}>
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
    </div>
  );
}
