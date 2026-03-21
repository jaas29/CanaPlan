// Nutrient calculation engine - deterministic arithmetic from company documents (AG-P-01)

export const NUTRIENT_TARGETS_PER_TCH = {
  n:    { min: 1.0, max: 1.4 },
  p2o5: { min: 0.4, max: 0.6 },
  k2o:  { min: 1.4, max: 1.6 },
  s:    { min: 0.3, max: 0.4 },
  cao:  { min: 0.5, max: 0.6 },
  mgo:  { min: 0.4, max: 0.5 },
} as const;

export type NutrientKey = keyof typeof NUTRIENT_TARGETS_PER_TCH;

export interface FormulaComposition {
  nPct: number;
  p2o5Pct: number;
  k2oPct: number;
  sPct: number;
  mgoPct: number;
  caoPct: number;
  kgPerSack: number;
}

export interface NutrientResult {
  nKg: number;
  p2o5Kg: number;
  k2oKg: number;
  sKg: number;
  mgoKg: number;
  caoKg: number;
}

/**
 * Calculate total nutrients contributed by an application.
 * Core formula: totalKg * (nutrientPct / 100)
 */
export function calculateApplicationNutrients(
  formula: FormulaComposition,
  sacksPerHa: number,
  areaHa: number,
): NutrientResult {
  const totalSacks = sacksPerHa * areaHa;
  const totalKg = totalSacks * formula.kgPerSack;

  return {
    nKg:    totalKg * formula.nPct / 100,
    p2o5Kg: totalKg * formula.p2o5Pct / 100,
    k2oKg:  totalKg * formula.k2oPct / 100,
    sKg:    totalKg * formula.sPct / 100,
    mgoKg:  totalKg * formula.mgoPct / 100,
    caoKg:  totalKg * formula.caoPct / 100,
  };
}

/**
 * Calculate kg per TCH for each nutrient, then evaluate against target ranges.
 */
export function evaluateNutrientBalance(
  nutrients: NutrientResult,
  targetTch: number,
  areaHa: number,
): Record<NutrientKey, { kgPerTch: number; status: "bajo" | "optimo" | "exceso" }> {
  const totalTons = targetTch * areaHa;
  const result = {} as Record<NutrientKey, { kgPerTch: number; status: "bajo" | "optimo" | "exceso" }>;

  const mapping: Record<NutrientKey, number> = {
    n: nutrients.nKg,
    p2o5: nutrients.p2o5Kg,
    k2o: nutrients.k2oKg,
    s: nutrients.sKg,
    cao: nutrients.caoKg,
    mgo: nutrients.mgoKg,
  };

  for (const [key, kgTotal] of Object.entries(mapping)) {
    const nutrient = key as NutrientKey;
    const kgPerTch = kgTotal / totalTons;
    const target = NUTRIENT_TARGETS_PER_TCH[nutrient];

    let status: "bajo" | "optimo" | "exceso";
    if (kgPerTch < target.min) status = "bajo";
    else if (kgPerTch > target.max) status = "exceso";
    else status = "optimo";

    result[nutrient] = { kgPerTch, status };
  }

  return result;
}

/**
 * Compute the N requirement for a plan.
 */
export function calculateNRequired(targetTch: number, nRatePerTch: number, areaHa: number): number {
  return targetTch * nRatePerTch * areaHa;
}
