import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import FormulaForm from "../../FormulaForm";
import { updateFormula } from "../../actions";

export default async function EditarFormulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formulaId = Number(id);
  if (isNaN(formulaId)) notFound();

  const formula = await prisma.formula.findUnique({
    where: { id: formulaId },
  });

  if (!formula) notFound();

  return (
    <>
      <PageHeader
        title="Editar Formula"
        description={formula.name}
      />
      <div className="mt-6">
        <FormulaForm
          initial={{
            id: formula.id,
            name: formula.name,
            nPct: formula.nPct,
            p2o5Pct: formula.p2o5Pct,
            k2oPct: formula.k2oPct,
            sPct: formula.sPct,
            mgoPct: formula.mgoPct,
            caoPct: formula.caoPct,
            kgPerSack: formula.kgPerSack,
            costPerSack: formula.costPerSack,
            nitrogenSource: formula.nitrogenSource ?? "",
          }}
          action={updateFormula}
          submitLabel="Guardar Cambios"
        />
      </div>
    </>
  );
}
