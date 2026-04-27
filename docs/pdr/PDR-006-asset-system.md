# PDR-006: Asset System

**Status:** Active — Item entity complete; additional asset types planned  
**Last updated:** 2026-04-27  
**Dependency:** Modifier system stable (complete — see PDR-005)

---

## What is an Asset?

An Asset is a **game object** that a player can possess, encounter, or interact with. Where
a Modifier defines a single measurable effect, an Asset is the container that holds those
effects at runtime. A "1-Handed Sword" is an asset; "+12 Physical Damage" is a modifier
that might appear on it.

Assets occupy the same level in the taxonomy as Modifiers — both belong to the
`game_subcategory` scope. A 1-Handed Sword (asset) and a STR Requirement modifier both
exist under the same `game_subcategory_id`.

---

## Asset vs. Modifier — Key Distinction

| Concept | Modifier | Asset |
|---|---|---|
| Defines | A single gameplay effect (value, type, calc method) | A game object template (class, appearance, base stats) |
| Relationship to hierarchy | Scoped to a subcategory via FK | Scoped to a subcategory via FK |
| Runtime role | Selected and rolled to produce an item's stat line | The named container that receives modifier rolls |
| Relationship to each other | Independent — modifiers don't know about assets | Asset selects from eligible modifiers in its context |

Assets are **not subordinate to Modifiers** in the data model. They are peers at the
subcategory level. The relationship flows one direction: an asset selects from the modifier
pool that the binding system has declared eligible for its subcategory.

---

## Current Implementation

### Item (complete — all 7 layers)

The `Item` entity is the first concrete asset type and is fully implemented:

- **Table:** `item` (created via migrations 013 + 014)
- **Fields:** `id`, `game_domain_id`, `game_subdomain_id`, `game_category_id`,
  `game_subcategory_id`, `machine_name`, `name`, `description`, `is_active`,
  `archived_at`, `archived_reason`, `created_at`, `updated_at` (13 fields)
- **Hierarchy:** scoped to the full 4-level taxonomy (same FK chain as Modifier)
- **Stat sheet:** `item_stat_base` subordinate table — junction of item × stat with
  `combination_type` and `base_value`; managed via delete-all-then-reinsert transaction
  using a `stat_sheet_json` hidden form field
- **Sparse stat sheet:** rows with `base_value = 0` are created for all stats on save
  but only non-zero rows are displayed (contrast with CharacterClass where all stats
  always show)
- **All 7 layers:** L0 config → L1 model → L2 service → L3 controller → L4 view
  service → L5 view → L6 browser, including archive lifecycle and form cascades

### CharacterClass (complete — all 7 layers)

`CharacterClass` is not a hierarchy asset (it has no taxonomy FK chain) but follows
the same stat sheet pattern:

- **Table:** `character_class` (originally `character`, renamed via migration 010)
- **Fields:** `id`, `machine_name`, `name`, `description`, `is_active`, `archived_at`,
  `archived_reason`, `created_at`, `updated_at` (9 fields)
- **Stat sheet:** `character_stat_base` subordinate table — junction of character_class
  × stat with `combination_type` and `base_value`; bulk-managed via `stat_sheet_json`
- **Full stat sheet:** all stats always shown with their `default_value` pre-filled
  (contrast with Item's sparse approach)

### Stat (complete — all 7 layers)

Stats are the shared attribute vocabulary for both assets. The `Stat` entity defines
measurable game properties (strength, fire resistance, movement speed) that both
CharacterClass stat sheets and Item stat sheets reference via FK.

---

## Planned Design (Remaining Work)

### Additional Asset Types

The `Item` entity establishes the factory and stat sheet pattern. Future asset types
follow the same structure:

```
BaseEntityConfigFactory
  └── EnemyConfigFactory          (TBD — enemy asset type)
        ├── BASE_ENTITY_FIELDS
        ├── ASSET_HIERARCHY_FIELDS  (or enemy-specific hierarchy)
        ├── AUDIT_FIELDS
        └── enemy-specific fields   (ai_class, aggro_radius, loot_table_id, …)
```

Asset-specific fields depend on what the game engine needs to render and instantiate
each asset type at runtime.

### Asset-Modifier Eligibility

When a user views an Asset's detail page, the system should show which modifiers can appear
on it. This is exactly the same binding resolution logic used by the Modifier's assignment
panel — the same `prepareAssignmentPanel()` function (or a shared generalisation of it) can
drive the asset-side view.

No new binding tables are needed for the asset side. The existing modifier bindings already
declare which modifiers are eligible in a given subcategory context. An asset in that same
subcategory automatically inherits those declarations.

### Modifier Pool Generation (Future — Game Runtime)

At runtime, when the game engine generates an item instance for a player, it:
1. Looks up the subcategory of the item being generated
2. Queries the binding system for eligible modifiers in that context
3. Selects modifiers based on spawn weights (from modifier tiers)
4. Rolls values within the tier's `min_value`/`max_value` range

This generation logic belongs in the **game runtime**, not in this CMS. The CMS authors
the data that makes generation possible.

---

## What Remains Deferred

The `Item` entity is complete. What remains deferred:

1. **AssetTemplate pattern** — shared modifier pool declarations across asset classes.
   Example: "All Bows use the same eligible modifier list." Individual asset records
   reference a template rather than each declaring their own bindings. Deferred pending
   validation that the direct item→binding model is sufficient for the game runtime.

2. **Non-item asset types** — Enemy assets, Spell assets, Zone assets. Each will follow
   the `ItemConfigFactory` pattern (or a variant of it) once EnemyModifier validates
   the factory extension model.

3. **Modifier pool view on Asset detail** — showing eligible modifiers on an Item's detail
   page reuses `prepareAssignmentPanel()` from the Modifier system. This connection has
   not yet been wired in the L4/L5 view layer for Item.

The correct sequencing was: `Modifier stable (done) → Item entity (done) → EnemyModifier
full vertical (validates factory) → additional asset types`.

---

## AssetTemplate Pattern (Future Consideration)

An AssetTemplate is a class of items that share a modifier pool — for example, "All Bows
use the same eligible modifier list." Individual asset records would reference a template
rather than each declaring their own bindings.

This is a potential future optimisation. It should not be designed into the system before
the simpler direct asset→binding model is proven. Over-designing for templates before
the basic asset model exists would violate the prototype-first principle.

---

## Related Documents

- [PDR-001: Vision & Scope](PDR-001-vision-and-scope.md) — why assets are out of scope for the prototype
- [PDR-003: Database Design](PDR-003-database-design.md) — how assets fit the hierarchy
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — what assets depend on
- [PDR-008: Roadmap](PDR-008-roadmap.md) — when the asset system is planned
