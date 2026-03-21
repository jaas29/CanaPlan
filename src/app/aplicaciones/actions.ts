"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createApplicationRecord(formData: FormData) {
  const planApplicationId = formData.get("planApplicationId")
    ? Number(formData.get("planApplicationId"))
    : null;
  const lotId = Number(formData.get("lotId"));
  const formulaId = Number(formData.get("formulaId"));
  const actualDate = formData.get("actualDate") as string;
  const actualSacks = Number(formData.get("actualSacks"));
  const operatorName = (formData.get("operatorName") as string) || null;
  const observations = (formData.get("observations") as string) || null;

  if (!lotId || !formulaId || !actualDate || !actualSacks) {
    throw new Error("Faltan campos requeridos");
  }

  // Calculate kg/ha if we have lot area
  const lot = await prisma.lot.findUniqueOrThrow({ where: { id: lotId } });
  const formula = await prisma.formula.findUniqueOrThrow({ where: { id: formulaId } });
  const actualKgPerHa = (actualSacks / lot.areaHa) * formula.kgPerSack;

  await prisma.applicationRecord.create({
    data: {
      planApplicationId,
      lotId,
      formulaId,
      actualDate: new Date(actualDate),
      actualSacks,
      actualKgPerHa,
      operatorName,
      observations,
    },
  });

  // If linked to a plan, update plan status to en_progreso
  if (planApplicationId) {
    const planApp = await prisma.planApplication.findUnique({
      where: { id: planApplicationId },
      include: { plan: true },
    });
    if (planApp && planApp.plan.status === "borrador") {
      await prisma.fertilizationPlan.update({
        where: { id: planApp.plan.id },
        data: { status: "en_progreso" },
      });
    }
  }

  redirect("/aplicaciones");
}

export async function updateApplicationRecord(formData: FormData) {
  const recordId = Number(formData.get("recordId"));
  const formulaId = Number(formData.get("formulaId"));
  const actualDate = formData.get("actualDate") as string;
  const actualSacks = Number(formData.get("actualSacks"));
  const operatorName = (formData.get("operatorName") as string) || null;
  const observations = (formData.get("observations") as string) || null;

  if (!recordId || !formulaId || !actualDate || !actualSacks) {
    throw new Error("Faltan campos requeridos");
  }

  const record = await prisma.applicationRecord.findUniqueOrThrow({
    where: { id: recordId },
  });
  const lot = await prisma.lot.findUniqueOrThrow({ where: { id: record.lotId } });
  const formula = await prisma.formula.findUniqueOrThrow({ where: { id: formulaId } });
  const actualKgPerHa = (actualSacks / lot.areaHa) * formula.kgPerSack;

  await prisma.applicationRecord.update({
    where: { id: recordId },
    data: {
      formulaId,
      actualDate: new Date(actualDate),
      actualSacks,
      actualKgPerHa,
      operatorName,
      observations,
    },
  });

  redirect("/aplicaciones");
}

export async function deleteApplicationRecord(formData: FormData) {
  const recordId = Number(formData.get("recordId"));
  if (!recordId) throw new Error("Record ID requerido");

  const record = await prisma.applicationRecord.findUnique({
    where: { id: recordId },
    include: {
      planApplication: { include: { plan: true } },
    },
  });
  if (!record) throw new Error("Registro no encontrado");

  await prisma.applicationRecord.delete({ where: { id: recordId } });

  // If this was the last application record for a plan, revert plan to "borrador"
  if (record.planApplication) {
    const plan = record.planApplication.plan;
    const remainingRecords = await prisma.applicationRecord.count({
      where: {
        planApplication: { planId: plan.id },
      },
    });
    if (remainingRecords === 0 && plan.status === "en_progreso") {
      await prisma.fertilizationPlan.update({
        where: { id: plan.id },
        data: { status: "borrador" },
      });
    }
  }

  redirect("/aplicaciones");
}
