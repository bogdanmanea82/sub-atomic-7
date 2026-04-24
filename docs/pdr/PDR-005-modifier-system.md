# PDR-005: Modifier System

**Status:** Active  
**Last updated:** 2026-04-23

---

## Modifier as First-Class Citizen

The Modifier entity is not a sub-feature of items. It is the **atomic unit of game behaviour**
— the one entity type that actually defines what makes one piece of game content different
from another.

Every item, enemy, zone, or spell derives its gameplay identity from the modifiers associated
with it. A 1-Handed Sword is a named container; the modifiers it can roll are what make it
interesting. This is why Modifier is modelled as a first-class citizen rather than a
subordinate attribute.

The current implementation is `ItemModifier` — the first concrete instance of what will
become a family of modifier types (EnemyModifier, ZoneModifier, SpellModifier). The
`ItemModifier` entity is the reference implementation that proves the factory pattern works.

---

## ItemModifier Field Structure

### Classification Fields

| Field | Type | Purpose |
|---|---|---|
| `affix_type` | enum | `prefix` or `suffix` — where the modifier name appears on an item |
| `semantic_cat` | enum | Broad gameplay category (damage, defense, utility, etc.) |
| `value_type` | enum | What the value represents (flat, percent, override) |
| `calc_method` | enum | How values combine (additive, multiplicative, percentage, override) |

These four enums define the **vocabulary** of modifier semantics. They allow a game engine
to process modifiers programmatically without needing to parse modifier names.

### Identity & Hierarchy Fields

Provided by universal molecules (`BASE_ENTITY_FIELDS`, `MODIFIER_HIERARCHY_FIELDS`):
`id`, `name`, `code` (unique slug), `description`, `sortOrder`,
`gameDomainId`, `gameSubdomainId`, `gameCategoryId`, `gameSubcategoryId`.

The full hierarchy FK chain scopes each modifier to exactly one subcategory context.

### Lifecycle Fields

`isActive`, `archivedReason`, `archivedAt` — managed by the lifecycle system (see below).

---

## Tier System

Tiers represent **value scaling across character progression levels**. A single modifier
conceptually covers the full power range of an item for a given stat. Individual tiers
carve that range into discrete steps with different drop rates.

Each tier has:
- `tier_index` — 0-based ordering (must be gapless)
- `level_req` — minimum character level to receive this tier
- `min_value` / `max_value` — the value roll range at this tier
- `spawn_weight` — relative spawn probability (lower at higher tiers = rarer)

### Cross-Row Validation

Before any write, the full tier set is validated as a unit:

