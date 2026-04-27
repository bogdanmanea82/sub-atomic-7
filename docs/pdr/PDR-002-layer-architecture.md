# PDR-002: Seven-Layer Architecture

**Status:** Active  
**Last updated:** 2026-04-23

---

## Core Principle

The system uses a **seven-layer atomic architecture** with strict unidirectional dependencies.
Each layer depends only on layers below it. No upward dependencies are permitted.

```
L6 Browser          ← client-side state, validation, DOM interaction
L5 View             ← HTML rendering (TypeScript tagged template literals)
L4 View Service     ← presentation preparation (no rendering)
L3 Controller       ← HTTP adapter (ElysiaJS coupling lives here only)
L2 Model Service    ← business workflows, transactions
L1 Model            ← framework-agnostic domain logic
L0 Configuration    ← active behavior definition (no dependencies)
```

Configuration depends on nothing. Browser depends on everything. A change in L0 propagates
upward through all layers without requiring changes to any of them — this is the
**write-once-share-everywhere** principle in action.

---

## Sub-atom → Atom → Molecule → Organism

Within each layer, the same composition hierarchy applies:

| Level | Responsibility |
|---|---|
| Sub-atom | Does exactly one thing. Atomic unit — cannot be split further |
| Atom | Orchestrates 2–4 sub-atoms. Owns one named operation |
| Molecule | Orchestrates atoms into a coherent workflow or field group |
| Organism | Orchestrates molecules into a complete entity behavior |

An atom **orchestrates** — it never implements logic that belongs in a sub-atom. If you use
"and" to describe what an atom does, it is doing too much.

---

## Layer 0: Configuration

**What it owns:** Active behavior definitions for all other layers.  
**What it must never do:** Import from any other layer. Contain runtime logic.

Configuration is the source of truth for field types, constraints, display formats, relationships,
permissions, and table names. When you change a field's `minLength` in L0, L1 validation,
L3 schema, and L6 browser validation all update automatically — because they all read from
the same config object.

The factory pattern at L0:

```
BaseEntityConfigFactory (abstract)
  ├── GameDomainConfigFactory
  ├── GameSubdomainConfigFactory
  ├── GameCategoryConfigFactory
  ├── GameSubcategoryConfigFactory
  └── ModifierConfigFactory
        ├── Composes: universal atoms (id, name, description, timestamps)
        ├── Composes: universal molecules (AUDIT_FIELDS)
        ├── Composes: domain molecules (hierarchy-fields, machine-name-field, status-fields, archive-fields)
        └── Adds: modifier semantic fields (target_stat_id, combination_type, roll_shape, value_min/max, modifier_group, display_template)
  └── ModifierBindingConfigFactory (generic — parameterized by parentEntityName, additionalFields, bindingEntityName)
        ├── ItemModifierBinding — adds affix_type
        └── EnemyModifierBinding — no additional fields (lean start)
```

Key files:
- `src/config/factories/base-entity-config-factory.ts` — abstract template
- `src/config/universal/` — sub-atoms, atoms, molecules shared across all entities
- `src/config/molecules/modifier/` — domain molecules for modifier types
- `src/config/entities/` — concrete factory implementations per entity

---

## Layer 1: Model

**What it owns:** Framework-agnostic domain logic. Query builders. Validation. Serialization.  
**What it must never do:** Import from ElysiaJS, Controller, View, or Browser.

L1 reads L0 config to drive its behavior. The universal model sub-atoms process any entity
whose config follows the standard FieldConfig shape — one implementation, all entities benefit.

Key sub-atom categories in `src/model/universal/sub-atoms/`:
- `validation/` — field-level and cross-field rule enforcement
- `query-building/` — parameterised SQL fragment builders (no string concatenation)
- `serialization/` — TypeScript values → PostgreSQL-safe values
- `deserialization/` — PostgreSQL rows → typed TypeScript objects

---

## Layer 2: Model Service

**What it owns:** Business workflows. Transaction orchestration. Cross-entity operations.  
**What it must never do:** Import from Controller or View. Contain HTTP concepts.

L2 composes L1 atoms into complete operations (`createEntityWorkflow`, `updateEntityWorkflow`).
Transactions are managed here via `withTransaction(db, fn)` — the database connection is
passed down, not leaked upward.

