import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import DeleteLotButton from "./DeleteLotButton";

export default async function LotesPage() {
  const lots = await prisma.lot.findMany({
    orderBy: { displayName: "asc" },
    include: {
      varietyRel: true,
      soilReferences: {
        include: { soilReferenceAnalysis: true },
        take: 1,
      },
      _count: { select: { plans: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Lotes"
        description={`${lots.length} lotes registrados`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/lotes/importar"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-emerald-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Importar Excel
            </Link>
            <Link
              href="/lotes/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo Lote
            </Link>
          </div>
        }
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]/20">
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Variedad
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Area (ha)
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Cosechas
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Ref. Suelo
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Planes
              </th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
            {lots.map((lot) => (
              <tr key={lot.id} className="group hover:bg-[var(--color-surface-container-high)] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-semibold text-[var(--color-on-surface)]">
                    {lot.displayName}
                  </span>
                  {lot.farmGroup && (
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{lot.farmGroup}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-on-surface)]">
                  {lot.varietyRel?.displayName ?? lot.variety ?? "-"}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-[var(--color-on-surface)]">
                  {lot.areaHa.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums text-[var(--color-on-surface)]">
                  {lot.harvestCycleCount}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {lot.lifecycleStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                  {lot.soilReferences[0] ? (
                    <Link
                      href={`/suelos/${lot.soilReferences[0].soilReferenceAnalysisId}`}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                      title="Ver analisis de referencia"
                    >
                      {lot.soilReferences[0].soilReferenceAnalysis.sourceName}
                    </Link>
                  ) : (
                    <span className="text-xs text-[var(--color-outline-variant)]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums text-[var(--color-on-surface-variant)]">
                  {lot._count.plans}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/lotes/${lot.code}/editar`}
                      className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-dim)] transition-all"
                      title="Editar lote"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </Link>
                    <DeleteLotButton lotId={lot.id} lotName={lot.displayName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
