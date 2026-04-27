# LAYER-004: View Service Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 4 at a Glance

Layer 4 transforms raw database records into typed view models ready for rendering. It has
**no framework dependency** — no Elysia, no HTTP concepts, no HTML strings. Its only concern
is data preparation: field formatting, form population, pagination metadata, reference
resolution, and status derivation.

**L4 imports from:** L0 (EntityConfig, FieldConfig, BrowserFieldConfig types).  
**L4 is imported by:** L3 (controller Pages files only — not API files).

**The bridge to L6:** `prepareBrowserFieldConfig()` serializes L0 field config to a JSON
string. L5 embeds that string in the rendered HTML. L6 deserializes it to run browser
validation without any server round-trip.

---

## Directory Map

```
src/view-service/
├── types/
│   ├── view-models.ts              — DisplayField, ListView, DetailView, FormView, SelectOption, ReferenceLookup
│   ├── tier-view-models.ts         — TierFormRow, TierDetailRow, TierFieldMeta
│   ├── binding-view-models.ts      — BindingDetailRow, BindingOverrideDisplay
│   ├── assignment-view-models.ts   — ResolvedAssignment, AssignmentCategoryGroup, AssignmentPanelData
│   ├── character-class-view-models.ts — StatSheetViewRow, CharacterClassFormView, CharacterClassDetailView
│   ├── item-view-models.ts         — ItemStatBaseViewRow (+ combination_type), ItemFormView, ItemDetailView
│   └── index.ts
├── sub-atoms/
│   ├── formatters/
│   │   ├── format-boolean.ts       — formatBoolean (status dot HTML), formatBooleanYesNo
│   │   ├── format-date.ts          — formatDate (DD Mmm YYYY), formatDatetime (+ HH:MM)
│   │   ├── format-number.ts        — formatNumber (locale thousands separator)
│   │   ├── format-text.ts          — formatText ("—" for empty), formatTextTruncated
│   │   ├── format-status.ts        — formatStatusClass (badge CSS class)
│   │   ├── format-input-type.ts    — formatInputType (displayFormat → HTML input type)
│   │   ├── format-binding-overrides.ts — formatBindingOverrides (5 override fields → display strings)
│   │   └── index.ts
│   ├── pagination/
│   │   ├── build-pagination-meta.ts — buildPaginationMeta (computed page navigation metadata)
│   │   └── index.ts
│   ├── derive-current-state.ts     — deriveCurrentState ("active" | "disabled" | "archived")
│   ├── build-status-form-extension.ts — buildStatusFormExtension (currentState + statusReason)
│   └── index.ts
├── atoms/
│   └── field-display/
│       ├── prepare-field.ts        — prepareField (single field → DisplayField with formatted value)
│       └── index.ts
├── molecules/
│   └── views/
│       ├── build-list-view.ts      — buildListView (entities[] + config → ListView)
│       ├── build-detail-view.ts    — buildDetailView (entity + config → DetailView)
│       ├── build-form-view.ts      — buildFormView (config + options → FormView)
│       ├── build-browser-field-config.ts — buildBrowserFieldConfig (config → BrowserFieldConfig[])
│       ├── build-filtered-list-view.ts   — buildFilteredListView (remove hierarchy columns)
│       └── index.ts
└── entities/
    ├── game-domain/
    │   ├── game-domain-view-service.ts
    │   └── index.ts
    ├── game-subdomain/
    │   ├── game-subdomain-view-service.ts
    │   └── index.ts
    ├── game-category/
    │   ├── game-category-view-service.ts
    │   └── index.ts
    ├── game-subcategory/
    │   ├── game-subcategory-view-service.ts
    │   └── index.ts
    ├── stat/
    │   ├── stat-view-service.ts
    │   └── index.ts
    ├── character-class/
    │   ├── character-class-view-service.ts
    │   └── index.ts
    ├── item/
    │   ├── item-view-service.ts
    │   └── index.ts
    ├── modifier/
    │   ├── modifier-view-service.ts
    │   ├── modifier-binding-view-service.ts
    │   ├── modifier-assignment-view-service.ts
    │   └── index.ts
    └── index.ts                    — exports 5 of 6 entity services (Modifier not re-exported here)
```

---

## Types (`src/view-service/types/`)

### `view-models.ts` — core view contracts