1. Tier indexes form a gapless sequence starting at 0 (no gaps, no duplicates)
2. `level_req` values are non-decreasing (you can't have tier 2 require level 10 and tier 3 require level 5)
3. `min_value` values are non-decreasing (higher tiers can't roll lower floors)
4. `spawn_weight` values are non-increasing (higher tiers must be rarer or equal)

These constraints are enforced in L2 by `validateTierSet()` before the database is touched.

### Persistence Pattern

Tiers are persisted using **delete-all-then-reinsert** inside a transaction. When tiers are
updated, all existing tiers for the modifier are deleted and the new set is inserted fresh.

Trade-off: slightly higher write volume versus the complexity of a diff/UPSERT approach.
For a CMS authoring flow (infrequent writes, small tier sets), this is the correct choice.
The simpler write path reduces the surface area for subtle bugs in tier ordering logic.

### Tier Orchestration

The tier add/update/delete operations are encapsulated in the `createTierOrchestration`
factory (`src/model-service/sub-atoms/tiers/`). This factory takes the core service's
`findById` and the tier model as dependencies and returns the three tier operations.
`ItemModifierService` spreads the result onto `_core` to produce the full service surface.

---

## Binding System

Bindings declare which modifiers are **eligible** in which game subcategory contexts.

A binding record states: "This modifier may (or may not) appear when the system is generating
items for this subcategory." The binding table is a junction between modifiers and subcategories.

### Why Bindings Are Data, Not Code

Without the binding system, eligibility rules would be code conditions scattered across
item generation logic. Adding a new rule would require a code change. With bindings, game
designers control eligibility through data — create a binding record, remove a binding
record.

### Resolution Logic (used in the Assignments panel)

When determining which modifiers are eligible for a given subcategory:

1. **Check for an explicit binding** on this subcategory → use it if found
2. **Check the parent category** for a binding covering this subcategory's modifier → inherit it
3. **No binding** → the modifier has no declared eligibility in this context

This resolution order gives fine-grained override capability: a broad rule can be set at
the category level, and individual subcategories can override it explicitly.

---

## Assignment Panel (Screen 3)

The assignment panel is a **read-only computed view** showing which modifiers are eligible
in each subcategory of the current modifier's game hierarchy.

Key design decision: zero new database tables, zero L6 browser code. The panel is computed
entirely in L4 (`prepareAssignmentPanel()`) by reading the existing modifiers and bindings
tables, then rendered server-side in L5. The assignment view is a projection over existing
data — no new persistence needed.

The panel shows:
- A summary bar: eligible / excluded / no-binding / total counts
- A category-grouped table with resolution source (explicit / inherited / none)

---

## Lifecycle System

### States

| State | Meaning |
|---|---|
| `active` | Normal operation — modifier can appear in item generation |
| `deactivated` | Temporarily disabled — modifier won't appear but is not archived |
| `reactivated` | Previously deactivated, now re-enabled |
| `archived` | Soft-deleted — preserved for audit, not usable |

### Lifecycle as Event Log

The lifecycle state is **derived from the history log**, not stored as a column. The
`deriveLifecycleStatus()` L4 function scans the `item_modifier_history` table for the
most recent status-bearing event and returns the current state.

This means the full lifecycle history is always available — you can see that a modifier
was active → deactivated → reactivated → archived, with timestamps for each transition.

### 4-Color Signal System

In the list view and detail pages:
- Green = active
- Red = deactivated
- Blue = reactivated
- Yellow = archived
- Pink = renamed (history events only)

---

## Factory Extension Model

The ItemModifier is the first instance of a modifier factory. The pattern is:

```
BaseEntityConfigFactory
  └── ItemModifierConfigFactory
        ├── BASE_ENTITY_FIELDS (universal)
        ├── MODIFIER_HIERARCHY_FIELDS (domain molecule)
        ├── CODE_FIELD (domain molecule)
        ├── MODIFIER_LIFECYCLE_FIELDS (domain molecule)
        ├── AUDIT_FIELDS (universal)
        └── item-specific enums (affix_type, semantic_cat, value_type, calc_method)
```

Adding `EnemyModifier` follows the same pattern:

```
BaseEntityConfigFactory
  └── EnemyModifierConfigFactory
        ├── BASE_ENTITY_FIELDS (universal — reused unchanged)
        ├── MODIFIER_HIERARCHY_FIELDS (domain molecule — reused unchanged)
        ├── CODE_FIELD (domain molecule — reused unchanged)
        ├── MODIFIER_LIFECYCLE_FIELDS (domain molecule — reused unchanged)
        ├── AUDIT_FIELDS (universal — reused unchanged)
        └── enemy-specific fields (damage_type, ai_behavior, etc.)
```

A new `enemy_modifiers` table is created. A new L1/L2/L3 stack is built following the
ItemModifier patterns. No existing entity code is modified.

The tier system is **optional** per modifier type — not all domains need progression-based
value scaling. EnemyModifier may not compose the tier molecules at all.

---

## Deferred: Unified Entity History

Currently `item_modifier_history` is modifier-specific. The planned generalization is a
single `entity_history` table with `entity_type` + `entity_id` as the composite scope key.
This allows all five CMS entities (GameDomain, GameSubdomain, etc.) to share the same
audit log infrastructure. Deferred pending query optimization work for polymorphic
`entity_type + entity_id` lookups.

---

## Related Documents

- [PDR-003: Database Design](PDR-003-database-design.md) — tier and binding table schemas
- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — factory pattern
- [PDR-006: Asset System](PDR-006-asset-system.md) — how assets relate to modifiers
