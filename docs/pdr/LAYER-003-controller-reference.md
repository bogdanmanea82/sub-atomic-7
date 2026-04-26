# LAYER-003: Controller Reference

**Status:** Active  
**Last updated:** 2026-04-26

---

## Layer 3 at a Glance

Layer 3 owns HTTP — request parsing, schema validation, permission checking, and response
formatting. It is the only layer allowed to reference ElysiaJS types and decorators. It reads
Layer 0 configuration to derive TypeBox schemas and permission rules. It delegates all business
logic to Layer 2 services.

**L3 imports from:** L0 (EntityConfig, FieldConfig, PermissionConfig), L2 (entity services),
L4 (view services, for HTML pages only), L5 (view organisms, for HTML pages only).  
**Nothing imports from L3** — it is the outermost server layer.

**The dual-track rule:** Every entity has two Elysia instances — `*-controller.ts` (JSON API)
and `*-pages.ts` (HTML pages). They are merged into one exported Controller at the entity
`index.ts`. This split is what prevents large files.

---

## Directory Map

```
src/controller/
├── sub-atoms/
│   ├── options/
│   │   ├── build-cascading-options.ts  — fetch 4-level hierarchy options in parallel
│   │   ├── build-reference-lookup.ts   — build UUID→displayName lookup map
│   │   ├── fetch-options.ts            — fetch entity list and map to SelectOption[]
│   │   └── index.ts
│   ├── request/
│   │   ├── extract-pagination.ts       — parse page/pageSize query params with safe defaults
│   │   ├── extract-params.ts           — extract :id path param (throws if missing)
│   │   ├── extract-query.ts            — convert query string to conditions Record or undefined
│   │   ├── parse-body.ts               — assert body is plain JSON object (not array/null)
│   │   └── index.ts
│   ├── response/
│   │   ├── format-error.ts             — { success: false, error, details? } envelope
│   │   ├── format-paginated.ts         — { success: true, data[], count, totalCount... }
│   │   ├── format-success.ts           — { success: true, data } envelope
│   │   ├── set-html-content-type.ts    — set text/html; charset=utf-8 on response headers
│   │   └── index.ts
│   ├── schema/
│   │   ├── derive-body-schema.ts       — convert L0 FieldConfig[] → TypeBox t.Object schema
│   │   ├── pagination-query-schema.ts  — t.Object({ page, pageSize }) with t.Numeric()
│   │   └── index.ts
│   ├── types/
│   │   ├── entity-service.ts           — EntityService<T> interface + 5 result discriminated unions
│   │   └── index.ts
│   └── index.ts
├── atoms/
│   ├── handlers/
│   │   ├── create-handler.ts           — makeCreateHandler: POST → 201/400/500
│   │   ├── delete-handler.ts           — makeDeleteHandler: DELETE → 204/404/500
│   │   ├── get-all-handler.ts          — makeGetAllHandler: GET / → 200/500
│   │   ├── get-by-id-handler.ts        — makeGetByIdHandler: GET /:id → 200/404/500
│   │   ├── update-handler.ts           — makeUpdateHandler: PUT → 200/400/404/500
│   │   └── index.ts
│   ├── middleware/
│   │   ├── authenticate.ts             — authenticatePlugin: derives user from Bearer token
│   │   ├── authorize.ts                — makeAuthorizeMiddleware: checks PermissionConfig
│   │   ├── error-handler.ts            — errorHandlerPlugin: 404/400/500 for unhandled throws
│   │   ├── validate-request.ts         — validateRequestPlugin: 415 on non-JSON POST/PUT
│   │   └── index.ts
│   └── index.ts
├── molecules/
│   ├── crud-routes.ts                  — createCrudRoutes factory: wires all 5 CRUD routes
│   └── index.ts
└── entities/
    ├── game-domain/
    │   ├── game-domain-controller.ts   — JSON API: CRUD + check-name + check-machine-name
    │   ├── game-domain-pages.ts        — HTML pages: list/create/detail/edit/duplicate
    │   └── index.ts
    ├── game-subdomain/
    │   ├── game-subdomain-controller.ts
    │   ├── game-subdomain-pages.ts     — cascading domain dropdown filter
    │   └── index.ts
    ├── game-category/
    │   ├── game-category-controller.ts
    │   ├── game-category-pages.ts      — cascading domain→subdomain dropdowns
    │   └── index.ts
    ├── game-subcategory/
    │   ├── game-subcategory-controller.ts
    │   ├── game-subcategory-pages.ts   — cascading domain→subdomain→category dropdowns
    │   └── index.ts
    ├── stat/
    │   ├── stat-controller.ts          — JSON API: CRUD + check-name + check-machine-name
    │   ├── stat-pages.ts               — HTML pages: no hierarchy filters
    │   └── index.ts
    ├── item-modifier/
    │   ├── item-modifier-controller.ts — JSON API: CRUD + check-name + nested tier/binding APIs
    │   ├── item-modifier-pages.ts      — HTML pages: 4-level cascade + tier rows + assignments
    │   ├── item-modifier-binding-api.ts — nested CRUD: /api/modifiers/:id/bindings
    │   ├── item-modifier-tier-api.ts   — nested CRUD: /api/modifiers/:id/tiers/:index
    │   └── index.ts
    └── index.ts
```

