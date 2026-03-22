import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [
    lotCount,
    planCount,
    formulaCount,
    totalAreaAgg,
    plansByStatus,
    recentRecords,
    pendingApps,
    yieldResults,
  ] = await Promise.all([
    prisma.lot.count(),
    prisma.fertilizationPlan.count(),
    prisma.formula.count(),
    prisma.lot.aggregate({ _sum: { areaHa: true } }),
    prisma.fertilizationPlan.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.applicationRecord.findMany({
      include: { lot: true, formula: true },
      orderBy: { actualDate: "desc" },
      take: 5,
    }),
    prisma.planApplication.findMany({
      where: { applicationRecords: { none: {} } },
      include: {
        formula: true,
        plan: { include: { lot: true, harvestSeason: true } },
      },
      orderBy: { plannedDate: "asc" },
      take: 5,
    }),
    prisma.yieldResult.findMany({
      include: { lot: true, harvestSeason: true },
      orderBy: { actualTch: "desc" },
      take: 5,
    }),
  ]);

  const totalAreaHa = totalAreaAgg._sum.areaHa ?? 0;
  const statusMap: Record<string, number> = {};
  for (const s of plansByStatus) statusMap[s.status] = s._count.id;

  const stats = [
    { label: "Lotes", value: lotCount, icon: "grass" },
    { label: "Area Total", value: `${totalAreaHa.toFixed(1)} ha`, icon: "square_foot" },
    { label: "Planes", value: planCount, icon: "assignment" },
    { label: "Formulas", value: formulaCount, icon: "science" },
  ];

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    borrador: { label: "Borrador", color: "bg-slate-100 text-slate-700" },
    en_progreso: { label: "En progreso", color: "bg-amber-50 text-amber-700" },
    completado: { label: "Completado", color: "bg-emerald-50 text-emerald-700" },
  };

  return (
    <>
      <PageHeader
        title="Panel"
        description="Resumen general de la finca"
      />

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-[var(--color-on-surface)]">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plans by Status */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-on-surface)] mb-4">
            Planes por Estado
          </h2>
          {planCount === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">No hay planes creados.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => {
                const count = statusMap[key] ?? 0;
                const pct = planCount > 0 ? (count / planCount) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                        {label}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-[var(--color-on-surface)]">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-surface-dim)]">
                      <div
                        className="h-2 rounded-full bg-[var(--color-primary)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Applications */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-on-surface)]">
              Aplicaciones Pendientes
            </h2>
            {pendingApps.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {pendingApps.length}
              </span>
            )}
          </div>
          {pendingApps.length === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">Todas las aplicaciones planificadas han sido registradas.</p>
          ) : (
            <div className="space-y-2">
              {pendingApps.map((pa) => (
                <Link
                  key={pa.id}
                  href={`/aplicaciones/nueva?planAppId=${pa.id}`}
                  className="flex items-center justify-between rounded-lg p-2.5 hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">
                      {pa.plan.lot.displayName}
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      {pa.applicationNumber === 1 ? "1ra" : "2da"} &middot; {pa.formula.name} &middot; {pa.totalSacks.toFixed(0)} sacos
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-on-surface)]">
              Actividad Reciente
            </h2>
            <Link href="/aplicaciones" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              Ver todas
            </Link>
          </div>
          {recentRecords.length === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">No hay aplicaciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {recentRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg p-2.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">
                      {r.lot.displayName}
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      {r.formula.name} &middot; {r.actualSacks} sacos
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-[var(--color-on-surface-variant)]">
                    {new Date(r.actualDate).toLocaleDateString("es-CR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yield Results Summary */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-on-surface)]">
              Mejores Rendimientos
            </h2>
            <Link href="/resultados" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              Ver todos
            </Link>
          </div>
          {yieldResults.length === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">No hay resultados de cosecha registrados.</p>
          ) : (
            <div className="space-y-2">
              {yieldResults.map((r) => {
                const diff = r.targetTch != null ? r.actualTch - r.targetTch : null;
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg p-2.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-on-surface)]">
                        {r.lot.displayName}
                      </p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {r.harvestSeason.name}
                        {r.targetTch != null && ` · Meta: ${r.targetTch}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-[var(--color-on-surface)]">
                        {r.actualTch} TCH
                      </p>
                      {diff != null && (
                        <p className={`text-xs tabular-nums ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