| Type | Shape | Purpose |
|---|---|---|
| `DisplayField` | `{ name, label, value: string, rawValue: unknown, displayFormat: string }` | Single field prepared for display. `value` is always a pre-formatted string. |
| `ListRowMetadata` | `{ description?, createdAt?, updatedAt?, archivedAt?, archivedReason? }` | Tooltip data for list rows |
| `ListViewRow` | `{ id: string, fields: DisplayField[], metadata?: ListRowMetadata }` | Single row in a list table |
| `PaginationMeta` | `{ currentPage, totalPages, totalCount, pageSize, hasNext, hasPrev }` | Display-ready pagination state |
| `ListView` | `{ title, columns: { name, label }[], rows: ListViewRow[], count, pagination? }` | Complete list page data |
| `DetailView` | `{ title, fields: DisplayField[], isActive?, archivedAt? }` | Complete detail page data |
| `SelectOption` | `{ label: string, value: string }` | Dropdown option pair |
| `FormField` | `{ name, label, inputType, value, required, error?, options? }` | Single form input definition |
| `FormView` | `{ title, fields: FormField[], currentState?, statusReason? }` | Complete form page data |
| `ReferenceLookup` | `Record<string, Record<string, string>>` | `{ fieldName: { uuid: "Display Name" } }` — resolves FK UUIDs in display |

### `tier-view-models.ts`

| Type | Shape | Purpose |
|---|---|---|
| `TierFormRow` | `{ tier_index, min_value: number\|null, max_value: number\|null, level_req, spawn_weight }` | Tier row for form rendering (native numbers) |
| `TierDetailRow` | `{ tier_index: number, min_value, max_value, level_req, spawn_weight: string }` | Tier row for detail display (formatted strings) |
| `TierFieldMeta` | `{ name, label, inputType, min?, max?, step? }` | Metadata for each tier column input |

### `binding-view-models.ts`

| Type | Shape | Purpose |
|---|---|---|
| `BindingOverrideDisplay` | `{ weightOverride, minTier, maxTier, tierRange, levelReqOverride }` | 5 formatted strings shared by binding and assignment panels |
| `BindingDetailRow` | `{ id, targetName, isIncluded, weightOverride, minTier, maxTier, levelReqOverride }` | Single binding row for display |

### `assignment-view-models.ts`

| Type | Shape | Purpose |
|---|---|---|
| `ResolvedAssignment` | `{ subcategoryName, status, source, weightOverride, tierRange, levelReqOverride }` | Subcategory with computed eligibility |
| `AssignmentCategoryGroup` | `{ categoryName, categoryBinding, assignments: ResolvedAssignment[] }` | All subcategories under one category |
| `AssignmentSummary` | `{ totalSubcategories, eligible, excluded, noBinding }` | Count totals for panel header |
| `AssignmentPanelData` | `{ summary: AssignmentSummary, groups: AssignmentCategoryGroup[] }` | Complete assignments panel data |

### `character-class-view-models.ts`

Extended view model types for the CharacterClass stat sheet. Imported by L5 view organisms
that render the stat sheet table.

| Type | Shape | Purpose |
|---|---|---|
| `StatSheetViewRow` | `{ stat_id, stat_name, stat_category, stat_data_type, stat_value_min, stat_value_max, stat_default_value, base_value, error? }` | One stat row in a character stat sheet form or detail view |
| `CharacterClassFormView` | `extends FormView` with `statSheet: readonly StatSheetViewRow[]` | Complete create/edit form view with stat sheet rows attached |
| `CharacterClassDetailView` | `extends DetailView` with `statSheet: readonly StatSheetViewRow[]` | Complete detail page view with stat sheet rows attached |

`error?` on `StatSheetViewRow` carries per-row validation messages (e.g., "base_value out of range").

### `item-view-models.ts`

Extended view model types for the Item stat sheet. Parallel to `character-class-view-models.ts`
but adds `combination_type` to each stat row — Items store the modifier math bucket per stat.

| Type | Shape | Purpose |
|---|---|---|
| `ItemStatBaseViewRow` | `{ stat_id, stat_name, stat_category, stat_data_type, stat_value_min, stat_value_max, stat_default_value, combination_type, base_value, error? }` | One stat row in an item stat sheet (adds `combination_type` vs CharacterClass) |
| `ItemFormView` | `extends FormView` with `statSheet: readonly ItemStatBaseViewRow[]` | Complete create/edit form view with item stat sheet rows attached |
| `ItemDetailView` | `extends DetailView` with `statSheet: readonly ItemStatBaseViewRow[]` | Complete detail page view with item stat sheet rows attached |

---

## Sub-Atoms: Formatters (`src/view-service/sub-atoms/formatters/`)

One concern per file. All return strings — they never produce HTML except `formatBoolean`.

### `format-boolean.ts`

```typescript
export function formatBoolean(value: boolean): string
// → '<span class="status-dot status-dot--active"></span>'  or  '...--inactive'

export function formatBooleanYesNo(value: boolean): string
// → "Yes" | "No"
```

