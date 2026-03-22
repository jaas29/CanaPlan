import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";

export default async function SuelosPage() {
  const analyses = await prisma.soilReferenceAnalysis.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lotReferences: true } } },
  });

  return (
    <>
      <PageHeader
        title="Analisis de Suelo de Referencia"
        description="Analisis externos usados como referencia para sus lotes"
        actions={
          <Link
            href="/suelos/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Analisis
          </Link>
        }
      />

      {analyses.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            science
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay analisis de referencia registrados. Agregue uno para documentar los datos de suelo que usa como proxy.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/suelos/${a.id}`}
              className="group rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                    {a.sourceType === "ingenio" ? "Fuente: Ingenio" : "Fuente: Externa"}
                  </p>
                  <h3 className="mt-1 font-bold text-[var(--color-on-surface)]">
                    {a.sourceName}
                  </h3>
                  {a.sourceLotCode && (
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                      Lote origen: {a.sourceLotCode}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {a.year && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-surface-dim)] px-2 py-0.5 text-xs text-[var(--color-on-surface-variant)]">
                    {a.year}
                  </span>
                )}
                {a.ph != null && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-surface-dim)] px-2 py-0.5 text-xs text-[var(--color-on-surface-variant)]">
                    pH {a.ph}
                  </span>
                )}
                {a.organicMatterPct != null && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-surface-dim)] px-2 py-0.5 text-xs text-[var(--color-on-surface-variant)]">
                    M.O. {a.organicMatterPct}%
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)]">
                <span className="material-symbols-outlined text-[14px]">link</span>
                {a._count.lotReferences} lote(s) vinculado(s)
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
