import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";

export default async function FormulasPage() {
  const formulas = await prisma.formula.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Formulas"
        description="Biblioteca de formulas de fertilizacion"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formulas.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm"
          >
            <h3 className="text-base font-bold text-[var(--color-on-surface)]">
              {f.name}
            </h3>
            {f.nitrogenSource && (
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                {f.nitrogenSource}
              </p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "N", value: f.nPct },
                { label: "P2O5", value: f.p2o5Pct },
                { label: "K2O", value: f.k2oPct },
                { label: "S", value: f.sPct },
                { label: "MgO", value: f.mgoPct },
                { label: "CaO", value: f.caoPct },
              ]
                .filter((n) => n.value > 0)
                .map((n) => (
                  <div key={n.label} className="rounded-lg bg-[var(--color-surface-dim)] px-2 py-1.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                      {n.label}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-[var(--color-on-surface)]">
                      {n.value}%
                    </p>
                  </div>
                ))}
            </div>

            <p className="mt-3 text-xs text-[var(--color-on-surface-variant)]">
              {f.kgPerSack} kg/saco
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
