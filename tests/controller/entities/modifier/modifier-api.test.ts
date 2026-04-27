// tests/controller/entities/item-modifier/item-modifier-api.test.ts
// Integration tests for the Modifier JSON API (GET/POST/PUT/DELETE /api/modifiers).
// Uses Elysia's .handle() method — no server needed, but the live DB is required.
// All test rows use name LIKE 'http_test_mod_%' and code LIKE 'HTTP_MOD_%' for isolation.
//
// Browser simulation tests: reproduce the exact data format the browser sends
// via FormData/fetchJson — boolean fields as "true"/"false" strings, integer fields
// as numeric strings, and no Authorization header. These expose the two root-cause
// bugs in form-submit-handler.ts and fetch-json.ts.

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { ModifierController } from "../../../../src/controller/entities/modifier";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

const ADMIN_TOKEN = "Bearer dev-admin-token";
const BASE = "http://localhost";

const app = new Elysia().use(ModifierController);

let createdId = "";
let gameDomainId = "";
let gameSubdomainId = "";
let gameCategoryId = "";
let gameSubcategoryId = "";
let targetStatId = "";

function makePayload(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    game_domain_id: gameDomainId,
    game_subdomain_id: gameSubdomainId,
    game_category_id: gameCategoryId,
    game_subcategory_id: gameSubcategoryId,
    machine_name: "HTTP_MOD_" + Date.now(),
    name: "http_test_mod_" + Date.now(),
    description: "Created by HTTP integration test",
    affix_type: "prefix",
    target_stat_id: targetStatId,
    combination_type: "flat",
    roll_shape: "scalar",
    value_min: 1,
    value_max: 10,
    modifier_group: "http_test",
    display_template: "Adds {value} test damage",
    is_active: true,
    tiers_json: JSON.stringify([
      { tier_index: 0, min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 },
    ]),
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

  // Resolve hierarchy IDs by joining all levels — avoids picking a domain with no children
  const subcats = await db`
    SELECT gs.id, gs.game_subdomain_id, gs.game_category_id,
           gc.game_domain_id
    FROM game_subcategory gs
    JOIN game_category gc ON gc.id = gs.game_category_id
    LIMIT 1
  `;
  if (!subcats[0]) throw new Error("No seeded game_subcategory rows found — run seeds first");
  gameSubcategoryId = subcats[0].id as string;
  gameSubdomainId = subcats[0].game_subdomain_id as string;
  gameCategoryId = subcats[0].game_category_id as string;
  gameDomainId = subcats[0].game_domain_id as string;

  // Resolve a stat ID for the required target_stat_id FK field
  const stats = await db`SELECT id FROM stat LIMIT 1`;
  if (!stats[0]) throw new Error("No seeded stat rows found — run seeds first");
  targetStatId = stats[0].id as string;

  // Wipe any leftover test rows from prior runs
  await db.unsafe(`DELETE FROM item_modifier WHERE name LIKE 'http_test_mod_%'`);
});

afterAll(async () => {
  const db = getConnection();
  await db.unsafe(`DELETE FROM item_modifier WHERE name LIKE 'http_test_mod_%'`);
});

// ── GET /api/modifiers ─────────────────────────────────────────────────────
describe("GET /api/modifiers", () => {
  it("returns 200 with success envelope and array data", async () => {
    const res = await app.handle(new Request(`${BASE}/api/modifiers`));
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("does not require Authorization header (public read)", async () => {
    const res = await app.handle(new Request(`${BASE}/api/modifiers`));
    expect(res.status).toBe(200);
  });
});

// ── POST /api/modifiers ────────────────────────────────────────────────────
describe("POST /api/modifiers", () => {
  it("returns 201 with created modifier on valid input", async () => {
    const payload = makePayload({
      machine_name: "HTTP_MOD_CREATE_" + Date.now(),
      name: "http_test_mod_create_" + Date.now(),
    });
    const res = await app.handle(jsonReq("POST", "/api/modifiers", payload));

    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean; data: { id: string; name: string } };
    expect(body.success).toBe(true);
    expect(typeof body.data.id).toBe("string");
    expect(body.data.name).toBe(payload["name"] as string);
    createdId = body.data.id;
  });

  it("auto-creates a subcategory binding on creation", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const db = getConnection();
    const rows = await db`
      SELECT target_type, target_id FROM item_modifier_binding
      WHERE modifier_id = ${createdId}
    `;
    expect(rows.length).toBe(1);
    expect(rows[0]!.target_type).toBe("subcategory");
    expect(rows[0]!.target_id).toBe(gameSubcategoryId);
  });

  it("returns 401 when Authorization header is absent", async () => {
    const res = await app.handle(jsonReq("POST", "/api/modifiers", makePayload(), ""));
    expect(res.status).toBe(401);
  });

  it("rejects body missing required field 'name'", async () => {
    const payload = makePayload();
    delete (payload as Record<string, unknown>)["name"];
    const res = await app.handle(jsonReq("POST", "/api/modifiers", payload));
    expect(res.status).toBeGreaterThanOrEqual(400);
    const body = await res.json() as { success?: boolean };
    expect(body.success).not.toBe(true);
  });

  // ── Browser-simulation: reproduces "Request failed (422)" on modifier create ──
  // Root cause 1: FormData sends is_active as "true"/"false" string — TypeBox rejects.
  // Root cause 2: FormData sends value_min/value_max as numeric strings — TypeBox rejects.

  it("browser bug — rejects is_active:'true' (FormData boolean bug) with 422", async () => {
    const res = await app.handle(
      jsonReq("POST", "/api/modifiers", {
        ...makePayload({ machine_name: "HTTP_MOD_BOOL_" + Date.now(), name: "http_test_mod_bool_" + Date.now() }),
        is_active: "true",
      }),
    );
    expect(res.status).toBe(422);
  });

  it("browser bug — rejects value_min as string '1' (FormData integer bug) with 422", async () => {
    const res = await app.handle(
      jsonReq("POST", "/api/modifiers", {
        ...makePayload({ machine_name: "HTTP_MOD_INT_" + Date.now(), name: "http_test_mod_int_" + Date.now() }),
        value_min: "1",
        value_max: "10",
      }),
    );
    expect(res.status).toBe(422);
  });
});

