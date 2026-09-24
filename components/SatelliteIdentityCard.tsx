"use client";

import { useEffect, useState } from "react";
import { STATUS_STYLES, Sparkline, StatusRing } from "@/components/StatusTile";
import type { SubsystemStatus } from "@/lib/status";

// ponytail: random-walk mock stands in for the decoded telemetry feed.
type Node = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  amber: number;
  red: number;
  /** true when a falling value is the bad direction (battery, link). */
  lowIsBad: boolean;
  history: number[];
  /** Frozen feed — renders stale regardless of its last value. */
  stale?: boolean;
};

const NODES: Node[] = [
  { id: "bat", label: "Battery", unit: "%", min: 0, max: 100, amber: 30, red: 15, lowIsBad: true, history: [33] },
  { id: "link", label: "Link", unit: "dB", min: 0, max: 20, amber: 6, red: 3, lowIsBad: true, history: [11] },
  { id: "temp", label: "Temp", unit: "°C", min: -20, max: 90, amber: 60, red: 70, lowIsBad: false, history: [41] },
  { id: "pwr", label: "Bus Pwr", unit: "W", min: 0, max: 1.5, amber: 1, red: 1.2, lowIsBad: false, history: [0.78] },
  { id: "sstv", label: "SSTV Q", unit: "img", min: 0, max: 10, amber: 8, red: 10, lowIsBad: false, history: [2, 2], stale: true },
];

function statusOf(n: Node): SubsystemStatus {
  if (n.stale) return "stale";
  const v = n.history.at(-1)!;
  const past = (edge: number) => (n.lowIsBad ? v <= edge : v >= edge);
  return past(n.red) ? "fault" : past(n.amber) ? "degraded" : "nominal";
}

function tick(n: Node): Node {
  if (n.stale) return n;
  const span = n.max - n.min;
  const v = n.history.at(-1)! + (Math.random() - 0.5) * span * 0.04;
  const clamped = Math.min(n.max, Math.max(n.min, v));
  return { ...n, history: [...n.history, clamped].slice(-20) };
}

/** Honeycomb of status rings. Ticks every second, independent of the card. */
function HexTelemetry() {
  const [nodes, setNodes] = useState(NODES);
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setNodes((prev) => prev.map(tick));
      setT((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const rows = [nodes.slice(0, 3), nodes.slice(3)];

  return (
    <section
      aria-label="Live telemetry"
      className="rounded-xl border border-edge bg-obsidian-900 p-5"
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
        <span>Live telemetry · hex grid</span>
        <span className="text-steel">T+{String(t).padStart(4, "0")}</span>
      </div>

      <div className="mt-5 flex flex-col items-center">
        {rows.map((row, r) => (
          <div key={r} className={`flex gap-3 ${r ? "-mt-4" : ""}`}>
            {row.map((n) => {
              const status = statusOf(n);
              const s = STATUS_STYLES[status];
              const v = n.history.at(-1)!;
              return (
                <div key={n.id} className="flex w-24 flex-col items-center">
                  <StatusRing
                    status={status}
                    gauge={((v - n.min) / (n.max - n.min)) * 100}
                    className="h-24 w-24"
                  >
                    <span className="[&>svg]:h-3 [&>svg]:w-3">{s.icon}</span>
                    <span className="font-mono text-[12px] leading-none text-steel">
                      {status === "stale" ? "——" : v.toFixed(n.max < 5 ? 2 : 1)}
                    </span>
                    <span className="font-mono text-[9px] text-steel/45">{n.unit}</span>
                  </StatusRing>
                  <span className="display mt-1 text-[11px] tracking-[0.07em] text-steel">
                    {n.label}
                  </span>
                  <span className={`font-mono text-[9px] ${s.text}`}>{s.name.toUpperCase()}</span>
                  <Sparkline data={n.history.length > 1 ? n.history : [v, v]} className={`mt-1 h-3 w-14 ${s.text}`} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

// 70cm amateur-satellite sub-band. Actual assignment needs IARU coordination.
const FREQ_MIN = 435;
const FREQ_MAX = 438;

function IdentityCard() {
  const [saved, setSaved] = useState({ nickname: "SOMAIYASAT-1", freq: "437.525" });
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);

  const f = Number(draft.freq);
  const errors = {
    nickname: draft.nickname.trim() ? "" : "Nickname required",
    freq:
      draft.freq.trim() && f >= FREQ_MIN && f <= FREQ_MAX
        ? ""
        : `Must be ${FREQ_MIN.toFixed(3)}–${FREQ_MAX.toFixed(3)} MHz`,
  };
  const invalid = Boolean(errors.nickname || errors.freq);

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    const next = { nickname: draft.nickname.trim(), freq: f.toFixed(3) };
    console.log("[identity] save", next);
    setSaved(next);
    setDraft(next);
    setEditing(false);
  };

  const field = "h-8 font-mono text-sm";

  return (
    <form
      onSubmit={save}
      onKeyDown={(e) => e.key === "Escape" && editing && cancel()}
      className={`group relative rounded-xl border bg-obsidian-900 p-5 transition-colors ${
        editing ? "border-signal/40" : "border-edge"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
          Identity &amp; link config
        </h3>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit identity and link config"
            className="rounded-md p-1.5 text-signal opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-signal [@media(hover:none)]:opacity-100"
          >
            {PencilIcon}
          </button>
        )}
      </div>

      <dl className="mt-3 flex flex-col gap-3">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel/60">
            <label htmlFor="nickname">Nickname</label>
          </dt>
          <dd>
            {editing ? (
              <input
                id="nickname"
                autoFocus
                value={draft.nickname}
                onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
                aria-invalid={Boolean(errors.nickname)}
                aria-describedby="nickname-err"
                className={`${field} w-full rounded-md border border-edge-strong bg-obsidian-850 px-2 text-white outline-none focus:border-signal`}
              />
            ) : (
              <p className={`${field} flex items-center text-white`}>{saved.nickname}</p>
            )}
            {editing && errors.nickname && (
              <p id="nickname-err" className="mt-1 text-[11px] text-fault">{errors.nickname}</p>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel/60">
            <label htmlFor="freq">Downlink (MHz)</label>
          </dt>
          <dd>
            {editing ? (
              <input
                id="freq"
                inputMode="decimal"
                value={draft.freq}
                onChange={(e) => setDraft({ ...draft, freq: e.target.value })}
                aria-invalid={Boolean(errors.freq)}
                aria-describedby="freq-err"
                className={`${field} w-full rounded-md border border-edge-strong bg-obsidian-850 px-2 text-white outline-none focus:border-signal`}
              />
            ) : (
              <p className={`${field} flex items-center text-white`}>{saved.freq}</p>
            )}
            {editing && errors.freq && (
              <p id="freq-err" className="mt-1 text-[11px] text-fault">{errors.freq}</p>
            )}
          </dd>
        </div>
      </dl>

      {editing && (
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={invalid}
            className="rounded-md bg-signal px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-obsidian-950 disabled:opacity-40"
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
    </form>
  );
}

/** Exp 04 · Pattern 1 — multi-field inline edit beside a live telemetry grid. */
export default function SatelliteIdentityCard() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <HexTelemetry />
      <IdentityCard />
    </div>
  );
}
