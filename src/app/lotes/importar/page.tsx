import PageHeader from "@/components/PageHeader";
import ImportForm from "./ImportForm";

export default function ImportarLotesPage() {
  return (
    <>
      <PageHeader
        title="Importar Lotes"
        description="Cargar lotes desde archivo Excel (Maestro de Lotes)"
      />
      <div className="mt-6">
        <ImportForm />
      </div>
    </>
  );
}
