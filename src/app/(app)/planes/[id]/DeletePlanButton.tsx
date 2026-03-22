"use client";

import { useState } from "react";
import { deletePlan } from "../actions";

export default function DeletePlanButton({ planId, lotName }: { planId: number; lotName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-error)]/30 px-4 py-2.5 text-sm font-semibold text-[var(--color-error)] hover:bg-red-50 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-error)]">
        Eliminar plan de {lotName}?
      </span>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-[var(--color-outline-variant)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={async () => {
          setDeleting(true);
          const fd = new FormData();
          fd.set("planId", String(planId));
          await deletePlan(fd);
        }}
        disabled={deleting}
        className="rounded-lg bg-[var(--color-error)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {deleting ? "Eliminando..." : "Confirmar"}
      </button>
    </div>
  );
}
