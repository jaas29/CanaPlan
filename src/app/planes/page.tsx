import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";

export default async function PlanesPage() {
  const plans = await prisma.fertilizationPlan.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    borrador: "bg-slate-100 text-slate-700",
    aprobado: "bg-blue-50 text-blue-700",
    en_progreso: "bg-amber-50 text-amber-700",
    completado: "bg-emerald-50 text-emerald-700",
  };

  return (
    <>
      <PageHeader
        title="Planes de Fertilizacion"
        description="Planificacion por lote y zafra"
        actions={
          <Link
            href="/planes/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Plan
          </Link>
        }
      />

      {plans.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            assignment
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay planes creados. Crea el primero para comenzar.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {plans.map((plan) => {
            const totalPlannedSacks = plan.applications.reduce(
              (sum, a) => sum + a.totalSacks,
              0,
            );
            const recordedCount = plan.applications.filter(
              (a) => a.applicationRecords.length > 0,
            ).length;

            return (
              <Link
                key={plan.id}
                href={`/planes/${plan.id}`}
                className="block rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm hover:border-[var(--color-primary)]/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[var(--color-on-surface)]">
                      {plan.lot.displayName}
                    </h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      Zafra {plan.harvestSeason.name} &middot; Meta: {plan.targetTch} TCH &middot; {plan.lot.areaHa} ha
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {plan.status}
                  </span>
                </div>

                <div className="mt-3 flex gap-4 text-xs text-[var(--color-on-surface-variant)]">
                  <span>{plan.applications.length} aplicacion(es)</span>
                  <span>{totalPlannedSacks.toFixed(0)} sacos planificados</span>
                  <span>
                    {recordedCount}/{plan.applications.length} registradas
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
