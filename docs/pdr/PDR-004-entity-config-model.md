# PDR-004: Entity & Configuration Model

**Status:** Active  
**Last updated:** 2026-04-23

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
  id-field-atom.ts                   — uuid, autoGenerate: true
  name-field-atom.ts                 — string, required, NAME constraints
  description-field-atom.ts          — string, optional, DESCRIPTION constraints
  is-active-field-atom.ts            — boolean, required
  sort-order-field-atom.ts           — integer, optional
  created-at-field-atom.ts           — timestamp, autoSet: 'create'
  updated-at-field-atom.ts           — timestamp, autoSet: 'update'
  game-domain-ref-field-atom.ts      — reference to GameDomain
  game-subdomain-ref-field-atom.ts   — reference to GameSubdomain
  game-category-ref-field-atom.ts    — reference to GameCategory
  game-subcategory-ref-field-atom.ts — reference to GameSubcategory
```

### 3. Molecules — named field groups

A molecule is an array of atoms that belong together conceptually.

```
src/config/universal/molecules/
  base-entity-fields.ts   — [id, name, description, sortOrder]
  audit-fields.ts         — [createdAt, updatedAt]

src/config/molecules/modifier/
  hierarchy-fields.ts     — [gameDomainRef, gameSubdomainRef, gameCategoryRef, gameSubcategoryRef]
  code-field.ts           — [code]  (unique slug)
  status-fields.ts        — [isActive]
  archive-fields.ts       — [archivedReason, archivedAt]
  lifecycle-fields.ts     — [status-fields + archive-fields]
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
  abstract getTableName(): string
  abstract getEntityName(): string
  abstract buildFields(): FieldConfig[]

  getNonColumnKeys(): string[] { return [] }  // hook — override when needed

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
// src/config/entities/item-modifier/item-modifier-config-factory.ts
class ItemModifierConfigFactory extends BaseEntityConfigFactory {
  getTableName() { return "item_modifiers" }
  getEntityName() { return "ItemModifier" }

  buildFields(): FieldConfig[] {
    return [
      ...BASE_ENTITY_FIELDS,       // universal molecule
      ...MODIFIER_HIERARCHY_FIELDS, // domain molecule
      CODE_FIELD,                  // domain molecule (single field)
      ...MODIFIER_LIFECYCLE_FIELDS, // domain molecule
      ...AUDIT_FIELDS,             // universal molecule
      affixTypeField,              // item-specific enum
      semanticCatField,            // item-specific enum
      valueTypeField,              // item-specific enum
      calcMethodField,             // item-specific enum
    ]
  }

  getNonColumnKeys() {
    return ["tiers_json", "tiers", "status_action", "status_reason"]
  }
}

export const ITEM_MODIFIER_CONFIG = new ItemModifierConfigFactory().create()
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

A new modifier type (e.g., `EnemyModifier`) follows the same factory pattern:

1. Create `src/config/entities/enemy-modifier/enemy-modifier-config-factory.ts`
2. Compose: `BASE_ENTITY_FIELDS`, `MODIFIER_HIERARCHY_FIELDS`, `CODE_FIELD`,
   `MODIFIER_LIFECYCLE_FIELDS`, `AUDIT_FIELDS`
3. Add enemy-specific fields (damage_type enum, ai_behavior, etc.)
4. The domain molecules (`MODIFIER_HIERARCHY_FIELDS`, `MODIFIER_LIFECYCLE_FIELDS`) are
   **reused unchanged** — EnemyModifier gets the hierarchy and lifecycle system for free

The L1/L2/L3 stack for EnemyModifier is built following the same patterns as ItemModifier.
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
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — ItemModifierConfigFactory in context
- [PDR-007: API & Transport Layer](PDR-007-api-transport-layer.md) — how FieldConfig drives OpenAPI
