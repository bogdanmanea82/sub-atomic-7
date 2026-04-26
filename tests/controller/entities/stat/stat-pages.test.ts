// tests/controller/entities/stat/stat-pages.test.ts
// Integration tests for Stat HTML page routes (GET views + POST form actions).
// Uses Elysia's .handle() method — no server needed, live DB is required.
// All test rows use machine_name LIKE 'page_test_%' for isolation.
//
// Key things under test:
//   - GET routes return 200 HTML with correct content
//   - POST create/update redirect (3xx) to the correct location on success
//   - POST create/update return 422 + re-rendered form on validation failure
//   - POST delete redirects to /stats
//   - Elysia parses application/x-www-form-urlencoded bodies correctly

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { StatController } from "../../../../src/controller/entities/stat";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

const BASE = "http://localhost";
const app = new Elysia().use(StatController);

let seededId = "";
let seededMachineName = "";

function formPost(path: string, fields: Record<string, string | number>): Request {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])),
  );
  return new Request(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

beforeAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'page_test_%'`);
  seededMachineName = "page_test_seed_" + Date.now();
  const rows = await db.unsafe<{ id: string }[]>(`
    INSERT INTO stat (machine_name, name, data_type, value_min, value_max, default_value, category)
    VALUES ('${seededMachineName}', 'Page Test Seed', 'raw', 0, 100, 10, 'attribute')
    RETURNING id
  `);
  seededId = rows[0]!.id;
});

afterAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'page_test_%'`);
});

