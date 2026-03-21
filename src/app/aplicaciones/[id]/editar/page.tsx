import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditarAplicacionForm from "./EditarAplicacionForm";

export default async function EditarAplicacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recordId = Number(id);
  if (isNaN(recordId)) notFound();

  const record = await prisma.applicationRecord.findUnique({
    where: { id: recordId },
    include: {
      lot: true,
      formula: true,
      planApplication: {
        include: {
          formula: true,
          plan: { include: { harvestSeason: true } },
        },
      },
    },
  });

  if (!record) notFound();

  const formulas = await prisma.formula.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const pa = record.planApplication;
  const planInfo = pa
    ? `${pa.applicationNumber === 1 ? "1ra" : "2da"} aplicacion · ${pa.formula.name} · ${pa.totalSacks.toFixed(0)} sacos · Zafra ${pa.plan.harvestSeason.name}`
    : null;

  return (
    <>
      <PageHeader
        title="Editar Aplicacion"
        description={`${record.lot.displayName} · ${new Date(record.actualDate).toLocaleDateString("es-CR")}`}
      />
      <div className="mt-6">
        <EditarAplicacionForm
          record={{
            id: record.id,
            lotName: record.lot.displayName,
            formulaId: record.formulaId,
            actualDate: new Date(record.actualDate).toISOString().split("T")[0],
            actualSacks: record.actualSacks,
            operatorName: record.operatorName,
            observations: record.observations,
            planInfo,
          }}
          formulas={formulas.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>
    </>
  );
}
