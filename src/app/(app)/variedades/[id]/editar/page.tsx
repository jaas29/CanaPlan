import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import VarietyForm from "../../VarietyForm";
import { updateVariety } from "../../actions";

export default async function EditarVariedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const varietyId = Number(id);
  if (isNaN(varietyId)) notFound();

  const variety = await prisma.variety.findUnique({ where: { id: varietyId } });
  if (!variety) notFound();

  return (
    <>
      <PageHeader
        title={`Editar: ${variety.displayName}`}
        description="Modificar variedad de cana"
      />
      <div className="mt-6 max-w-2xl">
        <VarietyForm
          action={updateVariety}
          initial={{
            id: variety.id,
            displayName: variety.displayName,
            notes: variety.notes ?? "",
            isActive: variety.isActive,
          }}
          submitLabel="Guardar Cambios"
          showActiveToggle
        />
      </div>
    </>
  );
}
