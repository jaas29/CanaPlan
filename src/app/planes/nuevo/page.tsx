import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import NuevoPlanForm from "./NuevoPlanForm";

export default async function NuevoPlanPage() {
  const [lots, formulas, seasons] = await Promise.all([
    prisma.lot.findMany({ orderBy: { displayName: "asc" } }),
    prisma.formula.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.harvestSeason.findMany({ orderBy: { name: "desc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Nuevo Plan de Fertilizacion"
        description="Crear plan por lote con calculo automatico de nutrientes"
      />
      <div className="mt-6">
        <NuevoPlanForm
          lots={lots.map((l) => ({
            id: l.id,
            displayName: l.displayName,
            areaHa: l.areaHa,
            variety: l.variety,
          }))}
          formulas={formulas.map((f) => ({
            id: f.id,
            name: f.name,
            nPct: f.nPct,
            p2o5Pct: f.p2o5Pct,
            k2oPct: f.k2oPct,
            sPct: f.sPct,
            mgoPct: f.mgoPct,
            caoPct: f.caoPct,
            kgPerSack: f.kgPerSack,
          }))}
          seasons={seasons.map((s) => ({
            id: s.id,
            name: s.name,
          }))}
        />
      </div>
    </>
  );
}
