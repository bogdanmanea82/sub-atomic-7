# Product Design Requirements

This directory contains design documentation for the sub-atomic-7 RPG CMS prototype.
These documents capture architectural decisions and design intent — they are not production
operations, delivery, or QA documents.

**New here?** Read PDR-001 and PDR-002 first.

---

## Product Design Requirements

| Document | Topic |
|---|---|
| [PDR-001: Vision & Scope](PDR-001-vision-and-scope.md) | What the system is, prototype goals, what is out of scope |
| [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) | Seven-layer architecture, sub-atom/atom/molecule/organism, file map |
| [PDR-003: Database Design](PDR-003-database-design.md) | FK hierarchy, game rules as data, binding system, migration history |
| [PDR-004: Entity & Config Model](PDR-004-entity-config-model.md) | L0 factory pattern, composition hierarchy, how to extend |
| [PDR-005: Modifier System](PDR-005-modifier-system.md) | Tiers, bindings, assignments, lifecycle, factory extension model |
| [PDR-006: Asset System](PDR-006-asset-system.md) | Planned asset entity — what it is and why it depends on modifiers |
| [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) | ElysiaJS philosophy, OpenAPI, planned GraphQL, Unity/Godot |
| [PDR-008: Roadmap](PDR-008-roadmap.md) | Current state and next milestones (no deadlines) |

---

## Architecture Decision Records

Short records explaining why key technology and design choices were made.

| Document | Decision |
|---|---|
| [ADR-001: Why Bun](ADR-001-why-bun.md) | Bun as runtime, bundler, and test runner |
| [ADR-002: Why ElysiaJS](ADR-002-why-elysia.md) | ElysiaJS as HTTP framework |
| [ADR-003: Why Atomic Design](ADR-003-why-atomic-design.md) | Seven-layer atomic architecture |
| [ADR-004: Why PostgreSQL](ADR-004-why-postgresql.md) | PostgreSQL over SQLite/MySQL |
| [ADR-005: GraphQL Deferred](ADR-005-graphql-deferred.md) | Why GraphQL is not added until game runtime entities exist |
