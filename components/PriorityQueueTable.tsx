"use client";

import { useState } from "react";
import { STATUS_STYLES } from "@/components/StatusTile";
import { DEFAULT_RANKS, setRank, type QueueChannel, type Ranks } from "@/lib/priority";

const ROWS: { id: QueueChannel; label: string; note: string }[] = [
  { id: "ttc", label: "TT&C", note: "Housekeeping / command" },
  { id: "sstv", label: "SSTV", note: "Imagery" },
  { id: "m17", label: "M17 / Codec2", note: "Voice / data" },
];

const LockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/** Exp 04 · Pattern 2 — table edit with a governance lock on the TT&C row. */
export default function PriorityQueueTable() {
  const [saved, setSaved] = useState<Ranks>(DEFAULT_RANKS);
  const [draft, setDraft] = useState<Ranks>(DEFAULT_RANKS);
  const [editing, setEditing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const locked = !unlocked;
  const ranks = editing ? draft : saved;
  // Rows hold still while editing so a stepper never slides out from under the cursor.
  const sorted = editing ? ROWS : [...ROWS].sort((a, b) => ranks[a.id] - ranks[b.id]);

  const step = (id: QueueChannel, delta: number) =>
    setDraft((d) => setRank(d, id, d[id] + delta, locked));

  // Fallback: re-locking puts TT&C back on top rather than keeping an
  // override nobody is watching.
  const toggleLock = () => {
    if (unlocked) setDraft((d) => setRank(d, "ttc", 1, false));
    setUnlocked(!unlocked);
  };

  const close = () => {
    setEditing(false);
    setUnlocked(false);
  };
  const cancel = () => {
    setDraft(saved);
    close();
  };
  const save = () => {
    const payload = { ranks: draft, schemeOverride: draft.ttc !== 1 };
    console.log("[priority-queue] save", payload);
    setSaved(draft);
    close();
  };

  const demoted = editing && draft.ttc !== 1;
  const btn = "flex h-7 w-7 items-center justify-center rounded-md border border-edge-strong font-mono text-sm text-signal disabled:border-edge disabled:text-steel/30";

  return (
    <section className="rounded-xl border border-edge bg-obsidian-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
          Data priority queue
        </h3>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setEditing(true);
            }}
            className="rounded-md border border-signal/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:bg-signal hover:text-obsidian-950"
          >
            Edit ranks
          </button>
        )}
      </div>

      {editing && (
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={unlocked}
            onClick={toggleLock}
            className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
              unlocked ? "border-signal bg-signal/20" : "border-edge-strong bg-obsidian-850"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
                unlocked ? "left-4 bg-signal" : "left-0.5 bg-steel/50"
              }`}
            />
          </button>
          <span className="text-sm text-steel">
            Allow priority scheme edit
            <span className="block text-[11px] text-steel/50">
              Unlocks TT&amp;C. Off restores TT&amp;C to rank 1.
            </span>
          </span>
        </label>
      )}

      <table className="mt-4 w-full text-left">
        <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel/45">
          <tr className="border-b border-edge">
            <th className="w-28 pb-2 font-normal">Rank</th>
            <th className="pb-2 font-normal">Channel</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const rowLocked = editing && row.id === "ttc" && locked;
            return (
              <tr key={row.id} className="border-b border-edge last:border-0">
                <td className="py-3">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Raise ${row.label} priority`}
                        disabled={rowLocked || setRank(draft, row.id, draft[row.id] - 1, locked) === draft}
                        onClick={() => step(row.id, -1)}
                        className={btn}
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-mono text-sm text-white" aria-live="polite">
                        {draft[row.id]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Lower ${row.label} priority`}
                        disabled={rowLocked || setRank(draft, row.id, draft[row.id] + 1, locked) === draft}
                        onClick={() => step(row.id, 1)}
                        className={btn}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-sm text-white">{ranks[row.id]}</span>
                  )}
                </td>
                <td className="py-3">
                  <span className="display flex items-center gap-2 text-[13px] tracking-[0.07em] text-steel">
                    {row.label}
                    {rowLocked && (
                      <span className="text-steel/50" title="Locked by fail-safe rule">
                        {LockIcon}
                        <span className="sr-only">(locked)</span>
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-steel/50">{row.note}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {demoted && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-degraded/10 px-3 py-2.5 text-[11px] leading-5 text-degraded">
          <span className="mt-0.5 shrink-0">{STATUS_STYLES.degraded.icon}</span>
          TT&amp;C is not rank 1 — housekeeping may be starved during short
          passes. Needs ground-operator sign-off before uplink.
        </p>
      )}

      {editing && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-signal px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-obsidian-950"
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancel}
            className="rounded-md border border-edge-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-steel hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
