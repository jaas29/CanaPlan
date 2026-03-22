import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import RegistrarAplicacionForm from "./RegistrarAplicacionForm";

export default async function NuevaAplicacionPage({
  searchParams,
}: {
  searchParams: Promise<{ planAppId?: string; planId?: string }>;
}) {
  const sp = await searchParams;

  // If arriving from a specific planned application
  let prefill = null;
  if (sp.planAppId) {
    const planApp = await prisma.planApplication.findUnique({
      where: { id: Number(sp.planAppId) },
      include: {
        formula: true,
        plan: { include: { lot: true, harvestSeason: true } },
      },
    });
    if (planApp) {
      prefill = {
        planApplicationId: planApp.id,
        lotId: planApp.plan.lotId,
        lotName: planApp.plan.lot.displayName,
        formulaId: planApp.formulaId,
        formulaName: planApp.formula.name,
        plannedSacks: planApp.totalSacks,
        sacksPerHa: planApp.sacksPerHa,
        applicationNumber: planApp.applicationNumber,
        seasonName: planApp.plan.harvestSeason.name,
      };
    }
  }

  // If arriving from a plan (pick first unrecorded application)
  if (!prefill && sp.planId) {
    const plan = await prisma.fertilizationPlan.findUnique({
      where: { id: Number(sp.planId) },
      include: {
        lot: true,
        harvestSeason: true,
        applications: {
          include: {
            formula: true,
            applicationRecords: true,
          },
          orderBy: { applicationNumber: "asc" },
        },
      },
    });
    if (plan) {
      const unrecorded = plan.applications.find(
        (a) => a.applicationRecords.length === 0,
      );
      if (unrecorded) {
        prefill = {
          planApplicationId: unrecorded.id,
          lotId: plan.lotId,
          lotName: plan.lot.displayName,
          formulaId: unrecorded.formulaId,
          formulaName: unrecorded.formula.name,
          plannedSacks: unrecorded.totalSacks,
          sacksPerHa: unrecorded.sacksPerHa,
          applicationNumber: unrecorded.applicationNumber,
          seasonName: plan.harvestSeason.name,
        };
      }
    }
  }

  const [lots, formulas] = await Promise.all([
    prisma.lot.findMany({ orderBy: { displayName: "asc" } }),
    prisma.formula.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Registrar Aplicacion"
        description={
          prefill
            ? `${prefill.applicationNumber === 1 ? "1ra" : "2da"} aplicacion para ${prefill.lotName} · Zafra ${prefill.seasonName}`
            : "Registrar una aplicacion de fertilizante realizada en campo"
        }
      />
      <div className="mt-6">
        <RegistrarAplicacionForm
          lots={lots.map((l) => ({ id: l.id, displayName: l.displayName, areaHa: l.areaHa }))}
          formulas={formulas.map((f) => ({ id: f.id, name: f.name }))}
          prefill={prefill}
        />
      </div>
    </>
  );
}
