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

export async function createVariety(formData: FormData) {
  const displayName = (formData.get("displayName") as string).trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!displayName) throw new Error("Nombre es requerido");

  const code = toCode(displayName);
  const existing = await prisma.variety.findUnique({ where: { code } });
  if (existing) throw new Error(`Ya existe una variedad con codigo "${code}"`);

  await prisma.variety.create({ data: { code, displayName, notes } });
  redirect("/variedades");
}

export async function updateVariety(formData: FormData) {
  const id = Number(formData.get("id"));
  const displayName = (formData.get("displayName") as string).trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "true";

  if (!id || !displayName) throw new Error("ID y nombre son requeridos");

  await prisma.variety.update({
    where: { id },
    data: { displayName, notes, isActive },
  });

  redirect("/variedades");
}

export async function deleteVariety(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Variedad ID requerido");

  const lotCount = await prisma.lot.count({ where: { varietyId: id } });
  if (lotCount > 0) {
    throw new Error(`No se puede eliminar: la variedad esta asignada a ${lotCount} lote(s).`);
  }

  await prisma.variety.delete({ where: { id } });
  redirect("/variedades");
}
