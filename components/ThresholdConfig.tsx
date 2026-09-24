"use client";

import { useEffect, useRef, useState } from "react";
import StatusLegend from "@/components/StatusLegend";

type Channel = "battery" | "link" | "temp";
type Thresholds = Record<Channel, { amber: number; red: number }>;

const CHANNELS: { id: Channel; label: string; unit: string; min: number; max: number; lowIsBad: boolean }[] = [
  { id: "battery", label: "Battery", unit: "%", min: 0, max: 100, lowIsBad: true },
  { id: "link", label: "Link quality", unit: "dB", min: 0, max: 30, lowIsBad: true },
  { id: "temp", label: "Temperature", unit: "°C", min: -40, max: 125, lowIsBad: false },
];

const DEFAULTS: Thresholds = {
  battery: { amber: 30, red: 15 },
  link: { amber: 6, red: 3 },
  temp: { amber: 60, red: 70 },
};

/** Red must sit past amber in the bad direction, or the degraded band vanishes. */
function errorFor(c: (typeof CHANNELS)[number], t: { amber: number; red: number }) {
  if ([t.amber, t.red].some((v) => Number.isNaN(v) || v < c.min || v > c.max))
    return `Range ${c.min}–${c.max} ${c.unit}`;
  if (c.lowIsBad ? t.red >= t.amber : t.red <= t.amber)
    return `Red must be ${c.lowIsBad ? "below" : "above"} amber`;
  return "";
}

/** Exp 04 · Pattern 3 — overlay edit in a non-modal right slide-over. */
export default function ThresholdConfig() {
  const [saved, setSaved] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);
  const [open, setOpen] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) firstInput.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const cancel = () => {
    setDraft(saved);
    close();
  };
  const errors = Object.fromEntries(CHANNELS.map((c) => [c.id, errorFor(c, draft[c.id])]));
  const invalid = Object.values(errors).some(Boolean);
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    console.log("[thresholds] apply", draft);
    setSaved(draft);
    close();
  };

  const set = (id: Channel, key: "amber" | "red", v: string) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [key]: v === "" ? NaN : Number(v) } }));

  return (
    <section className="rounded-xl border border-edge bg-obsidian-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
          State legend
        </h3>
        <button
          ref={trigger}
          type="button"
          onClick={() => {
            setDraft(saved);
            setOpen(true);
          }}
          aria-expanded={open}
          aria-controls="threshold-panel"
          className="rounded-md border border-signal/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:bg-signal hover:text-obsidian-950"
        >
          Configure thresholds
        </button>
      </div>
      <div className="mt-4">
        <StatusLegend />
      </div>

      {/* Non-modal: no backdrop, page stays scrollable and visible to the left. */}
      <form
        id="threshold-panel"
        role="dialog"
        aria-label="Alert threshold configuration"
        inert={!open}
        onSubmit={apply}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-edge-strong bg-obsidian-900 shadow-2xl shadow-black transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="border-b border-edge px-5 py-4">
          <h4 className="display text-xl text-white">Alert thresholds</h4>
          <p className="mt-1 text-[11px] text-steel/60">
            Boundaries where a channel turns degraded (amber) and fault (red).
          </p>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {CHANNELS.map((c, i) => (
            <fieldset key={c.id}>
              <legend className="display text-[13px] tracking-[0.07em] text-steel">
                {c.label} <span className="font-mono text-[10px] text-steel/45">({c.unit}, {c.lowIsBad ? "low is bad" : "high is bad"})</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["amber", "red"] as const).map((key) => (
                  <label key={key} className="block">
                    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${key === "amber" ? "text-degraded" : "text-fault"}`}>
                      {key === "amber" ? "Degraded at" : "Fault at"}
                    </span>
                    <input
                      ref={i === 0 && key === "amber" ? firstInput : undefined}
                      type="number"
                      min={c.min}
                      max={c.max}
                      value={Number.isNaN(draft[c.id][key]) ? "" : draft[c.id][key]}
                      onChange={(e) => set(c.id, key, e.target.value)}
                      aria-invalid={Boolean(errors[c.id])}
                      aria-describedby={`${c.id}-err`}
                      className="mt-1 h-8 w-full rounded-md border border-edge-strong bg-obsidian-850 px-2 font-mono text-sm text-white outline-none focus:border-signal"
                    />
                  </label>
                ))}
              </div>
              {errors[c.id] && (
                <p id={`${c.id}-err`} className="mt-1 text-[11px] text-fault">{errors[c.id]}</p>
              )}
            </fieldset>
          ))}
        </div>

        <footer className="flex gap-2 border-t border-edge px-5 py-4">
          <button
            type="submit"
            disabled={invalid}
            className="rounded-md bg-signal px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-obsidian-950 disabled:opacity-40"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={cancel}
            className="rounded-md border border-edge-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-steel hover:text-white"
          >
            Cancel
          </button>
        </footer>
      </form>
    </section>
  );
}
