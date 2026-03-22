import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import DeleteResultButton from "./DeleteResultButton";

export default async function ResultadosPage() {
  const results = await prisma.yieldResult.findMany({
    include: {
      lot: true,
      harvestSeason: true,
    },
    orderBy: [{ harvestSeason: { name: "desc" } }, { lot: { displayName: "asc" } }],
  });

  return (
    <>
      <PageHeader
        title="Resultados de Cosecha"
        description="Registro de rendimiento (TCH) por lote y zafra"
        actions={
          <Link
            href="/resultados/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Registrar Resultado
          </Link>
        }
      />

      {results.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            trending_up
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay resultados registrados. Registra el rendimiento de cosecha de tus lotes.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--color-outline-variant)]/20">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Lote</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Zafra</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">TCH Meta</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">TCH Real</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Diferencia</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Tons Total</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Fecha</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
              {results.map((r) => {
                const diff = r.targetTch != null ? r.actualTch - r.targetTch : null;
                const diffPct = diff != null && r.targetTch ? (diff / r.targetTch) * 100 : null;

                return (
                  <tr key={r.id} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{r.lot.displayName}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">{r.harvestSeason.name}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-[var(--color-on-surface-variant)]">
                      {r.targetTch ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums font-bold">
                      {r.actualTch}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums">
                      {diff != null ? (
                        <span className={diff >= 0 ? "text-emerald-700" : "text-red-700"}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                          <span className="text-xs ml-0.5">
                            ({diffPct! > 0 ? "+" : ""}{diffPct!.toFixed(1)}%)
                          </span>
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-[var(--color-on-surface)]">
                      {r.totalTons?.toFixed(0) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                      {r.harvestDate ? new Date(r.harvestDate).toLocaleDateString("es-CR") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/resultados/${r.id}/editar`}
                          className="rounded p-1 text-[var(--color-on-surface-variant)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <DeleteResultButton resultId={r.id} lotName={r.lot.displayName} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
