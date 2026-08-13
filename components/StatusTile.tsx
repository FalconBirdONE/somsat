import {
  formatAge,
  getEffectiveStatus,
  type SubsystemStatus,
  type TelemetryTile,
} from "@/lib/status";

const R_STATE = 46; // outer ring — encodes state via dash pattern
const R_GAUGE = 37; // inner arc — encodes the numeric value
const C_GAUGE = 2 * Math.PI * R_GAUGE;

const icon = (path: React.ReactNode, className = "h-4 w-4") => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {path}
  </svg>
);

const NOMINAL_PATH = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </>
);
const DEGRADED_PATH = (
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);
const FAULT_PATH = (
  <>
    <path d="M8.5 2h7L22 8.5v7L15.5 22h-7L2 15.5v-7Z" />
    <path d="M12 7v5" />
    <path d="M12 16h.01" />
  </>
);
const STALE_PATH = (
  <>
    <path d="m2 2 20 20" />
    <path d="M8.5 16.4a5 5 0 0 1 7 0" />
    <path d="M5 12.9a10 10 0 0 1 5.2-2.7" />
    <path d="M13.8 10.2A10 10 0 0 1 19 12.9" />
    <path d="M1.8 9.4a15 15 0 0 1 4.6-2.9" />
    <path d="M10.5 5.1a15 15 0 0 1 11.7 4.3" />
    <path d="M12 20h.01" />
  </>
);

/**
 * Closed set — one row per state. Every state differs in colour AND icon shape
 * AND ring dash pattern, so the readout survives greyscale or any
 * colour-vision deficiency. `dash` is the redundant, non-colour encoder.
 * Class strings stay literal so Tailwind's scanner can see them.
 */
export const STATUS_STYLES: Record<
  SubsystemStatus,
  {
    name: string;
    meaning: string;
    /** What this state implies for the autonomous router. */
    implication: string;
    text: string;
    stroke: string;
    tint: string;
    dash: string;
    width: number;
    path: React.ReactNode;
    icon: React.ReactNode;
  }
> = {
  nominal: {
    name: "Nominal",
    meaning: "Confirmed healthy, fresh data",
    implication: "Router may schedule this payload normally.",
    text: "text-nominal",
    stroke: "stroke-nominal",
    tint: "bg-nominal/10",
    dash: "0",
    width: 2,
    path: NOMINAL_PATH,
    icon: icon(NOMINAL_PATH),
  },
  degraded: {
    name: "Degraded",
    meaning: "Marginal — approaching limit",
    implication: "Router de-prioritises this payload and derates the budget.",
    text: "text-degraded",
    stroke: "stroke-degraded",
    tint: "bg-degraded/10",
    dash: "1 6",
    width: 2.5,
    path: DEGRADED_PATH,
    icon: icon(DEGRADED_PATH),
  },
  fault: {
    name: "Fault",
    meaning: "Confirmed failure — action required",
    implication: "Router sheds this payload; safe mode available to the operator.",
    text: "text-fault",
    stroke: "stroke-fault",
    tint: "bg-fault/10",
    dash: "0",
    width: 4,
    path: FAULT_PATH,
    icon: icon(FAULT_PATH),
  },
  stale: {
    name: "Stale",
    meaning: "No fresh telemetry — unknown, not healthy",
    implication: "Router may be acting on outdated data — consider ground override.",
    text: "text-stale",
    stroke: "stroke-stale",
    tint: "bg-stale/10",
    dash: "9 7",
    width: 2,
    path: STALE_PATH,
    icon: icon(STALE_PATH),
  },
};

/**
 * Shared ring primitive — state dash pattern on the outer ring, value on the
 * inner arc. One geometry at every size, so a 36px row badge and a 176px
 * detail dial read as the same object.
 */
export function StatusRing({
  status,
  gauge,
  className,
  children,
}: {
  status: SubsystemStatus;
  gauge?: number;
  className: string;
  children?: React.ReactNode;
}) {
  const s = STATUS_STYLES[status];
  // Staleness means the value is unknown, so the gauge empties with it.
  const fill = status === "stale" ? 0 : (gauge ?? 0);

  return (
    <span className={`relative block ${className} ${s.text}`}>
      <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
        <circle
          cx="52"
          cy="52"
          r={R_GAUGE}
          className="fill-obsidian-850 stroke-obsidian-800"
          strokeWidth={3}
        />
        {gauge !== undefined && (
          <circle
            cx="52"
            cy="52"
            r={R_GAUGE}
            className={`fill-none ${s.stroke} transition-[stroke-dasharray] duration-500`}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${(fill / 100) * C_GAUGE} ${C_GAUGE}`}
          />
        )}
        <circle
          cx="52"
          cy="52"
          r={R_STATE}
          className={`fill-none ${s.stroke}`}
          strokeWidth={s.width}
          strokeDasharray={s.dash}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {children}
        </span>
      )}
    </span>
  );
}

/** Recent samples, newest last. Area-filled so it reads at a glance. */
export function Sparkline({
  data,
  className,
  w = 44,
  h = 12,
}: {
  data: number[];
  className?: string;
  w?: number;
  h?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pt = (v: number, i: number) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 2) - 1}`;
  const line = data.map(pt).join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        points={`0,${h} ${line} ${w},${h}`}
        fill="currentColor"
        opacity={0.12}
      />
      <polyline
        points={line}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Selector row — one subsystem in the left-hand list. Compact by design: the
 * ring carries the state, the mono column carries the number, and the detail
 * panel does the explaining.
 */
export default function StatusTile({
  tile,
  selected,
  onSelect,
}: {
  tile: TelemetryTile;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const status = getEffectiveStatus(tile);
  const s = STATUS_STYLES[status];
  const age = formatAge(tile.lastUpdatedSeconds);
  const Root = onSelect ? "button" : "div";

  return (
    <Root
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      aria-pressed={onSelect ? selected : undefined}
      className={`flex w-full items-center gap-3 rounded-md border-l-2 py-2.5 pl-3 pr-3 text-left transition-colors duration-300 ${
        selected
          ? "border-l-signal bg-signal/[0.06]"
          : "border-l-transparent hover:bg-white/[0.03]"
      } ${onSelect ? "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal" : ""}`}
    >
      <StatusRing
        status={status}
        gauge={tile.gauge}
        className={`h-9 w-9 shrink-0 ${status === "fault" ? "motion-safe:animate-[fault-throb_2.4s_ease-in-out_infinite]" : ""}`}
      >
        {s.icon}
      </StatusRing>

      <span className="min-w-0 flex-1">
        <span className="display block truncate text-[12px] leading-tight tracking-[0.07em] text-steel">
          {tile.label}
        </span>
        <span className={`font-mono text-[10px] ${s.text} opacity-80`}>
          {s.name.toUpperCase()}
        </span>
        <span className="sr-only">, {s.meaning}</span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block font-mono text-[13px] leading-tight text-steel">
          {status === "stale" ? "——" : tile.value}
        </span>
        <span className="block font-mono text-[10px] text-steel/45">
          {status === "stale" ? age : `T+${age}`}
        </span>
      </span>
    </Root>
  );
}
