"use client";

import { useEffect, useRef, useState } from "react";
import ArrowLink from "@/components/ArrowLink";
import DetailOverlay from "@/components/DetailOverlay";
import StatusLegend from "@/components/StatusLegend";
import TelemetryWidgetGrid from "@/components/TelemetryWidgetGrid";
import { cycleStatus, getEffectiveStatus, type TelemetryTile } from "@/lib/status";

// ponytail: static mock stands in for the decoded-telemetry feed. Swap for a
// fetch() here when the ground-station decoder exposes an endpoint.
const TILES: TelemetryTile[] = [
  {
    id: "comm",
    label: "Link Quality",
    status: "nominal",
    value: "12.4 dB",
    gauge: 72,
    history: [9.1, 10.4, 11.8, 11.2, 12.9, 12.4],
    lastUpdatedSeconds: 8,
    staleThresholdSeconds: 120,
  },
  {
    id: "battery",
    label: "Battery / Power",
    status: "degraded",
    value: "41%",
    gauge: 41,
    history: [78, 70, 61, 54, 47, 41],
    lastUpdatedSeconds: 22,
    staleThresholdSeconds: 120,
  },
  {
    id: "temp",
    label: "Onboard Temp",
    status: "fault",
    value: "71°C",
    gauge: 88,
    history: [42, 48, 55, 61, 68, 71],
    lastUpdatedSeconds: 15,
    staleThresholdSeconds: 120,
  },
  {
    id: "ttc",
    label: "TT&C",
    status: "nominal",
    value: "4 frm",
    gauge: 30,
    history: [2, 3, 3, 5, 4, 4],
    lastUpdatedSeconds: 6,
    staleThresholdSeconds: 90,
  },
  {
    // Reported nominal before the dropout — the stale rule overrides it.
    id: "sstv",
    label: "SSTV Queue",
    status: "nominal",
    value: "2 img",
    gauge: 55,
    history: [1, 1, 2, 2, 3, 2],
    lastUpdatedSeconds: 252,
    staleThresholdSeconds: 180,
  },
  {
    id: "m17",
    label: "M17 / Codec2",
    status: "nominal",
    value: "IDLE",
    lastUpdatedSeconds: 44,
    staleThresholdSeconds: 300,
  },
];

// ponytail: random-walk mock of the live feed, one tick per second. Replace
// with the decoder WebSocket (design.md §8) — the grid and overlay just read
// `tiles`, so nothing else changes.
function tick(t: TelemetryTile, frozen: boolean): TelemetryTile {
  const aged = { ...t, lastUpdatedSeconds: t.lastUpdatedSeconds + 1 };
  if (frozen || Math.random() > 0.4) return aged;
  if (!t.history) return { ...aged, lastUpdatedSeconds: 0 };
  const last = t.history.at(-1)!;
  const dp = Number.isInteger(last) ? 0 : 1;
  const next = Math.max(0, +(last + (Math.random() - 0.5) * (dp ? 1 : 3)).toFixed(dp));
  return {
    ...aged,
    lastUpdatedSeconds: 0,
    history: [...t.history.slice(-5), next],
    value: t.value.replace(/\d+(\.\d+)?/, next.toFixed(dp)),
  };
}

export default function MissionControlPage() {
  const [tiles, setTiles] = useState(TILES);
  const [openId, setOpenId] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  // Channels whose feed has dropped out — they age but receive no packets.
  const frozen = useRef(new Set(["sstv"]));

  // Keeps running while the detail overlay is open: short passes can't
  // afford a paused dashboard behind a modal.
  useEffect(() => {
    const id = setInterval(() => {
      setTiles((prev) => prev.map((t) => tick(t, frozen.current.has(t.id))));
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const effective = tiles.map(getEffectiveStatus);
  const staleCount = effective.filter((s) => s === "stale").length;
  const faultCount = effective.filter((s) => s === "fault").length;

  // A demo-staled channel stops receiving packets, or the next tick would
  // freshen it straight back.
  const cycle = (id: string) =>
    setTiles((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = cycleStatus(t);
        frozen.current[getEffectiveStatus(next) === "stale" ? "add" : "delete"](id);
        return next;
      }),
    );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-edge pb-6">
        <div className="flex items-center gap-4">
          <ArrowLink href="/" label="Back to overview" direction="left" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
              SomSat &amp; SomPod · Mission Control Portal
            </span>
            <h1 className="display mt-1 text-3xl leading-none text-white sm:text-4xl">
              Mission Control
            </h1>
          </div>
        </div>

        <dl className="flex gap-7 font-mono text-[10px] uppercase tracking-[0.16em]">
          <div>
            <dt className="text-steel/45">Faults</dt>
            <dd className={`mt-1 text-sm ${faultCount ? "text-fault" : "text-steel"}`}>
              {String(faultCount).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="text-steel/45">Stale</dt>
            <dd className={`mt-1 text-sm ${staleCount ? "text-stale" : "text-steel"}`}>
              {String(staleCount).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="text-steel/45">Override</dt>
            <dd className="mt-1 text-sm text-steel">GND armed</dd>
          </div>
        </dl>
      </header>

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
          Telemetry · {tiles.length} channels · drag the grip to reprioritise
        </h2>
        <TelemetryWidgetGrid tiles={tiles} onOpen={setOpenId} />
        {staleCount > 0 && (
          <p className="mt-3 rounded-lg bg-stale/10 px-3 py-2.5 text-[11px] leading-5 text-stale">
            {staleCount} channel{staleCount > 1 ? "s" : ""} without fresh
            telemetry — router decisions may use outdated data.
          </p>
        )}
      </section>

      <DetailOverlay
        tile={tiles.find((t) => t.id === openId)}
        now={now}
        onClose={() => setOpenId(null)}
        onCycle={() => openId && cycle(openId)}
      />

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <section className="rounded-xl border border-edge bg-obsidian-900 p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
            State legend
          </h2>
          <div className="mt-4">
            <StatusLegend />
          </div>
        </section>

        <details className="group rounded-xl border border-edge bg-obsidian-900 p-5">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45 transition-colors hover:text-steel marker:text-signal">
            Design rationale
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-steel/80">
            Identical green indicators encoded only &ldquo;the last value we saw
            was fine&rdquo;, while operators read them as &ldquo;this subsystem
            is fine right now&rdquo; — readings that diverge precisely during a
            comms dropout. Age is now a first-class status: past its threshold,{" "}
            <code className="font-mono text-steel">getEffectiveStatus</code>{" "}
            overrides the reported value to <em>stale</em>, empties the gauge and
            fills the freshness meter. Each state differs in hue, icon and ring
            dash pattern, so stale still reads as distinct in greyscale — the cue
            that the autonomous router may be scheduling from outdated inputs and
            ground override should be considered.
          </p>
        </details>
      </div>
    </main>
  );
}
