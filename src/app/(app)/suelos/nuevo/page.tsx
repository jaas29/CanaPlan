import PageHeader from "@/components/PageHeader";
import SoilReferenceForm from "../SoilReferenceForm";
import { createSoilReference } from "../actions";

export default function NuevoSueloPage() {
  return (
    <>
      <PageHeader
        title="Nuevo Analisis de Referencia"
        description="Registrar un analisis de suelo externo para usar como referencia"
      />
      <div className="mt-6">
        <SoilReferenceForm action={createSoilReference} submitLabel="Crear Analisis" />
      </div>
    </>
  );
}
