"use client";

import { useState } from "react";
import { deleteFormula } from "./actions";

export default function DeleteFormulaButton({
  formulaId,
  formulaName,
}: {
  formulaId: number;
  formulaName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded p-1 text-[var(--color-on-surface-variant)] hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Eliminar formula"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    );
  }

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("id", String(formulaId));
      await deleteFormula(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--color-on-surface-variant)] mr-1">
          {formulaName}?
        </span>
        <button
          onClick={() => { setConfirming(false); setError(null); }}
          className="rounded px-2 py-0.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-dim)] transition-colors"
        >
          No
        </button>
        <button
          onClick={handleDelete}
          disabled={submitting}
          className="rounded px-2 py-0.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "..." : "Si"}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
