import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_RANKS, setRank } from "./priority.ts";

test("unlocked move swaps with the current holder", () => {
  assert.deepEqual(setRank(DEFAULT_RANKS, "m17", 2, false), {
    ttc: 1,
    sstv: 3,
    m17: 2,
  });
});

test("locked: TT&C row can't move", () => {
  assert.equal(setRank(DEFAULT_RANKS, "ttc", 2, true), DEFAULT_RANKS);
});

test("locked: another row can't displace TT&C from its slot", () => {
  assert.equal(setRank(DEFAULT_RANKS, "sstv", 1, true), DEFAULT_RANKS);
});

test("unlocked: TT&C can be demoted", () => {
  assert.deepEqual(setRank(DEFAULT_RANKS, "ttc", 3, false), {
    ttc: 3,
    sstv: 2,
    m17: 1,
  });
});

test("out-of-range rank is ignored", () => {
  assert.equal(setRank(DEFAULT_RANKS, "m17", 4, false), DEFAULT_RANKS);
  assert.equal(setRank(DEFAULT_RANKS, "sstv", 0, false), DEFAULT_RANKS);
});
