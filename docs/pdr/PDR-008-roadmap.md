# PDR-008: Roadmap

**Status:** Active  
**Last updated:** 2026-04-27

No deadlines. Milestones are sequenced by dependency, not by date.

---

## Current State

All seven layers are complete for eight primary entities:
`GameDomain`, `GameSubdomain`, `GameCategory`, `GameSubcategory`, `Stat`,
`CharacterClass`, `Item`, `Modifier`.

**CharacterClass** — player archetype entity with archive lifecycle and a stat sheet
subordinate table (`character_stat_base`). Stat sheets are bulk-managed via
`stat_sheet_json` hidden form field using delete-all-then-reinsert transactions.
All stats are shown pre-filled with their `default_value`.

**Item** — game object entity scoped to the full 4-level taxonomy hierarchy (same FK
chain as Modifier). Owns a `item_stat_base` stat sheet (sparse — only non-zero rows
displayed). Carries archive lifecycle and full form cascade support.

**Supporting models (no standalone controller/routes):**
- `CharacterStatBase` — junction of CharacterClass × Stat; 7 fields including `combination_type`
- `ItemStatBase` — junction of Item × Stat; 7 fields including `combination_type`
- `Formula` — L0 config + L1 model only

The `Modifier` entity is the universal modifier table (table: `modifier`). The rename from
`ItemModifier` / `item_modifiers` was completed via migrations 015–017. The entity now
carries no asset-specific semantics — those live on binding sub-entities.

The Modifier entity is fully featured:
- Tiers (value scaling by progression level) — `modifier_tier` table
- Item bindings (eligibility scoping for items) — `item_modifier_binding` table, includes `affix_type`
- Enemy bindings (eligibility scoping for enemies) — `enemy_modifier_binding` table
- Assignment panel (computed eligibility view, zero L6 code)
- Lifecycle management (active/deactivated/archived with full event history) — `modifier_history`
- 4-color signal system in list and detail views

The Enemies hierarchy is seeded (migration 018 + `seeds/19-enemies-hierarchy.sql`):
- 1 domain: Enemies
- 5 subdomains: Beasts, Humanoids, Undead, Constructs, Aberrations
- 19 categories (mammals, reptiles, birds, insects, aquatic, bandits, cultists, …)
- 58 subcategories (wolf, bear, boar, …)

The API layer is documented:
- OpenAPI at `GET /openapi` (Scalar UI)
- All routes carry TypeBox schemas for validation and documentation
- HTML page routes excluded from the API spec

The factory pattern is established and proven across multiple entity and binding types:
- `BaseEntityConfigFactory` abstract template
- `ModifierConfigFactory` as the reference implementation
- `ModifierBindingConfigFactory` generic factory — parameterized by 4 args including optional
  `bindingEntityName` to support multiple binding types sharing the same `modifier` FK parent
- `ModifierTierConfigFactory` generic factory
- All eight primary entities use the factory pattern

---

## Milestone 1: Stabilise & Generalise

**Goal:** Make the current system bulletproof and generalise patterns that are currently modifier-specific.

Tasks (no particular order):
- **Unified entity history table** — generalise `modifier_history` into `entity_history`
  with `entity_type + entity_id` scoping. Add status sections and history tabs to
  GameDomain, GameSubdomain, GameCategory, GameSubcategory detail pages.
  Requires: optimised query builders for polymorphic `entity_type + entity_id` lookups.
- **Phase 4.7: Split dual-export formatter files** — some L4 view service files export
  both a formatter and related types; split into separate files for clean separation.
- **Phase 6.6: Decompose name-availability-handler** — currently bundles condition building
  and conflict detection inside the handler factory; extract to L2 service methods.
- **Unit tests for config factories** — `BaseEntityConfigFactory` template method and
  `ModifierConfigFactory` `nonColumnKeys` hook.
- **Unit tests for tier orchestration** — `createTierOrchestration` error paths (no DB needed).
- **Integration tests for tier CRUD** — `addTier`, `updateTier`, `deleteTier` with reindex
  verification against a live PostgreSQL instance.

---

## Milestone 2: EnemyModifier Full Stack

**Goal:** Build the full L1–L6 vertical for EnemyModifier — the L0 config and L3 binding
API are already in place; the remaining work is the EnemyModifier entity itself.

