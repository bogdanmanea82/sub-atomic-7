# PDR-007: API & Transport Layer

**Status:** Active  
**Last updated:** 2026-04-23

---

## ElysiaJS Philosophy

Layer 3 (Controller) is an **HTTP adapter**, not a business logic layer. The handler
pattern is:

```
validate request format → call L2 service → return response
```

Nothing more. Business logic (uniqueness checks, cross-field validation, tier validation)
lives in L1 and L2. Controllers are deliberately thin.

This design choice means L2 services are **transport-agnostic**. The same `ItemModifierService`
methods that REST handlers call are exactly what GraphQL resolvers will call when the game
runtime API is added. Zero duplication, zero migration cost.

---

## ElysiaJS-Specific Practices

### Structural Typing over Context Imports

Handler factories use structural typing rather than importing `Context` from Elysia:

```typescript
// Correct — structurally typed, decoupled from Elysia internals
({ body, set }: { body: unknown; set: { status?: number | string } }) => { ... }

// Incorrect — tightly coupled, causes type integrity loss per ElysiaJS docs
(ctx: Context) => { ... }
```

The key subtlety: `set.status` is an **optional** property (`status?:`) in Elysia's
internal type. Using `{ status: number }` (required) causes TypeScript errors.
The correct structural shape is `{ status?: number | string }`.

### Schema at the Route Boundary

TypeBox schemas (`t.Object()`) are declared on route definitions, not inside handlers.
This gives Elysia three things simultaneously:
1. **Runtime validation** — invalid bodies are rejected before the handler runs
2. **Type inference** — TypeScript knows the body type inside the handler
3. **OpenAPI generation** — Elysia can introspect the schema to produce documentation

The `deriveBodySchema()` sub-atom (`src/controller/sub-atoms/schema/derive-body-schema.ts`)
projects L0 `FieldConfig[]` into a TypeBox schema at L3. This is the bridge between the
single source of truth (L0 config) and the route validation layer — no field definitions
are duplicated.

`paginationQuerySchema` uses `t.Numeric()` for `page` and `pageSize`. `t.Numeric()` handles
the automatic string → number coercion that query parameters require (HTTP sends all query
params as strings; the game client expects numbers).

### HTML Page Routes Hidden from OpenAPI

CMS HTML page routes are mounted in a separate Elysia instance constructed with
`{ detail: { hide: true } }`. This hides all routes in that instance from the OpenAPI
specification without annotating each route individually.

The API routes (JSON) and page routes (HTML) are logically separate concerns — the OpenAPI
spec documents only the machine-readable API contract.

---

## Current API Surface

All five entity groups are documented at `GET /openapi` (Scalar UI) and `GET /openapi/json`.

| Entity | REST prefix | Tags |
|---|---|---|
| Game Domains | `/api/game-domains` | `Game Domains` |
| Game Subdomains | `/api/game-subdomains` | `Game Subdomains` |
| Game Categories | `/api/game-categories` | `Game Categories` |
| Game Subcategories | `/api/game-subcategories` | `Game Subcategories` |
| Item Modifiers | `/api/modifiers` | `Item Modifiers` |

Each entity exposes the standard 5 CRUD routes via `createCrudRoutes()` plus entity-specific
check endpoints (name availability, field availability).

Item Modifiers additionally expose:
- `GET/POST/PUT/DELETE /api/modifiers/:id/tiers/:index` — tier management
- `GET/POST/PUT/DELETE /api/modifiers/:id/bindings/:id` — binding management

---

## Planned: GraphQL Game Runtime API

The decision to add GraphQL is approved and deferred to game implementation time.
See [ADR-005: Why GraphQL is Deferred](ADR-005-graphql-deferred.md) for the full rationale.

### Why GraphQL for the Game Runtime (Not REST)

A game client loading a zone needs:
```
zone data → enemies in zone → abilities per enemy → loot tables → modifier effects
```

With REST this is 1 + N + N² round-trips. With GraphQL it is one query where the client
specifies exactly what it needs.

The five current CMS entities are authoring entities, not game runtime entities. The game
runtime entities (Zone, Enemy, Ability, LootPool) don't exist yet. Building GraphQL now
means zero entities to query. The correct time to build it is when those entities are defined.

### Architectural Fit

The seven-layer architecture maps cleanly to GraphQL:

| Current Layer | REST Role | GraphQL Role |
|---|---|---|
| L1 Model | Query builders | Resolver data access |
| L2 Model Service | Business workflows | Query resolvers (`findById`, `findMany` already exist) |
| L3 Controller | REST endpoints | One `/graphql` endpoint (additive) |

L2 service methods become resolvers with no rewrite required. The split is:
- `GET /openapi` — CMS authoring (REST, stays forever)
- `POST /graphql` — Game runtime (GraphQL, added when runtime entities exist)

### N+1 Problem — Must Be Solved from Day One

Without DataLoader, GraphQL makes the database problem worse, not better:
```graphql
query { zone { enemies { abilities { modifiers { } } } } }
```
Without batching, this executes one DB query per nested object.

DataLoader batches these into one query per type (3 queries total instead of 1 + N + N*M).
This must be built into the GraphQL layer from the start, not retrofitted later.

---

## WebSocket Consideration (Future)

Real-time modifier preview — showing a player's item stat line update as modifiers are
tweaked — is a natural WebSocket use case. ElysiaJS supports WebSockets natively.

This is not planned for the prototype. It requires a game client to exist (Unity/Godot or
browser-based) that can consume the WebSocket stream. Deferred to post-asset-system work.

---

## Unity / Godot Portability

The choice of GraphQL for the game runtime API is directly motivated by Unity/Godot client
requirements:
- Both engines have GraphQL client libraries
- The strongly-typed schema maps naturally to Unity's C# type system
- Single endpoint (no route proliferation as entity count grows)
- Client can specify exactly which fields to fetch — mobile clients only request minimal data

The CMS and game runtime are designed to be consumed by any client that speaks HTTP + GraphQL.
There is no Unity-specific or Godot-specific adapter layer.

---

## Related Documents

- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — where L3 sits in the full stack
- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — how FieldConfig drives schemas
- [ADR-002: Why ElysiaJS](ADR-002-why-elysia.md)
- [ADR-005: Why GraphQL is Deferred](ADR-005-graphql-deferred.md)
