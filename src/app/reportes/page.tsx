import PageHeader from "@/components/PageHeader";

export default function ReportesPage() {
  return (
    <>
      <PageHeader
        title="Reportes"
        description="Analisis y reportes de rendimiento"
      />

      <div className="mt-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]">
          bar_chart
        </span>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          Reportes disponibles una vez se registren planes, aplicaciones y resultados de cosecha.
        </p>
      </div>
    </>
  );
}
