# PDR-006: Asset System (Planned)

**Status:** Planned — not yet implemented  
**Last updated:** 2026-04-23  
**Dependency:** Requires ItemModifier to be stable

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

## Planned Design

### AssetConfigFactory

The Asset entity will use the same factory pattern as ItemModifier:

```
BaseEntityConfigFactory
  └── ItemAssetConfigFactory
        ├── BASE_ENTITY_FIELDS      (universal — id, name, description, sortOrder)
        ├── ASSET_HIERARCHY_FIELDS  (domain molecule — FK chain through taxonomy)
        ├── AUDIT_FIELDS            (universal — createdAt, updatedAt)
        └── asset-specific fields   (asset_class, rarity, base_stats, visual_id)
```

Asset-specific fields are still TBD — they depend on what the game engine needs to
render and instantiate an asset at runtime.

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

## Why Assets Must Wait

The asset system depends on the modifier system being stable because:

1. The asset detail page's modifier-pool view reuses the binding resolution logic —
   that logic must be proven correct in the modifier context first
2. The `AssetConfigFactory` will compose domain molecules that may need to be extracted
   from the `ItemModifierConfigFactory` — that extraction should happen after the modifier
   factory is fully operational
3. Adding assets before the modifier factory extension model (EnemyModifier) is validated
   would mean building on an unproven abstraction

The correct sequencing is: `ItemModifier stable → EnemyModifier (validates factory) →
AssetFactory (uses proven pattern)`.

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
