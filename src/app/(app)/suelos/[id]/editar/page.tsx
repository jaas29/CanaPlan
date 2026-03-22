import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import SoilReferenceForm from "../../SoilReferenceForm";
import { updateSoilReference } from "../../actions";

export default async function EditarSueloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const soilId = Number(id);
  if (isNaN(soilId)) notFound();

  const analysis = await prisma.soilReferenceAnalysis.findUnique({ where: { id: soilId } });
  if (!analysis) notFound();

  return (
    <>
      <PageHeader
        title={`Editar: ${analysis.sourceName}`}
        description="Modificar analisis de suelo de referencia"
      />
      <div className="mt-6">
        <SoilReferenceForm
          action={updateSoilReference}
          submitLabel="Guardar Cambios"
          initial={{
            id: analysis.id,
            sourceType: analysis.sourceType,
            sourceName: analysis.sourceName,
            sourceLotCode: analysis.sourceLotCode ?? "",
            analysisDate: analysis.analysisDate
              ? analysis.analysisDate.toISOString().split("T")[0]
              : "",
            year: analysis.year ? String(analysis.year) : "",
            ph: analysis.ph != null ? String(analysis.ph) : "",
            organicMatterPct: analysis.organicMatterPct != null ? String(analysis.organicMatterPct) : "",
            phosphorus: analysis.phosphorus != null ? String(analysis.phosphorus) : "",
            potassium: analysis.potassium != null ? String(analysis.potassium) : "",
            calcium: analysis.calcium != null ? String(analysis.calcium) : "",
            magnesium: analysis.magnesium != null ? String(analysis.magnesium) : "",
            acidity: analysis.acidity != null ? String(analysis.acidity) : "",
            iron: analysis.iron != null ? String(analysis.iron) : "",
            copper: analysis.copper != null ? String(analysis.copper) : "",
            zinc: analysis.zinc != null ? String(analysis.zinc) : "",
            manganese: analysis.manganese != null ? String(analysis.manganese) : "",
            notes: analysis.notes ?? "",
          }}
        />
      </div>
    </>
  );
}
