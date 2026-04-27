# LAYER-000: Layer 0 — Configuration Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 0 at a Glance

Layer 0 (Configuration) is the foundation of the entire system. It owns active behavior
definitions for all other layers — field types, constraints, display formats, relationships,
permissions, and table names. It imports from nothing. Every other layer imports from it.

> **Key rule:** L0 imports from nothing. Every other layer imports from L0. A change in L0
> propagates upward through all layers without requiring changes to any of them.

Configuration is built bottom-up through four levels:

```
Sub-atoms  — primitive constraints (minLength, min/max ranges, display format strings)
    ↓
Atoms      — complete FieldConfig objects for named fields (id, name, machine_name, etc.)
    ↓
Molecules  — grouped field arrays shared across entities (BASE_ENTITY_FIELDS, AUDIT_FIELDS)
    ↓
Factories  — EntityConfig objects assembled from molecules + entity-specific fields
```

When you change a field's `maxLength` in a sub-atom, L1 validation, L3 TypeBox schema,
and L6 browser validation all update automatically — because they all read from the same
config object. This is the **write-once-share-everywhere** principle enforced architecturally.

---

## Directory Map

```
src/config/
├── types/                    — FieldConfig, EntityConfig, RelationshipConfig, BrowserFieldConfig
│
├── universal/
│   ├── sub-atoms/            — smallest reusable fragments: constraints, markers, enum values
│   ├── atoms/                — complete FieldConfig objects for named fields
│   └── molecules/            — grouped field arrays shared across ALL entities
│
├── molecules/
│   └── modifier/             — domain molecules shared across all modifier-type entities
│
├── factories/                — abstract BaseEntityConfigFactory + generic sub-entity factories
│
└── entities/                 — concrete config factories, one directory per entity
    ├── game-domain/
    ├── game-subdomain/
    ├── game-category/
    ├── game-subcategory/
    ├── stat/
    ├── character-class/
    ├── character-stat-base/
    ├── formula/
    ├── item/
    ├── item-stat-base/
    ├── modifier/
    ├── modifier-tier/
    ├── item-modifier-binding/
    └── enemy-modifier-binding/
```

**Distinction between `universal/molecules/` and `molecules/modifier/`:**
Universal molecules belong to every entity (all entities have audit fields, all entities have
standard permissions). Domain molecules (`modifier/`) belong only to entities in that domain
— Modifier, ItemModifierBinding, and EnemyModifierBinding use them now; future modifier
domains (SpellModifier, ZoneModifier) will reuse them unchanged.

---

## Types Layer — `src/config/types/`

These are pure TypeScript type definitions. No logic, no runtime values. Everything else in
L0 (and all upstream layers) is typed against these interfaces.

### `field-config.ts`

The root type system. Every field in every entity is typed as one discriminant of `FieldConfig`.

| Export | Kind | Purpose |
|---|---|---|
| `FieldType` | type union | `"string" \| "integer" \| "decimal" \| "boolean" \| "reference" \| "enum" \| "uuid" \| "timestamp"` |
| `DisplayFormat` | type union | `"text" \| "textarea" \| "number" \| "toggle" \| "datetime" \| "select" \| "hidden"` |
| `BaseFieldConfig` | interface | Properties common to all fields: `name`, `label`, `type`, `required`, `editable`, `showInList`, `listOrder`, `displayFormat`, `isPrimaryDisplay` |
| `StringFieldConfig` | interface | Extends `BaseFieldConfig` — adds `minLength`, `maxLength`, `pattern?` |
| `IntegerFieldConfig` | interface | Extends `BaseFieldConfig` — adds `min`, `max` |
| `DecimalFieldConfig` | interface | Extends `BaseFieldConfig` — adds `precision`, `scale`, `min?`, `max?` |
| `BooleanFieldConfig` | interface | Extends `BaseFieldConfig` — no extra constraints |
| `TimestampFieldConfig` | interface | Extends `BaseFieldConfig` — adds `autoSet: 'create' \| 'update' \| 'none'` |
| `UuidFieldConfig` | interface | Extends `BaseFieldConfig` — adds `autoGenerate: boolean` |
| `ReferenceFieldConfig` | interface | Extends `BaseFieldConfig` — adds `referencedEntity`, `displayField` |
| `EnumFieldConfig` | interface | Extends `BaseFieldConfig` — adds `values: readonly string[]` |
| `FieldConfig` | discriminated union | Union of all 8 interfaces, discriminated on `type` |

**The discriminated union is the workhorse.** L1 validate/serialize/deserialize, L3
`deriveBodySchema`, and L6 browser validation all switch on `field.type` to handle each
case. Adding a new `FieldType` requires updating all four of those call sites.

### `entity-config.ts`

Defines the shape that all entity config factories produce.

| Export | Kind | Purpose |
|---|---|---|
| `PermissionLevel` | type union | `"public" \| "authenticated" \| "admin"` |
| `CrudOperations` | type union | `"create" \| "read" \| "update" \| "delete"` |
| `PermissionConfig` | type | `Record<CrudOperations, PermissionLevel>` |
| `EntityConfig` | interface | Complete entity descriptor: `entityName`, `tableName`, `displayName`, `pluralDisplayName`, `fields: FieldConfig[]`, `permissions: PermissionConfig`, `relationships?: RelationshipConfig[]`, `nonColumnKeys?: string[]` |

**`nonColumnKeys`** is critical: it lists virtual form fields that exist in HTML forms but
are not DB columns (e.g., `tiers_json`, `status_action`, `status_reason`). L2 Model Service
strips these before building SQL INSERT/UPDATE statements.

### `relationship-config.ts`

ORM relationship metadata — enables implicit FK association without loading logic.

