"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createFormula(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const nPct = Number(formData.get("nPct"));
  const p2o5Pct = Number(formData.get("p2o5Pct"));
  const k2oPct = Number(formData.get("k2oPct"));
  const sPct = Number(formData.get("sPct") || 0);
  const mgoPct = Number(formData.get("mgoPct") || 0);
  const caoPct = Number(formData.get("caoPct") || 0);
  const kgPerSack = Number(formData.get("kgPerSack") || 50);
  const costPerSack = Number(formData.get("costPerSack") || 0) || null;
  const nitrogenSource = (formData.get("nitrogenSource") as string)?.trim() || null;

  if (!name) throw new Error("Nombre es requerido");

  await prisma.formula.create({
    data: { name, nPct, p2o5Pct, k2oPct, sPct, mgoPct, caoPct, kgPerSack, costPerSack, nitrogenSource },
  });

  redirect("/formulas");
}

export async function updateFormula(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string).trim();
  const nPct = Number(formData.get("nPct"));
  const p2o5Pct = Number(formData.get("p2o5Pct"));
  const k2oPct = Number(formData.get("k2oPct"));
  const sPct = Number(formData.get("sPct") || 0);
  const mgoPct = Number(formData.get("mgoPct") || 0);
  const caoPct = Number(formData.get("caoPct") || 0);
  const kgPerSack = Number(formData.get("kgPerSack") || 50);
  const costPerSack = Number(formData.get("costPerSack") || 0) || null;
  const nitrogenSource = (formData.get("nitrogenSource") as string)?.trim() || null;

  if (!id || !name) throw new Error("ID y nombre son requeridos");

  await prisma.formula.update({
    where: { id },
    data: { name, nPct, p2o5Pct, k2oPct, sPct, mgoPct, caoPct, kgPerSack, costPerSack, nitrogenSource },
  });

  redirect("/formulas");
}

export async function deleteFormula(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Formula ID requerido");

  const planAppCount = await prisma.planApplication.count({ where: { formulaId: id } });
  if (planAppCount > 0) {
    throw new Error(`No se puede eliminar: la formula esta vinculada a ${planAppCount} aplicacion(es) planificada(s).`);
  }

  const recCount = await prisma.applicationRecord.count({ where: { formulaId: id } });
  if (recCount > 0) {
    throw new Error(`No se puede eliminar: la formula tiene ${recCount} registro(s) de aplicacion.`);
  }

  await prisma.formula.delete({ where: { id } });
  redirect("/formulas");
}
