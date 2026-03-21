import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import DeleteRecordButton from "./DeleteRecordButton";

export default async function AplicacionesPage() {
  const records = await prisma.applicationRecord.findMany({
    include: {
      lot: true,
      formula: true,
      planApplication: {
        include: {
          formula: true,
          plan: { include: { harvestSeason: true } },
        },
      },
    },
    orderBy: { actualDate: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Aplicaciones"
        description={`${records.length} aplicacion(es) registradas`}
        actions={
          <Link
            href="/aplicaciones/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Registrar Aplicacion
          </Link>
        }
      />

      {records.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            agriculture
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay aplicaciones registradas.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-outline-variant)]/20">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Fecha</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Lote</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Aplic.</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Formula</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Sacos</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">kg/ha</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Plan / Zafra</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Estado</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Operador</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
              {records.map((r) => {
                const pa = r.planApplication;
                const appNum = pa?.applicationNumber;
                const plannedSacks = pa?.totalSacks;
                const variation = plannedSacks != null ? r.actualSacks - plannedSacks : null;
                const variationPct = variation != null && plannedSacks && plannedSacks > 0
                  ? (variation / plannedSacks) * 100
                  : null;

                let statusLabel: string;
                let statusClass: string;
                if (!pa) {
                  statusLabel = "Sin plan";
                  statusClass = "bg-slate-100 text-slate-600";
                } else if (variationPct != null && Math.abs(variationPct) <= 5) {
                  statusLabel = "Conforme";
                  statusClass = "bg-emerald-50 text-emerald-700";
                } else {
                  statusLabel = "Desviado";
                  statusClass = "bg-amber-50 text-amber-700";
                }

                return (
                  <tr key={r.id} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {new Date(r.actualDate).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {r.lot.displayName}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {appNum ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-surface-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-on-surface-variant)]">
                          {appNum === 1 ? "1ra" : "2da"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.formula.name}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums font-medium">
                      {r.actualSacks}
                      {variation != null && (
                        <span className={`ml-1 text-xs ${variation === 0 ? "text-emerald-600" : variation > 0 ? "text-blue-600" : "text-red-600"}`}>
                          ({variation > 0 ? "+" : ""}{variation.toFixed(0)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-[var(--color-on-surface-variant)]">
                      {r.actualKgPerHa ? r.actualKgPerHa.toFixed(0) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pa ? (
                        <Link
                          href={`/planes/${pa.planId}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {pa.plan.harvestSeason.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-on-surface-variant)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                      {r.operatorName ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/aplicaciones/${r.id}/editar`}
                          className="rounded p-1 text-[var(--color-on-surface-variant)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <DeleteRecordButton recordId={r.id} lotName={r.lot.displayName} />
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