| Export | Kind | Purpose |
|---|---|---|
| `RelationshipType` | type union | `"belongsTo" \| "hasMany" \| "hasOne"` |
| `RelationshipConfig` | interface | `name`, `type: RelationshipType`, `targetEntity`, `foreignKey`, `inverse?` |

Used by hierarchy entities (GameDomain → GameSubdomain → GameCategory → GameSubcategory)
to declare parent–child associations. L1 Model reads these for join resolution.

### `browser-field-config.ts`

Single source of truth for the field shape serialized to JSON and embedded in HTML for
the browser layer. Stripped-down version of `FieldConfig` — only what the browser needs.

| Export | Kind | Purpose |
|---|---|---|
| `BrowserFieldConfig` | interface | `name`, `label`, `type: FieldType`, `required`, `constraints?` (min/max/minLength/maxLength/pattern/precision/scale), `values?` (enum options) |

L4 View Service serializes this to JSON. L6 Browser deserializes it for form rendering
and client-side validation. Keeping it as a single interface prevents browser/server drift.

### `index.ts`

Barrel re-export of all four files above.

---

## Universal Sub-Atoms — `src/config/universal/sub-atoms/`

Sub-atoms are the smallest reusable configuration fragments. They are spread (via `...`)
into atoms. Change a sub-atom once and every atom that uses it updates automatically.

### `string-constraints.ts`

| Export | Value | Use when |
|---|---|---|
| `STRING_CONSTRAINTS_STANDARD` | `{ minLength: 3, maxLength: 255 }` | Names, titles, codes |
| `STRING_CONSTRAINTS_SHORT` | `{ minLength: 3, maxLength: 50 }` | Slugs, abbreviations, machine names |
| `STRING_CONSTRAINTS_LONG` | `{ minLength: 3, maxLength: 5000 }` | Descriptions, templates |
| `STRING_CONSTRAINTS` | grouped object | `{ standard, short, long }` |

### `integer-constraints.ts`

| Export | Value | Use when |
|---|---|---|
| `INTEGER_CONSTRAINTS_STANDARD` | `{ min: 0, max: 2_147_483_647 }` | Non-negative counts, weights |
| `INTEGER_CONSTRAINTS_POSITIVE` | `{ min: 1, max: 2_147_483_647 }` | Required positive (level, tier index) |
| `INTEGER_CONSTRAINTS_PERCENTAGE` | `{ min: 0, max: 100 }` | Percentage values |
| `INTEGER_CONSTRAINTS_SIGNED` | `{ min: -2_147_483_648, max: 2_147_483_647 }` | Stats/values that can be negative (resistances, debuffs) |
| `INTEGER_CONSTRAINTS` | grouped object | `{ standard, positive, percentage, signed }` |

**Why signed matters:** `stat.default_value` and all modifier value fields use signed
constraints — resistances can reach negative values (e.g., fire resistance at −100%).

### `field-markers.ts`

Property bundles spread into atom definitions to set common combinations of flags.

| Export | Properties set | Use when |
|---|---|---|
| `FIELD_MARKER_REQUIRED` | `{ required: true }` | Field must have a value |
| `FIELD_MARKER_OPTIONAL` | `{ required: false }` | Field may be empty |
| `FIELD_MARKER_SYSTEM` | `{ required: true, editable: false, showInList: false }` | Auto-managed field hidden from forms |
| `FIELD_MARKER_PRIMARY` | `{ isPrimaryDisplay: true, showInList: true }` | Main display field shown in list views |
| `FIELD_MARKERS` | grouped object | `{ required, optional, system, primary }` |

### `display-formats.ts`

UI rendering hints. Each is a single-property object spread into atom definitions.

| Export | Value | Renders as |
|---|---|---|
| `DISPLAY_FORMAT_TEXT` | `{ displayFormat: "text" }` | `<input type="text">` |
| `DISPLAY_FORMAT_TEXTAREA` | `{ displayFormat: "textarea" }` | `<textarea>` |
| `DISPLAY_FORMAT_NUMBER` | `{ displayFormat: "number" }` | `<input type="number">` |
| `DISPLAY_FORMAT_TOGGLE` | `{ displayFormat: "toggle" }` | Toggle switch |
| `DISPLAY_FORMAT_DATETIME` | `{ displayFormat: "datetime" }` | Datetime display |
| `DISPLAY_FORMAT_SELECT` | `{ displayFormat: "select" }` | `<select>` dropdown |
| `DISPLAY_FORMAT_HIDDEN` | `{ displayFormat: "hidden" }` | `<input type="hidden">` |
| `DISPLAY_FORMATS` | grouped object | All 7 formats |

### `stat-categories.ts`

Semantic groupings for the `stat.category` enum field.

| Export | Value | Meaning |
|---|---|---|
| `STAT_CATEGORY_ATTRIBUTE` | `"attribute"` | Core character attributes (strength, dexterity) |
| `STAT_CATEGORY_RESOURCE` | `"resource"` | Pools (health, mana, stamina) |
| `STAT_CATEGORY_OFFENSIVE` | `"offensive"` | Attack/damage stats |
| `STAT_CATEGORY_DEFENSIVE` | `"defensive"` | Defense/resistance stats |
| `STAT_CATEGORY_UTILITY` | `"utility"` | Movement, cooldown, utility stats |
| `STAT_CATEGORIES` | grouped object | All 5 categories |
| `StatCategory` | type union | `"attribute" \| "resource" \| "offensive" \| "defensive" \| "utility"` |

### `stat-data-types.ts`

How a stored integer value is interpreted at runtime.

