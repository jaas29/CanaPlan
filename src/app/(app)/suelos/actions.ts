"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createSoilReference(formData: FormData) {
  const sourceType = (formData.get("sourceType") as string) || "ingenio";
  const sourceName = (formData.get("sourceName") as string).trim();
  const sourceLotCode = (formData.get("sourceLotCode") as string)?.trim() || null;
  const analysisDateStr = formData.get("analysisDate") as string | null;
  const year = Number(formData.get("year")) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!sourceName) throw new Error("Nombre de fuente es requerido");

  // Parse optional numeric soil values
  const ph = Number(formData.get("ph")) || null;
  const organicMatterPct = Number(formData.get("organicMatterPct")) || null;
  const phosphorus = Number(formData.get("phosphorus")) || null;
  const potassium = Number(formData.get("potassium")) || null;
  const calcium = Number(formData.get("calcium")) || null;
  const magnesium = Number(formData.get("magnesium")) || null;
  const acidity = Number(formData.get("acidity")) || null;
  const iron = Number(formData.get("iron")) || null;
  const copper = Number(formData.get("copper")) || null;
  const zinc = Number(formData.get("zinc")) || null;
  const manganese = Number(formData.get("manganese")) || null;

  await prisma.soilReferenceAnalysis.create({
    data: {
      sourceType,
      sourceName,
      sourceLotCode,
      analysisDate: analysisDateStr ? new Date(analysisDateStr) : null,
      year,
      ph,
      organicMatterPct,
      phosphorus,
      potassium,
      calcium,
      magnesium,
      acidity,
      iron,
      copper,
      zinc,
      manganese,
      notes,
    },
  });

  redirect("/suelos");
}

export async function updateSoilReference(formData: FormData) {
  const id = Number(formData.get("id"));
  const sourceType = (formData.get("sourceType") as string) || "ingenio";
  const sourceName = (formData.get("sourceName") as string).trim();
  const sourceLotCode = (formData.get("sourceLotCode") as string)?.trim() || null;
  const analysisDateStr = formData.get("analysisDate") as string | null;
  const year = Number(formData.get("year")) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!id || !sourceName) throw new Error("ID y nombre de fuente son requeridos");

  const ph = Number(formData.get("ph")) || null;
  const organicMatterPct = Number(formData.get("organicMatterPct")) || null;
  const phosphorus = Number(formData.get("phosphorus")) || null;
  const potassium = Number(formData.get("potassium")) || null;
  const calcium = Number(formData.get("calcium")) || null;
  const magnesium = Number(formData.get("magnesium")) || null;
  const acidity = Number(formData.get("acidity")) || null;
  const iron = Number(formData.get("iron")) || null;
  const copper = Number(formData.get("copper")) || null;
  const zinc = Number(formData.get("zinc")) || null;
  const manganese = Number(formData.get("manganese")) || null;

  await prisma.soilReferenceAnalysis.update({
    where: { id },
    data: {
      sourceType,
      sourceName,
      sourceLotCode,
      analysisDate: analysisDateStr ? new Date(analysisDateStr) : null,
      year,
      ph,
      organicMatterPct,
      phosphorus,
      potassium,
      calcium,
      magnesium,
      acidity,
      iron,
      copper,
      zinc,
      manganese,
      notes,
    },
  });

  redirect(`/suelos/${id}`);
}

export async function deleteSoilReference(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("ID requerido");

  // Cascade delete will remove lot_soil_references automatically (onDelete: Cascade)
  await prisma.soilReferenceAnalysis.delete({ where: { id } });
  redirect("/suelos");
}

export async function linkLotToSoilReference(formData: FormData) {
  const soilRefId = Number(formData.get("soilRefId"));
  const lotId = Number(formData.get("lotId"));
  const mappingNote = (formData.get("mappingNote") as string)?.trim() || null;

  if (!soilRefId || !lotId) throw new Error("Analisis y lote son requeridos");

  // Check if already linked
  const existing = await prisma.lotSoilReference.findUnique({
    where: { lotId_soilReferenceAnalysisId: { lotId, soilReferenceAnalysisId: soilRefId } },
  });
  if (existing) throw new Error("Este lote ya esta vinculado a este analisis");

  await prisma.lotSoilReference.create({
    data: {
      lotId,
      soilReferenceAnalysisId: soilRefId,
      mappingNote,
    },
  });

  redirect(`/suelos/${soilRefId}`);
}

export async function unlinkLotFromSoilReference(formData: FormData) {
  const linkId = Number(formData.get("linkId"));
  const soilRefId = Number(formData.get("soilRefId"));
  if (!linkId) throw new Error("Link ID requerido");

  await prisma.lotSoilReference.delete({ where: { id: linkId } });
  redirect(`/suelos/${soilRefId}`);
}