**Already complete (from universal Modifier refactor):**
- L0: `ENEMY_MODIFIER_BINDING_CONFIG` — `enemy-modifier-binding-config-factory.ts`
- L1: `EnemyModifierBindingModel` — `enemy-modifier-binding-model.ts`
- L2: `EnemyModifierBindingService` — `enemy-modifier-binding-service.ts`
- L3: `EnemyModifierBindingApi` — `/api/modifiers/:id/enemy-bindings` routes
- DB: `enemy_modifier_binding` table (migration 018), Enemies hierarchy seeded

**Still required:**
- A dedicated `EnemyModifier` entity that scopes modifiers specifically to the Enemies domain
  (e.g., filters the modifier list to the `enemies` game domain, possibly adds enemy-specific
  fields). This is distinct from just using the universal `Modifier` with enemy bindings.
- Full brainstorm session needed first to determine if a separate EnemyModifier entity is
  truly necessary vs. the universal Modifier + enemy bindings being sufficient.

Success criteria: Enemy-scoped modifier authoring is fully operational (CRUD, lifecycle, bindings)
without modifying any existing entity code outside the `enemy-modifier/` directories.

This milestone gates the asset system — assets cannot be built before the factory is proven.

---

## Milestone 3: Asset System ✓ (Item complete)

**Goal:** Build the first concrete asset type — complete.

The `Item` entity (all 7 layers) is the concrete deliverable of this milestone:
- Factory pattern — `ItemConfigFactory extends BaseEntityConfigFactory` ✓
- Own table — `item` (migrations 013, 014) ✓
- 4-level taxonomy hierarchy FK chain ✓
- Stat sheet (`item_stat_base`) with sparse display and `stat_sheet_json` pattern ✓
- Archive lifecycle, form cascades, browser routing ✓

**Still deferred within this milestone:**
- Eligible modifier pool view on the Item detail page (reuses
  `prepareAssignmentPanel()` from the Modifier system — not yet wired in L4/L5)
- AssetTemplate pattern (shared modifier pool across asset classes)
- Additional asset types beyond Item (see PDR-006)

---

## Milestone 4: GraphQL Game Runtime API

**Goal:** Add a `/graphql` endpoint that game clients (Unity, Godot, browser) can query.

Prerequisites: At least one game runtime entity exists (Zone, Enemy, or Ability). The
CMS entities (Modifier, Asset) need GraphQL types too since they are referenced at runtime.

Approach:
- Install `@elysiajs/graphql-yoga graphql graphql-yoga`
- Define SDL type definitions per entity in `src/game-api/schema/`
- Define resolvers in `src/game-api/resolvers/` — thin wrappers calling existing L2 services
- Define DataLoader batch functions in `src/game-api/loaders/` — one per entity type
- Mount `.use(yoga(...))` in `src/index.ts` alongside existing REST routes (additive, not replacing)

The REST API remains unchanged. The GraphQL endpoint is additive.

DataLoader is non-negotiable — must be included from the first commit of the GraphQL layer.

---

## Milestone 5: Unity/Godot Prototype Client

**Goal:** Demonstrate that a game engine can consume the GraphQL API to drive procedural
item generation.

Scope:
- Read-only queries (no mutations from the game client — content is authored via CMS only)
- Load zone data, resolve eligible modifiers, roll values within tier ranges
- Display a generated item's stat line in a simple prototype UI

This milestone is purely validating the data pipeline. Game mechanics and art are out of scope.

---

## Deferred / Under Consideration

- **WebSockets** — real-time modifier preview in game client. Requires a client that can
  consume a WebSocket stream. Deferred until Milestone 5 context exists.
- **Advanced auth** — current auth is placeholder. Production hardening is a separate phase,
  not part of the prototype roadmap.
- **SpellModifier, ZoneModifier, MapModifier** — additional modifier types beyond Enemy.
  Each follows the same factory pattern once EnemyModifier validates it.
- **AssetTemplate pattern** — shared modifier pool declarations across asset classes.
  Considered a future optimisation; the direct asset→binding model ships first.

---

## Related Documents

- [PDR-001: Vision & Scope](PDR-001-vision-and-scope.md) — what "done" means for the prototype
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — current state of the core entity
- [PDR-006: Asset System](PDR-006-asset-system.md) — planned, gated on Milestone 2
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — GraphQL addition in depth
