import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import SimuladorForm from "./SimuladorForm";

export default async function SimuladorPage() {
  const [formulas, lots] = await Promise.all([
    prisma.formula.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.lot.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Simulador TCH"
        description="Estimacion de nutrientes y costos por meta de rendimiento"
      />
      <div className="mt-6">
        <SimuladorForm
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
            costPerSack: f.costPerSack,
          }))}
          lots={lots.map((l) => ({ id: l.id, displayName: l.displayName, areaHa: l.areaHa }))}
        />
      </div>
    </>
  );
}
