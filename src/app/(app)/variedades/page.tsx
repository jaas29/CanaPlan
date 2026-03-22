import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import DeleteVarietyButton from "./DeleteVarietyButton";

export default async function VariedadesPage() {
  const varieties = await prisma.variety.findMany({
    orderBy: { displayName: "asc" },
    include: { _count: { select: { lots: true } } },
  });

  return (
    <>
      <PageHeader
        title="Variedades"
        description={`${varieties.length} variedades registradas`}
        actions={
          <Link
            href="/variedades/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Variedad
          </Link>
        }
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]/20">
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Codigo
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Lotes
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Notas
              </th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
            {varieties.map((v) => (
              <tr key={v.id} className="group hover:bg-[var(--color-surface-container-high)] transition-colors">
                <td className="px-4 py-3 font-semibold text-[var(--color-on-surface)]">
                  {v.displayName}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)] font-mono">
                  {v.code}
                </td>
                <td className="px-4 py-3 text-center text-sm tabular-nums text-[var(--color-on-surface)]">
                  {v._count.lots}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      v.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {v.isActive ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-on-surface-variant)]">
                  {v.notes ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/variedades/${v.id}/editar`}
                      className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-dim)] transition-all"
                      title="Editar variedad"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </Link>
                    <DeleteVarietyButton varietyId={v.id} varietyName={v.displayName} />
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
