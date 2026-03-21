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
  const lot = await prisma.lot.findUnique({ where: { code } });
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
          initial={{
            id: lot.id,
            displayName: lot.displayName,
            farmGroup: lot.farmGroup ?? "",
            variety: lot.variety ?? "",
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
