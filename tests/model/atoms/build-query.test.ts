// tests/model/atoms/build-query.test.ts
import { describe, it, expect } from "bun:test";
import {
  buildSelectQuery,
  buildInsertQuery,
  buildUpdateQuery,
  buildDeleteQuery,
} from "@model/universal/atoms/build-query";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("buildSelectQuery", () => {
  it("builds SELECT with all entity fields quoted", () => {
    const result = buildSelectQuery(GAME_DOMAIN_CONFIG);
    expect(result.sql).toContain("SELECT");
    expect(result.sql).toContain('"id"');
    expect(result.sql).toContain('"name"');
    expect(result.sql).toContain('"description"');
    expect(result.sql).toContain('"is_active"');
    expect(result.sql).toContain('"created_at"');
    expect(result.sql).toContain('"updated_at"');
    expect(result.sql).toContain("FROM game_domain");
    expect(result.params).toEqual([]);
  });

  it("appends WHERE clause when conditions are provided", () => {
    const result = buildSelectQuery(GAME_DOMAIN_CONFIG, { id: "abc-123" });
    expect(result.sql).toContain('WHERE "id" = ?');
    expect(result.params).toEqual(["abc-123"]);
  });

  it("handles multiple conditions with AND", () => {
    const result = buildSelectQuery(GAME_DOMAIN_CONFIG, {
      name: "Test",
      is_active: true,
    });
    expect(result.sql).toContain('WHERE "name" = ? AND "is_active" = ?');
    expect(result.params).toEqual(["Test", true]);
  });

  it("omits WHERE for empty conditions object", () => {
    const result = buildSelectQuery(GAME_DOMAIN_CONFIG, {});
    expect(result.sql).not.toContain("WHERE");
    expect(result.params).toEqual([]);
  });
});

describe("buildInsertQuery", () => {
  it("builds INSERT with quoted fields and params", () => {
    const data = { id: "abc", name: "Test", is_active: true };
    const result = buildInsertQuery(GAME_DOMAIN_CONFIG, data);
    expect(result.sql).toContain("INSERT INTO game_domain");
    expect(result.sql).toContain('"id"');
    expect(result.sql).toContain('"name"');
    expect(result.sql).toContain("VALUES");
    expect(result.params).toContain("abc");
    expect(result.params).toContain("Test");
    expect(result.params).toContain(true);
  });
});

describe("buildUpdateQuery", () => {
  it("builds UPDATE SET with WHERE clause", () => {
    const data = { name: "Updated" };
    const conditions = { id: "abc-123" };
    const result = buildUpdateQuery(GAME_DOMAIN_CONFIG, data, conditions);
    expect(result.sql).toContain("UPDATE game_domain SET");
    expect(result.sql).toContain('"name" = ?');
    expect(result.sql).toContain('WHERE "id" = ?');
    // params should be SET values first, then WHERE values
    expect(result.params).toEqual(["Updated", "abc-123"]);
  });

  it("handles multiple fields and conditions", () => {
    const data = { name: "New", is_active: false };
    const conditions = { id: "abc" };
    const result = buildUpdateQuery(GAME_DOMAIN_CONFIG, data, conditions);
    expect(result.params).toEqual(["New", false, "abc"]);
  });
});

describe("buildDeleteQuery", () => {
  it("builds DELETE with WHERE and RETURNING clause", () => {
    const conditions = { id: "abc-123" };
    const result = buildDeleteQuery(GAME_DOMAIN_CONFIG, conditions);
    expect(result.sql).toContain("DELETE FROM game_domain");
    expect(result.sql).toContain('WHERE "id" = ?');
    expect(result.sql).toContain('RETURNING "id"');
    expect(result.params).toEqual(["abc-123"]);
  });
});