`formatBoolean` returns an HTML status dot — the one case where L4 produces markup. Used only
in list/detail display, never in form fields.

### `format-date.ts`

```typescript
export function formatDate(value: Date): string      // → "26 Apr 2026"
export function formatDatetime(value: Date): string  // → "26 Apr 2026 14:30"
```

Uses `en-GB` locale. Falls back to `String(value)` for non-Date inputs.

### `format-number.ts`

```typescript
export function formatNumber(value: number): string  // → "1,234,567" (locale separators)
```

### `format-text.ts`

```typescript
export function formatText(value: string | null | undefined): string
// → value as-is, or "—" (em-dash) for empty/null/undefined

export function formatTextTruncated(value: string | null | undefined, maxLength = 100): string
// → truncated with ellipsis if over limit, "—" for empty
```

### `format-status.ts`

```typescript
export function formatStatusClass(isActive: boolean): string
// → "badge badge--active" | "badge badge--inactive"
```

### `format-input-type.ts`

```typescript
export function formatInputType(field: FieldConfig): string
```

Maps `field.displayFormat` to HTML input type string:

| `displayFormat` | HTML input type |
|---|---|
| `"text"` | `"text"` |
| `"textarea"` | `"textarea"` |
| `"number"` | `"number"` |
| `"toggle"` | `"checkbox"` |
| `"datetime"` | `"datetime-local"` |
| `"select"` | `"select"` |
| default | `"text"` |

### `format-binding-overrides.ts`

```typescript
export function formatBindingOverrides(b: Record<string, unknown>): BindingOverrideDisplay
```

Extracts and formats the 5 override columns from a raw binding DB record:

| Field | Logic |
|---|---|
| `weightOverride` | `b.weight_override ?? "Global default"` |
| `tierRange` | Both min+max → "Tiers X–Y"; min only → "Tier X+"; max only → "Tiers 0–X"; neither → "All tiers" |
| `minTier` | `String(b.min_tier ?? "—")` |
| `maxTier` | `String(b.max_tier ?? "—")` |
| `levelReqOverride` | `b.level_req_override ?? "Per tier default"` |

---

## Sub-Atoms: Pagination (`src/view-service/sub-atoms/pagination/`)

### `build-pagination-meta.ts`

```typescript
export function buildPaginationMeta(
  totalCount: number,
  currentPage: number,
  pageSize: number,
): PaginationMeta
```

Computes display-ready pagination state. `totalPages = Math.max(1, Math.ceil(totalCount / pageSize))`.
`hasNext = currentPage < totalPages`. `hasPrev = currentPage > 1`.

Called in L3 Pages files, not inside view services — pagination math happens at the controller
boundary where `totalCount` is available from the service result.

---

## Sub-Atoms: Status (`src/view-service/sub-atoms/`)

### `derive-current-state.ts`

```typescript
export function deriveCurrentState(
  values?: Record<string, unknown>,
): "active" | "disabled" | "archived"
```

Derives 3-state status from entity field values. Rules applied in order:

1. `archived_reason` present and non-empty → `"archived"`
2. `is_active === true` (boolean) or `is_active === "true"` (string) → `"active"`
3. Otherwise → `"disabled"`
4. No values (new entity) → `"active"` (default)

### `build-status-form-extension.ts`

```typescript
export function buildStatusFormExtension(
  values?: Record<string, unknown>,
): { readonly currentState: "active" | "disabled" | "archived"; readonly statusReason?: string }
```

Wraps `deriveCurrentState` and extracts `archived_reason` as `statusReason`. Merged into
every `FormView` for entities using the status/archive lifecycle pattern.

---

## Atoms: Field Display (`src/view-service/atoms/field-display/`)

### `prepare-field.ts`

```typescript
export function prepareField(
  entity: Record<string, unknown>,
  field: FieldConfig,
  referenceLookup?: ReferenceLookup,
): DisplayField
```

Formats a single field value using the appropriate formatter for its `FieldConfig` type:

| `FieldConfig.type` | Formatter used |
|---|---|
| `"string"` | `formatText()` |
| `"integer"` | `formatNumber()` |
| `"decimal"` | `formatNumber()` |
| `"boolean"` | `formatBoolean()` |
| `"timestamp"` | `formatDatetime()` |
| `"enum"` | `formatText()` |
| `"uuid"` | raw string |
| `"reference"` | `referenceLookup[field.name][uuid]` → resolves to display name |

Returns `"—"` for `null` or `undefined` values. Reference fields fall back to the raw UUID
if the lookup is absent or the UUID is not found.

---

## Molecules: View Builders (`src/view-service/molecules/views/`)

