// tests/controller/entities/game-domain/game-domain-api.test.ts
// Integration tests for the GameDomain JSON API (GET/POST/PUT/DELETE /api/game-domains).
// Uses Elysia's .handle() method — no server needed, but the live DB is required.
// All test rows use name LIKE 'http_test_gd_%' for isolation.
//
// Browser simulation tests: reproduce the exact data format the browser sends
// via FormData/fetchJson — is_active as "true"/"false" string and no auth header.
// These expose the two root-cause bugs in form-submit-handler.ts and fetch-json.ts.

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { GameDomainController } from "../../../../src/controller/entities/game-domain";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

const ADMIN_TOKEN = "Bearer dev-admin-token";
const BASE = "http://localhost";

const app = new Elysia().use(GameDomainController);

let createdId = "";

function makePayload(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    name: "http_test_gd_" + Date.now(),
    description: "Created by HTTP integration test",
    is_active: true,
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
  await db.unsafe(`DELETE FROM game_domain WHERE name LIKE 'http_test_gd_%'`);
});

afterAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM game_domain WHERE name LIKE 'http_test_gd_%'`);
});

// ── GET /api/game-domains ──────────────────────────────────────────────────
describe("GET /api/game-domains", () => {
  it("returns 200 with success envelope and array data", async () => {
    const res = await app.handle(new Request(`${BASE}/api/game-domains`));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("does not require Authorization header (public read)", async () => {
    const res = await app.handle(new Request(`${BASE}/api/game-domains`));
    expect(res.status).toBe(200);
  });
});

// ── POST /api/game-domains ─────────────────────────────────────────────────
describe("POST /api/game-domains", () => {
  it("returns 201 with created domain on valid input", async () => {
    const payload = makePayload({ name: "http_test_gd_create_" + Date.now() });
    const res = await app.handle(jsonReq("POST", "/api/game-domains", payload));

    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean; data: { id: string; name: string } };
    expect(body.success).toBe(true);
    expect(typeof body.data.id).toBe("string");
    expect(body.data.name).toBe(payload["name"] as string);
    createdId = body.data.id;
  });

  it("returns 401 when Authorization header is absent", async () => {
    const res = await app.handle(jsonReq("POST", "/api/game-domains", makePayload(), ""));
    expect(res.status).toBe(401);
  });

  it("returns 400 on duplicate name", async () => {
    const name = "http_test_gd_dupe_" + Date.now();
    await app.handle(jsonReq("POST", "/api/game-domains", makePayload({ name })));
    const res = await app.handle(jsonReq("POST", "/api/game-domains", makePayload({ name })));
    expect(res.status).toBe(400);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(false);
  });

  it("rejects body missing required field 'name'", async () => {
    const payload = makePayload();
    delete (payload as Record<string, unknown>)["name"];
    const res = await app.handle(jsonReq("POST", "/api/game-domains", payload));
    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json() as { success?: boolean };
    expect(body.success).not.toBe(true);
  });

  // ── Browser-simulation: reproduces "Request failed (422)" on domain create ──
  // Root cause: FormData hidden+checkbox pattern sends "true"/"false" strings.
  // TypeBox body schema requires boolean — string input fails schema validation.

  it("browser bug — rejects is_active:'true' (FormData string) with 422", async () => {
    const res = await app.handle(
      jsonReq("POST", "/api/game-domains", {
        name: "http_test_gd_bool_" + Date.now(),
        is_active: "true",
      }),
    );
    expect(res.status).toBe(422);
  });

  it("browser bug — rejects is_active:'false' (FormData string) with 422", async () => {
    const res = await app.handle(
      jsonReq("POST", "/api/game-domains", {
        name: "http_test_gd_bool2_" + Date.now(),
        is_active: "false",
      }),
    );
    expect(res.status).toBe(422);
  });
});

// ── GET /api/game-domains/check-name ──────────────────────────────────────
describe("GET /api/game-domains/check-name", () => {
  it("returns available:true for a name not in use", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/game-domains/check-name?name=http_test_gd_unused_${Date.now()}`),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { available: boolean };
    expect(body.available).toBe(true);
  });

  it("returns available:false for an existing name", async () => {
    const listRes = await app.handle(new Request(`${BASE}/api/game-domains`));
    const listBody = await listRes.json() as { data: Array<{ name: string }> };
    const existingName = listBody.data[0]?.name;
    if (!existingName) throw new Error("No seeded domains found");

    const res = await app.handle(
      new Request(`${BASE}/api/game-domains/check-name?name=${encodeURIComponent(existingName)}`),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { available: boolean };
    expect(body.available).toBe(false);
  });
});

// ── GET /api/game-domains/:id ──────────────────────────────────────────────
describe("GET /api/game-domains/:id", () => {
  it("returns 200 with full domain record", async () => {
    if (!createdId) throw new Error("No domain created in prior test");
    const res = await app.handle(new Request(`${BASE}/api/game-domains/${createdId}`));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      data: { id: string; name: string; is_active: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(typeof body.data.name).toBe("string");
    expect(typeof body.data.is_active).toBe("boolean");
  });

  it("returns 404 for unknown id", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/game-domains/00000000-0000-0000-0000-000000000000`),
    );
    expect(res.status).toBe(404);
  });
});

// ── PUT /api/game-domains/:id ──────────────────────────────────────────────
describe("PUT /api/game-domains/:id", () => {
  it("returns 200 and updated domain on valid update", async () => {
    if (!createdId) throw new Error("No domain created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/game-domains/${createdId}`, { name: "http_test_gd_updated_" + Date.now() }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { name: string } };
    expect(body.success).toBe(true);
  });

  it("returns 401 when no token is provided", async () => {
    if (!createdId) throw new Error("No domain created in prior test");
    const res = await app.handle(jsonReq("PUT", `/api/game-domains/${createdId}`, { name: "Valid Name" }, ""));
    expect(res.status).toBe(401);
  });

  // ── Browser-simulation: PUT with is_active as string ──────────────────────
  it("browser bug — rejects is_active:'true' string on PUT with 422", async () => {
    if (!createdId) throw new Error("No domain created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/game-domains/${createdId}`, { is_active: "true" }),
    );
    expect(res.status).toBe(422);
  });
});

// ── DELETE /api/game-domains/:id ───────────────────────────────────────────
describe("DELETE /api/game-domains/:id", () => {
  it("returns 204 and entity no longer exists after delete", async () => {
    const payload = makePayload({ name: "http_test_gd_del_" + Date.now() });
    const createRes = await app.handle(jsonReq("POST", "/api/game-domains", payload));
    const createBody = await createRes.json() as { data: { id: string } };
    const id = createBody.data.id;

    const deleteRes = await app.handle(
      new Request(`${BASE}/api/game-domains/${id}`, {
        method: "DELETE",
        headers: { Authorization: ADMIN_TOKEN },
      }),
    );
    expect(deleteRes.status).toBe(204);

    const findRes = await app.handle(new Request(`${BASE}/api/game-domains/${id}`));
    expect(findRes.status).toBe(404);
  });

  // ── Browser-simulation: reproduces "Authentication required" on delete ─────
  // Root cause: fetchJson never sends Authorization header. Every write operation
  // hits the auth middleware with no token → 401.

  it("browser bug — returns 401 when no Authorization header on DELETE", async () => {
    if (!createdId) throw new Error("No domain created in prior test");
    const res = await app.handle(
      new Request(`${BASE}/api/game-domains/${createdId}`, { method: "DELETE" }),
    );
    expect(res.status).toBe(401);
  });
});
