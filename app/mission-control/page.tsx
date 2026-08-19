"use client";

import { useState } from "react";
import ArrowLink from "@/components/ArrowLink";
import StatusDetail from "@/components/StatusDetail";
import StatusLegend from "@/components/StatusLegend";
import StatusTile from "@/components/StatusTile";
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

export default function MissionControlPage() {
  const [tiles, setTiles] = useState(TILES);
  const [selected, setSelected] = useState(0);

  const effective = tiles.map(getEffectiveStatus);
  const staleCount = effective.filter((s) => s === "stale").length;
  const faultCount = effective.filter((s) => s === "fault").length;

  const cycleAt = (i: number) =>
    setTiles((prev) => prev.map((t, j) => (i === j ? cycleStatus(t) : t)));

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

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        {/* Left: selector. */}
        <aside className="rounded-xl border border-edge bg-obsidian-900 p-3">
          <h2 className="px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
            Telemetry · {tiles.length} channels
          </h2>

          <div role="listbox" aria-label="Subsystem telemetry" className="flex flex-col gap-0.5">
            {tiles.map((tile, i) => (
              <StatusTile
                key={tile.id}
                tile={tile}
                selected={i === selected}
                onSelect={() => setSelected(i)}
              />
            ))}
          </div>

          {staleCount > 0 && (
            <p className="mt-3 rounded-lg bg-stale/10 px-3 py-2.5 text-[11px] leading-5 text-stale">
              {staleCount} channel{staleCount > 1 ? "s" : ""} without fresh
              telemetry — router decisions may use outdated data.
            </p>
          )}
        </aside>

        {/* Right: what the selected telemetry means. */}
        <StatusDetail tile={tiles[selected]} onCycle={() => cycleAt(selected)} />
      </div>

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