// ── GET /api/modifiers/:id ─────────────────────────────────────────────────
describe("GET /api/modifiers/:id", () => {
  it("returns 200 with full modifier record", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const res = await app.handle(new Request(`${BASE}/api/modifiers/${createdId}`));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      success: boolean;
      data: { id: string; name: string; is_active: boolean; value_min: number | null };
    };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdId);
    expect(typeof body.data.name).toBe("string");
    expect(typeof body.data.is_active).toBe("boolean");
  });

  it("returns 404 for unknown id", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/modifiers/00000000-0000-0000-0000-000000000000`),
    );
    expect(res.status).toBe(404);
  });
});

// ── PUT /api/modifiers/:id ─────────────────────────────────────────────────
describe("PUT /api/modifiers/:id", () => {
  it("returns 200 and updated modifier on valid update", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const tiersJson = JSON.stringify([
      { tier_index: 0, min_value: 2, max_value: 8, level_req: 1, spawn_weight: 100 },
    ]);
    const res = await app.handle(
      jsonReq("PUT", `/api/modifiers/${createdId}`, {
        name: "http_test_mod_updated_" + Date.now(),
        tiers_json: tiersJson,
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; data: { name: string } };
    expect(body.success).toBe(true);
  });

  it("returns 401 when no token is provided", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/modifiers/${createdId}`, { name: "Valid Name" }, ""),
    );
    expect(res.status).toBe(401);
  });

  // ── Browser-simulation: PUT with integer fields as strings ─────────────────
  // Root cause: form-submit-handler.ts collects FormData values as strings.
  // Number inputs (value_min/value_max) arrive as "1", "10" — TypeBox rejects.

  it("browser bug — rejects value_min/value_max as strings on PUT with 422", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/modifiers/${createdId}`, { value_min: "5", value_max: "50" }),
    );
    expect(res.status).toBe(422);
  });

  it("browser bug — rejects is_active:'false' string on PUT with 422", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const res = await app.handle(
      jsonReq("PUT", `/api/modifiers/${createdId}`, { is_active: "false" }),
    );
    expect(res.status).toBe(422);
  });
});

// ── DELETE /api/modifiers/:id ──────────────────────────────────────────────
describe("DELETE /api/modifiers/:id", () => {
  it("returns 204 and modifier no longer exists after delete", async () => {
    const payload = makePayload({
      machine_name: "HTTP_MOD_DEL_" + Date.now(),
      name: "http_test_mod_del_" + Date.now(),
    });
    const createRes = await app.handle(jsonReq("POST", "/api/modifiers", payload));
    const createBody = await createRes.json() as { data: { id: string } };
    const id = createBody.data.id;

    const deleteRes = await app.handle(
      new Request(`${BASE}/api/modifiers/${id}`, {
        method: "DELETE",
        headers: { Authorization: ADMIN_TOKEN },
      }),
    );
    expect(deleteRes.status).toBe(204);

    const findRes = await app.handle(new Request(`${BASE}/api/modifiers/${id}`));
    expect(findRes.status).toBe(404);
  });

  // ── Browser-simulation: reproduces "Authentication required" on modifier delete ──
  // Root cause: fetchJson never sends Authorization header.
  // Every DELETE/POST/PUT from the browser arrives without a Bearer token → 401.

  it("browser bug — returns 401 when no Authorization header on DELETE", async () => {
    if (!createdId) throw new Error("No modifier created in prior test");
    const res = await app.handle(
      new Request(`${BASE}/api/modifiers/${createdId}`, { method: "DELETE" }),
    );
    expect(res.status).toBe(401);
  });
});