// ── GET /stats ─────────────────────────────────────────────────────────────
describe("GET /stats", () => {
  it("returns 200 with HTML content-type", async () => {
    const res = await app.handle(new Request(`${BASE}/stats`));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("response body contains a table or list of stats", async () => {
    const res = await app.handle(new Request(`${BASE}/stats`));
    const html = await res.text();
    expect(html).toContain("Stats");
    expect(html).toContain("<table");
  });
});

// ── GET /stats/new ─────────────────────────────────────────────────────────
describe("GET /stats/new", () => {
  it("returns 200 with an HTML form containing stat fields", async () => {
    const res = await app.handle(new Request(`${BASE}/stats/new`));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<form");
    expect(html).toContain('name="machine_name"');
    expect(html).toContain('name="data_type"');
    expect(html).toContain('name="category"');
  });
});

// ── GET /stats/:id ─────────────────────────────────────────────────────────
describe("GET /stats/:id", () => {
  it("returns 200 with the stat's machine_name in the page", async () => {
    const res = await app.handle(new Request(`${BASE}/stats/${seededId}`));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain(seededMachineName);
  });

  it("returns 404 for unknown id", async () => {
    const res = await app.handle(
      new Request(`${BASE}/stats/00000000-0000-0000-0000-000000000000`),
    );
    expect(res.status).toBe(404);
  });
});

// ── GET /stats/:id/edit ────────────────────────────────────────────────────
describe("GET /stats/:id/edit", () => {
  it("returns 200 with a pre-filled form containing the stat's values", async () => {
    const res = await app.handle(new Request(`${BASE}/stats/${seededId}/edit`));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<form");
    expect(html).toContain(seededMachineName);
  });
});

// ── GET /stats/:id/duplicate ───────────────────────────────────────────────
describe("GET /stats/:id/duplicate", () => {
  it("returns 200 with a form titled 'Duplicate'", async () => {
    const res = await app.handle(new Request(`${BASE}/stats/${seededId}/duplicate`));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Duplicate");
    expect(html).toContain("<form");
  });

  it("form contains the source stat's machine_name pre-filled", async () => {
    const res = await app.handle(new Request(`${BASE}/stats/${seededId}/duplicate`));
    const html = await res.text();
    expect(html).toContain(seededMachineName);
  });
});

// ── POST /stats (create action) ────────────────────────────────────────────
describe("POST /stats (form create)", () => {
  it("redirects to /stats/:id on successful create", async () => {
    const machineName = "page_test_create_" + Date.now();
    const res = await app.handle(
      formPost("/stats", {
        machine_name: machineName,
        name: "Page Test Create",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
        status_action: "active",
      }),
    );
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    const location = res.headers.get("location") ?? "";
    expect(location).toMatch(/^\/stats\/[0-9a-f-]{36}$/);
  });

  it("integer fields submitted as form strings are accepted and stored as numbers", async () => {
    const machineName = "page_test_ints_" + Date.now();
    const createRes = await app.handle(
      formPost("/stats", {
        machine_name: machineName,
        name: "Page Int Test",
        data_type: "raw",
        value_min: -50,
        value_max: 500,
        default_value: 25,
        category: "defensive",
        status_action: "active",
      }),
    );
    expect(createRes.status).toBeGreaterThanOrEqual(300);
    expect(createRes.status).toBeLessThan(400);

    const id = (createRes.headers.get("location") ?? "").split("/stats/")[1];
    const detailRes = await app.handle(new Request(`${BASE}/stats/${id}`));
    const html = await detailRes.text();
    // The detail page should render the integer values
    expect(html).toContain("-50");
    expect(html).toContain("500");
  });

  it("returns 422 and re-renders the form on duplicate machine_name", async () => {
    const machineName = "page_test_dupe_" + Date.now();
    await app.handle(
      formPost("/stats", {
        machine_name: machineName,
        name: "First",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
      }),
    );
    const res = await app.handle(
      formPost("/stats", {
        machine_name: machineName,
        name: "Second",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
      }),
    );
    expect(res.status).toBe(422);
    const html = await res.text();
    // Form re-rendered with submitted values still present
    expect(html).toContain("<form");
    expect(html).toContain(machineName);
  });

  it("returns 422 and re-renders the form when required field is missing", async () => {
    const res = await app.handle(
      formPost("/stats", {
        // name is missing
        machine_name: "page_test_missing_" + Date.now(),
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
      }),
    );
    expect(res.status).toBe(422);
    const html = await res.text();
    expect(html).toContain("<form");
  });
});

// ── POST /stats/:id (update action) ───────────────────────────────────────
describe("POST /stats/:id (form update)", () => {
  it("redirects to /stats/:id on successful update", async () => {
    const res = await app.handle(
      formPost(`/stats/${seededId}`, {
        machine_name: "page_test_updated_" + Date.now(),
        name: "Page Updated Name",
        data_type: "percentage",
        value_min: -100,
        value_max: 100,
        default_value: 0,
        category: "defensive",
      }),
    );
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toBe(`/stats/${seededId}`);
  });

  it("returns 422 when updated machine_name conflicts with another stat", async () => {
    // Create another stat to provide the conflicting name
    const takenName = "page_test_taken_" + Date.now();
    const createRes = await app.handle(
      formPost("/stats", {
        machine_name: takenName,
        name: "Taken Name Stat",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
        status_action: "active",
      }),
    );
    expect(createRes.status).toBeLessThan(400);

    const res = await app.handle(
      formPost(`/stats/${seededId}`, {
        machine_name: takenName,
        name: "Conflict Update",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
      }),
    );
    expect(res.status).toBe(422);
  });
});

// ── POST /stats/:id/delete ─────────────────────────────────────────────────
describe("POST /stats/:id/delete", () => {
  it("redirects to /stats and the record no longer renders a detail page", async () => {
    const machineName = "page_test_todel_" + Date.now();
    const createRes = await app.handle(
      formPost("/stats", {
        machine_name: machineName,
        name: "To Delete",
        data_type: "raw",
        value_min: 0,
        value_max: 100,
        default_value: 10,
        category: "attribute",
        status_action: "active",
      }),
    );
    const location = createRes.headers.get("location") ?? "";
    const id = location.split("/stats/")[1] ?? "";
    expect(id).toBeTruthy();

    const deleteRes = await app.handle(
      new Request(`${BASE}/stats/${id}/delete`, { method: "POST" }),
    );
    expect(deleteRes.status).toBeGreaterThanOrEqual(300);
    expect(deleteRes.status).toBeLessThan(400);
    expect(deleteRes.headers.get("location")).toBe("/stats");

    const findRes = await app.handle(new Request(`${BASE}/stats/${id}`));
    expect(findRes.status).toBe(404);
  });
});