### `build-list-view.ts`

```typescript
export function buildListView(
  entities: Record<string, unknown>[],
  config: EntityConfig,
  referenceLookup?: ReferenceLookup,
  pagination?: PaginationMeta,
): ListView
```

Transforms an array of raw DB records into a complete list view model.

**Field filtering:**
- Excludes `displayFormat === "hidden"` — system fields never shown
- Excludes `showInList === false` — fields marked for detail-only

**Column ordering:** sorted by `listOrder` (default `50` when undefined).

**Row metadata** — extracted per row for tooltips:
- `description` — `formatText()`
- `createdAt`, `updatedAt`, `archivedAt` — `formatDatetime()`
- `archivedReason` — `formatText()`

Returns: `{ title: config.pluralDisplayName, columns, rows, count, pagination }`.

### `build-detail-view.ts`

```typescript
export function buildDetailView(
  entity: Record<string, unknown>,
  config: EntityConfig,
  referenceLookup?: ReferenceLookup,
): DetailView
```

Transforms a single raw DB record into a detail view model.

**Field filtering:** Excludes `displayFormat === "hidden"`.

**Title:** `entity.name` if present, otherwise `config.displayName`.

**Extra fields on return:** `isActive` (if field present), `archivedAt` (if field present).
These drive status badge and archive notice in the detail page template.

### `build-form-view.ts`

```typescript
export function buildFormView(
  config: EntityConfig,
  currentValues?: Record<string, unknown>,
  errors?: Record<string, string>,
  selectOptions?: Record<string, readonly SelectOption[]>,
  titleOverride?: string,
): FormView
```

Builds `FormField[]` for rendering a create or edit form.

**Field filtering (excluded):**
- `displayFormat === "hidden"` — system fields
- `type === "uuid"` — IDs are never user-editable
- `type === "timestamp"` — managed by server
- `editable === false` — explicitly locked fields

**Options population:**
- `enum` fields auto-generate `options` from `field.values[]`
- `selectOptions[field.name]` overrides enum options (and provides options for `reference` fields)

**Title logic:** `titleOverride ?? (currentValues ? \`Edit ${config.displayName}\` : \`New ${config.displayName}\`)`

**Error hydration:** `errors[field.name]` is attached as `field.error` — form renders inline
error messages without re-fetching.

### `build-browser-field-config.ts`

```typescript
export function buildBrowserFieldConfig(config: EntityConfig): BrowserFieldConfig[]
```

Extracts the browser-relevant subset of L0 field config for client-side validation.

**Excluded fields:**
- `type === "uuid"` — server-generated
- `type === "timestamp"` — server-managed

**Type-specific properties included:**

| Field type | Properties carried to browser |
|---|---|
| `"string"` | `minLength`, `maxLength`, `pattern` |
| `"integer"` | `min`, `max` |
| `"decimal"` | `min`, `max`, `precision`, `scale` |
| `"enum"` | `values[]` |
| `"boolean"`, `"reference"` | base properties only |

`BrowserFieldConfig` is defined in `src/config/types/browser-field-config.ts` (L0), not in
L4 — the type lives at the layer that defines it, and L4 reads it to produce conforming output.

### `build-filtered-list-view.ts`

```typescript
export function buildFilteredListView(
  view: ListView,
  excludeFields: Set<string>,
): ListView
```

Removes named columns and corresponding row fields from a `ListView`. Used by hierarchical
entities where parent reference columns are replaced by filter dropdowns in the page template.

Example: `GameSubdomain` list removes `game_domain_id` column because the page shows a domain
filter dropdown instead of repeating the domain name in every row.

---

## Organisms: Entity View Services (`src/view-service/entities/`)

All entity view services are **object literals** (not classes). They import the entity's L0
config and compose molecules + sub-atoms into named methods.

---

### Simple Pattern: `GameDomainViewService`, `StatViewService`

No reference FKs, no cascade. Signature is the same for both:

```typescript
const EntityViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView,

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): DetailView,

  prepareCreateForm(
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView,

  prepareEditForm(
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView,

  prepareDuplicateForm(
    sourceValues: Record<string, unknown>,
  ): FormView,

  prepareBrowserFieldConfig(): string,  // JSON string for L5 embedding
}
```

`prepareCreateForm` / `prepareEditForm` / `prepareDuplicateForm` all merge
`buildStatusFormExtension()` into the returned `FormView` (`currentState`, `statusReason`).

`prepareDuplicateForm` always sets `currentState: "active"` — duplicates start in active state
regardless of the source entity's status.

---

### Hierarchical Pattern: `GameSubdomainViewService`, `GameCategoryViewService`, `GameSubcategoryViewService`

