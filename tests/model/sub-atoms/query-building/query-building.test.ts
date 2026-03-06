// tests/model/sub-atoms/query-building/query-building.test.ts
import { describe, it, expect } from "bun:test";
import { queryBuildSelect } from "@model/universal/sub-atoms/query-building/query-build-select";
import { queryBuildInsert } from "@model/universal/sub-atoms/query-building/query-build-insert";
import { queryBuildUpdate } from "@model/universal/sub-atoms/query-building/query-build-update";
import { queryBuildWhere } from "@model/universal/sub-atoms/query-building/query-build-where";
import { queryBuildValues } from "@model/universal/sub-atoms/query-building/query-build-values";

// ═══════════════════════════════════════════════════════════════════════════
// queryBuildSelect
// ═══════════════════════════════════════════════════════════════════════════

describe("queryBuildSelect", () => {
  it("builds SELECT with quoted field names", () => {
    const result = queryBuildSelect("game_domain", ["id", "name", "is_active"]);
    expect(result).toBe('SELECT "id", "name", "is_active" FROM game_domain');
  });

  it("uses * when fields array is empty", () => {
    const result = queryBuildSelect("game_domain", []);
    expect(result).toBe("SELECT * FROM game_domain");
  });

  it("handles a single field", () => {
    const result = queryBuildSelect("game_domain", ["name"]);
    expect(result).toBe('SELECT "name" FROM game_domain');
  });

  it("quotes snake_case fields for PostgreSQL compatibility", () => {
    const result = queryBuildSelect("game_domain", ["created_at", "updated_at"]);
    expect(result).toBe('SELECT "created_at", "updated_at" FROM game_domain');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// queryBuildInsert
// ═══════════════════════════════════════════════════════════════════════════

describe("queryBuildInsert", () => {
  it("builds INSERT with quoted fields and placeholders", () => {
    const result = queryBuildInsert("game_domain", {
      name: "Test",
      is_active: true,
    });
    expect(result.sql).toBe(
      'INSERT INTO game_domain ("name", "is_active") VALUES (?, ?)'
    );
    expect(result.params).toEqual(["Test", true]);
  });

  it("includes all data fields in correct order", () => {
    const result = queryBuildInsert("game_domain", {
      id: "abc-123",
      name: "Domain",
      description: "A test domain",
    });
    expect(result.sql).toContain('"id", "name", "description"');
    expect(result.params).toEqual(["abc-123", "Domain", "A test domain"]);
  });

  it("handles null values in params", () => {
    const result = queryBuildInsert("game_domain", {
      name: "Test",
      description: null,
    });
    expect(result.params).toEqual(["Test", null]);
  });

  it("generates correct number of placeholders", () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < 6; i++) data[`field${i}`] = `value${i}`;
    const result = queryBuildInsert("game_domain", data);
    const placeholders = result.sql.match(/\?/g);
    expect(placeholders).toHaveLength(6);
    expect(result.params).toHaveLength(6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// queryBuildUpdate
// ═══════════════════════════════════════════════════════════════════════════

describe("queryBuildUpdate", () => {
  it("builds UPDATE SET with quoted fields", () => {
    const result = queryBuildUpdate("game_domain", {
      name: "Updated",
      is_active: false,
    });
    expect(result.sql).toBe(
      'UPDATE game_domain SET "name" = ?, "is_active" = ?'
    );
    expect(result.params).toEqual(["Updated", false]);
  });

  it("handles a single field update", () => {
    const result = queryBuildUpdate("game_domain", { name: "New Name" });
    expect(result.sql).toBe('UPDATE game_domain SET "name" = ?');
    expect(result.params).toEqual(["New Name"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// queryBuildWhere
// ═══════════════════════════════════════════════════════════════════════════

describe("queryBuildWhere", () => {
  it("builds WHERE clause with quoted fields", () => {
    const result = queryBuildWhere({ id: "abc-123" });
    expect(result.sql).toBe('WHERE "id" = ?');
    expect(result.params).toEqual(["abc-123"]);
  });

  it("joins multiple conditions with AND", () => {
    const result = queryBuildWhere({ name: "Test", is_active: true });
    expect(result.sql).toBe('WHERE "name" = ? AND "is_active" = ?');
    expect(result.params).toEqual(["Test", true]);
  });

  it("returns empty result for empty conditions", () => {
    const result = queryBuildWhere({});
    expect(result.sql).toBe("");
    expect(result.params).toEqual([]);
  });

  it("handles null values in conditions", () => {
    const result = queryBuildWhere({ description: null });
    expect(result.sql).toBe('WHERE "description" = ?');
    expect(result.params).toEqual([null]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// queryBuildValues
// ═══════════════════════════════════════════════════════════════════════════

describe("queryBuildValues", () => {
  it("builds VALUES clause for a single row", () => {
    const result = queryBuildValues([{ name: "A", is_active: true }]);
    expect(result.sql).toBe("VALUES (?, ?)");
    expect(result.params).toEqual(["A", true]);
  });

  it("builds VALUES clause for multiple rows", () => {
    const result = queryBuildValues([
      { name: "A", is_active: true },
      { name: "B", is_active: false },
    ]);
    expect(result.sql).toBe("VALUES (?, ?), (?, ?)");
    expect(result.params).toEqual(["A", true, "B", false]);
  });

  it("returns empty result for empty array", () => {
    const result = queryBuildValues([]);
    expect(result.sql).toBe("");
    expect(result.params).toEqual([]);
  });
});