`src/index.ts` — app entry point: mounts all controllers + OpenAPI + static + home + health.

---

## Sub-Atoms: Request (`src/controller/sub-atoms/request/`)

One concern per file. Together they cover all inputs a route handler needs.

### `extract-pagination.ts`

```typescript
export function extractPagination(query: Record<string, string>): {
  page: number;
  pageSize: number;
}
```

Safe defaults: `page = 1`, `pageSize = DEFAULT_PAGE_SIZE`. Caps `pageSize` at 100. Converts
string query params to numbers. Never throws.

### `extract-params.ts`

```typescript
export function extractId(params: Record<string, string>): string
```

Extracts `:id` param. Throws if missing — handler does not need to guard against undefined.

### `extract-query.ts`

```typescript
export function extractQueryConditions(
  query: Record<string, string>,
): Record<string, unknown> | undefined
```

Returns `undefined` if query is empty (signals "fetch all"). Otherwise returns the conditions
object for `service.findMany(conditions)`.

### `parse-body.ts`

```typescript
export function parseBody(body: unknown): Record<string, unknown>
```

Asserts body is a plain object. Throws on `null`, arrays, and primitives. Used by create/update
handlers before delegating to the service layer.

---

## Sub-Atoms: Response (`src/controller/sub-atoms/response/`)

All JSON endpoints return one of three envelope shapes.

### `format-success.ts`

```typescript
export type SuccessResponse<T> = { readonly success: true; readonly data: T }
export function formatSuccess<T>(data: T): SuccessResponse<T>
```

### `format-error.ts`

```typescript
export type ErrorResponse = {
  readonly success: false;
  readonly error: string;
  readonly details?: Record<string, string>;
}
export function formatError(error: string, details?: Record<string, string>): ErrorResponse
```

`details` is used for validation errors: `{ fieldName: "error message" }`.

### `format-paginated.ts`

```typescript
export type PaginatedResponse<T> = {
  readonly success: true;
  readonly data: T[];
  readonly count: number;
  readonly totalCount?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly totalPages?: number;
}
export function formatPaginated<T>(
  data: T[],
  totalCount?: number,
  page?: number,
  pageSize?: number,
): PaginatedResponse<T>
```

### `set-html-content-type.ts`

```typescript
export function setHtml(headers: Record<string, string>): void
```

Sets `content-type: text/html; charset=utf-8`. Called at the top of every HTML page handler.

---

## Sub-Atoms: Schema (`src/controller/sub-atoms/schema/`)

### `derive-body-schema.ts` — L0 → TypeBox pipeline

```typescript
export function deriveBodySchema(
  fields: readonly FieldConfig[],
  mode: "create" | "update" = "create",
  passthroughKeys: readonly string[] = [],
  alwaysOptionalKeys: readonly string[] = [],
): ReturnType<typeof t.Object>
```

This is where L0 configuration directly drives HTTP validation. The function reads
`FieldConfig[]` from L0 and produces a TypeBox schema that Elysia uses for:
- Request body validation (returns 422 on failure — Elysia built-in)
- OpenAPI schema generation (auto-documented)

**Auto-managed fields skipped:**
- `uuid` where `autoGenerate: true` — server generates the ID
- `timestamp` where `autoSet !== "none"` — server manages created_at / updated_at

**`mode` parameter:**
- `"create"` — respects each field's `required` flag
- `"update"` — wraps every field in `t.Optional()` (partial update semantics)

**`passthroughKeys`** — virtual form fields not stored as DB columns (e.g., `tiers_json`,
`status_action`, `status_reason`). Listed as `t.Optional(t.String())` so Elysia does not
strip them from the body, but they bypass L0 field type logic.

**`alwaysOptionalKeys`** — real columns whose value is always derived from another input
(e.g., `is_active` is derived from `status_action` in the service). Wrapped in `t.Optional()`
even in create mode.

**`buildBaseType` mapping (internal helper):**

| FieldConfig `type` | TypeBox output |
|---|---|
| `"string"` | `t.String({ minLength, maxLength })` |
| `"integer"` | `t.Number({ minimum, maximum })` |
| `"decimal"` | `t.Number({ minimum?, maximum? })` |
| `"boolean"` | `t.Boolean()` |
| `"reference"` | `t.String()` (UUID as string) |
| `"enum"` | `t.Union([t.Literal(v), ...])` for each value in `values[]` |
| `"uuid"` | `t.String()` |
| `"timestamp"` | `t.String()` |

### `pagination-query-schema.ts`

```typescript
export const paginationQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})
```

