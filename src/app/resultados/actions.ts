"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createYieldResult(formData: FormData) {
  const lotId = Number(formData.get("lotId"));
  const harvestSeasonId = Number(formData.get("harvestSeasonId"));
  const actualTch = Number(formData.get("actualTch"));
  const harvestDate = formData.get("harvestDate") as string | null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!lotId || !harvestSeasonId || !actualTch || actualTch <= 0) {
    throw new Error("Lote, zafra y TCH real son requeridos");
  }

  const lot = await prisma.lot.findUniqueOrThrow({ where: { id: lotId } });
  const totalTons = actualTch * lot.areaHa;

  // Get target TCH from plan if one exists
  const plan = await prisma.fertilizationPlan.findUnique({
    where: { lotId_harvestSeasonId: { lotId, harvestSeasonId } },
  });

  await prisma.yieldResult.upsert({
    where: { lotId_harvestSeasonId: { lotId, harvestSeasonId } },
    create: {
      lotId,
      harvestSeasonId,
      actualTch,
      totalTons,
      targetTch: plan?.targetTch ?? null,
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      notes,
    },
    update: {
      actualTch,
      totalTons,
      targetTch: plan?.targetTch ?? null,
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      notes,
    },
  });

  // If plan exists and all applications recorded, mark as completado
  if (plan) {
    await prisma.fertilizationPlan.update({
      where: { id: plan.id },
      data: { status: "completado" },
    });
  }

  redirect("/resultados");
}

export async function deleteYieldResult(formData: FormData) {
  const resultId = Number(formData.get("resultId"));
  if (!resultId) throw new Error("Result ID requerido");

  const result = await prisma.yieldResult.findUnique({
    where: { id: resultId },
  });
  if (!result) throw new Error("Resultado no encontrado");

  // If there's a linked plan marked as "completado", revert to "en_progreso"
  const plan = await prisma.fertilizationPlan.findUnique({
    where: {
      lotId_harvestSeasonId: {
        lotId: result.lotId,
        harvestSeasonId: result.harvestSeasonId,
      },
    },
  });

  await prisma.yieldResult.delete({ where: { id: resultId } });

  if (plan && plan.status === "completado") {
    await prisma.fertilizationPlan.update({
      where: { id: plan.id },
      data: { status: "en_progreso" },
    });
  }

  redirect("/resultados");
}
