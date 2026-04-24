# PDR-008: Roadmap

**Status:** Active  
**Last updated:** 2026-04-23

No deadlines. Milestones are sequenced by dependency, not by date.

---

## Current State

All seven layers are complete for the five core entities:
`GameDomain`, `GameSubdomain`, `GameCategory`, `GameSubcategory`, `ItemModifier`.

The ItemModifier entity is fully featured:
- Tiers (value scaling by progression level)
- Bindings (eligibility scoping via data)
- Assignment panel (computed eligibility view, zero L6 code)
- Lifecycle management (active/deactivated/archived with full event history)
- 4-color signal system in list and detail views

The API layer is documented:
- OpenAPI at `GET /openapi` (Scalar UI)
- All routes carry TypeBox schemas for validation and documentation
- HTML page routes excluded from the API spec

The factory pattern is established:
- `BaseEntityConfigFactory` abstract template
- `ItemModifierConfigFactory` as the reference implementation
- All five entities use the factory pattern

---

## Milestone 1: Stabilise & Generalise

**Goal:** Make the current system bulletproof and generalise patterns that are currently modifier-specific.

Tasks (no particular order):
- **Unified entity history table** — generalise `item_modifier_history` into `entity_history`
  with `entity_type + entity_id` scoping. Add status sections and history tabs to
  GameDomain, GameSubdomain, GameCategory, GameSubcategory detail pages.
  Requires: optimised query builders for polymorphic `entity_type + entity_id` lookups.
- **Phase 4.7: Split dual-export formatter files** — some L4 view service files export
  both a formatter and related types; split into separate files for clean separation.
- **Phase 6.6: Decompose name-availability-handler** — currently bundles condition building
  and conflict detection inside the handler factory; extract to L2 service methods.
- **Unit tests for config factories** — `BaseEntityConfigFactory` template method and
  `ItemModifierConfigFactory` `nonColumnKeys` hook.
- **Unit tests for tier orchestration** — `createTierOrchestration` error paths (no DB needed).
- **Integration tests for tier CRUD** — `addTier`, `updateTier`, `deleteTier` with reindex
  verification against a live PostgreSQL instance.

---

## Milestone 2: EnemyModifier

**Goal:** Prove the factory extension model works by building the second modifier type.

The `EnemyModifier` will:
- Use the same `BaseEntityConfigFactory` and domain molecules as `ItemModifier`
- Have its own `enemy_modifiers` table with enemy-specific fields
- Have its own full L1/L2/L3 stack — no code shared at the file level, only at the config level
- Validate that adding a new modifier type requires zero changes to existing entity code

Success criteria: `EnemyModifier` is fully operational (CRUD, lifecycle, bindings) and
no file outside `src/config/entities/enemy-modifier/` and `src/*/entities/enemy-modifier/`
was modified.

This milestone gates the asset system — assets cannot be built before the factory is proven.

---

## Milestone 3: Asset System

**Goal:** Build the `ItemAsset` entity as the first concrete asset type.

The asset system introduces a new entity class: game objects that can carry modifiers.
The `ItemAsset` entity will:
- Use the same factory pattern — `ItemAssetConfigFactory extends BaseEntityConfigFactory`
- Have its own `item_assets` table
- Show eligible modifiers on the asset detail page using the binding resolution logic
  already proven in the modifier assignment panel
- Serve as the second proof point for the factory extension model

After this milestone, the CMS can author both modifiers and the objects that use them.

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
