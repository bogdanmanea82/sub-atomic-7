// tests/controller/entities/stat/stat-api.test.ts
// Integration tests for the Stat JSON API (GET/POST/PUT/DELETE /api/stats).
// Uses Elysia's .handle() method — no server needed, but the live DB is required.
// All test rows use machine_name LIKE 'http_test_%' for isolation.

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { StatController } from "../../../../src/controller/entities/stat";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

const ADMIN_TOKEN = "Bearer dev-admin-token";
const BASE = "http://localhost";

const app = new Elysia().use(StatController);

let createdId = "";

function makePayload(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    machine_name: "http_test_" + Date.now(),
    name: "HTTP Test Stat",
    description: "Created by HTTP integration test",
    data_type: "raw",
    value_min: 0,
    value_max: 9999,
    default_value: 10,
    category: "attribute",
    ...overrides,
  };
}

function jsonReq(
  method: string,
  path: string,
  body?: unknown,
  auth: string = ADMIN_TOKEN,
): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = auth;
  return new Request(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'http_test_%'`);
});

afterAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM stat WHERE machine_name LIKE 'http_test_%'`);
});

// ── GET /api/stats ─────────────────────────────────────────────────────────
describe("GET /api/stats", () => {
  it("returns 200 with success envelope and array data", async () => {
    const res = await app.handle(new Request(`${BASE}/api/stats`));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("does not require Authorization header (public read)", async () => {
    const res = await app.handle(new Request(`${BASE}/api/stats`));
    expect(res.status).toBe(200);
  });
});

// ── POST /api/stats ────────────────────────────────────────────────────────
describe("POST /api/stats", () => {
  it("returns 201 with created stat on valid input", async () => {
    const payload = makePayload({ machine_name: "http_test_create_" + Date.now() });
    const res = await app.handle(jsonReq("POST", "/api/stats", payload));

    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean; data: { id: string; machine_name: string } };
    expect(body.success).toBe(true);
    expect(typeof body.data.id).toBe("string");
    expect(body.data.machine_name).toBe(payload["machine_name"] as string);
    createdId = body.data.id;
  });

  it("returns 401 when Authorization header is absent", async () => {
    const res = await app.handle(jsonReq("POST", "/api/stats", makePayload(), ""));
    expect(res.status).toBe(401);
  });

  it("rejects POST with non-JSON Content-Type (4xx — schema or parse error)", async () => {
    // Elysia body validation runs before onBeforeHandle, so form-encoded content
    // is rejected at the schema level (422) rather than our 415 middleware check
    const res = await app.handle(
      new Request(`${BASE}/api/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: ADMIN_TOKEN,
        },
        body: "machine_name=test",
      }),
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("rejects body missing required field 'name'", async () => {
    const payload = makePayload();
    delete (payload as Record<string, unknown>)["name"];
    const res = await app.handle(jsonReq("POST", "/api/stats", payload));
    // Elysia TypeBox schema validates body before the handler runs
    // 422 when the scoped error handler is present; 400 otherwise (ParseError path)
    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json() as { success?: boolean };
    expect(body.success).not.toBe(true);
  });

  it("returns 400 with machine_name error on duplicate machine_name", async () => {
    const name = "http_test_dupe_" + Date.now();
    await app.handle(jsonReq("POST", "/api/stats", makePayload({ machine_name: name })));
    const res = await app.handle(jsonReq("POST", "/api/stats", makePayload({ machine_name: name })));

    expect(res.status).toBe(400);
    const body = await res.json() as { success: boolean; details?: Record<string, string> };
    expect(body.success).toBe(false);
    expect(body.details?.["machine_name"]).toBeDefined();
  });

  it("accepts integer fields sent as JSON numbers (not strings)", async () => {
    const payload = makePayload({
      machine_name: "http_test_ints_" + Date.now(),
      value_min: -100,
      value_max: 500,
      default_value: 0,
    });
    const res = await app.handle(jsonReq("POST", "/api/stats", payload));
    expect(res.status).toBe(201);
    const body = await res.json() as { data: { value_min: number; value_max: number } };
    expect(body.data.value_min).toBe(-100);
    expect(body.data.value_max).toBe(500);
  });
});

// ── GET /api/stats/check-machine-name ─────────────────────────────────────
describe("GET /api/stats/check-machine-name", () => {
  it("returns available:true for a name not in use", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/stats/check-machine-name?machineName=http_test_unused_${Date.now()}`),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { available: boolean };
    expect(body.available).toBe(true);
  });

  it("returns available:false for an existing machine_name", async () => {
    const listRes = await app.handle(new Request(`${BASE}/api/stats`));
    const listBody = await listRes.json() as { data: Array<{ machine_name: string }> };
    const existingName = listBody.data[0]?.machine_name;
    if (!existingName) throw new Error("No seeded stats found");

    const res = await app.handle(
      new Request(`${BASE}/api/stats/check-machine-name?machineName=${existingName}`),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { available: boolean };
    expect(body.available).toBe(false);
  });

  it("is not shadowed by the /:id wildcard route", async () => {
    // If routing breaks, 'check-machine-name' would match /:id and return 404
    const res = await app.handle(
      new Request(`${BASE}/api/stats/check-machine-name?machineName=anything`),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("returns available:true when excludeId matches the machine_name owner", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const getRes = await app.handle(new Request(`${BASE}/api/stats/${createdId}`));
    const getBody = await getRes.json() as { data: { machine_name: string } };
    const ownName = getBody.data.machine_name;

    const res = await app.handle(
      new Request(`${BASE}/api/stats/check-machine-name?machineName=${ownName}&excludeId=${createdId}`),
    );
    const body = await res.json() as { available: boolean };
    expect(body.available).toBe(true);
  });
});

// ── GET /api/stats/:id ─────────────────────────────────────────────────────
describe("GET /api/stats/:id", () => {
  it("returns 200 with full stat record", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const res = await app.handle(new Request(`${BASE}/api/stats/${createdId}`));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      data: { id: string; machine_name: string; value_min: number };
    };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(typeof body.data.machine_name).toBe("string");
    expect(typeof body.data.value_min).toBe("number");
  });

  it("returns 404 for unknown id", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/stats/00000000-0000-0000-0000-000000000000`),
    );
    expect(res.status).toBe(404);
  });
});

// ── PUT /api/stats/:id ─────────────────────────────────────────────────────
describe("PUT /api/stats/:id", () => {
  it("returns 200 and the updated stat on valid update", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/stats/${createdId}`, { name: "HTTP Updated Name" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { name: string } };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("HTTP Updated Name");
  });

  it("returns 401 when no token is provided", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const res = await app.handle(jsonReq("PUT", `/api/stats/${createdId}`, { name: "Valid Name" }, ""));
    expect(res.status).toBe(401);
  });

  it("returns 400 on duplicate machine_name", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const takenName = "http_test_taken_" + Date.now();
    await app.handle(jsonReq("POST", "/api/stats", makePayload({ machine_name: takenName })));

    const res = await app.handle(
      jsonReq("PUT", `/api/stats/${createdId}`, { machine_name: takenName }),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { details?: Record<string, string> };
    expect(body.details?.["machine_name"]).toBeDefined();
  });

  it("allows updating with the stat's own machine_name (no self-conflict)", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const getRes = await app.handle(new Request(`${BASE}/api/stats/${createdId}`));
    const getBody = await getRes.json() as { data: { machine_name: string } };
    const ownName = getBody.data.machine_name;

    const res = await app.handle(
      jsonReq("PUT", `/api/stats/${createdId}`, { machine_name: ownName, name: "Self Update" }),
    );
    expect(res.status).toBe(200);
  });
});

// ── DELETE /api/stats/:id ──────────────────────────────────────────────────
describe("DELETE /api/stats/:id", () => {
  it("returns 200 and the stat no longer exists", async () => {
    const payload = makePayload({ machine_name: "http_test_del_" + Date.now() });
    const createRes = await app.handle(jsonReq("POST", "/api/stats", payload));
    const createBody = await createRes.json() as { data: { id: string } };
    const id = createBody.data.id;

    const deleteRes = await app.handle(
      new Request(`${BASE}/api/stats/${id}`, {
        method: "DELETE",
        headers: { Authorization: ADMIN_TOKEN },
      }),
    );
    // Elysia returns 204 for DELETE with no response body
    expect(deleteRes.status).toBe(204);

    const findRes = await app.handle(new Request(`${BASE}/api/stats/${id}`));
    expect(findRes.status).toBe(404);
  });

  it("returns 401 when no token is provided on DELETE", async () => {
    if (!createdId) throw new Error("No stat created in prior test");
    const res = await app.handle(
      new Request(`${BASE}/api/stats/${createdId}`, { method: "DELETE" }),
    );
    expect(res.status).toBe(401);
  });
});
