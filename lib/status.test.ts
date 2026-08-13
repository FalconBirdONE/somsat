import assert from "node:assert/strict";
import test from "node:test";
import {
  cycleStatus,
  formatAge,
  getEffectiveStatus,
  type TelemetryTile,
} from "./status.ts";

const tile = (over: Partial<TelemetryTile>): TelemetryTile => ({
  id: "t",
  label: "Test",
  status: "nominal",
  value: "—",
  lastUpdatedSeconds: 0,
  staleThresholdSeconds: 120,
  ...over,
});

test("fresh + nominal stays nominal", () => {
  assert.equal(
    getEffectiveStatus(tile({ status: "nominal", lastUpdatedSeconds: 12 })),
    "nominal",
  );
});

test("stale timestamp overrides a reported nominal", () => {
  assert.equal(
    getEffectiveStatus(tile({ status: "nominal", lastUpdatedSeconds: 300 })),
    "stale",
  );
});

test("fresh + fault stays fault", () => {
  assert.equal(
    getEffectiveStatus(tile({ status: "fault", lastUpdatedSeconds: 5 })),
    "fault",
  );
});

test("stale overrides fault too — age is unknowable, not critical", () => {
  assert.equal(
    getEffectiveStatus(tile({ status: "fault", lastUpdatedSeconds: 300 })),
    "stale",
  );
});

test("exactly at the threshold is still fresh", () => {
  assert.equal(
    getEffectiveStatus(tile({ status: "nominal", lastUpdatedSeconds: 120 })),
    "nominal",
  );
});

test("cycling walks all four states and returns to nominal", () => {
  let t = tile({ status: "nominal", lastUpdatedSeconds: 5 });
  const seen = [getEffectiveStatus(t)];
  for (let i = 0; i < 4; i++) {
    t = cycleStatus(t);
    seen.push(getEffectiveStatus(t));
  }
  assert.deepEqual(seen, [
    "nominal",
    "degraded",
    "fault",
    "stale",
    "nominal",
  ]);
});

test("the stale step ages the timestamp rather than faking the status", () => {
  const t = cycleStatus(tile({ status: "fault", staleThresholdSeconds: 120 }));
  assert.equal(t.status, "nominal", "reported value stays a real reading");
  assert.ok(t.lastUpdatedSeconds > t.staleThresholdSeconds);
  assert.equal(getEffectiveStatus(t), "stale", "precedence rule does the work");
});

test("formatAge pads minutes and seconds", () => {
  assert.equal(formatAge(252), "04:12");
  assert.equal(formatAge(9), "00:09");
});
