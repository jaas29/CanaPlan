import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import LotForm from "../LotForm";
import { createLot } from "../actions";

export default async function NuevoLotePage() {
  const varieties = await prisma.variety.findMany({
    where: { isActive: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Nuevo Lote"
        description="Registrar un nuevo lote en el sistema"
      />
      <div className="mt-6">
        <LotForm
          action={createLot}
          submitLabel="Crear Lote"
          varieties={varieties.map((v) => ({ id: v.id, displayName: v.displayName }))}
        />
      </div>
    </>
  );
}
