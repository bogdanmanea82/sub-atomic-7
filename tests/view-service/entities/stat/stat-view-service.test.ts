// tests/view-service/entities/stat/stat-view-service.test.ts
// Verifies StatViewService returns correct data structures for all prepare* methods.
// Pure unit tests — no database.
//
// Type shapes (from src/view-service/types/view-models.ts):
//   ListView:   { title, columns, rows: ListViewRow[], count, pagination? }
//   ListViewRow: { id, fields: DisplayField[] }
//   DetailView: { title, fields: DisplayField[] }
//   FormView:   { title, fields: FormField[] }

import { describe, it, expect } from "bun:test";
import { StatViewService } from "../../../../src/view-service/entities/stat/stat-view-service";

const SAMPLE_STAT: Record<string, unknown> = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  machine_name: "strength",
  name: "Strength",
  description: "Raw physical power.",
  data_type: "raw",
  value_min: 0,
  value_max: 9999,
  default_value: 10,
  category: "attribute",
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
};

describe("StatViewService", () => {
  // ── prepareListView ────────────────────────────────────────────────────
  describe("prepareListView", () => {
    it("returns a list view with a 'Stats' title", () => {
      const view = StatViewService.prepareListView([]);
      expect(typeof view.title).toBe("string");
      expect(view.title.length).toBeGreaterThan(0);
    });

    it("returns an empty rows array when given no data", () => {
      const view = StatViewService.prepareListView([]);
      expect(Array.isArray(view.rows)).toBe(true);
      expect(view.rows).toHaveLength(0);
    });

    it("count matches the number of entities passed in", () => {
      const view = StatViewService.prepareListView([SAMPLE_STAT, SAMPLE_STAT]);
      expect(view.count).toBe(2);
    });

    it("includes machine_name in the column headers", () => {
      const view = StatViewService.prepareListView([]);
      const colNames = view.columns.map((c) => c.name);
      expect(colNames).toContain("machine_name");
    });

    it("includes a row for each entity with the correct id", () => {
      const view = StatViewService.prepareListView([SAMPLE_STAT]);
      expect(view.rows).toHaveLength(1);
      expect(view.rows[0]!.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  // ── prepareDetailView ──────────────────────────────────────────────────
  describe("prepareDetailView", () => {
    it("returns a detail view with a non-empty title", () => {
      const view = StatViewService.prepareDetailView(SAMPLE_STAT);
      expect(typeof view.title).toBe("string");
      expect(view.title.length).toBeGreaterThan(0);
    });

    it("includes all visible fields as DisplayField entries", () => {
      const view = StatViewService.prepareDetailView(SAMPLE_STAT);
      const fieldNames = view.fields.map((f) => f.name);
      const expected = [
        "machine_name", "name", "description", "data_type",
        "value_min", "value_max", "default_value", "category",
        "created_at", "updated_at",
      ];
      for (const name of expected) {
        expect(fieldNames).toContain(name);
      }
    });

    it("renders the machine_name value as a string", () => {
      const view = StatViewService.prepareDetailView(SAMPLE_STAT);
      const machineNameField = view.fields.find((f) => f.name === "machine_name");
      expect(machineNameField?.value).toBe("strength");
    });
  });

  // ── prepareCreateForm ──────────────────────────────────────────────────
  describe("prepareCreateForm", () => {
    it("returns a form with all required field names", () => {
      const view = StatViewService.prepareCreateForm();
      const fieldNames = view.fields.map((f) => f.name);
      expect(fieldNames).toContain("machine_name");
      expect(fieldNames).toContain("name");
      expect(fieldNames).toContain("data_type");
      expect(fieldNames).toContain("category");
    });

    it("propagates error messages to the correct form field", () => {
      const errors = { machine_name: "Already taken" };
      const view = StatViewService.prepareCreateForm({}, errors);
      const machineNameField = view.fields.find((f) => f.name === "machine_name");
      expect(machineNameField?.error).toBe("Already taken");
    });

    it("pre-fills submitted values on re-render after failed POST", () => {
      const values = { machine_name: "fire_resistance", name: "Fire Resistance" };
      const view = StatViewService.prepareCreateForm(values);
      const machineNameField = view.fields.find((f) => f.name === "machine_name");
      expect(machineNameField?.value).toBe("fire_resistance");
    });
  });

  // ── prepareEditForm ────────────────────────────────────────────────────
  describe("prepareEditForm", () => {
    it("pre-fills all stat values into the form fields", () => {
      const view = StatViewService.prepareEditForm(SAMPLE_STAT);
      const nameField = view.fields.find((f) => f.name === "name");
      expect(nameField?.value).toBe("Strength");
    });

    it("propagates errors on failed update", () => {
      const errors = { name: "Name too short" };
      const view = StatViewService.prepareEditForm(SAMPLE_STAT, errors);
      const nameField = view.fields.find((f) => f.name === "name");
      expect(nameField?.error).toBe("Name too short");
    });
  });

  // ── prepareDuplicateForm ───────────────────────────────────────────────
  describe("prepareDuplicateForm", () => {
    it("returns a form whose title starts with 'Duplicate'", () => {
      const view = StatViewService.prepareDuplicateForm(SAMPLE_STAT);
      expect(view.title).toMatch(/^Duplicate/);
    });

    it("pre-fills source values into form fields", () => {
      const view = StatViewService.prepareDuplicateForm(SAMPLE_STAT);
      const categoryField = view.fields.find((f) => f.name === "category");
      expect(categoryField?.value).toBe("attribute");
    });
  });

  // ── prepareBrowserFieldConfig ──────────────────────────────────────────
  describe("prepareBrowserFieldConfig", () => {
    it("returns a valid JSON string", () => {
      const json = StatViewService.prepareBrowserFieldConfig();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("parsed config includes an entry for machine_name", () => {
      const config = JSON.parse(StatViewService.prepareBrowserFieldConfig()) as Array<{ name: string }>;
      const names = config.map((f) => f.name);
      expect(names).toContain("machine_name");
    });

    it("parsed config includes an entry for data_type", () => {
      const config = JSON.parse(StatViewService.prepareBrowserFieldConfig()) as Array<{ name: string }>;
      const names = config.map((f) => f.name);
      expect(names).toContain("data_type");
    });
  });
});