Adds two differences:

**1. `selectOptions` first parameter on form methods:**

```typescript
prepareCreateForm(
  selectOptions: Record<string, readonly SelectOption[]>,
  values?: Record<string, unknown>,
  errors?: Record<string, string>,
): FormView
```

`selectOptions` keys are field names (e.g., `"game_domain_id"`, `"game_subdomain_id"`).
These are fetched by L3 via `buildCascadingOptions` and passed down.

**2. `prepareFilteredListView`:**

```typescript
prepareFilteredListView(
  entities: Record<string, unknown>[],
  pagination?: PaginationMeta,
  referenceLookup?: ReferenceLookup,
): ListView
```

Calls `buildFilteredListView()` to remove parent reference columns from the list table.
Each entity removes its own parent FK columns:

| Entity | Columns removed from list |
|---|---|
| GameSubdomain | `game_domain_id` |
| GameCategory | `game_domain_id`, `game_subdomain_id` |
| GameSubcategory | `game_domain_id`, `game_subdomain_id`, `game_category_id` |

Note the parameter order difference: `prepareFilteredListView(entities, pagination?, referenceLookup?)`
vs `prepareListView(entities, referenceLookup?, pagination?)`. This is a known asymmetry in
the current codebase — follow the existing signature when adding new entities.

---

### Complex Pattern: `ModifierViewService`

Extends the hierarchical pattern with tier data and extended return types.

**Extended form method return type:**

```typescript
prepareCreateForm(
  selectOptions: Record<string, readonly SelectOption[]>,
  values?: Record<string, unknown>,
  errors?: Record<string, string>,
  tierRows?: readonly TierFormRow[],
): FormView & {
  readonly tierRows: readonly TierFormRow[]
  readonly tierFieldMeta: readonly TierFieldMeta[]
  readonly currentState: "active" | "disabled" | "archived"
}
```

If `tierRows` is omitted, defaults to a single starter row:
`{ tier_index: 0, min_value: null, max_value: null, level_req: 1, spawn_weight: 100 }`.

`tierFieldMeta` is `MODIFIER_TIER_FORM_META` from L0 — the column definitions for the tier
table in the form. L5 uses it to render tier input headers.

**Extended detail method return type:**

```typescript
prepareDetailView(
  entity: Record<string, unknown>,
  referenceLookup?: ReferenceLookup,
  tiers?: readonly Record<string, unknown>[],
): DetailView & { readonly tierRows: readonly TierDetailRow[] }
```

Converts raw tier DB records to `TierDetailRow[]` — all numeric values formatted as strings.

**Tier utility methods:**

```typescript
tiersToFormRows(tiers: readonly Record<string, unknown>[]): readonly TierFormRow[]
```
Converts raw DB tier records to typed `TierFormRow[]` (coerces numbers via `Number()`).

```typescript
parseTiersJsonForRerender(input: Record<string, unknown>): readonly TierFormRow[]
```
Parses `input["tiers_json"]` — the hidden field that carries tier state through a form POST.
Returns `[]` on blank or invalid JSON. Used when a create/update form fails validation and
must re-render with the user's tier data intact.

**Browser config extras:**

```typescript
prepareBrowserFieldConfig(): string   // JSON of MODIFIER_CONFIG fields
prepareTierFieldConfig(): string      // JSON of MODIFIER_TIER_FORM_META
```

Both returned as JSON strings for embedding in HTML.

---

### Binding View Service: `ModifierBindingViewService`

```typescript
const ModifierBindingViewService = {
  preparePanel(
    bindings: Record<string, unknown>[],
    categoryLookup: Record<string, string>,
    subcategoryLookup: Record<string, string>,
  ): readonly BindingDetailRow[]
}
```

Accepts raw DB binding rows for either category-level or subcategory-level bindings (not both
at once). Determines lookup via `binding.target_type` field. Formats overrides via
`formatBindingOverrides()`. Returns typed `BindingDetailRow[]`.

---

### Assignment View Service: `ModifierAssignmentViewService`

```typescript
const ModifierAssignmentViewService = {
  preparePanel(
    categoryBindings: Record<string, unknown>[],
    subcategoryBindings: Record<string, unknown>[],
    allCategories: Record<string, unknown>[],
    allSubcategories: Record<string, unknown>[],
  ): AssignmentPanelData
}
```

Pure computation — no database access. Resolves every subcategory's eligibility status by
applying three cascading rules in order:

1. **Explicit subcategory binding exists** → use it directly (`source: "explicit"`)
2. **Parent category binding exists, no subcategory override** → inherit (`source: "category-inherited"`)
3. **No binding at any level** → `status: "none"`, `source: "none"`

