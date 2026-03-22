"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { calculateApplicationNutrients } from "@/lib/nutrients";

interface ApplicationInput {
  applicationNumber: number;
  formulaId: number;
  sacksPerHa: number;
  plannedDate: string | null;
}

export async function createPlan(formData: FormData) {
  const lotId = Number(formData.get("lotId"));
  const harvestSeasonId = Number(formData.get("harvestSeasonId"));
  const targetTch = Number(formData.get("targetTch"));
  const notes = (formData.get("notes") as string) || null;

  // Parse applications from JSON
  const applicationsJson = formData.get("applications") as string;
  const applications: ApplicationInput[] = JSON.parse(applicationsJson);

  // Validate
  if (!lotId || !harvestSeasonId || !targetTch || applications.length === 0) {
    throw new Error("Faltan campos requeridos");
  }

  // Get lot area for calculations
  const lot = await prisma.lot.findUniqueOrThrow({ where: { id: lotId } });

  // Compute N required
  const nRatePerTch = 1.2;
  const nRequiredKg = targetTch * nRatePerTch * lot.areaHa;

  // Create plan with applications in a transaction
  const plan = await prisma.fertilizationPlan.create({
    data: {
      lotId,
      harvestSeasonId,
      targetTch,
      nRatePerTch,
      nRequiredKg,
      notes,
      status: "borrador",
      applications: {
        create: await Promise.all(
          applications.map(async (app) => {
            const formula = await prisma.formula.findUniqueOrThrow({
              where: { id: app.formulaId },
            });

            const nutrients = calculateApplicationNutrients(
              formula,
              app.sacksPerHa,
              lot.areaHa,
            );

            return {
              applicationNumber: app.applicationNumber,
              formulaId: app.formulaId,
              sacksPerHa: app.sacksPerHa,
              totalSacks: app.sacksPerHa * lot.areaHa,
              doseKgPerHa: app.sacksPerHa * formula.kgPerSack,
              plannedDate: app.plannedDate ? new Date(app.plannedDate) : null,
              nContributedKg: nutrients.nKg,
              p2o5ContributedKg: nutrients.p2o5Kg,
              k2oContributedKg: nutrients.k2oKg,
              sContributedKg: nutrients.sKg,
              mgoContributedKg: nutrients.mgoKg,
              caoContributedKg: nutrients.caoKg,
            };
          }),
        ),
      },
    },
  });

  redirect(`/planes/${plan.id}`);
}

export async function updatePlan(formData: FormData) {
  const planId = Number(formData.get("planId"));
  const targetTch = Number(formData.get("targetTch"));
  const notes = (formData.get("notes") as string) || null;
  const applicationsJson = formData.get("applications") as string;
  const applications: ApplicationInput[] = JSON.parse(applicationsJson);

  if (!planId || !targetTch || applications.length === 0) {
    throw new Error("Faltan campos requeridos");
  }

  const plan = await prisma.fertilizationPlan.findUniqueOrThrow({
    where: { id: planId },
    include: { lot: true },
  });

  const lot = plan.lot;
  const nRatePerTch = 1.2;
  const nRequiredKg = targetTch * nRatePerTch * lot.areaHa;

  // Delete old plan applications (cascade deletes are not automatic here
  // since we're replacing, not deleting the plan itself).
  // First delete any application records linked to existing plan applications.
  const oldPlanApps = await prisma.planApplication.findMany({
    where: { planId },
    select: { id: true },
  });
  const oldPlanAppIds = oldPlanApps.map((a) => a.id);

  if (oldPlanAppIds.length > 0) {
    await prisma.applicationRecord.deleteMany({
      where: { planApplicationId: { in: oldPlanAppIds } },
    });
    await prisma.planApplication.deleteMany({
      where: { planId },
    });
  }

  // Create new plan applications with recalculated nutrients
  for (const app of applications) {
    const formula = await prisma.formula.findUniqueOrThrow({
      where: { id: app.formulaId },
    });

    const nutrients = calculateApplicationNutrients(
      formula,
      app.sacksPerHa,
      lot.areaHa,
    );

    await prisma.planApplication.create({
      data: {
        planId,
        applicationNumber: app.applicationNumber,
        formulaId: app.formulaId,
        sacksPerHa: app.sacksPerHa,
        totalSacks: app.sacksPerHa * lot.areaHa,
        doseKgPerHa: app.sacksPerHa * formula.kgPerSack,
        plannedDate: app.plannedDate ? new Date(app.plannedDate) : null,
        nContributedKg: nutrients.nKg,
        p2o5ContributedKg: nutrients.p2o5Kg,
        k2oContributedKg: nutrients.k2oKg,
        sContributedKg: nutrients.sKg,
        mgoContributedKg: nutrients.mgoKg,
        caoContributedKg: nutrients.caoKg,
      },
    });
  }

  // Update plan header
  await prisma.fertilizationPlan.update({
    where: { id: planId },
    data: {
      targetTch,
      nRatePerTch,
      nRequiredKg,
      notes,
    },
  });

  redirect(`/planes/${planId}`);
}

export async function deletePlan(formData: FormData) {
  const planId = Number(formData.get("planId"));
  if (!planId) throw new Error("Plan ID requerido");

  // Delete application records linked to this plan's applications first
  const planApps = await prisma.planApplication.findMany({
    where: { planId },
    select: { id: true },
  });
  const planAppIds = planApps.map((a) => a.id);

  if (planAppIds.length > 0) {
    await prisma.applicationRecord.deleteMany({
      where: { planApplicationId: { in: planAppIds } },
    });
  }

  // Cascade: PlanApplication deleted via onDelete: Cascade in schema
  await prisma.fertilizationPlan.delete({ where: { id: planId } });

  redirect("/planes");
}