| Export | Value | Interpretation |
|---|---|---|
| `STAT_DATA_TYPE_RAW` | `"raw"` | Final value as stored (e.g., 100 = 100 HP) |
| `STAT_DATA_TYPE_PERCENTAGE` | `"percentage"` | Percentage (e.g., 40 = 40%) |
| `STAT_DATA_TYPE_MULTIPLIER` | `"multiplier"` | Scaled by 100 (e.g., 110 = 1.1×) |
| `STAT_DATA_TYPES` | grouped object | All 3 types |
| `StatDataType` | type union | `"raw" \| "percentage" \| "multiplier"` |

### `combination-types.ts`

Modifier math buckets following the Path of Exile formula:
`final = (base + Σflat) × (1 + Σincreased) × Πmore`

| Export | Value | Formula role |
|---|---|---|
| `COMBINATION_TYPE_FLAT` | `"flat"` | Added before multipliers |
| `COMBINATION_TYPE_INCREASED` | `"increased"` | Additive within bucket, applied as percentage |
| `COMBINATION_TYPE_MORE` | `"more"` | Independent multiplicative — stacks with other `more` modifiers |
| `COMBINATION_TYPES` | grouped object | All 3 types |
| `CombinationType` | type union | `"flat" \| "increased" \| "more"` |

### `roll-shapes.ts`

Whether a modifier produces a single frozen value or preserves a live min–max range.

| Export | Value | Meaning |
|---|---|---|
| `ROLL_SHAPE_SCALAR` | `"scalar"` | Single frozen value at roll time (e.g., "+30% increased life") |
| `ROLL_SHAPE_RANGE` | `"range"` | Live min–max preserved (e.g., "adds 5–10 fire damage") |
| `ROLL_SHAPES` | grouped object | Both shapes |
| `RollShape` | type union | `"scalar" \| "range"` |

### `index.ts`

Barrel re-export of all sub-atom files.

---

## Universal Atoms — `src/config/universal/atoms/`

Atoms are complete `FieldConfig` objects for a single named field. Each atom is ready to
spread directly into a `buildFields()` return array.

| Atom file | `name` | `type` | Required | In list | Key constraint | Used by |
|---|---|---|---|---|---|---|
| `id-field-atom.ts` | `id` | uuid | true | false | `autoGenerate: true`, hidden | ALL entities |
| `name-field-atom.ts` | `name` | string | true | true | standard (3–255), `isPrimaryDisplay: true` | Most entities |
| `description-field-atom.ts` | `description` | string | false | false | long (3–5000), textarea | Most entities |
| `machine-name-field-atom.ts` | `machine_name` | string | true | true | short (3–50), pattern `^[a-z][a-z0-9_]*$` | All entities with stable identifiers |
| `is-active-field-atom.ts` | `is_active` | boolean | true | true | default true, listOrder 100 | BASE_ENTITY_FIELDS, MODIFIER_STATUS_FIELDS |
| `sort-order-field-atom.ts` | `sort_order` | integer | false | true | 0–99999, default 1000 | Hierarchy entities (display ordering) |
| `created-at-field-atom.ts` | `created_at` | timestamp | true | false | `autoSet: 'create'`, system | AUDIT_FIELDS — ALL entities |
| `updated-at-field-atom.ts` | `updated_at` | timestamp | true | false | `autoSet: 'update'`, system | AUDIT_FIELDS — ALL entities |
| `game-domain-ref-field-atom.ts` | `game_domain_id` | reference | true | true | FK → GameDomain, select | MODIFIER_HIERARCHY_FIELDS, hierarchy entities |
| `game-subdomain-ref-field-atom.ts` | `game_subdomain_id` | reference | true | false | FK → GameSubdomain, select | MODIFIER_HIERARCHY_FIELDS, hierarchy entities |
| `game-category-ref-field-atom.ts` | `game_category_id` | reference | true | false | FK → GameCategory, select | MODIFIER_HIERARCHY_FIELDS, hierarchy entities |
| `game-subcategory-ref-field-atom.ts` | `game_subcategory_id` | reference | true | false | FK → GameSubcategory, select | MODIFIER_HIERARCHY_FIELDS, Modifier config |
| `stat-value-min-field-atom.ts` | `value_min` | integer | true | false | signed (−2B to +2B) | Stat config |
| `stat-value-max-field-atom.ts` | `value_max` | integer | true | false | signed (−2B to +2B) | Stat config |
| `stat-default-value-field-atom.ts` | `default_value` | integer | true | false | signed (−2B to +2B) | Stat config |
| `stat-data-type-field-atom.ts` | `data_type` | enum | true | true | values: raw/percentage/multiplier | Stat config |
| `stat-category-field-atom.ts` | `category` | enum | true | true | values: attribute/resource/offensive/defensive/utility | Stat config |
| `target-stat-id-field-atom.ts` | `target_stat_id` | reference | true | true | FK → Stat, select | Modifier config |
| `combination-type-field-atom.ts` | `combination_type` | enum | true | false | values: flat/increased/more | Modifier config |
| `roll-shape-field-atom.ts` | `roll_shape` | enum | true | false | values: scalar/range | Modifier config |
| `modifier-value-min-field-atom.ts` | `value_min` | integer | true | false | signed (−2B to +2B) | Modifier config |
| `modifier-value-max-field-atom.ts` | `value_max` | integer | true | false | signed (−2B to +2B) | Modifier config |
| `modifier-group-field-atom.ts` | `modifier_group` | string | true | false | short (3–50) | Modifier config |
| `display-template-field-atom.ts` | `display_template` | string | true | false | long (3–5000), textarea | Modifier config |
| `affix-type-field-atom.ts` | `affix_type` | enum | true | true | values: prefix/suffix, listOrder 20 | ItemModifierBinding config |
| `character-id-field-atom.ts` | `character_id` | reference | true | false | FK → CharacterClass, hidden | CharacterStatBase config |
| `stat-id-field-atom.ts` | `stat_id` | reference | true | false | FK → Stat, hidden | CharacterStatBase config, ItemStatBase config |
| `item-id-field-atom.ts` | `item_id` | reference | true | false | FK → Item, hidden | ItemStatBase config |