Groups results by category. Counts `eligible` (included), `excluded`, and `noBinding`.

Returns `AssignmentPanelData` with summary counts and grouped subcategory rows — a read-only
panel showing where a modifier is currently active across all game content.

---

### Stat Sheet Pattern: `CharacterClassViewService`

Extends the simple pattern (same as GameDomain/Stat) with stat sheet methods. No hierarchy
— CharacterClass is a top-level entity.

**Extended method signatures:**

```typescript
prepareCreateForm(
  values?: Record<string, unknown>,
  errors?: Record<string, string>,
  statSheet?: readonly StatSheetViewRow[],
): CharacterClassFormView

prepareEditForm(
  currentValues: Record<string, unknown>,
  errors?: Record<string, string>,
  statSheet?: readonly StatSheetViewRow[],
): CharacterClassFormView

prepareDetailView(
  entity: Record<string, unknown>,
  referenceLookup?: ReferenceLookup,
  statSheet?: readonly StatSheetViewRow[],
): CharacterClassDetailView
```

`statSheet` defaults to `[]` when omitted. L3 pages load the stat sheet from
`CharacterClassService.findById(id)` (which returns `CharacterClassWithStats`) and passes
the `statSheet` array to the view service method.

**`buildStatSheetFromAllStats`** — internal helper used by the view service to build stat
sheet rows from the full active stats list. For each stat, looks up the character's
`base_value` from a map (defaulting to `stat.default_value` if not set). Returns
`StatSheetViewRow[]` sorted by stat category and name.

---

### Stat Sheet Pattern: `ItemViewService`

Extends the hierarchical pattern (same as Modifier) with stat sheet methods. Item is scoped
to game_subcategory_id — 4-level cascading dropdowns in forms.

**Extended method signatures:**

```typescript
prepareCreateForm(
  selectOptions: Record<string, readonly SelectOption[]>,
  values?: Record<string, unknown>,
  errors?: Record<string, string>,
  statSheet?: readonly ItemStatBaseViewRow[],
): ItemFormView

prepareEditForm(
  selectOptions: Record<string, readonly SelectOption[]>,
  currentValues: Record<string, unknown>,
  errors?: Record<string, string>,
  statSheet?: readonly ItemStatBaseViewRow[],
): ItemFormView

prepareDetailView(
  entity: Record<string, unknown>,
  referenceLookup?: ReferenceLookup,
  statSheet?: readonly ItemStatBaseViewRow[],
): ItemDetailView
```

**`prepareFilteredListView`** — same as other hierarchical entities: removes the 4 FK
columns from the list table.

**Key difference from CharacterClass:** Each `ItemStatBaseViewRow` carries `combination_type`
(flat/increased/more). The L5 stat sheet form renders a `combination_type` select column
alongside the `base_value` input. Item stat defaults are `0` (not `stat.default_value`) —
items start with no base stats and the designer sets values explicitly.

---

## Cross-Layer Dependency Map

```
L0 Configuration (src/config/)
  ├── EntityConfig.fields[]         → buildListView, buildDetailView, buildFormView (field filtering, ordering)
  ├── EntityConfig.displayName      → view titles
  ├── EntityConfig.pluralDisplayName → list page title
  ├── FieldConfig discriminated union → prepareField (type-specific formatting)
  ├── FieldConfig.displayFormat     → formatInputType → FormField.inputType
  ├── FieldConfig.showInList        → buildListView column filtering
  ├── FieldConfig.listOrder         → buildListView column ordering
  ├── FieldConfig.editable          → buildFormView field exclusion
  ├── FieldConfig.values[]          → buildFormView enum options
  └── BrowserFieldConfig type       → buildBrowserFieldConfig output shape

L4 View Service (src/view-service/)
  ↓ ListView, DetailView, FormView, AssignmentPanelData, TierDetailRow[], BrowserFieldConfig[]
L3 Controller (Pages files only)
  ├── prepareListView    → passed to L5 listPage organism
  ├── prepareDetailView  → passed to L5 detailPage organism
  ├── prepareCreateForm  → passed to L5 createPage organism
  ├── prepareEditForm    → passed to L5 editPage organism
  └── prepareBrowserFieldConfig → JSON string embedded in L5 HTML → deserialized by L6

No data flows upward from L4.
```

---

## Workflows

### Workflow A: Adding a View Service for a New Simple Entity

**Preconditions:** L0 entity config created (`ENTITY_CONFIG` exported).

**1. Create view service file** (`src/view-service/entities/{entity-name}/{entity-name}-view-service.ts`):

