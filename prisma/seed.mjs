import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

const { PrismaClient } = await import("../src/generated/prisma/client.ts");
const prisma = new PrismaClient({ adapter });

// ── Formulas (5 known from company documents) ─────────────────────
const formulas = [
  { name: "13-21.3-18-2.4(S)", nPct: 13, p2o5Pct: 21.3, k2oPct: 18, sPct: 2.4, mgoPct: 0, caoPct: 0, kgPerSack: 50, nitrogenSource: "Nitrato de amonio" },
  { name: "19-0-23.2-3.1(S)", nPct: 19, p2o5Pct: 0, k2oPct: 23.2, sPct: 3.1, mgoPct: 0, caoPct: 0, kgPerSack: 50, nitrogenSource: "Nitrato de amonio" },
  { name: "17.7-9.2-24-0-4.2(S)", nPct: 17.7, p2o5Pct: 9.2, k2oPct: 24, sPct: 4.2, mgoPct: 0, caoPct: 0, kgPerSack: 50, nitrogenSource: null },
  { name: "17.2-6-21.9-3.9(S)", nPct: 17.2, p2o5Pct: 6, k2oPct: 21.9, sPct: 3.9, mgoPct: 0, caoPct: 0, kgPerSack: 50, nitrogenSource: null },
  { name: "9.9-5.7-9.3-2.5-7.47(MgO)-12.45(CaO)", nPct: 9.9, p2o5Pct: 5.7, k2oPct: 9.3, sPct: 2.5, mgoPct: 7.47, caoPct: 12.45, kgPerSack: 50, nitrogenSource: null },
];

for (const f of formulas) {
  await prisma.formula.upsert({ where: { name: f.name }, update: f, create: f });
}
console.log(`Seeded ${formulas.length} formulas`);

// ── Harvest Seasons ───────────────────────────────────────────────
for (const s of [
  { name: "2025-2026", startDate: new Date("2025-11-01"), endDate: new Date("2026-10-31") },
  { name: "2026-2027", startDate: new Date("2026-11-01"), endDate: new Date("2027-10-31") },
]) {
  await prisma.harvestSeason.upsert({ where: { name: s.name }, update: {}, create: s });
}
console.log("Seeded 2 harvest seasons");

// ── Sample Lots ───────────────────────────────────────────────────
const lots = [
  { code: "nicolas-garcia", displayName: "Nicolas Garcia", farmGroup: "ARAZAM", variety: "B 80-408", areaHa: 10.43, harvestCycleCount: 4 },
  { code: "silverio", displayName: "Silverio", farmGroup: "ARAZAM", variety: "LAICA 04-809", areaHa: 7.25, harvestCycleCount: 3 },
  { code: "deyanira-1", displayName: "Deyanira Lote 1", farmGroup: "ARAZAM", variety: "B 80-408", areaHa: 6.81, harvestCycleCount: 5 },
  { code: "deyanira-2", displayName: "Deyanira Lote 2", farmGroup: "ARAZAM", variety: "LAICA 04-809", areaHa: 8.12, harvestCycleCount: 2 },
  { code: "deyanira-3", displayName: "Deyanira Lote 3", farmGroup: "ARAZAM", variety: "B 80-408", areaHa: 5.5, harvestCycleCount: 6 },
];

for (const l of lots) {
  await prisma.lot.upsert({ where: { code: l.code }, update: l, create: { ...l, lifecycleStatus: "soca" } });
}
console.log(`Seeded ${lots.length} sample lots`);

await prisma.$disconnect();