`t.Numeric()` is Elysia-specific — it coerces query string values to numbers automatically.
Without it, `?page=2` would arrive as the string `"2"` and fail a `t.Number()` check. Always
use `t.Numeric()` for query params; reserve `t.Number()` for JSON body fields.

---

## Sub-Atoms: Types (`src/controller/sub-atoms/types/`)

### `entity-service.ts` — structural contract between L3 and L2

```typescript
export interface EntityService<TEntity> {
  create(input: Record<string, unknown>): Promise<ServiceCreateResult<TEntity>>;
  findById(id: string): Promise<ServiceSelectResult<TEntity>>;
  findMany(conditions?: Record<string, unknown>): Promise<ServiceSelectManyResult<TEntity>>;
  update(id: string, data: Record<string, unknown>): Promise<ServiceUpdateResult<TEntity>>;
  delete(id: string): Promise<ServiceDeleteResult>;
}
```

TypeScript uses structural typing — no `implements` declaration needed. Any L2 service
that satisfies this shape works with `createCrudRoutes` and all handler factories.

**Result type discriminated unions:**

| Type | Variants |
|---|---|
| `ServiceCreateResult<T>` | `{ success: true, data: T }` \| `{ success: false, stage: "validation", errors }` \| `{ success: false, stage: "database", error }` |
| `ServiceSelectResult<T>` | `{ success: true, data: T }` \| `{ success: false, stage: "not_found", error }` \| `{ success: false, stage: "database", error }` |
| `ServiceSelectManyResult<T>` | `{ success: true, data: T[] }` \| `{ success: false, stage: "database", error }` |
| `ServiceUpdateResult<T>` | `{ success: true, data: T }` \| `{ success: false, stage: "validation", errors }` \| `{ success: false, stage: "not_found", error }` \| `{ success: false, stage: "database", error }` |
| `ServiceDeleteResult` | `{ success: true }` \| `{ success: false, stage: "not_found", error }` \| `{ success: false, stage: "database", error }` |

The `stage` discriminant tells handler factories exactly which HTTP status code to set — no
conditional logic needs to know about database internals.

---

## Sub-Atoms: Options (`src/controller/sub-atoms/options/`)

### `fetch-options.ts`

```typescript
export async function fetchOptions(
  service: OptionService,
  conditions?: Record<string, unknown>,
): Promise<readonly SelectOption[]>
```

Calls `service.findMany(conditions)`, maps results to `{ label: entity.name, value: entity.id }`.
Returns `[]` on failure — pages degrade gracefully to empty dropdowns rather than crashing.

### `build-reference-lookup.ts`

```typescript
export function buildReferenceLookup(
  entries: ReadonlyArray<{ fieldName: string; options: readonly SelectOption[] }>,
): ReferenceLookup
```

Builds `{ fieldName: { uuid: "Display Name", ... } }`. Detail pages pass this to the View
Service so UUID foreign keys render as human-readable names instead of raw IDs.

### `build-cascading-options.ts`

```typescript
export async function buildCascadingOptions(filters: {
  readonly domainId?: string;
  readonly subdomainId?: string;
  readonly categoryId?: string;
}): Promise<{
  readonly domainOptions: readonly SelectOption[];
  readonly subdomainOptions: readonly SelectOption[];
  readonly categoryOptions: readonly SelectOption[];
  readonly subcategoryOptions: readonly SelectOption[];
}>
```

Fetches only the levels needed: domains always fetch; subdomains only when `domainId` present;
categories only when `subdomainId` present; subcategories only when `categoryId` present.
Parallel fetches via `Promise.all`. Returns empty arrays for unfetched levels.

---

## Atoms: Handler Factories (`src/controller/atoms/handlers/`)

Each factory returns a bound async handler. The handler: extracts input, delegates to service,
maps the result discriminant to HTTP status + response envelope. No business logic here.

### Handler Status Code Summary

| Handler | Trigger | Status |
|---|---|---|
| `makeCreateHandler` | success | 201 Created |
| | validation error | 400 Bad Request |
| | database error | 500 Internal Server Error |
| `makeGetByIdHandler` | success | 200 OK |
| | not found | 404 Not Found |
| | database error | 500 Internal Server Error |
| `makeGetAllHandler` | success | 200 OK |
| | database error | 500 Internal Server Error |
| `makeUpdateHandler` | success | 200 OK |
| | validation error | 400 Bad Request |
| | not found | 404 Not Found |
| | database error | 500 Internal Server Error |
| `makeDeleteHandler` | success | 204 No Content |
| | not found | 404 Not Found |
| | database error | 500 Internal Server Error |

### Handler Signatures

```typescript
// All factories share this shape:
makeXxxHandler<TEntity>(service: EntityService<TEntity>)
  => (context: { params?, body?, query?, set: { status? } }) => Promise<Response>
```

The generic `TEntity` flows through `EntityService<TEntity>` → `ServiceXxxResult<TEntity>`
→ `formatSuccess(result.data)`. TypeScript inference keeps the chain typed end-to-end without
explicit type annotations in entity controller files.

---

