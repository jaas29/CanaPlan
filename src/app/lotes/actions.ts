"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function toCode(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createLot(formData: FormData) {
  const displayName = (formData.get("displayName") as string).trim();
  const farmGroup = (formData.get("farmGroup") as string)?.trim() || null;
  const variety = (formData.get("variety") as string)?.trim() || null;
  const areaHa = Number(formData.get("areaHa"));
  const lifecycleStatus = (formData.get("lifecycleStatus") as string) || "soca";
  const harvestCycleCount = Number(formData.get("harvestCycleCount") || 0);
  const soilReferenceZone = (formData.get("soilReferenceZone") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!displayName || !areaHa || areaHa <= 0) {
    throw new Error("Nombre y area son requeridos");
  }

  // Generate unique code
  let code = toCode(displayName);
  const existing = await prisma.lot.findUnique({ where: { code } });
  if (existing) {
    code = `${code}-${Date.now().toString(36).slice(-4)}`;
  }

  await prisma.lot.create({
    data: {
      code,
      displayName,
      farmGroup,
      variety,
      areaHa,
      lifecycleStatus,
      harvestCycleCount,
      soilReferenceZone,
      notes,
    },
  });

  redirect("/lotes");
}

export async function updateLot(formData: FormData) {
  const id = Number(formData.get("id"));
  const displayName = (formData.get("displayName") as string).trim();
  const farmGroup = (formData.get("farmGroup") as string)?.trim() || null;
  const variety = (formData.get("variety") as string)?.trim() || null;
  const areaHa = Number(formData.get("areaHa"));
  const lifecycleStatus = (formData.get("lifecycleStatus") as string) || "soca";
  const harvestCycleCount = Number(formData.get("harvestCycleCount") || 0);
  const soilReferenceZone = (formData.get("soilReferenceZone") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!id || !displayName || !areaHa || areaHa <= 0) {
    throw new Error("Nombre y area son requeridos");
  }

  await prisma.lot.update({
    where: { id },
    data: {
      displayName,
      farmGroup,
      variety,
      areaHa,
      lifecycleStatus,
      harvestCycleCount,
      soilReferenceZone,
      notes,
    },
  });

  redirect("/lotes");
}

export async function deleteLot(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Lot ID requerido");

  // Check for dependent plans
  const planCount = await prisma.fertilizationPlan.count({ where: { lotId: id } });
  if (planCount > 0) {
    throw new Error(`No se puede eliminar: el lote tiene ${planCount} plan(es) asociado(s). Elimine los planes primero.`);
  }

  // Check for direct application records
  const recCount = await prisma.applicationRecord.count({ where: { lotId: id } });
  if (recCount > 0) {
    throw new Error(`No se puede eliminar: el lote tiene ${recCount} aplicacion(es) registrada(s).`);
  }

  await prisma.lot.delete({ where: { id } });
  redirect("/lotes");
}
