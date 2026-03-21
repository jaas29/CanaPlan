import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import DeleteFormulaButton from "./DeleteFormulaButton";

export default async function FormulasPage() {
  const formulas = await prisma.formula.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { planApplications: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Formulas"
        description={`${formulas.length} formula(s) en biblioteca`}
        actions={
          <Link
            href="/formulas/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Formula
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {formulas.map((f) => (
          <div
            key={f.id}
            className="group rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--color-on-surface)]">
                  {f.name}
                </h3>
                {f.nitrogenSource && (
                  <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                    {f.nitrogenSource}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/formulas/${f.id}/editar`}
                  className="rounded p-1 text-[var(--color-on-surface-variant)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </Link>
                <DeleteFormulaButton formulaId={f.id} formulaName={f.name} />
              </div>
            </div>

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

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
              <span>{f.kgPerSack} kg/saco</span>
              {f.costPerSack && (
                <span className="font-medium text-[var(--color-on-surface)]">
                  {f.costPerSack.toLocaleString("es-CR")} CRC/saco
                </span>
              )}
            </div>
            {f._count.planApplications > 0 && (
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                Usada en {f._count.planApplications} aplicacion(es)
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