## Atoms: Middleware Plugins (`src/controller/atoms/middleware/`)

All middleware are Elysia plugin instances or factories. They are composed with `.use()` inside
each controller. Scope is `"scoped"` — middleware applies to the current Elysia instance and
its children, not the entire app.

### `authenticate.ts` — `authenticatePlugin`

```typescript
export const authenticatePlugin = new Elysia().derive(
  { as: "scoped" },
  ({ request }) => ({
    user: resolveUser(request.headers.get("authorization")),
  }),
)
```

Derives `user: AuthUser | null` into the handler context. `resolveUser` reads
`Authorization: Bearer <token>`. Dev tokens hardcoded (`dev-admin-token` → admin role,
`dev-user-token` → authenticated role). Returns `null` for missing/invalid tokens.

```typescript
export interface AuthUser {
  readonly id: string;
  readonly role: "authenticated" | "admin";
}
```

### `authorize.ts` — `makeAuthorizeMiddleware(permissions)`

```typescript
export function makeAuthorizeMiddleware(permissions: PermissionConfig) {
  return new Elysia().onBeforeHandle({ as: "scoped" }, ({ request, set, ...rest }) => {
    const user = rest["user"] as AuthUser | null | undefined
    const operation = methodToOperation(request.method)   // POST→create, PUT→update, DELETE→delete, *→read
    const required = permissions[operation]               // from L0 EntityConfig.permissions

    if (!hasPermission(user ?? null, required)) {
      if (!user) { set.status = 401; return formatError("Authentication required") }
      set.status = 403; return formatError("Insufficient permissions")
    }
  })
}
```

Reads `PermissionConfig` directly from L0 `EntityConfig.permissions`. HTTP method maps to
CRUD operation. Permission hierarchy: `public` < `authenticated` < `admin`.

| HTTP Method | CRUD Operation |
|---|---|
| `POST` | `create` |
| `PUT` | `update` |
| `DELETE` | `delete` |
| Everything else | `read` |

### `error-handler.ts` — `errorHandlerPlugin`

Handles: `NotFoundError` → 404, `ParseError` → 400, uncaught throws → 500.
Scoped so Elysia's built-in TypeBox 422 validation errors are not intercepted — they bubble
up to the framework's default handler and return properly formatted validation responses.

### `validate-request.ts` — `validateRequestPlugin`

Rejects POST/PUT without `Content-Type: application/json` header with 415. Runs before
the body is parsed, so malformed requests are rejected early.

---

## Molecules: CRUD Routes Factory (`src/controller/molecules/crud-routes.ts`)

```typescript
interface CrudRouteOptions {
  createSchema?: ReturnType<typeof t.Object>
  updateSchema?: ReturnType<typeof t.Object>
  querySchema?: ReturnType<typeof t.Object>
  tags?: string[]
}

export function createCrudRoutes<TEntity>(
  prefix: string,
  service: EntityService<TEntity>,
  options?: CrudRouteOptions,
): Elysia
```

Registers 5 routes on a new Elysia instance with `{ prefix }`:

| Route | Handler |
|---|---|
| `GET /` | `makeGetAllHandler(service)` |
| `GET /:id` | `makeGetByIdHandler(service)` |
| `POST /` | `makeCreateHandler(service)` |
| `PUT /:id` | `makeUpdateHandler(service)` |
| `DELETE /:id` | `makeDeleteHandler(service)` |

Schemas passed via `options` are attached to route metadata for:
- Elysia TypeBox validation (enforced at runtime)
- OpenAPI schema generation (for `/swagger` docs)

Returns a ready-to-mount Elysia instance. Callers mount with `.use(createCrudRoutes(...))`.

**Wiring an entity to CRUD takes 3 lines:**
```typescript
.use(createCrudRoutes("/api/game-domains", GameDomainService, {
  createSchema: bodySchema,
  updateSchema: deriveBodySchema(GAME_DOMAIN_CONFIG.fields, "update", passthroughKeys),
  querySchema: paginationQuerySchema,
}))
```

---

## Organisms: Entity Controller Pattern

Every entity follows an identical file structure. The pattern is:

```
entities/{entity-name}/
├── {entity-name}-controller.ts   ← JSON API (middleware + CRUD routes + check endpoints)
├── {entity-name}-pages.ts        ← HTML pages (list/create/detail/edit/duplicate)
└── index.ts                      ← exports combined Controller
```

### Controller File Template (`*-controller.ts`)

```typescript
const TAGS = ["Entity Name"]
const passthroughKeys = ENTITY_CONFIG.nonColumnKeys ?? []
const alwaysOptionalKeys = ["is_active"]
const bodySchema = deriveBodySchema(ENTITY_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys)

const EntityApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(ENTITY_CONFIG.permissions))  // reads L0 permissions
  .use(validateRequestPlugin)
  // ── Entity-specific check endpoints (before CRUD routes) ──
  .get("/api/entities/check-name", async ({ query }) => {
    const q = query as Record<string, string>
    return EntityService.checkNameAvailable(q["name"] ?? "", q["excludeId"] || undefined)
  }, {
    query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .get("/api/entities/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>
    return EntityService.checkMachineNameAvailable(q["machineName"] ?? "", q["excludeId"] || undefined)
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  // ── Standard CRUD (5 routes from factory) ──
  .use(createCrudRoutes("/api/entities", EntityService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(ENTITY_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }))

export const EntityController = new Elysia()
  .use(EntityApi)
  .use(EntityPages)
```

