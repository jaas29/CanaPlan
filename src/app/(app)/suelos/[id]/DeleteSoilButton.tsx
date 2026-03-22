"use client";

import { useState } from "react";
import { deleteSoilReference } from "../actions";

export default function DeleteSoilButton({ soilId, name }: { soilId: number; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-xs text-[var(--color-on-surface-variant)]">Eliminar &quot;{name}&quot;?</span>
        <form action={deleteSoilReference}>
          <input type="hidden" name="id" value={soilId} />
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
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">delete</span>
      Eliminar
    </button>
  );
}
