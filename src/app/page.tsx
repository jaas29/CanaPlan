import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [lotCount, planCount, formulaCount] = await Promise.all([
    prisma.lot.count(),
    prisma.fertilizationPlan.count(),
    prisma.formula.count(),
  ]);

  const totalAreaHa = await prisma.lot.aggregate({ _sum: { areaHa: true } });

  const stats = [
    { label: "Lotes", value: lotCount, icon: "grass" },
    { label: "Area Total", value: `${totalAreaHa._sum.areaHa?.toFixed(1) ?? 0} ha`, icon: "square_foot" },
    { label: "Planes", value: planCount, icon: "assignment" },
    { label: "Formulas", value: formulaCount, icon: "science" },
  ];

  return (
    <>
      <PageHeader
        title="Panel"
        description="Resumen general de la finca"
      />

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
    </>
  );
}
