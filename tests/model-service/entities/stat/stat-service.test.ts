// tests/model-service/entities/stat/stat-service.test.ts
// Integration tests for StatService — requires a running PostgreSQL database.
// Tests the full create/findById/update/delete/checkMachineNameAvailable flow.
// Test rows use machine_name LIKE 'test_%' for isolation; cleaned up in afterAll.

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { StatService } from "../../../../src/model-service/entities/stat/stat-service";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

let createdStatId: string | null = null;

function makeStatInput(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    machine_name: "test_strength_" + Date.now(),
    name: "Test Strength " + Date.now(),
    description: "A test stat for unit testing.",
    data_type: "raw",
    value_min: 0,
    value_max: 9999,
    default_value: 10,
    category: "attribute",
    is_active: true,
    ...overrides,
  };
}

beforeAll(async () => {
  // Stat is a top-level entity — no parent hierarchy records needed.
  // Any leftover test rows from prior crashed runs are cleaned here.
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'test_%'`);
});

afterAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'test_%'`);
});

describe("StatService", () => {
  // ── Create ───────────────────────────────────────────────────────────────
  describe("create", () => {
    it("creates a stat and returns the new record", async () => {
      const input = makeStatInput();
      const result = await StatService.create(input);

      expect(result.success).toBe(true);
      if (result.success) {
        createdStatId = (result.data as { id: string }).id;
        expect(createdStatId).toBeDefined();
        expect((result.data as { machine_name: string }).machine_name).toBe(input["machine_name"]);
      }
    });

    it("rejects a duplicate machine_name with a validation error", async () => {
      const machineName = "test_duplicate_" + Date.now();
      await StatService.create(makeStatInput({ machine_name: machineName }));
      const result = await StatService.create(makeStatInput({ machine_name: machineName }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("validation");
        expect(result.errors?.["machine_name"]).toBeDefined();
      }
    });

    it("rejects input with missing required field", async () => {
      const result = await StatService.create(makeStatInput({ name: undefined }));
      expect(result.success).toBe(false);
    });
  });

  // ── FindById ─────────────────────────────────────────────────────────────
  describe("findById", () => {
    it("returns the stat with all 11 fields populated", async () => {
      if (!createdStatId) throw new Error("No stat created in prior test");
      const result = await StatService.findById(createdStatId);

      expect(result.success).toBe(true);
      if (result.success) {
        const stat = result.data as {
          id: string; machine_name: string; name: string;
          data_type: string; value_min: number; value_max: number;
          default_value: number; category: string;
          created_at: Date; updated_at: Date;
        };
        expect(stat.id).toBe(createdStatId);
        expect(typeof stat.machine_name).toBe("string");
        expect(typeof stat.data_type).toBe("string");
        expect(typeof stat.value_min).toBe("number");
        expect(typeof stat.value_max).toBe("number");
        expect(typeof stat.default_value).toBe("number");
        expect(typeof stat.category).toBe("string");
        expect(stat.created_at).toBeInstanceOf(Date);
        expect(stat.updated_at).toBeInstanceOf(Date);
      }
    });

    it("returns not_found stage for an unknown id", async () => {
      const result = await StatService.findById("00000000-0000-0000-0000-000000000000");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });
  });

  // ── FindMany ─────────────────────────────────────────────────────────────
  describe("findMany", () => {
    it("returns an array (at least the seeded stats)", async () => {
      const result = await StatService.findMany();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect((result.data as unknown[]).length).toBeGreaterThan(0);
      }
    });

    it("filters by machine_name condition", async () => {
      if (!createdStatId) throw new Error("No stat created in prior test");
      const machineName = (await StatService.findById(createdStatId)).success
        ? ((await StatService.findById(createdStatId)) as { data: { machine_name: string } }).data.machine_name
        : "";

      const result = await StatService.findMany({ machine_name: machineName });
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as unknown[]).length).toBe(1);
      }
    });
  });

  // ── Update ───────────────────────────────────────────────────────────────
  describe("update", () => {
    it("updates the name field successfully", async () => {
      if (!createdStatId) throw new Error("No stat created in prior test");
      const result = await StatService.update(createdStatId, { name: "Updated Test Strength" });

      expect(result.success).toBe(true);
    });

    it("rejects a machine_name that belongs to another stat", async () => {
      const otherName = "test_other_" + Date.now();
      await StatService.create(makeStatInput({ machine_name: otherName }));

      if (!createdStatId) throw new Error("No stat created in prior test");
      const result = await StatService.update(createdStatId, { machine_name: otherName });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors?.["machine_name"]).toBeDefined();
      }
    });

    it("allows updating with the stat's own machine_name (no self-conflict)", async () => {
      if (!createdStatId) throw new Error("No stat created in prior test");
      const findResult = await StatService.findById(createdStatId);
      if (!findResult.success) throw new Error("Stat not found");
      const ownMachineName = (findResult.data as { machine_name: string }).machine_name;

      const result = await StatService.update(createdStatId, {
        machine_name: ownMachineName,
        name: "Self Update Test",
      });
      expect(result.success).toBe(true);
    });
  });

  // ── Delete ───────────────────────────────────────────────────────────────
  describe("delete", () => {
    it("deletes the stat and returns not_found on subsequent findById", async () => {
      const input = makeStatInput({ machine_name: "test_to_delete_" + Date.now() });
      const created = await StatService.create(input);
      if (!created.success) throw new Error("Setup stat not created");
      const id = (created.data as { id: string }).id;

      await StatService.delete(id);

      const found = await StatService.findById(id);
      expect(found.success).toBe(false);
      if (!found.success) {
        expect(found.stage).toBe("not_found");
      }
    });
  });

  // ── checkMachineNameAvailable ─────────────────────────────────────────────
  describe("checkMachineNameAvailable", () => {
    it("returns available: true for a machine_name not in use", async () => {
      const result = await StatService.checkMachineNameAvailable("test_unique_" + Date.now());
      expect(result.available).toBe(true);
    });

    it("returns available: false for an existing machine_name", async () => {
      const name = "test_taken_" + Date.now();
      await StatService.create(makeStatInput({ machine_name: name }));
      const result = await StatService.checkMachineNameAvailable(name);
      expect(result.available).toBe(false);
    });

    it("returns available: true when excludeId matches the owner", async () => {
      if (!createdStatId) throw new Error("No stat created in prior test");
      const findResult = await StatService.findById(createdStatId);
      if (!findResult.success) throw new Error("Stat not found");
      const ownMachineName = (findResult.data as { machine_name: string }).machine_name;

      const result = await StatService.checkMachineNameAvailable(ownMachineName, createdStatId);
      expect(result.available).toBe(true);
    });
  });
});