### `index.ts`

Barrel re-export of all atom files.

---

## Universal Molecules — `src/config/universal/molecules/`

Molecules are named field arrays. One import, multiple fields. They represent groupings that
belong together conceptually and appear in the same position within every entity that uses them.

### `base-entity-fields.ts`

```
BASE_ENTITY_FIELDS = [
  MACHINE_NAME_FIELD_ATOM,   // machine_name — stable programmatic identifier
  NAME_FIELD_ATOM,           // name — human-readable display name
  DESCRIPTION_FIELD_ATOM,    // description — optional long-form text
  IS_ACTIVE_FIELD_ATOM,      // is_active — live/disabled toggle
]
```

**Used by:** GameDomain, GameSubdomain, GameCategory, GameSubcategory (all 4 taxonomy entities).
**Not used by:** Modifier entities (they group `is_active` separately via MODIFIER_STATUS_FIELDS
to keep lifecycle fields distinct from core identity fields).

**Layer reads:** L1 validation (required/type/length), L4 view service (form fields, list columns),
L6 browser (form rendering, client validation).

### `audit-fields.ts`

```
AUDIT_FIELDS = [
  CREATED_AT_FIELD_ATOM,     // created_at — auto-set on INSERT, system-managed
  UPDATED_AT_FIELD_ATOM,     // updated_at — auto-set on UPDATE, system-managed
]
```

**Used by:** ALL entities without exception. Always the last items in `buildFields()`.
**Layer reads:** L1 serializer (knows to auto-set on create/update), L4 view service (detail view
shows audit timestamps).

### `archive-fields.ts`

```
ARCHIVE_FIELDS = [
  { name: "archived_at", type: "timestamp", ... },    // when archived, null if active
  { name: "archived_reason", type: "string", ... },   // reason text, null if active
]
```

**Used by:** GameDomain, GameSubdomain, GameCategory, GameSubcategory, Stat, CharacterClass, Item.
**Not used by:** Formula, CharacterStatBase, ItemStatBase (no archive lifecycle on these).
**Modifier entities use:** `MODIFIER_ARCHIVE_FIELDS` from `molecules/modifier/` (same shape,
separate molecule to keep modifier domain self-contained).
**Layer reads:** L2 Model Service `applyStatusAction()` workflow sets/clears these fields.

### `standard-permissions.ts`

```
STANDARD_PERMISSIONS = {
  create: "admin",
  read:   "public",
  update: "admin",
  delete: "admin",
}
```

**Used by:** ALL entities — none currently override this default.
**Layer reads:** L3 Controller authorization middleware checks `config.permissions[operation]`.

### `index.ts`

Barrel re-export of all four molecule files.

---

## Domain Molecules — `src/config/molecules/modifier/`

Domain molecules belong only to modifier-type entities. The pattern is: Modifier and its
binding sub-entities (ItemModifierBinding, EnemyModifierBinding) use them today; future
modifier domains (SpellModifier, ZoneModifier) will reuse them unchanged.
This is the **open for extension** principle at the config layer.

### `code-field.ts`

```
MODIFIER_MACHINE_NAME_FIELD_ATOM = {
  name: "machine_name", type: "string",
  minLength: 3, maxLength: 100,
  pattern: "^[a-z0-9_]+$"   // note: allows digits at start (differs from universal machine_name)
}
```

Machine-readable slug identifying the modifier type for engine dispatch (e.g., `fire_res`,
`str_req`, `bleed_chance`). Extracted here so all modifier domains share identical semantics.

### `hierarchy-fields.ts`

```
MODIFIER_HIERARCHY_FIELDS = [
  GAME_DOMAIN_REF_FIELD_ATOM,       // game_domain_id — FK to GameDomain
  GAME_SUBDOMAIN_REF_FIELD_ATOM,    // game_subdomain_id — FK to GameSubdomain
  GAME_CATEGORY_REF_FIELD_ATOM,     // game_category_id — FK to GameCategory
  GAME_SUBCATEGORY_REF_FIELD_ATOM,  // game_subcategory_id — FK to GameSubcategory
]
```

Four FK refs connecting every modifier type to the full five-level taxonomy. One import
spreads all four — single source of truth for modifier hierarchy structure. Any new modifier
domain gets the full hierarchy for free.

### `status-fields.ts`

```
MODIFIER_STATUS_FIELDS = [
  IS_ACTIVE_FIELD_ATOM,    // is_active — modifier live/disabled toggle
]
```

Single-field molecule. Kept separate from `archive-fields` because active/disabled is an
in-use runtime flag, while archive fields are the deferred observability/soft-delete layer.

### `archive-fields.ts`

```
MODIFIER_ARCHIVE_FIELDS = [
  { name: "archived_at", type: "timestamp", ... },
  { name: "archived_reason", type: "string", ... },
]
```

Same shape as `universal/molecules/archive-fields.ts` but kept in the modifier domain to
keep modifier configs self-contained. L2 `applyStatusAction()` sets/clears these.

### `binding-fields.ts`

```
MODIFIER_BINDING_FIELDS = [
  target_type,        // enum: "category" | "subcategory" — scope level of binding
  target_id,          // FK UUID — references the category or subcategory row
  is_included,        // boolean toggle — included vs. excluded from this scope
  weight_override,    // integer 0–10000 — overrides parent spawn weight for this scope
  min_tier_index,     // integer — minimum tier eligible in this scope
  max_tier_index,     // integer — maximum tier eligible in this scope
  level_req_override, // integer 1–99 — overrides level requirement for this scope
  is_active,          // boolean toggle — whether this binding rule is active
]
```

8 fields shared by all modifier binding sub-entities. Used by `ModifierBindingConfigFactory`
(generic) which prepends the parent FK before spreading these.

