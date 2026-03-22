import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ zafra?: string }>;
}) {
  const sp = await searchParams;

  const seasons = await prisma.harvestSeason.findMany({
    orderBy: { name: "desc" },
  });

  const selectedSeasonId = sp.zafra ? Number(sp.zafra) : seasons[0]?.id ?? null;
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  // Get all yield results for the selected season
  const yieldResults = selectedSeasonId
    ? await prisma.yieldResult.findMany({
        where: { harvestSeasonId: selectedSeasonId },
        include: { lot: true, harvestSeason: true },
        orderBy: { actualTch: "desc" },
      })
    : [];

  // Get plans for the selected season (for lots without yield results)
  const plans = selectedSeasonId
    ? await prisma.fertilizationPlan.findMany({
        where: { harvestSeasonId: selectedSeasonId },
        include: { lot: true, applications: { include: { formula: true } } },
      })
    : [];

  // Build combined report data
  const reportRows = plans.map((plan) => {
    const yr = yieldResults.find(
      (y) => y.lotId === plan.lotId && y.harvestSeasonId === plan.harvestSeasonId
    );
    const estimatedCost = plan.applications.reduce((sum, app) => {
      if (app.formula.costPerSack) return sum + app.totalSacks * app.formula.costPerSack;
      return sum;
    }, 0);
    return {
      lotName: plan.lot.displayName,
      areaHa: plan.lot.areaHa,
      targetTch: plan.targetTch,
      actualTch: yr?.actualTch ?? null,
      totalTons: yr?.totalTons ?? null,
      diff: yr && yr.targetTch != null ? yr.actualTch - yr.targetTch : null,
      diffPct:
        yr && yr.targetTch
          ? ((yr.actualTch - yr.targetTch) / yr.targetTch) * 100
          : null,
      hasResult: !!yr,
      estimatedCost,
    };
  });

  // Sort by actual TCH descending (lots with results first)
  reportRows.sort((a, b) => {
    if (a.hasResult && !b.hasResult) return -1;
    if (!a.hasResult && b.hasResult) return 1;
    return (b.actualTch ?? 0) - (a.actualTch ?? 0);
  });

  // Summary stats
  const lotsWithResults = reportRows.filter((r) => r.hasResult);
  const avgTch =
    lotsWithResults.length > 0
      ? lotsWithResults.reduce((sum, r) => sum + (r.actualTch ?? 0), 0) /
        lotsWithResults.length
      : null;
  const totalTons = lotsWithResults.reduce((sum, r) => sum + (r.totalTons ?? 0), 0);
  const metTarget = lotsWithResults.filter((r) => r.diff != null && r.diff >= 0).length;
  const totalArea = reportRows.reduce((sum, r) => sum + r.areaHa, 0);
  const totalCost = reportRows.reduce((sum, r) => sum + r.estimatedCost, 0);

  // Top 3 and bottom 3
  const top3 = lotsWithResults.slice(0, 3);
  const bottom3 = [...lotsWithResults].sort((a, b) => (a.actualTch ?? 0) - (b.actualTch ?? 0)).slice(0, 3);

  return (
    <>
      <PageHeader
        title="Reportes"
        description={selectedSeason ? `Zafra ${selectedSeason.name}` : "Seleccionar zafra"}
      />

      {/* Season filter */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">Zafra:</span>
        <div className="flex gap-1">
          {seasons.map((s) => (
            <Link
              key={s.id}
              href={`/reportes?zafra=${s.id}`}
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

      {reportRows.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            bar_chart
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay planes para esta zafra. Crea planes primero para generar reportes.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "TCH Promedio",
                value: avgTch != null ? avgTch.toFixed(1) : "---",
                sub: `${lotsWithResults.length} de ${reportRows.length} lotes con resultado`,
                icon: "analytics",
              },
              {
                label: "Toneladas Totales",
                value: totalTons > 0 ? totalTons.toFixed(0) : "---",
                sub: `${totalArea.toFixed(1)} ha planificadas`,
                icon: "inventory_2",
              },
              {
                label: "Cumplieron Meta",
                value: lotsWithResults.length > 0 ? `${metTarget}/${lotsWithResults.length}` : "---",
                sub: lotsWithResults.length > 0
                  ? `${((metTarget / lotsWithResults.length) * 100).toFixed(0)}% de lotes`
                  : "Sin resultados",
                icon: "check_circle",
              },
              {
                label: "Costo Estimado",
                value: totalCost > 0 ? `${(totalCost / 1000).toFixed(0)}k` : "---",
                sub: totalCost > 0 ? `${totalCost.toLocaleString("es-CR")} CRC total` : "Sin costos registrados",
                icon: "payments",
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

          {/* Top / Bottom Lots */}
          {lotsWithResults.length >= 3 && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-3">
                  Top 3 Lotes (Mayor TCH)
                </h3>
                <div className="space-y-2">
                  {top3.map((r, i) => (
                    <div key={r.lotName} className="flex items-center justify-between rounded-lg p-2.5 bg-emerald-50/50">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{r.lotName}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-emerald-700">
                        {r.actualTch} TCH
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-3">
                  Bottom 3 Lotes (Menor TCH)
                </h3>
                <div className="space-y-2">
                  {bottom3.map((r, i) => (
                    <div key={r.lotName} className="flex items-center justify-between rounded-lg p-2.5 bg-red-50/50">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{r.lotName}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-red-700">
                        {r.actualTch} TCH
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Table: TCH by Lot */}
          <div className="mt-6">
            <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-4">
              TCH por Lote - {selectedSeason?.name}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/20">
                    {["Lote", "Area (ha)", "TCH Meta", "TCH Real", "Diferencia", "%", "Tons Total", "Estado"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                  {reportRows.map((r) => {
                    let statusLabel: string;
                    let statusClass: string;
                    if (!r.hasResult) {
                      statusLabel = "Pendiente";
                      statusClass = "bg-slate-100 text-slate-700";
                    } else if (r.diff != null && r.diff >= 0) {
                      statusLabel = "Cumplido";
                      statusClass = "bg-emerald-50 text-emerald-700";
                    } else if (r.diffPct != null && Math.abs(r.diffPct) <= 10) {
                      statusLabel = "Cercano";
                      statusClass = "bg-amber-50 text-amber-700";
                    } else {
                      statusLabel = "Bajo meta";
                      statusClass = "bg-red-50 text-red-700";
                    }

                    return (
                      <tr key={r.lotName} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                        <td className="px-3 py-3 text-sm font-medium">{r.lotName}</td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">{r.areaHa.toFixed(2)}</td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">{r.targetTch}</td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right font-bold">
                          {r.actualTch ?? "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {r.diff != null ? (
                            <span className={r.diff >= 0 ? "text-emerald-700" : "text-red-700"}>
                              {r.diff > 0 ? "+" : ""}{r.diff.toFixed(1)}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {r.diffPct != null ? (
                            <span className={r.diffPct >= 0 ? "text-emerald-700" : "text-red-700"}>
                              {r.diffPct > 0 ? "+" : ""}{r.diffPct.toFixed(1)}%
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {r.totalTons?.toFixed(0) ?? "-"}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
