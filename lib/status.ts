export type SubsystemStatus = "nominal" | "degraded" | "fault" | "stale";

export interface TelemetryTile {
  id: string;
  label: string;
  status: SubsystemStatus;
  value: string;
  /** Seconds since last confirmed telemetry. */
  lastUpdatedSeconds: number;
  /** Beyond this age the tile is stale regardless of its reported status. */
  staleThresholdSeconds: number;
  /** 0–100 fill for the node's ring gauge. Omit for non-scalar subsystems. */
  gauge?: number;
  /** Recent samples, newest last — drives the inline sparkline. */
  history?: number[];
}

/**
 * Status precedence: staleness always wins. A subsystem that reported
 * "nominal" before a comms dropout is unknown, not healthy.
 */
export function getEffectiveStatus(tile: TelemetryTile): SubsystemStatus {
  return tile.lastUpdatedSeconds > tile.staleThresholdSeconds
    ? "stale"
    : tile.status;
}

const CYCLE: SubsystemStatus[] = ["nominal", "degraded", "fault", "stale"];

/**
 * Demo control: advance a node through the four states. "stale" is simulated
 * by ageing the timestamp past the threshold, so the node goes stale through
 * the same precedence rule the real feed would hit — not a special case.
 */
export function cycleStatus(tile: TelemetryTile): TelemetryTile {
  // Step from what the operator currently sees, not from the reported value —
  // a stale node reports "nominal", so indexing that would skip nominal.
  const next =
    CYCLE[(CYCLE.indexOf(getEffectiveStatus(tile)) + 1) % CYCLE.length];
  return {
    ...tile,
    status: next === "stale" ? "nominal" : next,
    lastUpdatedSeconds: next === "stale" ? tile.staleThresholdSeconds + 132 : 12,
  };
}

/** "04:12" style age, for freshness labels. */
export function formatAge(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