**Why check endpoints appear before `createCrudRoutes`:** Elysia matches routes in
declaration order. `/check-name` must be declared before `/:id` or Elysia treats `check-name`
as an ID parameter.

### Pages File Template (`*-pages.ts`)

```typescript
const BASE_PATH = "/entities"
const FIELD_CONFIG_JSON = EntityViewService.prepareBrowserFieldConfig()

export const EntityPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // GET /entities — list
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers)
    const pagination = extractPagination(query as Record<string, string>)
    const result = await EntityService.findManyPaginated(pagination)
    if (!result.success) return `<p>Error loading records.</p>`
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize)
    const view = EntityViewService.prepareListView(result.data, undefined, paginationMeta)
    return listPage(view, BASE_PATH)
  })

  // GET /entities/new — create form (must be before /:id)
  .get(`${BASE_PATH}/new`, ({ set }) => {
    setHtml(set.headers)
    const view = EntityViewService.prepareCreateForm()
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON)
  })

  // GET /entities/:id — detail
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => { ... })

  // GET /entities/:id/edit — edit form
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => { ... })

  // GET /entities/:id/duplicate — duplicate form
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => { ... })

  // POST /entities — create action
  .post(BASE_PATH, async ({ body, set, redirect }) => {
    const result = await EntityService.create(body as Record<string, unknown>)
    if (result.success) return redirect(`${BASE_PATH}/${result.data.id}`)
    setHtml(set.headers)
    set.status = 422
    const errors = result.stage === "validation" ? result.errors : undefined
    const view = EntityViewService.prepareCreateForm(body as Record<string, unknown>, errors)
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON)
  })

  // POST /entities/:id — update action
  .post(`${BASE_PATH}/:id`, async ({ params, body, set, redirect }) => {
    const result = await EntityService.update(params["id"], body as Record<string, unknown>)
    if (result.success) return redirect(`${BASE_PATH}/${params["id"]}`)
    setHtml(set.headers)
    set.status = 422
    // ... re-render with errors
  })

  // POST /entities/:id/delete — delete action
  .post(`${BASE_PATH}/:id/delete`, async ({ params, redirect }) => {
    await EntityService.delete(params["id"])
    return redirect(BASE_PATH)
  })
```

**HTML page routes use POST for mutations** (not PUT/DELETE) because HTML forms only support
GET and POST. API routes use the full HTTP verb set.

**Validation failure response:** status 422 + re-render the form with submitted values and
error messages. The browser stays on the form page rather than losing entered data.

### Index Export Template (`index.ts`)

```typescript
export { EntityController } from "./entity-controller"
```

---

## Entity-Specific Patterns

### Simple Entities (GameDomain, Stat)

No hierarchy, no cascading. Controller: 2 check endpoints + `createCrudRoutes`. Pages:
list with pagination + full CRUD page set.

### Hierarchical Entities (GameSubdomain, GameCategory, GameSubcategory)

Adds to the simple pattern:

1. **List filter:** Extract FK filter param from query; pass conditions to `findManyPaginated`
2. **Form options:** Call `buildCascadingOptions({ domainId?, subdomainId? })` before rendering forms
3. **Validation failure re-render:** Re-fetch cascade options using submitted parent IDs
4. **Reference lookup:** Build UUID→name lookup for detail pages

**Cascade call examples:**

```typescript
// GameSubdomain list — domain filter only
const { domainOptions } = await buildCascadingOptions({})

// GameCategory form — domain + subdomain options
const { domainOptions, subdomainOptions } = await buildCascadingOptions({ domainId })

// GameSubcategory form — full cascade
const { domainOptions, subdomainOptions, categoryOptions } =
  await buildCascadingOptions({ domainId, subdomainId })
```

### Complex Entity (ItemModifier)

Extends hierarchical pattern with:

1. **Scoped uniqueness checks:** `checkFieldAvailable(fieldName, value, scope, excludeId)` — name/machine_name unique within subcategory scope
2. **Nested tier API:** `ItemModifierTierApi` (add/update/delete by index)
3. **Nested binding API:** `ItemModifierBindingApi` (full CRUD)
4. **Assignments panel:** Detail/edit pages fetch bindings + all categories/subcategories for read-only computed view
5. **Tier form state:** On validation failure, parse `tiers_json` from submitted body to restore tier rows