```typescript
import { ENTITY_CONFIG } from "@config/entities/entity-name"
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig }
  from "@view-service/molecules/views"
import { buildStatusFormExtension } from "@view-service/sub-atoms"
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination"
import type { ListView, DetailView, FormView, ReferenceLookup } from "@view-service/types"
import type { PaginationMeta } from "@view-service/types"

export const EntityViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, ENTITY_CONFIG, referenceLookup, pagination)
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): DetailView {
    return buildDetailView(entity, ENTITY_CONFIG, referenceLookup)
  },

  prepareCreateForm(
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return {
      ...buildFormView(ENTITY_CONFIG, values, errors),
      ...buildStatusFormExtension(values),
    }
  },

  prepareEditForm(
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return {
      ...buildFormView(ENTITY_CONFIG, currentValues, errors, undefined, `Edit ${ENTITY_CONFIG.displayName}`),
      ...buildStatusFormExtension(currentValues),
    }
  },

  prepareDuplicateForm(sourceValues: Record<string, unknown>): FormView {
    const stripped = { ...sourceValues, id: undefined }
    return {
      ...buildFormView(ENTITY_CONFIG, stripped, undefined, undefined, `New ${ENTITY_CONFIG.displayName}`),
      currentState: "active" as const,
    }
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(ENTITY_CONFIG))
  },
}
```

**2. Create `index.ts`:**
```typescript
export { EntityViewService } from "./entity-name-view-service"
```

**3. Add to `src/view-service/entities/index.ts`:**
```typescript
export { EntityViewService } from "./entity-name"
```

**4. Run typecheck:**
```bash
bun run typecheck
```

---

### Workflow B: Adding a View Service for a Hierarchical Entity

Same as Workflow A, plus:

1. Add `selectOptions: Record<string, readonly SelectOption[]>` as first parameter of `prepareCreateForm`, `prepareEditForm`, `prepareDuplicateForm`
2. Pass `selectOptions` to `buildFormView(..., selectOptions, ...)`
3. Add `prepareFilteredListView` method:

```typescript
prepareFilteredListView(
  entities: Record<string, unknown>[],
  pagination?: PaginationMeta,
  referenceLookup?: ReferenceLookup,
): ListView {
  const full = buildListView(entities, ENTITY_CONFIG, referenceLookup, pagination)
  return buildFilteredListView(full, new Set(["parent_id_field_name"]))
}
```

Refer to `game-category-view-service.ts` (2 FK columns removed) as the reference implementation.

---

### Workflow C: Adding a New Field to an Existing Entity's Forms

If a new field is added to L0 config `buildFields()`:

- **List view**: auto-included if `showInList !== false` and `displayFormat !== "hidden"`
- **Detail view**: auto-included if `displayFormat !== "hidden"`
- **Form**: auto-included if `editable !== false`, `type !== "uuid"`, `type !== "timestamp"`
- **Browser config**: auto-included if `type !== "uuid"` and `type !== "timestamp"`

**No code change in L4 is needed for standard field types.**

**Code change is needed if:**
- The new field requires a `selectOptions` entry (reference field with a dropdown)
  → Add the FK service call in L3 pages, pass the option array to the view service
- The new field should NOT appear in the filtered list view
  → Add its name to the `Set` in `prepareFilteredListView`

---

### Workflow D: Debugging Field Not Appearing

```
SYMPTOM: Field missing from list
→ Check L0 field atom: showInList is not false?
→ Check L0 field atom: displayFormat is not "hidden"?
→ Check buildListView: field excluded by custom filter? (check for buildFilteredListView call)

SYMPTOM: Field missing from form
→ Check L0 field atom: editable is not false?
→ Check L0 field atom: type is not "uuid" or "timestamp"?
→ Check buildFormView: is selectOptions passed for reference fields?
  Reference fields with no options entry still appear but render no dropdown choices

SYMPTOM: Field missing from browser validation (L6 not validating it)
→ Check buildBrowserFieldConfig: type is not "uuid" or "timestamp"?
→ Check BrowserFieldConfig type in src/config/types/browser-field-config.ts:
  does it include the constraint property the field needs?
→ Check L6 browser validation: is it reading the new constraint property?

SYMPTOM: Wrong label on form field
→ Check L0 field atom: `label` property — this is the single source for all layers
→ L4 does not override labels; formatters do not change them

SYMPTOM: Reference field shows raw UUID instead of display name
→ Check: is referenceLookup passed to prepareDetailView / prepareListView?
→ Check: is buildReferenceLookup called in L3 pages with the correct field name key?
→ Check: does the UUID exist in the lookup map? (might be deleted reference)

SYMPTOM: Status toggle showing wrong state on edit form
→ Check deriveCurrentState: archived_reason check comes before is_active check
  An entity with archived_reason="x" always shows as archived regardless of is_active
→ Check: is archived_reason included in the entity values passed to prepareEditForm?
```

