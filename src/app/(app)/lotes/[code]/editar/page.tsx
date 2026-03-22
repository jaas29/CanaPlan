import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import LotForm from "../../LotForm";
import { updateLot } from "../../actions";

export default async function EditarLotePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [lot, varieties] = await Promise.all([
    prisma.lot.findUnique({ where: { code } }),
    prisma.variety.findMany({ where: { isActive: true }, orderBy: { displayName: "asc" } }),
  ]);
  if (!lot) notFound();

  return (
    <>
      <PageHeader
        title={`Editar: ${lot.displayName}`}
        description="Modificar datos del lote"
      />
      <div className="mt-6">
        <LotForm
          action={updateLot}
          submitLabel="Guardar Cambios"
          varieties={varieties.map((v) => ({ id: v.id, displayName: v.displayName }))}
          initial={{
            id: lot.id,
            displayName: lot.displayName,
            farmGroup: lot.farmGroup ?? "",
            varietyId: lot.varietyId ? String(lot.varietyId) : "",
            areaHa: String(lot.areaHa),
            lifecycleStatus: lot.lifecycleStatus,
            harvestCycleCount: String(lot.harvestCycleCount),
            soilReferenceZone: lot.soilReferenceZone ?? "",
            notes: lot.notes ?? "",
          }}
        />
      </div>
    </>
  );
}