**Controller composition (ItemModifier):**
```typescript
const ModifierApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(ITEM_MODIFIER_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/modifiers/check-name", ...)
  .get("/api/modifiers/check-machine-name", ...)
  .use(createCrudRoutes("/api/modifiers", ItemModifierService, { ... }))
  .use(ItemModifierBindingApi)   // nested binding CRUD
  .use(ItemModifierTierApi)      // nested tier CRUD

export const ItemModifierController = new Elysia()
  .use(ModifierApi)
  .use(ItemModifierPages)
```

### Nested APIs (Tiers and Bindings)

Each nested API is its own file — not embedded in the parent controller.

**`item-modifier-binding-api.ts`** routes:

| Route | Method | Status | Notes |
|---|---|---|---|
| `/api/modifiers/:id/bindings` | GET | 200 | list all bindings |
| `/api/modifiers/:id/bindings` | POST | 201/400/500 | create binding |
| `/api/modifiers/:id/bindings/:bindingId` | PUT | 200/400/404/500 | update binding |
| `/api/modifiers/:id/bindings/:bindingId` | DELETE | 204/404/500 | remove binding |

**`item-modifier-tier-api.ts`** routes:

| Route | Method | Status | Notes |
|---|---|---|---|
| `/api/modifiers/:id/tiers` | POST | 200/404/422 | add tier; returns updated tier set |
| `/api/modifiers/:id/tiers/:tierIndex` | PUT | 200/404/422 | update tier by index |
| `/api/modifiers/:id/tiers/:tierIndex` | DELETE | 200/404/422 | delete tier by index |

Tier mutations return the full updated tier set (not just the changed tier) — the browser
replaces the entire tier table after each operation.

---

## App Entry Point (`src/index.ts`)

```typescript
const app = new Elysia()
  .use(openapi({ documentation: { info, tags } }))
  .use(GameDomainController)
  .use(GameSubdomainController)
  .use(GameCategoryController)
  .use(GameSubcategoryController)
  .use(StatController)
  .use(ItemModifierController)
  .get("/public/main.js", () => Bun.file("public/main.js"))
  .get("/", async ({ set }) => { ... })   // home page with live counts
  .get("/health", () => ({ status: "healthy", timestamp: ... }))
  .listen(process.env["PORT"] ?? 3000)
```

Each controller brings all its own middleware. There is no global middleware in `index.ts` —
middleware is scoped to each controller, so entities can have independent permission rules.

---

## HTTP Status Code Reference

| Code | Source | When |
|---|---|---|
| 200 | GET, PUT handlers | Success |
| 201 | POST handler | Create success |
| 204 | DELETE handler | Delete success (no body) |
| 400 | create/update handlers | Service returned `stage: "validation"` |
| 401 | authorize middleware | No Bearer token, required level is authenticated/admin |
| 403 | authorize middleware | Token present but role insufficient |
| 404 | get-by-id, update, delete handlers | Service returned `stage: "not_found"` |
| 415 | validate-request middleware | POST/PUT without `Content-Type: application/json` |
| 422 | Elysia (TypeBox) / HTML pages | TypeBox schema validation failed / HTML form validation failed |
| 500 | All handlers | Service returned `stage: "database"` |

**422 duality:** For JSON routes, 422 is Elysia's built-in response when TypeBox validation
fails (schema mismatch). For HTML page routes, 422 is returned by the Pages handler after
a service validation error — the form re-renders with error messages.

---

## Cross-Layer Dependency Map

```
L0 Configuration
  ENTITY_CONFIG.fields[]        → deriveBodySchema()    → TypeBox body schema (validation + OpenAPI)
  ENTITY_CONFIG.permissions     → makeAuthorizeMiddleware() → 401/403 enforcement
  ENTITY_CONFIG.nonColumnKeys   → passthroughKeys param → preserved through Value.Clean()

L2 Model Service
  EntityService<T> interface    → handler factories receive service, not entity type
  ServiceXxxResult<T> unions    → stage discriminant → exact HTTP status code selection

L4 View Service (Pages files only)
  prepareListView()             → view model for list page rendering
  prepareCreateForm()           → view model for create form
  prepareEditForm()             → view model for edit form + existing values
  prepareDuplicateForm()        → view model for duplicate form
  prepareDetailView()           → view model for detail page
  prepareBrowserFieldConfig()   → JSON embedded in HTML for L6 browser validation

L5 View (Pages files only)
  listPage(), createPage(), detailPage(), editPage(), duplicatePage()
  → rendered HTML strings returned as HTTP response bodies
```

**The split that enforces layer separation:**
- `*-controller.ts` imports L0 and L2 only
- `*-pages.ts` imports L0, L2, L4, and L5

---

## Workflows

### Workflow A: Adding a New Entity Controller (Standard)

**Preconditions:** L0 config, L1 model, L2 service, L4 view service, L5 view organisms all complete.

**1. Create the controller file** (`{entity-name}-controller.ts`)