### `tiers-fields.ts`

```
MODIFIER_TIERS_FIELDS = [
  tier_index,   // integer 0–999 — position in tier ladder (0 = weakest)
  min_value,    // decimal (precision 12, scale 4) — lower bound of rolled value
  max_value,    // decimal (precision 12, scale 4) — upper bound of rolled value
  level_req,    // integer 1–99, default 1 — minimum character level to roll this tier
  spawn_weight, // integer 0–10000, default 100 — relative probability weight
]

MODIFIER_TIER_FORM_META = [...]   // browser form widget config (excludes tier_index — browser-managed)
```

5 DB fields shared by all modifier tier sub-entities. `MODIFIER_TIER_FORM_META` is a
parallel export containing the browser-side form widget configuration for the inline tier
editor — it excludes `tier_index` because the browser manages index assignment automatically.

Note: `min_value` and `max_value` are `decimal` type (not `integer`) to support fractional
multipliers (e.g., 1.15× for a tier that gives +15% increased life).

### `lifecycle-fields.ts` — **RETIRED**

This file previously exported `MODIFIER_LIFECYCLE_FIELDS` as a combined status + archive
array. It has been split into `status-fields.ts` and `archive-fields.ts`. The file exports
nothing. Nothing should import it. It remains as a tombstone for historical reference.

### `index.ts`

Barrel re-export of all modifier molecule files.

---

## Factories — `src/config/factories/`

Factories are the top of the L0 composition hierarchy. They assemble molecules and
entity-specific fields into a complete `EntityConfig` object.

### `base-entity-config-factory.ts`

Abstract base class. All entity config factories extend this. Uses the **Template Method**
design pattern: `create()` is the final algorithm; subclasses fill in the pieces.

| Method | Abstract? | Returns | Purpose |
|---|---|---|---|
| `create()` | No (final) | `EntityConfig` | Template method — assembles all pieces into the config object |
| `getEntityName()` | **YES** | `string` | PascalCase entity name (e.g., `"ItemModifier"`) |
| `getDisplayName()` | **YES** | `string` | Human-readable singular (e.g., `"Item Modifier"`) |
| `getPluralDisplayName()` | **YES** | `string` | Human-readable plural (e.g., `"Item Modifiers"`) |
| `getPermissions()` | **YES** | `PermissionConfig` | CRUD permission levels — almost always returns `STANDARD_PERMISSIONS` |
| `buildFields()` | **YES** | `FieldConfig[]` | Ordered field array — must be fully explicit, no inherited defaults |
| `getTableName()` | No (concrete) | `string` | Derives snake_case from `getEntityName()` via `toSnakeCase()` |
| `getRelationships()` | No (hook) | `RelationshipConfig[]` | Returns `[]` — override to declare FK relationships |
| `getNonColumnKeys()` | No (hook) | `string[]` | Returns `[]` — override to declare virtual form fields |
| `toSnakeCase()` | No (private) | `string` | Converts `PascalCase` → `snake_case` for table name derivation |

**Why `buildFields()` has no inherited defaults:** Field ordering is explicit contract. Every
entity declares its complete field composition. This prevents accidental field inheritance
and makes the config fully readable without tracing parent classes.

### `modifier-tier-config-factory.ts`

Generic factory parameterized by parent entity. Used once per modifier domain.

```typescript
// Usage pattern:
export const MODIFIER_TIER_CONFIG =
  new ModifierTierConfigFactory("Modifier", "modifier").create()

// Produces fields:
[ID, modifier_id (FK hidden), ...MODIFIER_TIERS_FIELDS, ...AUDIT_FIELDS]
// = 9 fields total
```

The two string parameters wire the FK column label and referenced table automatically.

### `modifier-binding-config-factory.ts`

Generic factory for modifier binding sub-entity configuration. Takes 4 parameters:

```typescript
new ModifierBindingConfigFactory(
  parentEntityName: string,    // FK label (e.g. "Modifier")
  parentTableName: string,     // FK referenced table (e.g. "modifier")
  additionalFields: FieldConfig[] = [],  // asset-specific fields (e.g. [AFFIX_TYPE_FIELD_ATOM])
  bindingEntityName?: string,  // binding entity name — decouples table name from parent name
)
```

The 4th `bindingEntityName` parameter is critical when multiple binding types share the
same parent entity. Without it, both `ItemModifierBinding` and `EnemyModifierBinding` would
derive the same table name from "Modifier" → "modifier_binding" (wrong). With it:

```typescript
// Item binding — table: item_modifier_binding, adds affix_type
new ModifierBindingConfigFactory("Modifier", "modifier", [AFFIX_TYPE_FIELD_ATOM], "ItemModifierBinding")
// → entityName: "ItemModifierBinding", tableName: "item_modifier_binding", 13 fields

// Enemy binding — table: enemy_modifier_binding, no additional fields
new ModifierBindingConfigFactory("Modifier", "modifier", [], "EnemyModifierBinding")
// → entityName: "EnemyModifierBinding", tableName: "enemy_modifier_binding", 12 fields
```

Base produces: `[ID, modifier_id (FK hidden), ...MODIFIER_BINDING_FIELDS, ...additionalFields, ...AUDIT_FIELDS]`

### `index.ts`

Barrel re-export of both factory files.

---

## Entity Config Factories — `src/config/entities/`

One directory per entity, one config factory file per directory. The singleton `ENTITY_CONFIG`
export is what all upstream layers import.

