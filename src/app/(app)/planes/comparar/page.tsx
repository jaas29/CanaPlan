import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function CompararPage() {
  const [planApps, yieldResults] = await Promise.all([
    prisma.planApplication.findMany({
      include: {
        formula: true,
        plan: {
          include: {
            lot: true,
            harvestSeason: true,
          },
        },
        applicationRecords: {
          include: { formula: true },
        },
      },
      orderBy: [
        { plan: { lot: { displayName: "asc" } } },
        { applicationNumber: "asc" },
      ],
    }),
    prisma.yieldResult.findMany({
      include: { lot: true, harvestSeason: true },
    }),
  ]);

  // Build yield lookup by lotId+seasonId
  const yieldMap = new Map<string, typeof yieldResults[0]>();
  for (const yr of yieldResults) {
    yieldMap.set(`${yr.lotId}-${yr.harvestSeasonId}`, yr);
  }

  // Group plan applications by plan for the yield section
  const planIds = [...new Set(planApps.map((pa) => pa.planId))];
  const plans = planIds.map((pid) => {
    const apps = planApps.filter((pa) => pa.planId === pid);
    const plan = apps[0].plan;
    const yr = yieldMap.get(`${plan.lotId}-${plan.harvestSeasonId}`);
    return { plan, apps, yieldResult: yr ?? null };
  });

  return (
    <>
      <PageHeader
        title="Plan vs Real"
        description="Comparacion entre aplicaciones planificadas, registradas y rendimiento"
      />

      {planApps.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            compare_arrows
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay aplicaciones planificadas. Crea un plan primero.
          </p>
        </div>
      ) : (
        <>
          {/* Application Comparison Table */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]/20">
                  {[
                    "Lote",
                    "Zafra",
                    "Aplic.",
                    "Formula Plan",
                    "Formula Real",
                    "Sacos Plan",
                    "Sacos Real",
                    "Variacion",
                    "Fecha Plan",
                    "Fecha Real",
                    "Estado",
                  ].map((h) => (
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
                {planApps.map((pa) => {
                  const record = pa.applicationRecords[0];
                  const hasRecord = !!record;

                  const plannedSacks = pa.totalSacks;
                  const actualSacks = record?.actualSacks ?? null;
                  const variation = actualSacks !== null ? actualSacks - plannedSacks : null;
                  const variationPct = variation !== null && plannedSacks > 0
                    ? (variation / plannedSacks) * 100
                    : null;

                  let status: string;
                  let statusClass: string;
                  if (!hasRecord) {
                    status = "Pendiente";
                    statusClass = "bg-slate-100 text-slate-700";
                  } else if (variationPct !== null && Math.abs(variationPct) <= 5) {
                    status = "Completado";
                    statusClass = "bg-emerald-50 text-emerald-700";
                  } else {
                    status = "Desviado";
                    statusClass = "bg-amber-50 text-amber-700";
                  }

                  const formulaMismatch = hasRecord && record.formulaId !== pa.formulaId;

                  return (
                    <tr
                      key={pa.id}
                      className="hover:bg-[var(--color-surface-container-high)] transition-colors"
                    >
                      <td className="px-3 py-3 text-sm font-medium">
                        <Link
                          href={`/planes/${pa.planId}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {pa.plan.lot.displayName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--color-on-surface-variant)]">
                        {pa.plan.harvestSeason.name}
                      </td>
                      <td className="px-3 py-3 text-sm text-center">
                        {pa.applicationNumber === 1 ? "1ra" : "2da"}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {pa.formula.name}
                      </td>
                      <td className={`px-3 py-3 text-sm ${formulaMismatch ? "text-amber-700 font-medium" : ""}`}>
                        {hasRecord ? record.formula.name : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm tabular-nums text-right">
                        {plannedSacks.toFixed(0)}
                      </td>
                      <td className="px-3 py-3 text-sm tabular-nums text-right font-medium">
                        {actualSacks !== null ? actualSacks.toFixed(0) : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm tabular-nums text-right">
                        {variation !== null ? (
                          <span
                            className={
                              variation === 0
                                ? "text-emerald-700"
                                : variation > 0
                                  ? "text-blue-700"
                                  : "text-red-700"
                            }
                          >
                            {variation > 0 ? "+" : ""}
                            {variation.toFixed(0)}{" "}
                            <span className="text-xs">
                              ({variationPct! > 0 ? "+" : ""}
                              {variationPct!.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--color-on-surface-variant)]">
                        {pa.plannedDate
                          ? new Date(pa.plannedDate).toLocaleDateString("es-CR")
                          : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {hasRecord
                          ? new Date(record.actualDate).toLocaleDateString("es-CR")
                          : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Yield / TCH Outcome Section */}
          <div className="mt-8">
            <h2 className="text-base font-bold text-[var(--color-on-surface)] mb-4">
              Resultado de Cosecha (TCH)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/20">
                    {["Lote", "Zafra", "TCH Meta", "TCH Real", "Diferencia", "%", "Tons Total", "Estado"].map((h) => (
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
                  {plans.map(({ plan, yieldResult: yr }) => {
                    const diff = yr && yr.targetTch != null ? yr.actualTch - yr.targetTch : null;
                    const diffPct = diff != null && yr!.targetTch ? (diff / yr!.targetTch) * 100 : null;

                    let resultStatus: string;
                    let resultStatusClass: string;
                    if (!yr) {
                      resultStatus = "Pendiente";
                      resultStatusClass = "bg-slate-100 text-slate-700";
                    } else if (diff != null && diff >= 0) {
                      resultStatus = "Cumplido";
                      resultStatusClass = "bg-emerald-50 text-emerald-700";
                    } else if (diff != null && diffPct != null && Math.abs(diffPct) <= 10) {
                      resultStatus = "Cercano";
                      resultStatusClass = "bg-amber-50 text-amber-700";
                    } else {
                      resultStatus = "Bajo meta";
                      resultStatusClass = "bg-red-50 text-red-700";
                    }

                    return (
                      <tr
                        key={plan.id}
                        className="hover:bg-[var(--color-surface-container-high)] transition-colors"
                      >
                        <td className="px-3 py-3 text-sm font-medium">
                          <Link
                            href={`/planes/${plan.id}`}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            {plan.lot.displayName}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-[var(--color-on-surface-variant)]">
                          {plan.harvestSeason.name}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {plan.targetTch}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right font-bold">
                          {yr ? yr.actualTch : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {diff != null ? (
                            <span className={diff >= 0 ? "text-emerald-700" : "text-red-700"}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right">
                          {diffPct != null ? (
                            <span className={diffPct >= 0 ? "text-emerald-700" : "text-red-700"}>
                              {diffPct > 0 ? "+" : ""}{diffPct.toFixed(1)}%
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm tabular-nums text-right text-[var(--color-on-surface)]">
                          {yr?.totalTons?.toFixed(0) ?? "-"}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resultStatusClass}`}>
                            {resultStatus}
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
