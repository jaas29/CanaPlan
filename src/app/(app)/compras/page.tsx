import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ zafra?: string }>;
}) {
  const sp = await searchParams;

  const seasons = await prisma.harvestSeason.findMany({ orderBy: { name: "desc" } });
  const selectedSeasonId = sp.zafra ? Number(sp.zafra) : seasons[0]?.id ?? null;
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  // Get all plans for the selected season with their applications
  const plans = selectedSeasonId
    ? await prisma.fertilizationPlan.findMany({
        where: { harvestSeasonId: selectedSeasonId },
        include: {
          lot: true,
          applications: { include: { formula: true } },
        },
      })
    : [];

  // Get all lots to find ones without plans
  const allLots = await prisma.lot.findMany({ orderBy: { displayName: "asc" } });
  const lotsWithPlans = new Set(plans.map((p) => p.lotId));
  const lotsWithoutPlans = allLots.filter((l) => !lotsWithPlans.has(l.id));

  // Aggregate sacks and cost per formula
  const formulaAgg: Record<
    number,
    { name: string; totalSacks: number; totalCost: number; costPerSack: number | null; lotCount: number }
  > = {};

  let grandTotalSacks = 0;
  let grandTotalCost = 0;
  let totalAreaPlanned = 0;

  for (const plan of plans) {
    totalAreaPlanned += plan.lot.areaHa;
    for (const app of plan.applications) {
      const fId = app.formulaId;
      if (!formulaAgg[fId]) {
        formulaAgg[fId] = {
          name: app.formula.name,
          totalSacks: 0,
          totalCost: 0,
          costPerSack: app.formula.costPerSack,
          lotCount: 0,
        };
      }
      formulaAgg[fId].totalSacks += app.totalSacks;
      const appCost = app.formula.costPerSack ? app.totalSacks * app.formula.costPerSack : 0;
      formulaAgg[fId].totalCost += appCost;
      grandTotalSacks += app.totalSacks;
      grandTotalCost += appCost;
    }
    // Count unique lots per formula
    for (const app of plan.applications) {
      // We just increment — not perfect for unique but good enough per plan
    }
  }

  // Count lots per formula (unique)
  const formulaLots: Record<number, Set<number>> = {};
  for (const plan of plans) {
    for (const app of plan.applications) {
      if (!formulaLots[app.formulaId]) formulaLots[app.formulaId] = new Set();
      formulaLots[app.formulaId].add(plan.lotId);
    }
  }
  for (const fId of Object.keys(formulaAgg)) {
    formulaAgg[Number(fId)].lotCount = formulaLots[Number(fId)]?.size ?? 0;
  }

  const formulaRows = Object.values(formulaAgg).sort((a, b) => b.totalSacks - a.totalSacks);

  return (
    <>
      <PageHeader
        title="Resumen de Compras"
        description={selectedSeason ? `Zafra ${selectedSeason.name} — Que necesita comprar` : "Seleccione una zafra"}
      />

      {/* Season filter */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">Zafra:</span>
        <div className="flex gap-1">
          {seasons.map((s) => (
            <Link
              key={s.id}
              href={`/compras?zafra=${s.id}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                s.id === selectedSeasonId
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-dim)]"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            shopping_cart
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            {selectedSeasonId
              ? "No hay planes para esta zafra. Cree planes primero."
              : "No hay zafras registradas."}
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Formulas Necesarias",
                value: formulaRows.length,
                sub: `${plans.length} planes activos`,
              },
              {
                label: "Sacos Totales",
                value: grandTotalSacks.toFixed(0),
                sub: `${totalAreaPlanned.toFixed(0)} ha planificadas`,
              },
              {
                label: "Costo Estimado",
                value: grandTotalCost > 0 ? `${(grandTotalCost / 1000).toFixed(0)}k` : "---",
                sub: grandTotalCost > 0 ? `${grandTotalCost.toLocaleString("es-CR")} CRC` : "Sin costos registrados",
              },
              {
                label: "Lotes sin Plan",
                value: lotsWithoutPlans.length,
                sub: lotsWithoutPlans.length > 0
                  ? "Necesitan plan de fertilizacion"
                  : "Todos los lotes tienen plan",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--color-on-surface)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Formula breakdown table */}
          <div className="mt-6">
            <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-4">
              Sacos por Formula
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/20">
                    {["Formula", "Lotes", "Sacos Total", "Costo/Saco", "Costo Total"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                  {formulaRows.map((f) => (
                    <tr key={f.name} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-[var(--color-on-surface)]">
                        {f.name}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-[var(--color-on-surface)]">
                        {f.lotCount}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold tabular-nums text-[var(--color-on-surface)]">
                        {f.totalSacks.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-[var(--color-on-surface-variant)]">
                        {f.costPerSack ? `${f.costPerSack.toLocaleString("es-CR")} CRC` : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium tabular-nums text-[var(--color-on-surface)]">
                        {f.totalCost > 0 ? `${f.totalCost.toLocaleString("es-CR")} CRC` : "-"}
                      </td>
                    </tr>
                  ))}
                  {/* Grand total row */}
                  <tr className="bg-[var(--color-surface-dim)] font-bold">
                    <td className="px-4 py-3 text-sm">TOTAL</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{plans.length} lotes</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{grandTotalSacks.toFixed(0)}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {grandTotalCost > 0 ? `${grandTotalCost.toLocaleString("es-CR")} CRC` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lots without plans */}
          {lotsWithoutPlans.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
                <h3 className="text-sm font-bold text-amber-800">
                  {lotsWithoutPlans.length} lote(s) sin plan para esta zafra
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {lotsWithoutPlans.map((lot) => (
                  <Link
                    key={lot.id}
                    href={`/planes/nuevo?lotId=${lot.id}${selectedSeasonId ? `&seasonId=${selectedSeasonId}` : ""}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    {lot.displayName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
