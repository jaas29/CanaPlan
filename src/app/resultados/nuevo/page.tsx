import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import ResultadoForm from "./ResultadoForm";

export default async function NuevoResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ lotId?: string; seasonId?: string }>;
}) {
  const sp = await searchParams;

  const [lots, seasons] = await Promise.all([
    prisma.lot.findMany({ orderBy: { displayName: "asc" } }),
    prisma.harvestSeason.findMany({ orderBy: { name: "desc" } }),
  ]);

  // Check if there's a plan to get target TCH
  let prefillTargetTch: number | null = null;
  if (sp.lotId && sp.seasonId) {
    const plan = await prisma.fertilizationPlan.findUnique({
      where: {
        lotId_harvestSeasonId: {
          lotId: Number(sp.lotId),
          harvestSeasonId: Number(sp.seasonId),
        },
      },
    });
    prefillTargetTch = plan?.targetTch ?? null;
  }

  return (
    <>
      <PageHeader
        title="Registrar Resultado de Cosecha"
        description="Registrar el rendimiento (TCH) real de un lote"
      />
      <div className="mt-6">
        <ResultadoForm
          lots={lots.map((l) => ({ id: l.id, displayName: l.displayName, areaHa: l.areaHa }))}
          seasons={seasons.map((s) => ({ id: s.id, name: s.name }))}
          prefillLotId={sp.lotId ?? ""}
          prefillSeasonId={sp.seasonId ?? ""}
          prefillTargetTch={prefillTargetTch}
        />
      </div>
    </>
  );
}