```typescript
import { ENTITY_CONFIG } from "@config/entities/entity-name"
import { EntityService } from "@model-service/entities/entity-name"
import { deriveBodySchema, paginationQuerySchema } from "@controller/sub-atoms/schema"
import { errorHandlerPlugin, authenticatePlugin, makeAuthorizeMiddleware, validateRequestPlugin }
  from "@controller/atoms/middleware"
import { createCrudRoutes } from "@controller/molecules"
import { t } from "elysia"

const TAGS = ["Entity Name"]
const passthroughKeys = ENTITY_CONFIG.nonColumnKeys ?? []
const alwaysOptionalKeys = ["is_active"]
const bodySchema = deriveBodySchema(ENTITY_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys)

const EntityApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(ENTITY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/entities/check-name", async ({ query }) => {
    const q = query as Record<string, string>
    return EntityService.checkNameAvailable(q["name"] ?? "", q["excludeId"] || undefined)
  }, { query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }), detail: { tags: TAGS } })
  .get("/api/entities/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>
    return EntityService.checkMachineNameAvailable(q["machineName"] ?? "", q["excludeId"] || undefined)
  }, { query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }), detail: { tags: TAGS } })
  .use(createCrudRoutes("/api/entities", EntityService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(ENTITY_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }))
```

**2. Create the pages file** (`{entity-name}-pages.ts`) — follow the pages template above.

**3. Create `index.ts`:**
```typescript
import { EntityApi } from "./entity-name-controller"
import { EntityPages } from "./entity-name-pages"
import { Elysia } from "elysia"

export const EntityController = new Elysia().use(EntityApi).use(EntityPages)
```

**4. Add to entity barrel** (`src/controller/entities/index.ts`):
```typescript
export { EntityController } from "./entity-name"
```

**5. Mount in `src/index.ts`:**
```typescript
.use(EntityController)
```

**6. Run typecheck:**
```bash
bun run typecheck
```

**7. Start server and verify routes registered:**
```bash
bun run dev
curl http://localhost:3000/api/entities         # → { success: true, data: [], count: 0 }
curl http://localhost:3000/entities              # → HTML list page
```

---

### Workflow B: Adding a Hierarchical Entity (With Cascade)

Same as Workflow A, plus:

1. Import `buildCascadingOptions` from `@controller/sub-atoms/options`
2. In the list handler: extract filter params from query; pass conditions to `findManyPaginated`
3. In form GET handlers: call `buildCascadingOptions({ domainId?, subdomainId? })`; pass options to View Service
4. In form POST handlers (on validation failure): re-call `buildCascadingOptions` with user-submitted parent IDs

Refer to `game-category-pages.ts` as the reference implementation for 2-level cascading, or
`game-subcategory-pages.ts` for 3-level.

---

### Workflow C: Adding a Custom API Endpoint

For non-CRUD endpoints (e.g., `check-name`, bulk operations, computed results):

1. Declare the route on `EntityApi` before the `createCrudRoutes` call
2. Use the appropriate sub-atoms: `extractId`, `parseBody`, `formatSuccess`, `formatError`
3. Add `query` or `body` TypeBox schema to the route definition for validation + OpenAPI docs
4. Add `detail: { tags: TAGS }` to include it in the OpenAPI tag group

```typescript
.get("/api/entities/my-custom-endpoint", async ({ query }) => {
  const q = query as Record<string, string>
  const result = await EntityService.customOperation(q["param"] ?? "")
  if (!result.success) return formatError(result.error)
  return formatSuccess(result.data)
}, {
  query: t.Object({ param: t.String() }),
  detail: { tags: TAGS },
})
```

---

### Workflow D: Adding a Nested Sub-Resource API

When an entity has child resources managed via JSON API (like bindings or tiers):

1. Create `{parent}-{child}-api.ts` in the parent entity's controller directory
2. Build `new Elysia()` with nested routes (`/api/{parent}/:id/{child}`)
3. Use handler patterns from `item-modifier-binding-api.ts` as reference
4. Import and mount with `.use({ChildApi})` inside the parent's `EntityApi`

No changes needed to `createCrudRoutes` — nested APIs are independent Elysia instances.

---

### Workflow E: Debugging Route Not Found (404)

```
SYMPTOM: GET /api/entities/check-name returns 404 or matches wrong route
→ Is check-name declared before .use(createCrudRoutes(...))?
  If after, Elysia tries to match "check-name" as /:id
→ Check src/controller/entities/{entity}/entity-controller.ts declaration order

SYMPTOM: POST /entities returns HTML but no redirect
→ Check: does EntityService.create() return { success: true, data: { id: ... } }?
→ Check: is result.data typed to have id? (cast to { id: string } if needed)

SYMPTOM: PUT /api/entities/:id returns 422 for valid data
→ Check deriveBodySchema call: are passthroughKeys correctly set from ENTITY_CONFIG.nonColumnKeys?
→ Check: is "is_active" in alwaysOptionalKeys? (it's derived from status_action in service)
→ Check: are auto-managed fields (uuid autoGenerate, timestamp autoSet) being submitted?
  They should be skipped by deriveBodySchema — if submitted, they may fail schema check

SYMPTOM: HTML form never shows validation errors
→ Check: Pages POST handler sets set.status = 422 before re-render?
→ Check: result.stage === "validation" check is present before passing errors to View Service?

SYMPTOM: Cascade dropdown empty on form
→ Check: buildCascadingOptions called with correct parent IDs?
→ Check: parent IDs extracted from entity (for edit) or from submitted body (for failure re-render)?

SYMPTOM: 401 on public read endpoint
→ Check: ENTITY_CONFIG.permissions.read — is it "public"?
→ Check: makeAuthorizeMiddleware receives ENTITY_CONFIG.permissions, not a hardcoded object
```

