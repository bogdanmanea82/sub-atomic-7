// tests/view-service/entities/item-modifier/item-modifier-view-service-state.test.ts
// Tests the deriveCurrentState() logic as observed through the public form methods.
// deriveCurrentState is private, but its output is the `currentState` field on every
// form view returned by prepareCreateForm / prepareEditForm / prepareDuplicateForm.
//
// Rules:
//   1. archived_reason present (non-null, non-empty) → "archived"
//   2. is_active === true (boolean) or "true" (string) → "active"
//   3. otherwise → "disabled"
//   4. no values passed → "active" (new entity default)
//   5. prepareDuplicateForm always returns "active" (ignores source values)

import { describe, it, expect } from "bun:test";
import { ModifierViewService } from "../../../../src/view-service/entities/modifier/modifier-view-service";

// Minimal SelectOptions — these don't affect currentState, just keep the call valid.
const EMPTY_OPTS = {};

describe("deriveCurrentState (via ModifierViewService form methods)", () => {
  // ── Rule 4: no values → "active" ───────────────────────────────────────────

  describe("prepareCreateForm called with no values", () => {
    it("returns currentState 'active' when values is undefined", () => {
      const view = ModifierViewService.prepareCreateForm(EMPTY_OPTS, undefined);
      expect(view.currentState).toBe("active");
    });
  });

  // ── Rule 1: archived_reason present → "archived" ───────────────────────────

  describe("Rule 1 — archived_reason present overrides is_active", () => {
    it("returns 'archived' when archived_reason is a non-empty string", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, {
        is_active: true,
        archived_reason: "Outdated by new set",
      });
      expect(view.currentState).toBe("archived");
    });

    it("returns 'archived' even when is_active is false", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, {
        is_active: false,
        archived_reason: "reason",
      });
      expect(view.currentState).toBe("archived");
    });
  });

  // ── Rule 2: is_active true → "active" ─────────────────────────────────────

  describe("Rule 2 — is_active true produces 'active'", () => {
    it("returns 'active' when is_active is boolean true", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, { is_active: true });
      expect(view.currentState).toBe("active");
    });

    it("returns 'active' when is_active is the string 'true'", () => {
      // Form re-renders after a failed POST submit values as strings
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, { is_active: "true" });
      expect(view.currentState).toBe("active");
    });
  });

  // ── Rule 3: fallthrough → "disabled" ──────────────────────────────────────

  describe("Rule 3 — fallthrough produces 'disabled'", () => {
    it("returns 'disabled' when is_active is boolean false", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, { is_active: false });
      expect(view.currentState).toBe("disabled");
    });

    it("returns 'disabled' when is_active is the string 'false'", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, { is_active: "false" });
      expect(view.currentState).toBe("disabled");
    });

    it("returns 'disabled' when is_active is absent from values", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, { name: "Sword Mod" });
      expect(view.currentState).toBe("disabled");
    });

    it("returns 'disabled' when archived_reason is an empty string (not considered archived)", () => {
      const view = ModifierViewService.prepareEditForm(EMPTY_OPTS, {
        is_active: false,
        archived_reason: "",
      });
      expect(view.currentState).toBe("disabled");
    });
  });

  // ── Rule 5: prepareDuplicateForm always returns "active" ───────────────────

  describe("prepareDuplicateForm — always 'active' regardless of source values", () => {
    it("returns 'active' even when source is archived", () => {
      const view = ModifierViewService.prepareDuplicateForm(EMPTY_OPTS, {
        is_active: false,
        archived_reason: "old reason",
      });
      expect(view.currentState).toBe("active");
    });

    it("returns 'active' even when source is disabled", () => {
      const view = ModifierViewService.prepareDuplicateForm(EMPTY_OPTS, {
        is_active: false,
      });
      expect(view.currentState).toBe("active");
    });
  });

  // ── tierFieldMeta is always populated ─────────────────────────────────────

  it("prepareCreateForm always includes tierFieldMeta from L0 config", () => {
    const view = ModifierViewService.prepareCreateForm(EMPTY_OPTS);
    expect(Array.isArray(view.tierFieldMeta)).toBe(true);
    expect(view.tierFieldMeta.length).toBeGreaterThan(0);
  });

  it("prepareCreateForm defaults to a single empty tier row when no tierRows provided", () => {
    const view = ModifierViewService.prepareCreateForm(EMPTY_OPTS);
    expect(view.tierRows).toHaveLength(1);
    expect(view.tierRows[0]!.tier_index).toBe(0);
  });
});
