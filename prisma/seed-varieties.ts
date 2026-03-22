import "dotenv/config";
import { prisma } from "../src/lib/db";

const VARIETIES = [
  { displayName: "B 80-408", code: "b-80-408" },
  { displayName: "B 77-95", code: "b-77-95" },
  { displayName: "B 82-333", code: "b-82-333" },
  { displayName: "LAICA 04-809", code: "laica-04-809" },
  { displayName: "LAICA 08-390", code: "laica-08-390" },
  { displayName: "LAICA 10-207", code: "laica-10-207" },
  { displayName: "LAICA 12-340", code: "laica-12-340" },
  { displayName: "NA 56-42", code: "na-56-42" },
  { displayName: "CC 01-1940", code: "cc-01-1940" },
  { displayName: "RB 86-7515", code: "rb-86-7515" },
  { displayName: "SP 71-6949", code: "sp-71-6949" },
];

async function main() {
  console.log("Seeding varieties...");

  for (const v of VARIETIES) {
    const existing = await prisma.variety.findUnique({ where: { code: v.code } });
    if (!existing) {
      await prisma.variety.create({ data: v });
      console.log(`  Created: ${v.displayName}`);
    } else {
      console.log(`  Already exists: ${v.displayName}`);
    }
  }

  // Backfill lots: match lot.variety (free text) to variety records
  const allVarieties = await prisma.variety.findMany();
  const lots = await prisma.lot.findMany({ where: { varietyId: null, variety: { not: null } } });

  let backfilled = 0;
  for (const lot of lots) {
    if (!lot.variety) continue;
    const match = allVarieties.find(
      (v) => v.displayName.toLowerCase() === lot.variety!.toLowerCase()
    );
    if (match) {
      await prisma.lot.update({
        where: { id: lot.id },
        data: { varietyId: match.id },
      });
      backfilled++;
    } else {
      console.log(`  No match for lot "${lot.displayName}" variety "${lot.variety}"`);
    }
  }

  console.log(`Backfilled ${backfilled} lots with varietyId.`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void 0);