---

### Workflow F: Debugging Schema Validation (422)

```
SYMPTOM: 422 from Elysia on valid-looking body
→ Log the incoming body: add console.log(body) before service call
→ Check deriveBodySchema: is the failing field in passthroughKeys or alwaysOptionalKeys?
→ Check field type: enum fields require exact string match to values[] in L0 atom
→ Check: t.Numeric() used for query params (not t.Number)?
→ For update mode: all fields are optional — 422 means a field present in body doesn't match its type

SYMPTOM: Virtual field (e.g., status_action) stripped from body
→ Add it to passthroughKeys (should equal ENTITY_CONFIG.nonColumnKeys)
→ Verify ENTITY_CONFIG.nonColumnKeys includes it in L0 config factory
```

---

### Workflow G: Testing a Controller

**Integration test pattern** (test against running server or test db):

```typescript
describe("EntityController", () => {
  it("POST /api/entities creates entity", async () => {
    const res = await fetch("http://localhost:3000/api/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-admin-token" },
      body: JSON.stringify({ name: "Test", machine_name: "test", is_active: true }),
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.name).toBe("Test")
  })

  it("POST /api/entities returns 400 on validation error", async () => {
    const res = await fetch("http://localhost:3000/api/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-admin-token" },
      body: JSON.stringify({ name: "" }),  // empty name — fails L1 validation
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.details?.name).toBeDefined()
  })

  it("GET /api/entities/check-name returns availability", async () => {
    const res = await fetch("http://localhost:3000/api/entities/check-name?name=Test")
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(typeof json.available).toBe("boolean")
  })
})
```

Run with: `bun test src/controller/entities/{entity-name}/`

**Manual smoke test sequence:**
```bash
# 1. List (should return empty array on fresh db)
curl http://localhost:3000/api/entities

# 2. Create (admin token required)
curl -X POST http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-admin-token" \
  -d '{"name":"Test","machine_name":"test","is_active":true}'

# 3. Get by ID (replace {id} with returned UUID)
curl http://localhost:3000/api/entities/{id}

# 4. Update
curl -X PUT http://localhost:3000/api/entities/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-admin-token" \
  -d '{"name":"Updated"}'

# 5. Delete
curl -X DELETE http://localhost:3000/api/entities/{id} \
  -H "Authorization: Bearer dev-admin-token"

# 6. HTML pages
open http://localhost:3000/entities
open http://localhost:3000/entities/new
```

---

### Workflow H: Git Conventions for L3 Changes

```bash
# New entity controller (both controller + pages)
feat(controller): add EntityName L3 controller and pages

# New check endpoint
feat(controller): add check-machine-name endpoint to EntityName

# New nested sub-resource API
feat(controller): add nested binding CRUD API under /api/modifiers/:id/bindings

# Bug fix in status code mapping
fix(controller): return 422 on HTML form validation failure instead of 200

# Extract shared pattern to sub-atom
refactor(controller): extract buildCascadingOptions to controller sub-atoms
```

**Rule:** L3-only changes use `controller` scope. Multi-layer feature work commits by layer
(one commit per layer touched). Never bundle L0 + L3 in the same commit.

**PR checklist for L3 changes:**
- [ ] `bun run typecheck` passes
- [ ] All CRUD routes registered: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- [ ] Check-name and check-machine-name routes declared **before** `createCrudRoutes` call
- [ ] `passthroughKeys` set from `ENTITY_CONFIG.nonColumnKeys`
- [ ] `alwaysOptionalKeys` includes `"is_active"` if entity uses status_action pattern
- [ ] Controller exported from entity `index.ts`
- [ ] Controller mounted in `src/index.ts`
- [ ] HTML pages use `{ detail: { hide: true } }` on the Elysia instance (keeps them out of OpenAPI docs)
- [ ] Manual smoke test: create → read → update → delete cycle passes

---

## Related Documents

- [LAYER-000: Configuration Reference](LAYER-000-configuration-reference.md) — L0 EntityConfig, FieldConfig, PermissionConfig
- [LAYER-002: Model Service Reference](LAYER-002-model-service-reference.md) — EntityService<T> implementations, result type shapes
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — ElysiaJS philosophy, OpenAPI generation, planned GraphQL
- [PDR-004: Entity & Config Model](PDR-004-entity-config-model.md) — FieldConfig discriminated union, nonColumnKeys
