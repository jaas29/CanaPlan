"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

export interface ParsedLot {
  rowNum: number;
  farmGroupId: string;
  displayName: string;
  harvestCycleCount: number;
  variety: string;
  areaHa: number;
  lifecycleStatus: string;
  error: string | null;
  isDuplicate: boolean;
}

export async function parseExcel(formData: FormData): Promise<ParsedLot[]> {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("Archivo requerido");

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

  // Find header row (look for "Nom_Finca" or similar)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    if (Array.isArray(row) && row.some((c) => String(c).includes("Nom_Finca") || String(c).includes("Área"))) {
      headerIdx = i;
      break;
    }
  }

  const headers = (rows[headerIdx] as string[]).map((h) => String(h ?? "").trim());
  const idxId = headers.findIndex((h) => h === "ID");
  const idxName = headers.findIndex((h) => h.includes("Nom_Finca") || h.includes("Nombre"));
  const idxCosechas = headers.findIndex((h) => h.includes("Cosechas"));
  const idxVariedad = headers.findIndex((h) => h.includes("Variedad"));
  const idxArea = headers.findIndex((h) => h.includes("rea"));

  if (idxName === -1 || idxArea === -1) {
    throw new Error("No se encontraron las columnas requeridas (Nom_Finca, Area). Verifica el formato.");
  }

  // Get existing lot names for duplicate detection
  const existingLots = await prisma.lot.findMany({ select: { displayName: true } });
  const existingNames = new Set(existingLots.map((l) => l.displayName.toLowerCase()));

  const parsed: ParsedLot[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length === 0 || !row[idxName]) continue;

    const displayName = String(row[idxName] ?? "").trim();
    if (!displayName) continue;

    const rawArea = Number(row[idxArea]);
    const areaHa = isNaN(rawArea) || rawArea <= 0 ? 0 : rawArea;

    const rawCosechas = String(row[idxCosechas] ?? "0");
    // Handle "0/3" format - take first number
    const cosechasNum = parseInt(rawCosechas.split("/")[0]) || 0;

    const rawVariedad = String(row[idxVariedad] ?? "").trim();
    // Detect lifecycle: if variety is "Barbecho" or cosechas is 0
    let lifecycleStatus = "soca";
    if (rawVariedad.toLowerCase() === "barbecho") {
      lifecycleStatus = "barbecho";
    } else if (cosechasNum === 0) {
      lifecycleStatus = "planta";
    }

    const variety = rawVariedad.toLowerCase() === "barbecho" ? null : rawVariedad;

    const farmGroupId = idxId !== -1 ? String(row[idxId] ?? "") : "";

    let error: string | null = null;
    if (!displayName) error = "Nombre requerido";
    else if (areaHa <= 0) error = "Area invalida";

    const isDuplicate = existingNames.has(displayName.toLowerCase());

    parsed.push({
      rowNum: i + 1,
      farmGroupId,
      displayName,
      harvestCycleCount: cosechasNum,
      variety: variety || "",
      areaHa,
      lifecycleStatus,
      error,
      isDuplicate,
    });
  }

  return parsed;
}

function toCode(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function importLots(formData: FormData) {
  const lotsJson = formData.get("lots") as string;
  const lots: ParsedLot[] = JSON.parse(lotsJson);

  // Filter out rows with errors
  const validLots = lots.filter((l) => !l.error);
  if (validLots.length === 0) throw new Error("No hay lotes validos para importar");

  let imported = 0;
  let skipped = 0;

  for (const lot of validLots) {
    // Skip duplicates
    if (lot.isDuplicate) {
      skipped++;
      continue;
    }

    let code = toCode(lot.displayName);
    const existing = await prisma.lot.findUnique({ where: { code } });
    if (existing) {
      code = `${code}-${Date.now().toString(36).slice(-4)}`;
    }

    await prisma.lot.create({
      data: {
        code,
        displayName: lot.displayName,
        farmGroup: lot.farmGroupId ? `Grupo ${lot.farmGroupId}` : null,
        variety: lot.variety || null,
        areaHa: lot.areaHa,
        lifecycleStatus: lot.lifecycleStatus,
        harvestCycleCount: lot.harvestCycleCount,
      },
    });
    imported++;
  }

  redirect(`/lotes?imported=${imported}&skipped=${skipped}`);
}
