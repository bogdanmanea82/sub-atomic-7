# PDR-004: Entity & Configuration Model

**Status:** Active  
**Last updated:** 2026-04-27

---

## Configuration as Layer 0

In this system, configuration is not passive documentation of what the code does. It is an
**active instruction set** that drives behaviour across all seven layers.

When you change a field's `maxLength` in L0:
- L1 validation enforces the new limit automatically
- L3 TypeBox schema reflects the new constraint
- L6 browser validation enforces it client-side

No code changes required in L1, L3, or L6. The config is the single source of truth.

This is the **write-once-share-everywhere** principle. It is enforced by the composition
hierarchy described below.

---

## The Composition Hierarchy

Configuration is built bottom-up through four levels:

### 1. Sub-atoms — primitive constraints

The smallest reusable config pieces. Each encodes one decision.

```
src/config/universal/sub-atoms/
  display-formats.ts    — the set of valid display format strings per field type
  field-markers.ts      — boolean markers (autoGenerate, autoSet values)
  string-constraints.ts — reusable { minLength, maxLength } presets
  integer-constraints.ts — reusable { min, max } presets
```

Example: `STRING_CONSTRAINTS.NAME` is `{ minLength: 1, maxLength: 100 }`. Every name field
across all entities uses this constant. Change it once, all entities update.

### 2. Atoms — named field configurations

An atom is a complete `FieldConfig` object for a single named field. Atoms compose sub-atoms.

```
src/config/universal/atoms/
  affix-type-field-atom.ts           — enum, "prefix" | "suffix"; ItemModifierBinding slot
  character-id-field-atom.ts         — reference to CharacterClass; FK on CharacterStatBase
  combination-type-field-atom.ts     — enum, flat | increased | more; PoE-style math bucket
  created-at-field-atom.ts           — timestamp, autoSet: 'create'
  description-field-atom.ts          — string, optional, DESCRIPTION constraints
  display-template-field-atom.ts     — string, modifier human-readable text template
  game-category-ref-field-atom.ts    — reference to GameCategory
  game-domain-ref-field-atom.ts      — reference to GameDomain
  game-subcategory-ref-field-atom.ts — reference to GameSubcategory
  game-subdomain-ref-field-atom.ts   — reference to GameSubdomain
  id-field-atom.ts                   — uuid, autoGenerate: true
  is-active-field-atom.ts            — boolean, required
  item-id-field-atom.ts              — reference to Item; FK on ItemStatBase; hidden display format
  machine-name-field-atom.ts         — string, universal unique slug; pattern ^[a-z][a-z0-9_]*$
  modifier-group-field-atom.ts       — string, modifier grouping key for mutual-exclusion
  modifier-value-max-field-atom.ts   — integer, modifier upper roll bound
  modifier-value-min-field-atom.ts   — integer, modifier lower roll bound
  name-field-atom.ts                 — string, required, NAME constraints
  roll-shape-field-atom.ts           — enum, scalar | range
  sort-order-field-atom.ts           — integer, optional
  stat-category-field-atom.ts        — enum, attribute | resource | offensive | defensive | utility
  stat-data-type-field-atom.ts       — enum, raw | percentage | multiplier
  stat-default-value-field-atom.ts   — integer, signed (allows negatives — e.g. resistances)
  stat-id-field-atom.ts              — reference to Stat; FK on CharacterStatBase and ItemStatBase
  stat-value-max-field-atom.ts       — integer, stat maximum value
  stat-value-min-field-atom.ts       — integer, stat minimum value
  target-stat-id-field-atom.ts       — reference to Stat; the stat a modifier affects
  updated-at-field-atom.ts           — timestamp, autoSet: 'update'
```

### 3. Molecules — named field groups

A molecule is an array of atoms that belong together conceptually.

```
src/config/universal/molecules/
  archive-fields.ts       — [archived_at, archived_reason]; taxonomy and stat entities
  audit-fields.ts         — [created_at, updated_at]; all entities
  base-entity-fields.ts   — [machine_name, name, description, is_active]; taxonomy entities
  standard-permissions.ts — default CRUD permissions: create/update/delete = admin; read = public

src/config/molecules/modifier/
  archive-fields.ts       — [archived_at, archived_reason]; modifier-specific archive fields
  binding-fields.ts       — 8 binding scope fields (target_type, target_id, is_included,
                            weight_override, min_tier_index, max_tier_index, level_req_override, is_active)
  code-field.ts           — MODIFIER_MACHINE_NAME_FIELD_ATOM; modifier slug (3–100 chars, ^[a-z0-9_]+$)
  hierarchy-fields.ts     — [game_domain_id, game_subdomain_id, game_category_id, game_subcategory_id]
  lifecycle-fields.ts     — ⚠ TOMBSTONE — retired; split into status-fields + archive-fields;
                            exports nothing; do not import
  status-fields.ts        — [is_active]; modifier live/disabled toggle
  tiers-fields.ts         — 5 tier progression fields (tier_index, level_req, min_value,
                            max_value, spawn_weight)
```

Universal molecules belong to all entities. Domain molecules (`modifier/`) belong only to
modifier-type entities. New modifier types (EnemyModifier, ZoneModifier) compose the same
domain molecules — they don't redefine them.

### 4. Entity Factories — complete entity configs

An entity factory assembles molecules (and any entity-specific fields) into a full
`EntityConfig`. The factory pattern uses the **Template Method** design:

