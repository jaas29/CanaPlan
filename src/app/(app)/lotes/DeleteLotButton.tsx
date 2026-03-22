"use client";

import { useState } from "react";
import { deleteLot } from "./actions";

export default function DeleteLotButton({ lotId, lotName }: { lotId: number; lotName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-[var(--color-error)] transition-all"
        title="Eliminar lote"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
      <span className="text-xs text-[var(--color-error)]">Eliminar {lotName}?</span>
      <button
        onClick={() => { setConfirming(false); setError(null); }}
        className="rounded px-2 py-1 text-xs font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)]"
      >
        No
      </button>
      <button
        onClick={async () => {
          setDeleting(true);
          setError(null);
          try {
            const fd = new FormData();
            fd.set("id", String(lotId));
            await deleteLot(fd);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
            setDeleting(false);
            setConfirming(false);
          }
        }}
        disabled={deleting}
        className="rounded bg-[var(--color-error)] px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "..." : "Si"}
      </button>
    </div>
  );
}