| Entity | Config singleton | Fields (count) | FK parents | `nonColumnKeys` |
|---|---|---|---|---|
| `GameDomain` | `GAME_DOMAIN_CONFIG` | ID + BASE_ENTITY_FIELDS + ARCHIVE + AUDIT = **9** | none | `status_action`, `status_reason` |
| `GameSubdomain` | `GAME_SUBDOMAIN_CONFIG` | ID + domain_ref + BASE + ARCHIVE + AUDIT = **10** | GameDomain | `status_action`, `status_reason` |
| `GameCategory` | `GAME_CATEGORY_CONFIG` | ID + domain_ref + subdomain_ref + BASE + ARCHIVE + AUDIT = **11** | GameDomain, GameSubdomain | `status_action`, `status_reason` |
| `GameSubcategory` | `GAME_SUBCATEGORY_CONFIG` | ID + domain_ref + subdomain_ref + category_ref + BASE + ARCHIVE + AUDIT = **12** | GameDomain, GameSubdomain, GameCategory | `status_action`, `status_reason` |
| `Stat` | `STAT_CONFIG` | ID + machine_name + name + desc + data_type + value_min + value_max + default_value + category + is_active + ARCHIVE + AUDIT = **14** | none | `status_action`, `status_reason` |
| `CharacterClass` | `CHARACTER_CLASS_CONFIG` | ID + machine_name + name + desc + is_active + ARCHIVE(2) + AUDIT(2) = **9** | none | `stat_sheet_json`, `status_action`, `status_reason` |
| `Formula` | `FORMULA_CONFIG` | ID + name + output_stat_id + expression + desc + AUDIT = **7** | Stat (output) | none |
| `CharacterStatBase` | `CHARACTER_STAT_BASE_CONFIG` | ID + character_id + stat_id + combination_type + base_value + AUDIT(2) = **7** | CharacterClass, Stat | none |
| `Item` | `ITEM_CONFIG` | ID + MODIFIER_HIERARCHY(4) + machine_name + name + desc + is_active + ARCHIVE(2) + AUDIT(2) = **13** | GameDomain, GameSubdomain, GameCategory, GameSubcategory | `stat_sheet_json`, `status_action`, `status_reason` |
| `ItemStatBase` | `ITEM_STAT_BASE_CONFIG` | ID + item_id + stat_id + combination_type + base_value + AUDIT(2) = **7** | Item, Stat | none |
| `Modifier` | `MODIFIER_CONFIG` | ID + MODIFIER_HIERARCHY(4) + machine_name + name + desc + target_stat_id + combination_type + roll_shape + value_min + value_max + modifier_group + display_template + is_active + MODIFIER_ARCHIVE(2) + AUDIT(2) = **20** | GameDomain, GameSubdomain, GameCategory, GameSubcategory | `tiers_json`, `tiers`, `status_action`, `status_reason` |
| `ModifierTier` | `MODIFIER_TIER_CONFIG` | → delegates to `ModifierTierConfigFactory("Modifier", "modifier")` = **9** | Modifier | (generic factory handles) |
| `ItemModifierBinding` | `ITEM_MODIFIER_BINDING_CONFIG` | → delegates to `ModifierBindingConfigFactory` + `AFFIX_TYPE_FIELD_ATOM` = **13** | Modifier | (generic factory handles) |
| `EnemyModifierBinding` | `ENEMY_MODIFIER_BINDING_CONFIG` | → delegates to `ModifierBindingConfigFactory` (no additional fields) = **12** | Modifier | (generic factory handles) |

**Field order convention** (enforced by `buildFields()` implementations):
```
ID → FK parents (hierarchy order: domain → subdomain → category → subcategory)
   → core identity (machine_name, name, description)
   → domain-specific fields
   → lifecycle (is_active, archived_at, archived_reason)
   → audit (created_at, updated_at)
```

---

## Cross-Layer Dependency Map

L0 is the only layer with zero imports. Every other layer imports from it.

```
L0 Configuration — src/config/
        │
        │  EntityConfig, FieldConfig, RelationshipConfig
        ▼
L1 Model — src/model/
  • validate-entity     reads fields[] → enforces required, type, length, range
  • serialize-entity    reads field.type → decimal→string, boolean→native bool
  • deserialize-entity  reads field.type → decimal string→Number(), boolean type check
  • build-select-query  reads tableName, fields[] (quoted camelCase for PostgreSQL)
  • build-insert-query  reads tableName, fields[], skips uuid(autoGenerate) & autoSet timestamps
  • build-update-query  reads tableName, fields[], nonColumnKeys → strips virtual fields
        │
        │  EntityConfig
        ▼
L2 Model Service — src/model-service/
  • select-entity-workflow      reads tableName, fields[], nonColumnKeys for CRUD orchestration
  • create-entity-workflow      passes EntityConfig to L1 insert query builder
  • update-entity-workflow      passes EntityConfig to L1 update query builder (strips nonColumnKeys)
  • applyStatusAction()         reads archive field names (archived_at, archived_reason) from config
        │
        │  EntityConfig, FieldConfig, PermissionConfig
        ▼
L3 Controller — src/controller/
  • derive-body-schema   reads FieldConfig discriminated union → TypeBox schemas for Elysia validation
  • authorize middleware reads config.permissions[operation] → "admin" | "public" | "authenticated"
  • createCrudRoutes     reads config for route setup, schema derivation, permission checks
        │
        │  EntityConfig, BrowserFieldConfig
        ▼
L4 View Service — src/view-service/
  • prepareListView      reads fields[], showInList, listOrder, isPrimaryDisplay
  • prepareDetailView    reads all fields[] for full-record display
  • prepareCreateForm    reads fields[], editable, required; serializes BrowserFieldConfig to JSON
  • prepareEditForm      reads fields[], current values; serializes BrowserFieldConfig to JSON
  • prepareFilteredListView reads fields[] with filter/pagination support
        │
        │  BrowserFieldConfig (deserialized from JSON embedded in HTML)
        ▼
L6 Browser — src/browser/
  • entity-routes.ts     reads entity machine names + display names for URL routing config
  • form validation      reads constraints (min/max, minLength/maxLength, pattern, required)
  • form rendering       reads displayFormat → text/textarea/number/toggle/select/hidden
  • enum rendering       reads values[] → builds select option lists
```