```typescript
// src/config/factories/base-entity-config-factory.ts
abstract class BaseEntityConfigFactory {
  abstract getEntityName(): string          // PascalCase — e.g. "CharacterClass"
  abstract getDisplayName(): string         // human singular — e.g. "Character Class"
  abstract getPluralDisplayName(): string   // human plural — e.g. "Character Classes"
  abstract getPermissions(): PermissionConfig
  abstract buildFields(): FieldConfig[]

  getTableName(): string { ... }            // derived: PascalCase → snake_case (not abstract)
  getRelationships(): RelationshipConfig[] { return [] }   // hook — override for FK relationships
  getNonColumnKeys(): string[] { return [] }               // hook — override for virtual form fields

  create(): EntityConfig {
    return {
      tableName: this.getTableName(),
      entityName: this.getEntityName(),
      fields: this.buildFields(),
      nonColumnKeys: this.getNonColumnKeys(),
      // ... relationships, permissions
    }
  }
}
```

A concrete factory overrides `buildFields()` to compose the molecules it needs:

```typescript
// src/config/entities/modifier/modifier-config-factory.ts
class ModifierConfigFactory extends BaseEntityConfigFactory {
  getEntityName() { return "Modifier" }  // → getTableName() derives "modifier"

  buildFields(): FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      ...MODIFIER_HIERARCHY_FIELDS,  // domain molecule — 4 FK refs
      MODIFIER_MACHINE_NAME_FIELD_ATOM, // domain molecule
      NAME_FIELD_ATOM,               // universal atom
      DESCRIPTION_FIELD_ATOM,        // universal atom
      TARGET_STAT_ID_FIELD_ATOM,     // universal atom
      COMBINATION_TYPE_FIELD_ATOM,   // universal atom
      ROLL_SHAPE_FIELD_ATOM,         // universal atom
      MODIFIER_VALUE_MIN_FIELD_ATOM, // universal atom
      MODIFIER_VALUE_MAX_FIELD_ATOM, // universal atom
      MODIFIER_GROUP_FIELD_ATOM,     // universal atom
      DISPLAY_TEMPLATE_FIELD_ATOM,   // universal atom
      ...MODIFIER_STATUS_FIELDS,     // domain molecule — is_active
      ...MODIFIER_ARCHIVE_FIELDS,    // domain molecule — archived_at, archived_reason
      ...AUDIT_FIELDS,               // universal molecule
    ]
  }

  getNonColumnKeys() {
    return ["tiers_json", "tiers", "status_action", "status_reason"]
  }
}

export const MODIFIER_CONFIG = new ModifierConfigFactory().create()
```

The `nonColumnKeys` hook declares virtual form fields that exist in the HTML form but are
not database columns. The `updateEntityWorkflow` strips these before building the SQL UPDATE.

---

## How to Add a New Entity

Five steps, all in L0:

1. Create `src/config/entities/{entity-name}/{entity-name}-config-factory.ts`
2. Extend `BaseEntityConfigFactory`, implement the three abstract methods
3. Compose molecules from `universal/` and add any entity-specific fields
4. Export `ENTITY_CONFIG = new EntityConfigFactory().create()`
5. Re-export from `src/config/entities/index.ts`

The L1 universal model, L2 universal workflows, and L3 `createCrudRoutes` factory all
read from `EntityConfig` — zero code changes required in those layers.

---

## How to Add a New Modifier Type

A new modifier domain follows the same factory pattern. For asset-type-specific bindings,
use `ModifierBindingConfigFactory` with a 4th `bindingEntityName` parameter:

```typescript
// New binding for Spell assets — table: spell_modifier_binding
new ModifierBindingConfigFactory(
  "Modifier",              // parent FK entity
  "modifier",              // parent FK table
  [SPELL_SLOT_FIELD_ATOM], // spell-specific fields
  "SpellModifierBinding",  // → tableName: spell_modifier_binding
)
```

The domain molecules (`MODIFIER_HIERARCHY_FIELDS`, `MODIFIER_STATUS_FIELDS`,
`MODIFIER_ARCHIVE_FIELDS`) are **reused unchanged** — any new modifier binding type gets
the hierarchy and lifecycle system for free.

No existing entity code is modified. This validates the **open for extension, closed for
modification** principle at the configuration layer.

---

## The `FieldConfig` Discriminated Union

Every field in the system is typed as one of eight discriminants:

| `type` | TypeBox schema | DB column type |
|---|---|---|
| `string` | `t.String({ minLength, maxLength })` | VARCHAR / TEXT |
| `integer` | `t.Number({ minimum, maximum })` | INTEGER |
| `decimal` | `t.Number({ minimum?, maximum? })` | NUMERIC |
| `boolean` | `t.Boolean()` | BOOLEAN |
| `reference` | `t.String()` (UUID as string) | UUID FK |
| `enum` | `t.Union([t.Literal(...), ...])` | VARCHAR with CHECK constraint |
| `uuid` | `t.String()` or skip (if autoGenerate) | UUID |
| `timestamp` | `t.String()` or skip (if autoSet ≠ 'none') | TIMESTAMPTZ |

The `deriveBodySchema()` sub-atom (`src/controller/sub-atoms/schema/derive-body-schema.ts`)
reads this discriminated union at L3 to produce TypeBox schemas for route validation and
OpenAPI documentation generation.

---

## Related Documents

- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — where L0 fits in the full stack
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — ModifierConfigFactory in context; binding architecture
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — how FieldConfig drives OpenAPI
