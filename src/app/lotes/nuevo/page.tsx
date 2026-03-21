import PageHeader from "@/components/PageHeader";
import LotForm from "../LotForm";
import { createLot } from "../actions";

export default function NuevoLotePage() {
  return (
    <>
      <PageHeader
        title="Nuevo Lote"
        description="Registrar un nuevo lote en el sistema"
      />
      <div className="mt-6">
        <LotForm action={createLot} submitLabel="Crear Lote" />
      </div>
    </>
  );
}
