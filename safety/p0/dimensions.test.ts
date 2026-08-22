import assert from "node:assert/strict";
import test from "node:test";
import { canonicalDimension } from "./dimensions";

test("treats reversed ordinary dimensions as one size", () => {
  assert.equal(canonicalDimension("40x60"), "40x60");
  assert.equal(canonicalDimension("60×40"), "40x60");
  assert.equal(canonicalDimension(" 75 X 100 "), "75x100");
});

test("rejects empty, zero, malformed and composite dimensions", () => {
  for (const value of [null, "", "0", "40", "2x90x60", "40x0", "axb"]) {
    assert.equal(canonicalDimension(value), null);
  }
});
