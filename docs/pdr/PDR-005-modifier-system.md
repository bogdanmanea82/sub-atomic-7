# PDR-005: Modifier System

**Status:** Active  
**Last updated:** 2026-04-27

---

## Modifier as First-Class Citizen

The Modifier entity is not a sub-feature of items. It is the **atomic unit of game behaviour**
— the one entity type that actually defines what makes one piece of game content different
from another.

Every item, enemy, zone, or spell derives its gameplay identity from the modifiers associated
with it. A 1-Handed Sword is a named container; the modifiers it can roll are what make it
interesting. This is why Modifier is modelled as a first-class citizen rather than a
subordinate attribute.

The implementation is the universal `Modifier` entity — a single table (`modifier`) that
carries no asset-specific semantics. Asset specificity lives on binding sub-entities:
`ItemModifierBinding` for items, `EnemyModifierBinding` for enemies, and so on for future
asset types. This keeps the modifier definition clean while allowing each asset domain to
carry its own binding fields (e.g., `affix_type` on item bindings only).

---

## Modifier Field Structure

### Identity & Hierarchy Fields

Provided by domain molecules (`MODIFIER_HIERARCHY_FIELDS`) and universal atoms:
`id`, `machine_name`, `name`, `description`,
`game_domain_id`, `game_subdomain_id`, `game_category_id`, `game_subcategory_id`.

The full four-level hierarchy FK chain scopes each modifier to exactly one subcategory
context. `machine_name` is the stable programmatic identifier (e.g., `fire_res`, `str_req`).

### Core Semantic Fields

These fields define the **vocabulary** of modifier math. They allow a game engine to
process modifiers programmatically without needing to parse display strings.

| Field | Type | Purpose |
|---|---|---|
| `target_stat_id` | reference | FK to the stat this modifier affects |
| `combination_type` | enum | `flat` / `increased` / `more` — PoE-style math bucket |
| `roll_shape` | enum | `scalar` / `range` — frozen single value or live min–max range |
| `value_min` | integer | Lower bound of the roll range |
| `value_max` | integer | Upper bound of the roll range |
| `modifier_group` | string | Groups related modifiers for mutual-exclusion logic |
| `display_template` | string | Human-readable text template (e.g., `"+{value}% increased Fire Damage"`) |

### Lifecycle Fields

Managed by the lifecycle system (see below):
- `is_active` — live/disabled runtime toggle (from `MODIFIER_STATUS_FIELDS` molecule)
- `archived_at`, `archived_reason` — soft-delete (from `MODIFIER_ARCHIVE_FIELDS` molecule)

### Asset-Specific Fields

Fields that differ per asset type live on the **binding sub-entities**, not on `modifier`:

| Field | On entity | Purpose |
|---|---|---|
| `affix_type` (prefix/suffix) | `ItemModifierBinding` | Item slot — irrelevant to enemies and other asset types |

This separation means the `modifier` table is stable across all asset domains. Adding a new
asset type creates a new binding table without touching `modifier`.

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
`ModifierService` spreads the result onto `_core` to produce the full service surface.

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
`deriveLifecycleStatus()` L4 function scans the `modifier_history` table for the
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

## Binding Architecture

The Modifier entity is universal. Asset-specific behaviour is encapsulated in binding
sub-entities. Each binding type is a separate table with its own L0 config, L1 model, and
L2 service.

### Current Binding Sub-Entities

| Binding entity | Table | Target hierarchy | Asset-specific fields |
|---|---|---|---|
| `ItemModifierBinding` | `item_modifier_binding` | Items hierarchy (game_subcategory) | `affix_type` (prefix/suffix) |
| `EnemyModifierBinding` | `enemy_modifier_binding` | Enemies hierarchy (enemy categories/subcategories) | none (lean start) |

Both use `ModifierBindingConfigFactory` — a generic factory parameterized by
`(parentEntityName, parentTableName, additionalFields, bindingEntityName)`. The 4th
parameter decouples the binding entity's table name from the parent entity name, which is
necessary now that both binding types share the same `modifier` FK parent:

