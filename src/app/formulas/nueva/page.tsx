import PageHeader from "@/components/PageHeader";
import FormulaForm from "../FormulaForm";
import { createFormula } from "../actions";

export default function NuevaFormulaPage() {
  return (
    <>
      <PageHeader
        title="Nueva Formula"
        description="Agregar una formula de fertilizacion a la biblioteca"
      />
      <div className="mt-6">
        <FormulaForm action={createFormula} submitLabel="Crear Formula" />
      </div>
    </>
  );
}