**Note:** L5 View does not directly import L0. It receives prepared data from L4 View Service
and renders it. L0 influences L5 only indirectly through L4's field ordering and labels.

---

## Workflows

### Feature Development: Adding a New Entity

**All work in this workflow starts and ends at L0 before any other layer is touched.**

1. Create `src/config/entities/{entity-name}/{entity-name}-config-factory.ts`
2. Extend `BaseEntityConfigFactory`, implement the 5 abstract methods:
   - `getEntityName()` → `"EntityName"` (PascalCase)
   - `getDisplayName()` → `"Entity Name"` (human readable)
   - `getPluralDisplayName()` → `"Entity Names"`
   - `getPermissions()` → `return STANDARD_PERMISSIONS` (unless policy differs)
   - `buildFields()` → compose molecules + entity-specific fields in field-order convention
3. If entity supports archive lifecycle: add `...ARCHIVE_FIELDS` and `getNonColumnKeys()` returning `["status_action", "status_reason"]`
4. If entity has FK relationships: implement `getRelationships()` returning `RelationshipConfig[]`
5. Export singleton: `export const ENTITY_CONFIG = new EntityConfigFactory().create()`
6. Add barrel re-export to `src/config/entities/index.ts`
7. **Run `bun run typecheck`** — zero errors before touching any other layer

Once L0 passes typecheck, proceed layer by layer: L1 → L2 → L3 → L4 → L5 → L6.
The L1 universal model, L2 universal workflows, and L3 `createCrudRoutes` all read from
`EntityConfig` — in many cases zero additional code is needed in those layers.

---

### Feature Development: Adding a New Field to an Existing Entity

1. **Check universals first** — grep `src/config/universal/atoms/` for existing atoms that match:
   ```bash
   grep -r "name.*machine_name" src/config/universal/atoms/ --include="*.ts"
   ```
   If a universal atom already covers this field: add it to `buildFields()`. Done — skip to step 6.

2. **Decide where the new field lives:**
   - Shared across all modifier types → `src/config/molecules/modifier/`
   - Reusable across multiple entity types → `src/config/universal/atoms/`
   - Entity-specific (only this one entity) → inline in `buildFields()`

3. **If new constraints are needed** → add to `src/config/universal/sub-atoms/` and export from barrel

4. **Add to `buildFields()`** — respect field order: ID → FKs → core → domain-specific → lifecycle → audit

5. **If the field is a virtual form field** (not a DB column) → add its name to `getNonColumnKeys()`

6. **Write migration** — every new DB column needs a migration file in `migrations/`

7. **Run `bun run typecheck`**

8. **L1 impact** — validate/serialize/deserialize/query-build all read config automatically.
   No code change needed unless the new field uses a brand-new `FieldType` discriminant (rare).

9. **L4 impact** — form and list views auto-include the field via field config iteration.
   Change only needed if custom display logic is required.

10. **L6 impact** — browser validation reads `BrowserFieldConfig` automatically.
    Change only needed for non-standard input types.

---

### Feature Development: Adding a New Modifier Domain (e.g., EnemyModifier)

The modifier domain molecules handle the heavy lifting. The new domain gets hierarchy,
lifecycle, tiers, and bindings for free.

1. Create `src/config/entities/enemy-modifier/enemy-modifier-config-factory.ts`:
   ```typescript
   buildFields(): FieldConfig[] {
     return [
       ID_FIELD_ATOM,
       ...MODIFIER_HIERARCHY_FIELDS,
       MODIFIER_MACHINE_NAME_FIELD_ATOM,
       NAME_FIELD_ATOM,
       DESCRIPTION_FIELD_ATOM,
       // enemy-specific fields inline here
       ...MODIFIER_STATUS_FIELDS,
       ...MODIFIER_ARCHIVE_FIELDS,
       ...AUDIT_FIELDS,
     ]
   }
   getNonColumnKeys() {
     return ["tiers_json", "tiers", "status_action", "status_reason"]
   }
   ```

2. Create tier config: `new ModifierTierConfigFactory("Modifier", "modifier").create()` (shared parent)
3. Create binding config: `new ModifierBindingConfigFactory("Modifier", "modifier", [...fields], "EnemyModifierBinding").create()`
4. Export all three singletons, add to entity barrel

The generic factories handle all subordinate entity structure. No changes to existing code.

---

### Feature Development: Adding a New FieldType Discriminant

This is a **cross-layer change**. Only proceed if none of the 8 existing discriminants fits.

1. **L0** — `field-config.ts`: add to `FieldType` union, create new `{Type}FieldConfig` interface, add to `FieldConfig` discriminated union
2. **L0** — Update `BrowserFieldConfig` if browser needs to render or validate it
3. **L1** — Update `validate-entity`, `serialize-entity`, `deserialize-entity`, all `build-*-query` files
4. **L3** — Update `derive-body-schema` to handle the new discriminant
5. **L6** — Update browser form rendering and validation switch statements

Commit each layer separately. Typecheck after each layer.

---

### Debugging: Field Behavior Not Working as Expected

Trace the symptom to the layer that owns it:

```
SYMPTOM: Validation rejects a value that should be valid
→ L0: check the atom's constraint — correct sub-atom spread? (e.g., signed vs standard)
→ L1: src/model/universal/sub-atoms/validate-field.ts — reads min/max correctly?

SYMPTOM: Field does not appear in the form
→ L0: is the field in buildFields()? (accidental omission)
→ L0: editable: false? (system fields are hidden from forms)
→ L4: prepareCreateForm — is there a custom filter excluding it?

SYMPTOM: Field shows wrong label in the UI
→ L0: check the atom's `label` property — this is the single source of truth for labels

SYMPTOM: Enum dropdown is empty or missing options
→ L0: the enum atom's `values: readonly string[]` — are the values present?
→ L4: prepareCreateForm options-map — does it include selectOptions for this field?

SYMPTOM: Value is saved to DB but reads back wrong
→ L0: is the field type correct? (e.g., decimal fields serialize to string for PostgreSQL)
→ L1: serialize-entity — is the type case handled?
→ L1: deserialize-entity — is the reverse conversion handled?

SYMPTOM: Browser validation not enforcing a constraint
→ L4: is the field included in the BrowserFieldConfig JSON embedded in the HTML?
→ L0: does BrowserFieldConfig interface include the constraint property?
→ L6: does browser validation read that constraint property in its switch case?
```

---

### Debugging: Finding What Uses a Config

```bash
# Find all files importing a specific entity config singleton
grep -r "MODIFIER_CONFIG" src/ --include="*.ts"

# Find all files using universal atoms (to assess impact of an atom change)
grep -r "from.*universal/atoms" src/ --include="*.ts"

# Find all entities that declare a specific field name
grep -r '"target_stat_id"' src/config/ --include="*.ts"

# Find all entities with nonColumnKeys (to understand virtual field scope)
grep -r "nonColumnKeys" src/config/ --include="*.ts"

# Find all atoms that use a specific sub-atom (to assess blast radius)
grep -r "INTEGER_CONSTRAINTS_SIGNED" src/config/ --include="*.ts"
```

---

### Testing: Config Factory Unit Tests

Reference implementation: `src/config/entities/game-domain/game-domain-config.test.ts`

```typescript
describe("EntityConfigFactory", () => {
  it("produces a config with correct identity", () => {
    const config = new EntityConfigFactory().create()
    expect(config.entityName).toBe("EntityName")
    expect(config.tableName).toBe("entity_name")
    expect(config.displayName).toBe("Entity Name")
  })

  it("has exact field count", () => {
    // Exact count catches accidental omissions or double-adds
    expect(ENTITY_CONFIG.fields.length).toBe(N)
  })

  it("has machine_name field with correct type", () => {
    const field = ENTITY_CONFIG.fields.find(f => f.name === "machine_name")
    expect(field).toBeDefined()
    expect(field?.type).toBe("string")
  })

  it("has correct permissions", () => {
    expect(ENTITY_CONFIG.permissions.create).toBe("admin")
    expect(ENTITY_CONFIG.permissions.read).toBe("public")
  })

  it("declares nonColumnKeys for virtual fields", () => {
    expect(ENTITY_CONFIG.nonColumnKeys).toContain("status_action")
  })
})
```

Run targeted:
```bash
bun test src/config/entities/{entity-name}/
```

Run full L0 suite:
```bash
bun test src/config/
```

---

### Testing: Integration Check After L0 Changes

After changing L0, verify the config change propagates correctly up the stack:

```bash
# 1. TypeScript — catches type mismatches immediately
bun run typecheck

# 2. L0 unit tests
bun test src/config/

# 3. API smoke test — proves L3 reads updated config for schema validation
curl -X POST http://localhost:3000/api/{entity} \
  -H "Content-Type: application/json" -d '{}'
# Expect: 422 with validation errors listing required fields (not 500)

# 4. Form render — proves L4/L5 pick up the field change
open http://localhost:3000/{entity}/create
# Expect: updated field appears in correct position with correct label
```

---

### Git: Commit Conventions for L0 Changes

All L0-only commits use the `config` scope:

```bash
# New entity config
feat(config): add EnemyModifier L0 entity config factory

# New universal atom
feat(config): add enemy-damage-type-field-atom to universal atoms

# New domain molecule
feat(config): add ENEMY_STATUS_FIELDS molecule to modifier domain

# New field on existing entity
feat(config): add target_stat_id field to Modifier config

# Constraint correction
fix(config): correct INTEGER_CONSTRAINTS_SIGNED min to -2147483648

# Structural refactor
refactor(config): extract MODIFIER_ARCHIVE_FIELDS from retired lifecycle-fields

# Consistency audit cleanup
refactor(config): atomic consistency pass — field order and marker alignment
```

**Rule:** Every L0-only change gets its own commit. For multi-layer feature work, commit
each layer separately in order (L0 first, then L1, L2, etc.).

---

### Git: PR Checklist for L0 Changes

Before pushing a branch with L0 modifications:

- [ ] `bun run typecheck` — zero errors
- [ ] `bun test src/config/` — all config tests pass
- [ ] Field count in config test matches actual `buildFields()` return length
- [ ] New atoms exported from `src/config/universal/atoms/index.ts`
- [ ] New sub-atoms exported from `src/config/universal/sub-atoms/index.ts`
- [ ] New entity configs exported from `src/config/entities/index.ts`
- [ ] `nonColumnKeys` declares all virtual form fields (tiers_json, status_action, etc.)
- [ ] Migration file exists for every new DB column
- [ ] Commit message uses `feat(config):`, `fix(config):`, or `refactor(config):` scope
- [ ] No imports from L1, L2, L3, L4, L5, or L6 introduced in any L0 file

---

## Related Documents

- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — where L0 sits in the full stack and the unidirectional dependency rule
- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — philosophy, composition hierarchy, and the write-once-share-everywhere principle
- [PDR-003: Database Design](PDR-003-database-design.md) — how L0 field types map to PostgreSQL column types and constraints
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — how `FieldConfig` drives TypeBox schema generation and OpenAPI documentation
- [PDR-008: Roadmap](PDR-008-roadmap.md) — planned new entities (EnemyModifier, Asset system) that will extend this config layer