```typescript
// Item binding — adds affix_type, uses "ItemModifierBinding" → table: item_modifier_binding
new ModifierBindingConfigFactory("Modifier", "modifier", [AFFIX_TYPE_FIELD_ATOM], "ItemModifierBinding")

// Enemy binding — no additional fields, uses "EnemyModifierBinding" → table: enemy_modifier_binding
new ModifierBindingConfigFactory("Modifier", "modifier", [], "EnemyModifierBinding")
```

### Adding a New Binding Type

When a new asset domain needs modifier bindings:

1. Create `src/config/entities/{asset}-modifier-binding/{asset}-modifier-binding-config-factory.ts`
2. Call `new ModifierBindingConfigFactory("Modifier", "modifier", [...assetFields], "{Asset}ModifierBinding")`
3. Create L1 model in `src/model/entities/{asset}-modifier-binding/`
4. Create L2 service in `src/model-service/entities/modifier/{asset}-modifier-binding-service.ts`
5. Add nested API routes to L3 modifier controller
6. Create migration for the new table

No changes to `modifier`, `ModifierService`, or any existing binding entities.

---

## Factory Extension Model

The `Modifier` entity uses the modifier domain molecules. The composition pattern is:

```
BaseEntityConfigFactory
  └── ModifierConfigFactory
        ├── MODIFIER_HIERARCHY_FIELDS (domain molecule — 4 FK refs)
        ├── MODIFIER_MACHINE_NAME_FIELD_ATOM (domain molecule)
        ├── NAME_FIELD_ATOM, DESCRIPTION_FIELD_ATOM (universal atoms)
        ├── [semantic fields: target_stat_id, combination_type, roll_shape, value_min,
        │   value_max, modifier_group, display_template]
        ├── MODIFIER_STATUS_FIELDS (domain molecule — is_active)
        ├── MODIFIER_ARCHIVE_FIELDS (domain molecule — archived_at, archived_reason)
        └── AUDIT_FIELDS (universal — created_at, updated_at)
```

**Note on `MODIFIER_LIFECYCLE_FIELDS`:** This molecule was retired and split into
`MODIFIER_STATUS_FIELDS` + `MODIFIER_ARCHIVE_FIELDS`. The file `lifecycle-fields.ts`
exists as a tombstone but exports nothing. Do not import it.

When a future modifier domain is needed (e.g., SpellModifier):

```
BaseEntityConfigFactory
  └── SpellModifierConfigFactory
        ├── MODIFIER_HIERARCHY_FIELDS (reused unchanged)
        ├── MODIFIER_MACHINE_NAME_FIELD_ATOM (reused unchanged)
        ├── NAME_FIELD_ATOM, DESCRIPTION_FIELD_ATOM (reused unchanged)
        ├── [spell-specific fields inline]
        ├── MODIFIER_STATUS_FIELDS (reused unchanged)
        ├── MODIFIER_ARCHIVE_FIELDS (reused unchanged)
        └── AUDIT_FIELDS (reused unchanged)
```

A new `spell_modifier` table is created. A new L1/L2/L3 stack is built. No existing code
is modified. The tier system is **optional** per modifier type — not all domains need
progression-based value scaling.

---

## Deferred: Unified Entity History

Currently `modifier_history` is modifier-specific. The planned generalization is a
single `entity_history` table with `entity_type` + `entity_id` as the composite scope key.
This allows all CMS entities (GameDomain, GameSubdomain, etc.) to share the same
audit log infrastructure. Deferred pending query optimization work for polymorphic
`entity_type + entity_id` lookups.

---

## Related Documents

- [PDR-003: Database Design](PDR-003-database-design.md) — tier and binding table schemas
- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — factory pattern
- [PDR-006: Asset System](PDR-006-asset-system.md) — how assets relate to modifiers
