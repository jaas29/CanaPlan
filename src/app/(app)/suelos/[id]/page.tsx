import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import DeleteSoilButton from "./DeleteSoilButton";
import LinkLotForm from "./LinkLotForm";

export default async function SoilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const soilId = Number(id);
  if (isNaN(soilId)) notFound();

  const analysis = await prisma.soilReferenceAnalysis.findUnique({
    where: { id: soilId },
    include: {
      lotReferences: {
        include: { lot: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!analysis) notFound();

  // Get lots not yet linked for the link form
  const linkedLotIds = analysis.lotReferences.map((lr) => lr.lotId);
  const availableLots = await prisma.lot.findMany({
    where: linkedLotIds.length > 0 ? { id: { notIn: linkedLotIds } } : {},
    orderBy: { displayName: "asc" },
  });

  const SOIL_VALUES: { label: string; value: number | null; unit: string }[] = [
    { label: "pH", value: analysis.ph, unit: "" },
    { label: "M.O.", value: analysis.organicMatterPct, unit: "%" },
    { label: "P", value: analysis.phosphorus, unit: "mg/L" },
    { label: "K", value: analysis.potassium, unit: "cmol/L" },
    { label: "Ca", value: analysis.calcium, unit: "cmol/L" },
    { label: "Mg", value: analysis.magnesium, unit: "cmol/L" },
    { label: "Acidez", value: analysis.acidity, unit: "cmol/L" },
    { label: "Fe", value: analysis.iron, unit: "mg/L" },
    { label: "Cu", value: analysis.copper, unit: "mg/L" },
    { label: "Zn", value: analysis.zinc, unit: "mg/L" },
    { label: "Mn", value: analysis.manganese, unit: "mg/L" },
  ];

  const hasValues = SOIL_VALUES.some((v) => v.value != null);

  return (
    <>
      <PageHeader
        title={analysis.sourceName}
        description={`Analisis de referencia${analysis.sourceLotCode ? ` · Lote origen: ${analysis.sourceLotCode}` : ""}${analysis.year ? ` · ${analysis.year}` : ""}`}
        actions={
          <div className="flex gap-2">
            <DeleteSoilButton soilId={analysis.id} name={analysis.sourceName} />
            <Link
              href={`/suelos/${analysis.id}/editar`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/40 px-4 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </Link>
          </div>
        }
      />

      {/* Source info banner */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-amber-600">info</span>
          <p className="text-sm text-amber-800">
            <strong>Analisis de referencia</strong> — estos valores provienen de{" "}
            <strong>{analysis.sourceType === "ingenio" ? "el ingenio" : "una fuente externa"}</strong>
            {analysis.sourceLotCode && (
              <>, lote de origen <strong>{analysis.sourceLotCode}</strong></>
            )}
            . Se usan como proxy para los lotes vinculados abajo.
          </p>
        </div>
      </div>

      {/* Soil values grid */}
      {hasValues && (
        <div className="mt-6 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-on-surface)] mb-4">Valores del Analisis</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {SOIL_VALUES.filter((v) => v.value != null).map((v) => (
              <div key={v.label} className="rounded-lg bg-[var(--color-surface-dim)] px-3 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {v.label}
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--color-on-surface)]">
                  {v.value}
                </p>
                {v.unit && (
                  <p className="text-[10px] text-[var(--color-on-surface-variant)]">{v.unit}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {analysis.notes && (
        <div className="mt-4 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-on-surface)] mb-2">Notas</h2>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{analysis.notes}</p>
        </div>
      )}

      {/* Linked lots */}
      <div className="mt-6 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--color-on-surface)] mb-4">
          Lotes que usan este analisis como referencia
        </h2>

        {analysis.lotReferences.length === 0 ? (
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Ningun lote vinculado aun. Use el formulario abajo para asignar lotes.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {analysis.lotReferences.map((lr) => (
              <div
                key={lr.id}
                className="flex items-center justify-between rounded-lg bg-[var(--color-surface-dim)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-on-surface)]">
                    {lr.lot.displayName}
                  </p>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    {lr.lot.areaHa} ha
                    {lr.mappingNote && <> · {lr.mappingNote}</>}
                  </p>
                </div>
                <form action={async (fd) => {
                  "use server";
                  const { unlinkLotFromSoilReference } = await import("../actions");
                  await unlinkLotFromSoilReference(fd);
                }}>
                  <input type="hidden" name="linkId" value={lr.id} />
                  <input type="hidden" name="soilRefId" value={analysis.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-50 transition-colors"
                    title="Desvincular lote"
                  >
                    <span className="material-symbols-outlined text-[14px]">link_off</span>
                    Desvincular
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Link form */}
        {availableLots.length > 0 && (
          <LinkLotForm soilRefId={analysis.id} lots={availableLots.map((l) => ({ id: l.id, displayName: l.displayName }))} />
        )}
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/suelos" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
          &larr; Volver a Analisis de Suelo
        </Link>
      </div>
    </>
  );
}
