import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import DeletePlanButton from "./DeletePlanButton";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (isNaN(planId)) notFound();

  const plan = await prisma.fertilizationPlan.findUnique({
    where: { id: planId },
    include: {
      lot: true,
      harvestSeason: true,
      applications: {
        include: {
          formula: true,
          applicationRecords: true,
        },
        orderBy: { applicationNumber: "asc" },
      },
    },
  });

  if (!plan) notFound();

  const STATUS_COLORS: Record<string, string> = {
    borrador: "bg-slate-100 text-slate-700",
    aprobado: "bg-blue-50 text-blue-700",
    en_progreso: "bg-amber-50 text-amber-700",
    completado: "bg-emerald-50 text-emerald-700",
  };

  return (
    <>
      <PageHeader
        title={plan.lot.displayName}
        description={`Zafra ${plan.harvestSeason.name} · Meta: ${plan.targetTch} TCH · ${plan.lot.areaHa} ha`}
        actions={
          <div className="flex gap-2">
            <DeletePlanButton planId={plan.id} lotName={plan.lot.displayName} />
            <Link
              href={`/planes/${plan.id}/editar`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </Link>
            <Link
              href={`/resultados/nuevo?lotId=${plan.lotId}&seasonId=${plan.harvestSeasonId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-emerald-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Resultado TCH
            </Link>
            <Link
              href={`/aplicaciones/nueva?planId=${plan.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">agriculture</span>
              Registrar Aplicacion
            </Link>
          </div>
        }
      />

      {/* Plan summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "TCH Meta", value: plan.targetTch },
          { label: "N Requerido", value: `${plan.nRequiredKg?.toFixed(1) ?? "---"} kg` },
          { label: "Estado", value: plan.status, badge: true },
          { label: "Area", value: `${plan.lot.areaHa} ha` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              {stat.label}
            </p>
            {stat.badge ? (
              <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-700"}`}>
                {String(stat.value)}
              </span>
            ) : (
              <p className="mt-1 text-xl font-extrabold tabular-nums text-[var(--color-on-surface)]">
                {String(stat.value)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Planned applications */}
      <div className="mt-8 space-y-4">
        {plan.applications.map((app) => {
          const hasRecord = app.applicationRecords.length > 0;
          return (
            <div
              key={app.id}
              className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[var(--color-on-surface)]">
                    {app.applicationNumber === 1 ? "1ra" : "2da"} Aplicacion
                  </h3>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    {app.formula.name} &middot; {app.sacksPerHa} sacos/ha &middot; {app.totalSacks.toFixed(0)} sacos total
                  </p>
                  {app.plannedDate && (
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      Fecha planificada: {new Date(app.plannedDate).toLocaleDateString("es-CR")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasRecord ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Aplicado
                    </span>
                  ) : (
                    <Link
                      href={`/aplicaciones/nueva?planAppId=${app.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-emerald-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Registrar
                    </Link>
                  )}
                </div>
              </div>

              {/* Nutrient breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(
                  [
                    ["N", app.nContributedKg],
                    ["P2O5", app.p2o5ContributedKg],
                    ["K2O", app.k2oContributedKg],
                    ["S", app.sContributedKg],
                    ["MgO", app.mgoContributedKg],
                    ["CaO", app.caoContributedKg],
                  ] as [string, number | null][]
                )
                  .filter(([, v]) => v && v > 0)
                  .map(([label, kg]) => (
                    <div key={label} className="rounded-lg bg-[var(--color-surface-dim)] px-2 py-1.5 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">{label}</p>
                      <p className="text-sm font-bold tabular-nums text-[var(--color-on-surface)]">{kg!.toFixed(1)} kg</p>
                    </div>
                  ))}
              </div>

              {/* Application records */}
              {app.applicationRecords.length > 0 && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">Registro real:</p>
                  {app.applicationRecords.map((rec) => (
                    <p key={rec.id} className="text-sm text-emerald-700">
                      {new Date(rec.actualDate).toLocaleDateString("es-CR")} &middot; {rec.actualSacks} sacos
                      {rec.observations && ` · ${rec.observations}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/planes" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
          &larr; Volver a Planes
        </Link>
      </div>
    </>
  );
}