Key directories:
- `src/model-service/atoms/crud/` — universal CRUD operation atoms
- `src/model-service/atoms/uniqueness/` — field availability checking
- `src/model-service/molecules/workflows/` — create/update/delete workflow molecules
- `src/model-service/sub-atoms/tiers/` — tier orchestration factory
- `src/model-service/entities/` — entity-specific services (thin wrappers over workflows)

---

## Layer 3: Controller

**What it owns:** HTTP request/response handling. Route mounting. Schema boundary.  
**What it must never do:** Contain business logic. Import from View or Browser.

ElysiaJS coupling is **acceptable and expected only in L3**. Handler factories use structural
typing (not `Context` imports) to stay decoupled from Elysia's internal type changes:

```typescript
// Correct — structural
({ body, set }: { body: unknown; set: { status?: number | string } }) => { ... }

// Incorrect — tightly coupled to Elysia internals
(ctx: Context) => { ... }
```

The `deriveBodySchema()` sub-atom bridges L0 to L3: it converts `FieldConfig[]` into a
TypeBox `t.Object()` schema at the route boundary. This gives Elysia the information it
needs to validate bodies and generate OpenAPI documentation — without duplicating the
field definitions that already exist in L0.

Key files:
- `src/controller/sub-atoms/schema/derive-body-schema.ts` — L0→TypeBox projection
- `src/controller/atoms/handlers/` — five CRUD handler factories
- `src/controller/molecules/crud-routes.ts` — standard 5-route CRUD scaffold
- `src/controller/entities/` — entity-specific controllers (API routes + page routes)

HTML page routes are mounted in a separate Elysia instance constructed with
`{ detail: { hide: true } }` so they are excluded from OpenAPI documentation.

---

## Layer 4: View Service

**What it owns:** Preparation of data for rendering. No HTML output.  
**What it must never do:** Render HTML. Import from Controller.

L4 transforms raw entity data into presentation-ready structures: formatted field values,
resolved reference labels, computed lifecycle status, cascading select options.

Key files:
- `src/view-service/entities/` — entity-specific view services
- `src/view-service/types/` — shared types (ReferenceLookup, etc.)

---

## Layer 5: View

**What it owns:** HTML rendering via TypeScript tagged template literals.  
**What it must never do:** Fetch data. Contain business logic.

L5 receives prepared data from L4 and renders it to HTML strings. Templates are TypeScript
functions — no template engine dependency. Sub-atoms handle shared structural patterns
(form sections, detail sections, navigation). Organisms assemble full pages.

Key files:
- `src/view/organisms/pages/` — full page renderers
- `src/view/organisms/` — entity-specific complete views
- `src/view/molecules/` — reusable section renderers
- `src/view/sub-atoms/` — element-level renderers

---

## Layer 6: Browser

**What it owns:** Client-side state, DOM interaction, AJAX, browser validation.  
**What it must never do:** Contain business logic. Import from server-side layers.

L6 reads L0 `BrowserFieldConfig` directly — the same configuration that drove server-side
rendering also drives browser validation and display. The router is data-driven:
`ENTITY_ROUTES` config array + `initEntityRoutes()` initialiser replaces per-entity routing logic.

Key files:
- `src/browser/main.ts` — data-driven router entry point
- `src/browser/sub-atoms/routing/entity-routes.ts` — route configuration
- `src/browser/sub-atoms/utilities/` — shared utilities (escapeText, injectStylesOnce, fetchJson)

---

## Why This Architecture

The seven-layer approach was chosen because earlier versions bundled logic across concerns —
validation in controllers, display logic in services, database queries in routes. When a bug
appeared it was impossible to isolate without reading large, mixed-concern files.

The atomic layering enforces that every change is localised. Changing how a boolean field is
serialised (L1) cannot accidentally break how it is displayed (L5) because those layers have
no shared mutable state — only shared configuration (L0).

See [ADR-003: Why Atomic Design Architecture](ADR-003-why-atomic-design.md) for the full
decision record.

---

## Related Documents

- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — L0 factory pattern in detail
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — L3 in depth (ElysiaJS, OpenAPI, GraphQL)
- [ADR-003: Why Atomic Design Architecture](ADR-003-why-atomic-design.md)
