// tests/config/universal/sub-atoms/roll-shapes.test.ts
// Verifies ROLL_SHAPES has exactly 2 values with the correct string literals.
// scalar = one frozen value rolled at item generation; range = live min–max per event.

import { describe, it, expect } from "bun:test";
import {
  ROLL_SHAPES,
  ROLL_SHAPE_SCALAR,
  ROLL_SHAPE_RANGE,
} from "../../../../src/config/universal/sub-atoms/roll-shapes";

describe("ROLL_SHAPES", () => {
  // ── Individual constants ───────────────────────────────────────────────

  it("ROLL_SHAPE_SCALAR is 'scalar'", () => {
    expect(ROLL_SHAPE_SCALAR).toBe("scalar");
  });

  it("ROLL_SHAPE_RANGE is 'range'", () => {
    expect(ROLL_SHAPE_RANGE).toBe("range");
  });

  // ── Grouped object ─────────────────────────────────────────────────────

  it("ROLL_SHAPES.scalar matches the individual constant", () => {
    expect(ROLL_SHAPES.scalar).toBe(ROLL_SHAPE_SCALAR);
  });

  it("ROLL_SHAPES.range matches the individual constant", () => {
    expect(ROLL_SHAPES.range).toBe(ROLL_SHAPE_RANGE);
  });

  it("ROLL_SHAPES has exactly 2 entries — no accidental additions or omissions", () => {
    expect(Object.keys(ROLL_SHAPES)).toHaveLength(2);
  });
});
