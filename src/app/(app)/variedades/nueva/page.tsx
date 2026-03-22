import PageHeader from "@/components/PageHeader";
import VarietyForm from "../VarietyForm";
import { createVariety } from "../actions";

export default function NuevaVariedadPage() {
  return (
    <>
      <PageHeader title="Nueva Variedad" description="Registrar una variedad de cana" />
      <div className="mt-6 max-w-2xl">
        <VarietyForm action={createVariety} submitLabel="Crear Variedad" />
      </div>
    </>
  );
}
