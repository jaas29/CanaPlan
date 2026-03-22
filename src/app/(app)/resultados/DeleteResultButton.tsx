"use client";

import { useState } from "react";
import { deleteYieldResult } from "./actions";

export default function DeleteResultButton({
  resultId,
  lotName,
}: {
  resultId: number;
  lotName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded p-1 text-[var(--color-on-surface-variant)] hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Eliminar resultado"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    );
  }

  const handleDelete = async () => {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("resultId", String(resultId));
    await deleteYieldResult(fd);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-[var(--color-on-surface-variant)] mr-1 hidden sm:inline">
        {lotName}?
      </span>
      <button
        onClick={() => setConfirming(false)}
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
  );
}
