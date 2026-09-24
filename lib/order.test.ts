import assert from "node:assert/strict";
import test from "node:test";
import { restoreOrder } from "./order.ts";

const IDS = ["comm", "battery", "temp"];

test("valid save is applied", () => {
  assert.deepEqual(restoreOrder(["temp", "comm", "battery"], IDS), ["temp", "comm", "battery"]);
});

test("unknown and duplicate ids are dropped, missing channels appended", () => {
  assert.deepEqual(restoreOrder(["temp", "gone", "temp"], IDS), ["temp", "comm", "battery"]);
});

test("garbage falls back to default order", () => {
  assert.deepEqual(restoreOrder({ nope: 1 }, IDS), IDS);
  assert.deepEqual(restoreOrder(null, IDS), IDS);
});
