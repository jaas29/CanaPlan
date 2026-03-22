"use client";

import { useState } from "react";
import { deleteVariety } from "./actions";

export default function DeleteVarietyButton({ varietyId, varietyName }: { varietyId: number; varietyName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-red-700">
        <span>{error}</span>
        <button onClick={() => setError(null)} className="underline">OK</button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="text-xs text-[var(--color-on-surface-variant)]">Eliminar?</span>
        <form
          action={async (fd) => {
            try {
              await deleteVariety(fd);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error al eliminar");
              setConfirming(false);
            }
          }}
        >
          <input type="hidden" name="id" value={varietyId} />
          <button type="submit" className="text-xs font-semibold text-red-700 hover:underline">Si</button>
        </form>
        <button onClick={() => setConfirming(false)} className="text-xs font-semibold text-[var(--color-on-surface-variant)] hover:underline">
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-700 transition-all"
      title={`Eliminar ${varietyName}`}
    >
      <span className="material-symbols-outlined text-[18px]">delete</span>
    </button>
  );
}
