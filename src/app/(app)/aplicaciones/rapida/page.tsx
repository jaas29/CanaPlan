import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";
import QuickLogCards from "./QuickLogCards";

export default async function RapidaPage() {
  // Get all pending planned applications (no record yet)
  const pendingApps = await prisma.planApplication.findMany({
    where: { applicationRecords: { none: {} } },
    include: {
      formula: true,
      plan: { include: { lot: true, harvestSeason: true } },
    },
    orderBy: [
      { plan: { harvestSeason: { name: "desc" } } },
      { plan: { lot: { displayName: "asc" } } },
      { applicationNumber: "asc" },
    ],
  });

  const items = pendingApps.map((pa) => ({
    planApplicationId: pa.id,
    lotId: pa.plan.lotId,
    lotName: pa.plan.lot.displayName,
    formulaId: pa.formulaId,
    formulaName: pa.formula.name,
    plannedSacks: pa.totalSacks,
    sacksPerHa: pa.sacksPerHa,
    applicationNumber: pa.applicationNumber,
    seasonName: pa.plan.harvestSeason.name,
    areaHa: pa.plan.lot.areaHa,
  }));

  return (
    <>
      <PageHeader
        title="Registro Rapido"
        description="Seleccione una aplicacion pendiente para registrarla"
        actions={
          <Link
            href="/aplicaciones/nueva"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Formulario Completo
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
            check_circle
          </span>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            No hay aplicaciones pendientes. Todas han sido registradas.
          </p>
          <Link
            href="/aplicaciones"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Ver historial de aplicaciones
          </Link>
        </div>
      ) : (
        <QuickLogCards items={items} />
      )}
    </>
  );
}
