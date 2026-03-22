import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditarResultadoForm from "./EditarResultadoForm";

export default async function EditarResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resultId = Number(id);
  if (isNaN(resultId)) notFound();

  const result = await prisma.yieldResult.findUnique({
    where: { id: resultId },
    include: { lot: true, harvestSeason: true },
  });

  if (!result) notFound();

  return (
    <>
      <PageHeader
        title="Editar Resultado"
        description={`${result.lot.displayName} · Zafra ${result.harvestSeason.name}`}
      />
      <div className="mt-6">
        <EditarResultadoForm
          result={{
            id: result.id,
            lotName: result.lot.displayName,
            seasonName: result.harvestSeason.name,
            actualTch: result.actualTch,
            targetTch: result.targetTch,
            harvestDate: result.harvestDate
              ? new Date(result.harvestDate).toISOString().split("T")[0]
              : "",
            notes: result.notes ?? "",
          }}
        />
      </div>
    </>
  );
}
