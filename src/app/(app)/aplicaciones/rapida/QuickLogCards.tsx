"use client";

import { useState } from "react";
import { createApplicationRecord } from "../actions";

interface PendingApp {
  planApplicationId: number;
  lotId: number;
  lotName: string;
  formulaId: number;
  formulaName: string;
  plannedSacks: number;
  sacksPerHa: number;
  applicationNumber: number;
  seasonName: string;
  areaHa: number;
}

export default function QuickLogCards({ items }: { items: PendingApp[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault();
    setSubmitting(id);
    const fd = new FormData(e.currentTarget);
    try {
      await createApplicationRecord(fd);
    } catch {
      // redirect throws in server actions — this is expected
    }
    setSaved((prev) => new Set(prev).add(id));
    setSubmitting(null);
    setExpandedId(null);
  };

  const today = new Date().toISOString().split("T")[0];

  const visibleItems = items.filter((i) => !saved.has(i.planApplicationId));

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs font-medium text-[var(--color-on-surface-variant)]">
        {visibleItems.length} aplicacion(es) pendiente(s)
      </p>

      {visibleItems.map((item) => {
        const isExpanded = expandedId === item.planApplicationId;
        const isSubmitting = submitting === item.planApplicationId;

        return (
          <div
            key={item.planApplicationId}
            className="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)] shadow-sm overflow-hidden transition-all"
          >
            {/* Card header — tappable */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.planApplicationId)}
              className="flex w-full items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-container-high)] transition-colors active:bg-[var(--color-surface-dim)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
                  {item.applicationNumber === 1 ? "looks_one" : "looks_two"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-on-surface)] truncate">
                  {item.lotName}
                </p>
                <p className="text-xs text-[var(--color-on-surface-variant)]">
                  {item.formulaName} &middot; {item.plannedSacks.toFixed(0)} sacos &middot; {item.areaHa} ha
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                  {item.seasonName}
                </p>
                <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">
                  {isExpanded ? "expand_less" : "expand_more"}
                </span>
              </div>
            </button>

            {/* Expanded form */}
            {isExpanded && (
              <form
                onSubmit={(e) => handleSubmit(e, item.planApplicationId)}
                className="border-t border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-high)] p-4"
              >
                <input type="hidden" name="planApplicationId" value={item.planApplicationId} />
                <input type="hidden" name="lotId" value={item.lotId} />
                <input type="hidden" name="formulaId" value={item.formulaId} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1">
                      Sacos
                    </label>
                    <input
                      type="number"
                      name="actualSacks"
                      required
                      min={0}
                      step={0.5}
                      defaultValue={item.plannedSacks.toFixed(0)}
                      className="w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm font-bold tabular-nums text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="actualDate"
                      required
                      defaultValue={today}
                      className="w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1">
                    Notas (opcional)
                  </label>
                  <input
                    type="text"
                    name="observations"
                    placeholder="Observaciones de campo..."
                    className="w-full rounded-lg border border-[var(--color-outline-variant)]/40 bg-white px-3 py-2.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-container)] transition-colors disabled:opacity-50 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  {isSubmitting ? "Guardando..." : "Registrar"}
                </button>
              </form>
            )}
          </div>
        );
      })}

      {saved.size > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <span className="material-symbols-outlined text-[24px] text-emerald-600">task_alt</span>
          <p className="mt-1 text-sm font-medium text-emerald-700">
            {saved.size} aplicacion(es) registrada(s)
          </p>
        </div>
      )}
    </div>
  );
}
