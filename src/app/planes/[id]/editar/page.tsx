import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditarPlanForm from "./EditarPlanForm";

export default async function EditarPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (isNaN(planId)) notFound();

  const plan = await prisma.fertilizationPlan.findUnique({
    where: { id: planId },
    include: {
      lot: true,
      harvestSeason: true,
      applications: {
        include: { formula: true },
        orderBy: { applicationNumber: "asc" },
      },
    },
  });

  if (!plan) notFound();

  const formulas = await prisma.formula.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title={`Editar Plan - ${plan.lot.displayName}`}
        description={`Zafra ${plan.harvestSeason.name} · ${plan.lot.areaHa} ha`}
      />
      <div className="mt-6">
        <EditarPlanForm
          planId={plan.id}
          lot={{ id: plan.lot.id, displayName: plan.lot.displayName, areaHa: plan.lot.areaHa }}
          seasonName={plan.harvestSeason.name}
          initialTargetTch={plan.targetTch}
          initialNotes={plan.notes ?? ""}
          initialApps={plan.applications.map((a) => ({
            formulaId: String(a.formulaId),
            sacksPerHa: String(a.sacksPerHa),
            plannedDate: a.plannedDate
              ? new Date(a.plannedDate).toISOString().split("T")[0]
              : "",
          }))}
          formulas={formulas.map((f) => ({
            id: f.id,
            name: f.name,
            nPct: f.nPct,
            p2o5Pct: f.p2o5Pct,
            k2oPct: f.k2oPct,
            sPct: f.sPct,
            mgoPct: f.mgoPct,
            caoPct: f.caoPct,
            kgPerSack: f.kgPerSack,
          }))}
        />
      </div>
    </>
  );
}