---

### Workflow E: Debugging Tier Re-render (Modifier)

```
SYMPTOM: Tier rows lost after validation failure
→ Check L3 pages: parseTiersJsonForRerender(input) called before prepareCreateForm?
→ Check: tiers_json is in MODIFIER_CONFIG.nonColumnKeys (passthroughKeys in L3)?
  If missing, Elysia's Value.Clean() strips it from the body before reaching the service

SYMPTOM: parseTiersJsonForRerender returns empty array
→ Check: browser JavaScript serializes tiers to tiers_json before form submit?
→ Log input["tiers_json"] in the pages handler to see raw value

SYMPTOM: Tier detail rows showing NaN
→ Check tiersToFormRows: source tier records have numeric values (not stringified numbers)?
→ Number() of an empty string or non-numeric value → 0 (not NaN); check DB column types
```

---

### Workflow F: Testing a View Service

View services are pure functions — test with plain data, no server needed.

```typescript
describe("EntityViewService", () => {
  it("prepareListView returns correct columns", () => {
    const view = EntityViewService.prepareListView([
      { id: "uuid-1", name: "Test", machine_name: "test", is_active: true }
    ])
    expect(view.title).toBe("Entities")  // pluralDisplayName
    expect(view.columns.find(c => c.name === "name")).toBeDefined()
    expect(view.rows).toHaveLength(1)
    expect(view.rows[0].id).toBe("uuid-1")
  })

  it("prepareCreateForm populates errors", () => {
    const view = EntityViewService.prepareCreateForm(
      { name: "" },
      { name: "Name is required" }
    )
    const nameField = view.fields.find(f => f.name === "name")
    expect(nameField?.error).toBe("Name is required")
  })

  it("prepareBrowserFieldConfig returns valid JSON", () => {
    const json = EntityViewService.prepareBrowserFieldConfig()
    expect(() => JSON.parse(json)).not.toThrow()
    const config = JSON.parse(json)
    expect(Array.isArray(config)).toBe(true)
    expect(config[0]).toHaveProperty("name")
    expect(config[0]).toHaveProperty("type")
  })

  it("prepareDuplicateForm sets currentState to active", () => {
    const view = EntityViewService.prepareDuplicateForm({
      id: "uuid-1", name: "Source", is_active: false
    })
    expect(view.currentState).toBe("active")
  })
})
```

Run with: `bun test src/view-service/entities/{entity-name}/`

---

### Workflow G: Git Conventions for L4 Changes

```bash
# New entity view service
feat(view-service): add EntityName L4 view service with list/detail/form methods

# New formatter sub-atom
feat(view-service): add formatCurrency sub-atom to formatters

# New view model type
feat(view-service): add EquipmentSlotView type to tier-view-models

# Bug fix in field filtering
fix(view-service): exclude archived_reason from filtered list view columns

# Extend existing view model
feat(view-service): add tierRows to Modifier prepareDetailView return type
```

**Rule:** L4-only changes use `view-service` scope. Multi-layer feature changes commit by
layer (one commit per layer). A new entity requires: L0 → L1 → L2 → L3 → **L4** → L5 → L6,
one commit each.

**PR checklist for L4 changes:**
- [ ] `bun run typecheck` passes
- [ ] New view service added to entity `index.ts`
- [ ] New entity view service exported from `src/view-service/entities/index.ts` (if simple entity)
- [ ] `prepareCreateForm` and `prepareEditForm` merge `buildStatusFormExtension()` for lifecycle entities
- [ ] `prepareDuplicateForm` sets `currentState: "active"` explicitly
- [ ] `prepareBrowserFieldConfig()` returns `JSON.stringify(buildBrowserFieldConfig(CONFIG))`
- [ ] Hierarchical entities implement `prepareFilteredListView()` with correct excluded fields
- [ ] Form methods accept `selectOptions` first param for reference-heavy entities
- [ ] Unit tests cover: column count, field names, error hydration, browser config JSON validity

---

## Related Documents

- [LAYER-000: Configuration Reference](LAYER-000-configuration-reference.md) — EntityConfig, FieldConfig, BrowserFieldConfig types
- [LAYER-003: Controller Reference](LAYER-003-controller-reference.md) — how L3 Pages files call L4 methods and pass results to L5
- [PDR-004: Entity & Config Model](PDR-004-entity-config-model.md) — write-once-share-everywhere principle that makes L4 auto-update on L0 changes
