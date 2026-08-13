import { STATUS_STYLES, Sparkline, StatusRing } from "@/components/StatusTile";
import { formatAge, getEffectiveStatus, type TelemetryTile } from "@/lib/status";

/**
 * The right-hand panel: what the selected telemetry actually *means*.
 * Everything here is an encoding of one subsystem — the dial is its state and
 * value, the trend is its history, the freshness meter is the stale rule drawn
 * as a bar, and the implication line is what the router does about it.
 */
export default function StatusDetail({
  tile,
  onCycle,
}: {
  tile: TelemetryTile;
  onCycle: () => void;
}) {
  const status = getEffectiveStatus(tile);
  const s = STATUS_STYLES[status];
  const age = formatAge(tile.lastUpdatedSeconds);
  // How far through its freshness allowance this reading is. Past 100% the
  // stale rule has already fired.
  const freshness = Math.min(
    100,
    (tile.lastUpdatedSeconds / tile.staleThresholdSeconds) * 100,
  );

  return (
    <section
      aria-label="Selected subsystem"
      className="flex h-full flex-col gap-7 rounded-xl border border-edge bg-obsidian-900 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="display text-2xl leading-none text-white">
            {tile.label}
          </h2>
          <p className={`mt-2 font-mono text-[11px] uppercase tracking-[0.18em] ${s.text}`}>
            {s.name} · {s.meaning}
          </p>
        </div>

        <button
          type="button"
          onClick={onCycle}
          className="rounded-full border border-signal/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal transition-colors duration-300 hover:bg-signal hover:text-obsidian-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Cycle state
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <StatusRing
          status={status}
          gauge={tile.gauge}
          className={`h-40 w-40 shrink-0 ${status === "fault" ? "motion-safe:animate-[fault-throb_2.4s_ease-in-out_infinite]" : ""}`}
        >
          <span className="[&>svg]:h-5 [&>svg]:w-5">{s.icon}</span>
          {/* Constrained to the dial's inner diameter — long readouts like
              "12.4 dB" otherwise run over the ring. */}
          <span className="max-w-[5.5rem] text-center font-mono text-base leading-none tracking-tight">
            {status === "stale" ? "——" : tile.value}
          </span>
        </StatusRing>

        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 font-mono text-[11px]">
          <Field label="Last update" value={status === "stale" ? `${age} ago` : `T+${age}`} />
          <Field label="Stale after" value={formatAge(tile.staleThresholdSeconds)} />
          <Field
            label="Gauge"
            value={tile.gauge === undefined ? "n/a" : `${status === "stale" ? "——" : tile.gauge}%`}
          />
          <Field label="Encoder" value={status === "stale" ? "dashed ring" : `${s.dash === "0" ? "solid" : "dotted"} ring`} />
        </dl>
      </div>

      {/* Freshness meter — the stale precedence rule, drawn. */}
      <div>
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-steel/50">
          <span>Freshness</span>
          <span className={status === "stale" ? "text-stale" : ""}>
            {status === "stale" ? "threshold exceeded" : `${Math.round(freshness)}% of window`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-obsidian-850">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${status === "stale" ? "bg-stale" : "bg-steel/50"}`}
            style={{ width: `${status === "stale" ? 100 : freshness}%` }}
          />
        </div>
      </div>

      {tile.history && (
        <div>
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-steel/50">
            <span>Trend · last 6 samples</span>
            <span>
              {Math.min(...tile.history)} → {Math.max(...tile.history)}
            </span>
          </div>
          <Sparkline
            data={tile.history}
            w={280}
            h={48}
            className={`mt-2 h-12 w-full ${status === "stale" ? "text-stale/50" : s.text}`}
          />
        </div>
      )}

      <p className={`mt-auto rounded-lg px-4 py-3 text-sm leading-6 ${s.tint} ${s.text}`}>
        {s.implication}
      </p>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="uppercase tracking-[0.16em] text-steel/45">{label}</dt>
      <dd className="mt-1 text-[13px] text-steel">{value}</dd>
    </div>
  );
}
