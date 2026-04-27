# LAYER-005: View Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 5 at a Glance

Layer 5 renders HTML. It accepts typed view models from L4 and produces complete HTML strings
using TypeScript tagged template literals. There is no template engine, no framework, and no
runtime dependency — every file is a plain TypeScript function that returns `string`.

**L5 imports from:** L4 (view model types only — `FormView`, `ListView`, `DetailView`, etc.).  
**L5 is imported by:** L3 Controller (Pages files only).

**The security invariant:** All user-supplied strings and database values are escaped with
`escapeHtml()` before interpolation. Values pre-formatted by L4 (dates, numbers, status dots)
arrive as safe strings and are not double-escaped. This rule is enforced at the sub-atom
level — every primitive element calls `escapeHtml()` internally.

**The L0→L6 bridge:** `formSection()` and `tierFormSection()` embed JSON config in
`<script type="application/json">` tags. L6 reads these tags at runtime for browser
validation — no server round-trip needed.

---

## Directory Map

```
src/view/
├── sub-atoms/
│   └── elements/
│       ├── escape.ts               — escapeHtml: XSS prevention, escapes & < > " '
│       ├── button.ts               — button(), submitButton() → <button> HTML
│       ├── link.ts                 — link() → <a> HTML, icon constants (◎ ✎ ⧉ ✖)
│       ├── badge.ts                — badge(), statusBadgeInline() → <span> HTML
│       ├── input.ts                — input() → <input> | <textarea> | <select> HTML
│       ├── delete-form.ts          — deleteForm() → inline <form method="POST"> for delete
│       ├── filter-select.ts        — filterSelect() → <select> for list filter bar
│       ├── global-styles.ts        — globalStyles() → complete CSS stylesheet string (~220 lines)
│       └── nav-config.ts           — NAV_ITEMS[] constant (data-driven nav links)
├── atoms/
│   └── components/
│       ├── form-field.ts           — formField(FormField) → label + input + error HTML
│       ├── table-row.ts            — tableRow(ListViewRow, basePath) → <tr> with action links
│       ├── pagination-controls.ts  — paginationControls(PaginationMeta, basePath) → <nav>
│       ├── nav-item.ts             — navItem(label, href, active) → <li> nav entry
│       └── tab-panel.ts            — tabPanel(id, content, active) → <div role="tabpanel">
├── molecules/
│   └── sections/
│       ├── page-header.ts          — pageHeader(options) → <header> with title, breadcrumbs, actions
│       ├── data-table.ts           — dataTable(ListView, basePath) → <table> with rows + pagination
│       ├── form-section.ts         — formSection(FormView, action, ...) → <form> with all fields
│       ├── detail-section.ts       — detailSection(DetailView) → <dl> two-column detail list
│       ├── tab-bar.ts              — tabBar(TabDefinition[]) → <nav role="tablist">
│       └── status-form-section.ts  — statusFormSection(state, reason) → status radio fieldset
├── organisms/
│   ├── layouts/
│   │   └── main-layout.ts          — mainLayout(content, title, currentPath) → full HTML document
│   └── pages/
│       ├── home-page.ts            — homePage(EntityCardData[]) → dashboard HTML
│       ├── list-page.ts            — listPage(ListView, basePath) → list page HTML
│       ├── filtered-list-page.ts   — filteredListPage(ListView, basePath, filters[]) → filtered list HTML
│       ├── detail-page.ts          — detailPage(DetailView, id, basePath) → detail page HTML
│       ├── create-page.ts          — createPage(FormView, basePath, fieldConfigJson?) → create form HTML
│       ├── edit-page.ts            — editPage(FormView, id, basePath, fieldConfigJson?) → edit form HTML
│       └── duplicate-page.ts       — duplicatePage(FormView, basePath, fieldConfigJson?) → duplicate form HTML
└── entities/
    ├── game-domain/                — re-exports generic organisms unchanged
    ├── game-subdomain/             — custom listPage with 1-filter bar
    ├── game-category/              — custom listPage with 2-filter bar
    ├── game-subcategory/           — custom listPage with 3-filter bar
    ├── stat/                       — re-exports generic organisms unchanged
    ├── character-class/
    │   ├── stat-sheet-detail-section.ts — read-only stat sheet table grouped by category
    │   ├── stat-sheet-form-section.ts   — editable stat sheet + hidden stat_sheet_json input
    │   └── index.ts                — custom detail/form pages passing statSheet to L4 + L5
    ├── item/
    │   ├── stat-sheet-detail-section.ts — read-only stat sheet with combination_type column
    │   ├── stat-sheet-form-section.ts   — editable stat sheet with combination_type select column
    │   └── index.ts                — custom detail/form pages with 4-level cascade + stat sheet
    └── modifier/
        ├── index.ts                — all 5 page functions: custom multi-tab layout
        ├── modifier-tabs.ts        — MODIFIER_TABS constant (3-tab definition)
        ├── tier-form-section.ts    — tierFormSection() → editable tier table with JS hooks
        ├── tier-detail-section.ts  — tierDetailSection() → read-only tier table + inline edit UI
        ├── binding-detail-panel.ts — bindingDetailPanel() → category + subcategory binding tables
        └── assignment-detail-panel.ts — assignmentDetailPanel() → resolved eligibility panel
```

---

## Sub-Atoms (`src/view/sub-atoms/elements/`)

The smallest renderable units. Each produces one HTML element or one CSS concept.

### `escape.ts`

```typescript
export function escapeHtml(value: string): string
```

Escapes `&`, `<`, `>`, `"`, `'` to HTML entities. Called internally by every element
function — callers do not escape manually. **Never skip this on user or database content.**

Pre-formatted values from L4 (output of `formatText`, `formatDatetime`, `formatNumber`,
`formatBoolean`) are already safe — passing them through `escapeHtml` a second time would
corrupt the status dot HTML produced by `formatBoolean`. L5 molecules trust L4 output.

### `button.ts`

```typescript
export function button(
  label: string,
  variant: "primary" | "secondary" | "danger" = "primary",
  type: "submit" | "button" = "button",
): string

export function submitButton(label = "Save"): string
```

Produces `<button type="..." class="btn btn--{variant}">`. Label is escaped.

### `link.ts`

```typescript
export const ICON_VIEW   = "\u25CE"  // ◎
export const ICON_EDIT   = "\u270E"  // ✎
export const ICON_COPY   = "\u29C9"  // ⧉
export const ICON_DELETE = "\u2716"  // ✖

export function link(
  label: string,
  href: string,
  variant: "default" | "secondary" | "danger" = "default",
  icon?: string,
  iconOnly = false,
): string
```

Three render modes depending on `icon` and `iconOnly`:
- `iconOnly: true` → `<a class="link--icon-only" title="${label}">${icon}</a>` (no visible text)
- `icon` present → icon + space + label
- neither → text only

### `badge.ts`

```typescript
export function badge(label: string, cssClass: string): string

export function statusBadgeInline(isActive: boolean, archivedAt?: string): string
```

`statusBadgeInline` renders a 3-state badge using priority order:
1. `archivedAt` present → yellow dot + "Archived"
2. `isActive === false` → red dot + "Disabled"
3. default → green dot + "Active"

### `input.ts`

```typescript
export function input(
  name: string,
  inputType: string,
  value: unknown,
  required: boolean,
  options?: readonly SelectOption[],
): string
```

Dispatches on `inputType`:

| `inputType` | Output |
|---|---|
| `"textarea"` | `<textarea>` with escaped content |
| `"checkbox"` | Hidden input (value `"false"`) + visible checkbox (value `"true"`) |
| `"select"` | `<select>` with `-- Select --` placeholder + option list |
| anything else | `<input type="...">` with escaped value |

The checkbox pattern (hidden + visible pair) ensures the field always submits a value —
unchecked checkboxes send nothing in HTML forms without the hidden fallback.

### `delete-form.ts`

```typescript
export function deleteForm(
  action: string,
  label = "Delete",
  small = false,
  iconOnly = false,
): string
```

Wraps a danger button in an inline POST form. HTML forms cannot send DELETE requests —
this pattern uses `POST /{id}/delete` instead. L3 Pages handle this route and call the
service delete method.

### `filter-select.ts`

```typescript
export function filterSelect(
  name: string,
  placeholder: string,
  options: readonly SelectOption[],
  selectedValue?: string,
): string
```

Renders a `<select>` with a blank placeholder option. `selectedValue` is compared to each
option value to set `selected` attribute — preserves filter state across page loads.

### `global-styles.ts`

```typescript
export function globalStyles(): string
```

Returns a complete `<style>` block (~220 lines). Called once by `mainLayout` and embedded
inline — no external CSS files, no CDN. All styles live here.

Key CSS classes used by other functions:

| Class | Used by |
|---|---|
| `.btn`, `.btn--primary/secondary/danger`, `.btn--small` | `button()`, `link()` |
| `.main-nav`, `.nav-item`, `.nav-item--active` | `mainLayout`, `navItem()` |
| `.data-table`, `.data-table--compact` | `dataTable()` |
| `.form-field`, `.form-field--required`, `.form-field--invalid`, `.field-error` | `formField()` |
| `.entity-form`, `.form-actions` | `formSection()` |
| `.detail-list`, `.detail-list--two-col`, `.detail-list__row` | `detailSection()` |
| `.status-dot--active/inactive/archived` | `badge()`, `statusBadgeInline()` |
| `.tab-bar`, `.tab-bar__tab`, `.tab-bar__tab--active`, `.tab-panel` | `tabBar()`, `tabPanel()` |
| `.tier-table`, `.binding-table`, `.assignment-table`, `.assignment-summary` | Modifier entity (tiers, bindings, assignments panels) |
| `.pagination`, `.pagination__link`, `.pagination__link--active` | `paginationControls()` |
| `.status-section--form` | `statusFormSection()` |

### `nav-config.ts`

```typescript
export interface NavItemConfig {
  readonly label: string
  readonly href: string
}

export interface NavChildItem {
  readonly label: string;
  readonly href: string;
}

export interface NavItemConfig {
  readonly label: string;
  readonly href?: string;
  readonly children?: readonly NavChildItem[];
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { label: "Home", href: "/" },
  {
    label: "Hierarchy",
    children: [
      { label: "Domains",       href: "/game-domains" },
      { label: "Subdomains",    href: "/game-subdomains" },
      { label: "Categories",    href: "/game-categories" },
      { label: "Subcategories", href: "/game-subcategories" },
    ],
  },
  { label: "Stats", href: "/stats" },
  {
    label: "Character",
    children: [
      { label: "Character Classes", href: "/character-classes" },
    ],
  },
  {
    label: "Modifiers",
    children: [
      { label: "Item Modifiers", href: "/modifiers" },
    ],
  },
  {
    label: "Assets",
    children: [
      { label: "Base Items", href: "/items" },
    ],
  },
]
```

Data-driven nav — adding a new entity to the nav requires only a new entry here. No
function changes needed.

---

## Atoms (`src/view/atoms/components/`)

Single-component functions that compose one or more sub-atoms.

### `form-field.ts`

```typescript
export function formField(field: FormField): string
```

Composes `label` + `input()` + optional error message:

```html
<div class="form-field [form-field--required] [form-field--invalid]">
  <label for="{name}">{label}</label>
  {input(name, inputType, value, required, options)}
  <!-- if field.error: -->
  <span class="field-error">{error}</span>
</div>
```

`form-field--required` and `form-field--invalid` classes are added conditionally.
The `form-field--invalid` class drives CSS styling (red border on the input).

### `table-row.ts`

```typescript
export function tableRow(row: ListViewRow, basePath: string): string
```

Renders a `<tr>` with data cells and an actions column. Special handling per column:

- **First column** (`fields[0]`): rendered as `<a href="${basePath}/${id}">` with tooltip
  showing `metadata.description` if present
- **`is_active` column**: passes `rawValue` (boolean) through `statusBadgeInline()` to show
  3-state dot — uses the pre-resolved `archivedAt` from row metadata
- **All other columns**: rendered as `escapeHtml(field.value)` (already formatted by L4)

Actions column: View (◎), Edit (✎), Duplicate (⧉), Delete form (✖).

### `pagination-controls.ts`

```typescript
export function paginationControls(
  pagination: PaginationMeta,
  basePath: string,
): string
```

Returns empty string when `pagination.totalPages <= 1`. Otherwise renders a `<nav>` with:
- Record range: "Showing 1–20 of 45 records"
- Page links with a 7-link window (first, last, current ±2, with `…` ellipsis gaps)
- Prev/Next links

### `nav-item.ts`

```typescript
export function navItem(label: string, href: string, active = false): string
```

Renders `<li class="nav-item [nav-item--active]">`. Active state set by `mainLayout` based
on `currentPath` matching.

### `tab-panel.ts`

```typescript
export function tabPanel(id: string, content: string, active: boolean): string
```

Renders `<div class="tab-panel" id="panel-{id}" role="tabpanel">`. Inactive panels have
`style="display:none"`. L6 browser JS toggles visibility on tab click.

---

## Molecules (`src/view/molecules/sections/`)

Composed sections that combine multiple atoms into a meaningful UI block.

### `page-header.ts`

```typescript
interface PageHeaderOptions {
  title: string
  badge?: string           // raw HTML — pre-rendered badge
  backUrl?: string         // renders ← Back link (alternative to breadcrumbs)
  breadcrumbs?: readonly { label: string; href?: string }[]
  actionLabel?: string     // single action button label
  actionUrl?: string       // single action button URL
  actions?: string         // raw HTML — multiple action buttons/links
}

export function pageHeader(options: PageHeaderOptions): string
```

Renders `<header class="page-header">` with:
- Breadcrumbs (items with `href` are links, last item is plain text) — separator `›`
- OR back link (← label) when `backUrl` provided
- `<h1>` + optional badge (inline)
- Action area (right side): `actions` HTML or single `link(actionLabel, actionUrl)`

### `data-table.ts`

```typescript
export function dataTable(
  view: ListView,
  basePath: string,
  paginationBasePath?: string,
): string
```

Renders empty state `<p>` when `view.rows` is empty.

Column count determines CSS class: `≤5 columns` → `data-table data-table--compact`,
`>5 columns` → `data-table`.

Calls `tableRow()` for each row. Calls `paginationControls()` with `paginationBasePath`
(falls back to `basePath`) for page navigation links.

### `form-section.ts`

```typescript
export function formSection(
  view: FormView,
  action: string,
  cancelUrl: string,
  fieldConfigJson?: string,
  extraContent?: string,
): string
```

Renders `<form method="POST" action="${action}">` containing:
1. `<script id="field-config" type="application/json">` — L0 config for L6 (if provided)
2. All `formField()` calls for `view.fields`
3. `extraContent` — injected after fields (used for `statusFormSection`, tier section)
4. Form actions: `submitButton()` + Cancel link

### `detail-section.ts`

```typescript
export function detailSection(view: DetailView): string
```

Renders `<dl class="detail-list detail-list--two-col">` with `<dt>/{<dd>` pairs.

**Excludes from the dl:** `is_active`, `created_at`, `updated_at`, `archived_at`,
`archived_reason` — these are rendered separately by page organisms (status badge, audit
footer) rather than in the main field list.

Values from L4 are already formatted strings — they are interpolated directly without
re-escaping (double-escaping would corrupt HTML status dots from `formatBoolean`).

### `tab-bar.ts`

```typescript
interface TabDefinition {
  readonly id: string
  readonly label: string
  readonly active: boolean
  readonly disabled?: boolean
}

export function tabBar(tabs: readonly TabDefinition[]): string
```

Renders `<nav class="tab-bar" role="tablist">`. Active tab gets `tab-bar__tab--active` class.
Disabled tabs get `disabled` attribute and `tab-bar__tab--disabled` class. L6 listens for
click events on `[data-tab]` to switch panels.

### `status-form-section.ts`

```typescript
export function statusFormSection(
  currentState: "active" | "disabled" | "archived",
  reasonValue?: string,
): string
```

Renders a `<fieldset>` with three radio buttons: Active, Disabled, Archived. The checked
radio matches `currentState`.

The reason textarea (`name="status_reason"`) is shown/hidden via CSS `:has()` selector:
```css
.status-section--form:has(input[value="disabled"]:checked) .status-reason-wrap { display: block; }
.status-section--form:has(input[value="archived"]:checked) .status-reason-wrap { display: block; }
```

No JavaScript required — CSS handles the conditional display. Only `status_action` and
`status_reason` are submitted with the form; L2 `applyStatusAction` translates them into
`is_active`, `archived_at`, and `archived_reason` column values.

---

## Organisms: Layouts (`src/view/organisms/layouts/`)

### `main-layout.ts`

```typescript
export function mainLayout(
  content: string,
  title: string,
  currentPath = "/",
): string
```

Produces the complete HTML document:

```
<!DOCTYPE html> → <html> → <head> (meta, title, inline styles) → <body>
  → <nav> (brand + NAV_ITEMS mapped to navItem())
  → <main> (content)
  → <footer>
  → <script src="/public/main.js" defer>
```

**Active nav detection:** exact match for `/`, `startsWith` for all other paths. So
`/game-domains/abc123` correctly highlights the "Game Domains" nav item.

**CSS delivery:** `globalStyles()` is called once inside `<head>` — all styles embedded
inline. No external CSS files.

**Browser JS:** `main.js` is loaded via `defer` — it runs after DOM is ready.

---

## Organisms: Pages (`src/view/organisms/pages/`)

Page organisms compose molecules into a complete page body, then wrap with `mainLayout`.
Each returns a fully rendered HTML document string.

### `list-page.ts`

```typescript
export function listPage(view: ListView, basePath: string): string
```

Structure: `pageHeader` (title + "New" button) → `dataTable`.

### `filtered-list-page.ts`

```typescript
interface FilterDropdownConfig {
  readonly name: string
  readonly placeholder: string
  readonly options: readonly SelectOption[]
  readonly selectedValue?: string
}

export function filteredListPage(
  view: ListView,
  basePath: string,
  filters: readonly FilterDropdownConfig[],
): string
```

Structure: `pageHeader` → filter bar (`<form method="GET">` with `filterSelect()` per filter
→ Filter button → Clear button if any filter active) → `dataTable`.

Pagination links include filter params in the query string so filters persist across pages.

### `detail-page.ts`

```typescript
export function detailPage(view: DetailView, id: string, basePath: string): string
```

Structure: `pageHeader` (breadcrumbs + status badge + Edit/Duplicate/Delete actions) →
`detailSection`.

Breadcrumbs: `[listName → basePath]` › `[entity title]`.

List name is derived from `basePath`: `/game-domains` → "Game Domains" by splitting on `-`
and capitalising each word.

### `create-page.ts`

```typescript
export function createPage(
  view: FormView,
  basePath: string,
  fieldConfigJson?: string,
): string
```

Structure: `pageHeader` (breadcrumbs: list → "New") → `formSection`.

If `view.currentState` is defined: filters `is_active` field out of the form (radio buttons
replace it) and passes `statusFormSection(view.currentState, view.statusReason)` as
`extraContent` to `formSection`.

### `edit-page.ts`

```typescript
export function editPage(
  view: FormView,
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string
```

Structure: `pageHeader` (breadcrumbs) → `formSection` (POST to `${basePath}/${id}`) →
Duplicate icon link below form.

Same `is_active` / status form handling as `createPage`.

### `duplicate-page.ts`

```typescript
export function duplicatePage(
  view: FormView,
  basePath: string,
  fieldConfigJson?: string,
): string
```

Structure: `pageHeader` → duplicate notice banner → `formSection`.

Notice text: *"Duplicating entry. Update the Name and Description before saving."*

Posts to `basePath` (creates a new record, not updating the source). L4 `prepareDuplicateForm`
strips the source `id` and forces `currentState: "active"`.

---

## Entities: Generic Entities

### `game-domain/index.ts`, `stat/index.ts`

```typescript
export { listPage, detailPage, createPage, editPage, duplicatePage }
  from "../../organisms/pages"
```

Pure re-exports — generic organisms satisfy all requirements. No custom rendering.

### `game-subdomain/index.ts`

```typescript
interface SubdomainFilterOptions {
  readonly domainOptions: readonly SelectOption[]
}

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: SubdomainFilterOptions,
  filterValues: Record<string, string | undefined>,
): string
```

Thin wrapper over `filteredListPage` with one `FilterDropdownConfig` (domain).
`detailPage`, `createPage`, `editPage`, `duplicatePage` are re-exported unchanged.

### `game-category/index.ts`

Two-filter listPage (domain + subdomain). Same thin-wrapper pattern.

### `game-subcategory/index.ts`

Three-filter listPage (domain + subdomain + category). Same thin-wrapper pattern.

---

## Entities: CharacterClass (Stat Sheet)

CharacterClass uses generic organisms for list/create/duplicate/detail/edit pages but adds
an inline stat sheet table to detail and form pages.

### `stat-sheet-detail-section.ts`

```typescript
export function statSheetDetailSection(
  statSheet: readonly StatSheetViewRow[],
): string
```

Read-only table grouped by `stat_category`. Each row shows: stat name, data type (%, ×, or
blank for raw), value range (min–max), default value, and the character class's `base_value`.
Rendered inside the `detailPage` as a section below the main `detailSection`.

### `stat-sheet-form-section.ts`

```typescript
export function statSheetFormSection(
  statSheet: readonly StatSheetViewRow[],
): string
```

Editable table with one `<input type="number">` per stat row for `base_value`. Grouped by
category. At form submit, L6 serializes the filled values into
`<input type="hidden" name="stat_sheet_json">`. The hidden field is in
`CHARACTER_CLASS_CONFIG.nonColumnKeys` so it reaches the service layer intact.

---

## Entities: Item (Stat Sheet + Hierarchy)

Item combines the hierarchical cascade pattern (4-level filter) with a stat sheet, and adds
a `combination_type` column to every stat row.

### `stat-sheet-detail-section.ts`

```typescript
export function statSheetDetailSection(
  statSheet: readonly ItemStatBaseViewRow[],
): string
```

Same structure as CharacterClass stat sheet detail but adds a **Combination Type** column
(flat/increased/more) to each row. Only rows with `base_value !== 0` exist — items have
sparse stat bases.

### `stat-sheet-form-section.ts`

```typescript
export function statSheetFormSection(
  statSheet: readonly ItemStatBaseViewRow[],
): string
```

Editable table with two inputs per row: a `<select>` for `combination_type` and a
`<input type="number">` for `base_value`. Rows where both are at their zero defaults can be
left blank. Serialized to `stat_sheet_json` by L6 before form submit — zero-value rows are
filtered out in the service layer.

---

## Entities: Modifier (Complex Multi-Tab)

Modifier views use a 3-tab layout for detail and edit pages. Each tab is a separate
`tabPanel` toggled by L6 browser JS.

### Tab Definitions (`modifier-tabs.ts`)

```typescript
export const MODIFIER_TABS: readonly TabDefinition[] = [
  { id: "definition", label: "Definition & Tiers", active: true  },
  { id: "bindings",   label: "Bindings",            active: false },
  { id: "assignments",label: "Assignments",          active: false },
]
```

The first tab is active by default. L6 switches to other tabs on click.

### `listPage` (4-filter)

```typescript
export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: ModifierFilterOptions,
  filterValues: Record<string, string | undefined>,
): string
```

Four cascading filter dropdowns: domain → subdomain → category → subcategory.

### `createPage` and `duplicatePage`

Single-screen form (no tabs). Structure:
1. `pageHeader`
2. `formSection` with `is_active` field removed, plus:
   - `statusFormSection` (status radio)
   - `tierFormSection` (tier table)

### `detailPage`

```typescript
export function detailPage(
  view: ModifierDetailView,  // DetailView + tierRows + bindings + assignments + status
  id: string,
  basePath: string,
): string
```

Three-tab layout:
- **Tab 1 — Definition & Tiers:** `detailSection` + `tierDetailSection` + status badge
- **Tab 2 — Bindings:** `bindingDetailPanel(categoryBindings, subcategoryBindings)`
- **Tab 3 — Assignments:** `assignmentDetailPanel(assignments)`

Action buttons: Edit, Duplicate, Delete.

### `editPage`

```typescript
export function editPage(
  view: ModifierFormView,  // FormView + tierRows + tierFieldMeta + currentState + bindings + assignments
  id: string,
  basePath: string,
  fieldConfigJson?: string,
): string
```

Three-tab layout:
- **Tab 1 — Definition & Tiers:** `formSection` with `statusFormSection` + `tierFormSection` as `extraContent`, plus Duplicate link
- **Tab 2 — Bindings:** `bindingDetailPanel`
- **Tab 3 — Assignments:** `assignmentDetailPanel`

### `tier-form-section.ts`

```typescript
export function tierFormSection(
  tierRows: readonly TierFormRow[],
  tierFieldMeta: readonly TierFieldMeta[],
): string
```

Renders an editable tier table. Each row has `data-tier-index` and `data-field` attributes
for L6 manipulation:

```html
<tr class="tier-row" data-tier-index="{n}">
  <td class="tier-index">{n}</td>
  <td><input type="number" data-field="tier_min_value" value="..." step="0.0001" /></td>
  <td><input type="number" data-field="tier_max_value" ... /></td>
  <td><input type="number" data-field="tier_level_req" min="1" max="99" ... /></td>
  <td><input type="number" data-field="tier_spawn_weight" min="0" max="10000" ... /></td>
  <td><button type="button" class="btn-remove-tier">Remove</button></td>
</tr>
```

At the bottom:
- `+ Add Tier` button (L6 appends a new row)
- `<input type="hidden" name="tiers_json">` — L6 serializes the table to JSON before submit
- `<script id="tier-field-config" type="application/json">` — tier column meta for L6

The hidden `tiers_json` field is in `MODIFIER_CONFIG.nonColumnKeys` (`passthroughKeys`
in L3), so it survives TypeBox `Value.Clean()` and reaches the service layer.

### `tier-detail-section.ts`

```typescript
export function tierDetailSection(tierRows: readonly TierDetailRow[]): string
```

Read-only tier table with Edit (✎) and Delete (✖) buttons per row. L6 intercepts these
button clicks and calls `/api/modifiers/:id/tiers/:tierIndex` endpoints. An inline edit
form (`display:none`) is embedded for in-place editing without page reload.

### `binding-detail-panel.ts`

```typescript
export function bindingDetailPanel(
  categoryBindings: readonly BindingDetailRow[],
  subcategoryBindings: readonly BindingDetailRow[],
): string
```

Two sections (category bindings + subcategory bindings), each with:
- A binding table (target name, included/excluded status, weight, tier range, level req, actions)
- "Add Binding" button
- Hidden add-binding form (revealed by L6 on button click)

L6 handles all binding mutations via fetch calls to `/api/modifiers/:id/bindings` endpoints.
The panel re-renders (or patches the DOM) after each operation.

### `assignment-detail-panel.ts`

```typescript
export function assignmentDetailPanel(data: AssignmentPanelData): string
```

Read-only computed panel. No user actions — shows resolved eligibility for all subcategories.

Structure:
1. Summary row: Eligible / Excluded / No binding / Total counts (4 stat boxes)
2. Category groups, each with a subcategory table

Subcategory rows show: name, status badge (included/excluded/none), source badge
(explicit/category-inherited/none), weight override, tier range, level req override.

Data is computed by `ModifierAssignmentViewService.preparePanel()` in L4 — L5 only
renders what it receives.

---

## Cross-Layer Dependency Map

```
L4 View Service
  ListView → listPage, filteredListPage, dataTable
  DetailView → detailPage, detailSection
  FormView → createPage, editPage, duplicatePage, formSection
  FormView + tierRows + tierFieldMeta → Modifier createPage/editPage
  DetailView + tierRows + bindings + assignments → Modifier detailPage
  PaginationMeta → paginationControls, buildPaginationMeta (computed in L3)
  BrowserFieldConfig[] (JSON stringified) → formSection <script> tag → L6

L0 Configuration (indirectly via L4)
  EntityConfig.displayName → page titles (via FormView.title, ListView.title)
  EntityConfig.pluralDisplayName → list page title
  FieldConfig.displayFormat → FormField.inputType (set by L4 formatInputType)

L3 Controller (Pages files — call direction: L3 → L5)
  Pages files import page functions and pass L4 view models
  Return value is the complete HTML string sent as HTTP response
```

---

## Workflows

### Workflow A: Adding a View for a New Simple Entity

**Preconditions:** L4 view service created.

**1. Create entity view directory** (`src/view/entities/{entity-name}/`).

**2. For simple entities** (no cascade, no tabs): just re-export generic organisms:

```typescript
// src/view/entities/{entity-name}/index.ts
export { listPage, detailPage, createPage, editPage, duplicatePage }
  from "../../organisms/pages"
```

**3. Wire in L3 pages file:**

```typescript
import { listPage, detailPage, createPage, editPage, duplicatePage }
  from "@view/entities/{entity-name}"
```

**4. Run typecheck:**
```bash
bun run typecheck
```

That's the complete L5 addition for a simple entity — zero new rendering code.

---

### Workflow B: Adding a View for a Hierarchical Entity (With Filters)

**1. Create entity view directory and `index.ts`:**

```typescript
import { filteredListPage } from "../../organisms/pages"
export { detailPage, createPage, editPage, duplicatePage }
  from "../../organisms/pages"
import type { ListView, SelectOption } from "@view-service/types"

interface EntityFilterOptions {
  readonly parentOptions: readonly SelectOption[]
  // add more as needed for deeper hierarchies
}

export function listPage(
  view: ListView,
  basePath: string,
  filterOptions: EntityFilterOptions,
  filterValues: Record<string, string | undefined>,
): string {
  return filteredListPage(view, basePath, [
    {
      name: "parent_id",
      placeholder: "All Parents",
      options: filterOptions.parentOptions,
      selectedValue: filterValues["parent_id"],
    },
  ])
}
```

**2. Update L3 pages** to import the custom `listPage` and pass filter options from
`buildCascadingOptions`.

**3. Run typecheck.**

---

### Workflow C: Adding a Field to Forms or Tables

If the L0 config `buildFields()` has a new field with default `showInList`, `editable`,
and `displayFormat` settings:

- **Tables:** auto-included by `buildListView` → `dataTable`. No L5 change needed.
- **Forms:** auto-included by `buildFormView` → `formSection`. No L5 change needed.
- **Detail page:** auto-included by `buildDetailView` → `detailSection`. No L5 change needed.

**A L5 change is needed only if:**
- The new field needs a custom render in the table (non-standard cell content)
  → Modify `tableRow()` with a special-case branch
- The new field needs custom form placement (e.g., outside the main field list)
  → Pass it as `extraContent` via `formSection`, or add a new molecule

---

### Workflow D: Adding a New Tab to a Multi-Tab Page

Example: adding a "History" tab to Modifier.

1. Add tab definition to `modifier-tabs.ts`:
   ```typescript
   { id: "history", label: "History", active: false }
   ```
2. Create `history-panel.ts` in `src/view/entities/modifier/`:
   ```typescript
   export function historyPanel(entries: readonly HistoryRow[]): string { ... }
   ```
3. Add `tabPanel("history", historyPanel(view.historyRows), false)` to the tab layout
   in `detailPage` and `editPage`
4. L6 tab-switching code will auto-detect the new panel via `id="panel-history"` — no JS
   changes needed if the data-tab attribute is consistent

---

### Workflow E: Debugging Rendering Issues

```
SYMPTOM: HTML entity codes showing in page (e.g., &amp; instead of &)
→ A value is being double-escaped
→ Find where the value was formatted by L4 (e.g., formatBoolean returns HTML status dot)
→ Check where it's interpolated in L5 — remove the escapeHtml() call on pre-formatted values
→ Rule: only call escapeHtml() on raw user strings and raw DB values, not on L4 output

SYMPTOM: Status dot not showing on list row
→ Check tableRow.ts: is_active column uses rawValue (boolean), not value (formatted string)
→ Check ListViewRow.fields[n].rawValue is populated by buildListView in L4
→ Check: is archivedAt in row.metadata? (affects 3-state logic)

SYMPTOM: Filter values lost after pagination click
→ Check filteredListPage: are filter params appended to pagination URLs?
→ Check L3 pages: is filterValues extracted from query and passed to listPage?

SYMPTOM: Form missing a field
→ Check L4 buildFormView: is editable set to false? type uuid or timestamp?
→ Check: field is in ENTITY_CONFIG.buildFields() at all?

SYMPTOM: Field config JSON not reaching browser (L6 can't validate)
→ Check createPage/editPage: is fieldConfigJson passed as third argument?
→ Check L3 pages: is EntityViewService.prepareBrowserFieldConfig() called and result passed?
→ Check formSection: does it include the <script id="field-config"> block?
→ Browser DevTools: look for <script id="field-config" type="application/json"> in page source

SYMPTOM: Tab panel not switching
→ Check panel IDs: panel-{id} must match tab data-tab="{id}"
→ Check L6 tab-switcher code is loaded (main.js present, no console errors)
→ Check MODIFIER_TABS: new tab has id matching panel?

SYMPTOM: Status reason textarea not appearing when Disabled selected
→ Check global-styles.ts: CSS :has() selectors present?
→ :has() requires modern browser — check browser compatibility if testing in old browser
→ Check status_action radio button values match "disabled" and "archived" exactly
```

---

### Workflow F: Testing L5 Rendering

L5 functions are pure — test by calling them and asserting on the returned HTML string.

```typescript
describe("listPage", () => {
  it("renders table headers from view columns", () => {
    const view: ListView = {
      title: "Game Domains",
      columns: [{ name: "name", label: "Name" }],
      rows: [],
      count: 0,
    }
    const html = listPage(view, "/game-domains")
    expect(html).toContain("Game Domains")
    expect(html).toContain("<th>Name</th>")
  })

  it("shows empty state when no rows", () => {
    const view = { title: "Domains", columns: [], rows: [], count: 0 }
    const html = listPage(view, "/game-domains")
    expect(html).toContain("No Domains found.")
  })
})

describe("formSection", () => {
  it("embeds field config JSON in script tag", () => {
    const view: FormView = { title: "New Domain", fields: [] }
    const html = formSection(view, "/game-domains", "/game-domains", '["config"]')
    expect(html).toContain('<script id="field-config" type="application/json">')
    expect(html).toContain('["config"]')
  })
})

describe("escapeHtml", () => {
  it("escapes XSS vectors", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain("<script>")
    expect(escapeHtml("O'Brien")).toBe("O&#039;Brien")
  })
})
```

Run with: `bun test src/view/`

---

### Workflow G: Git Conventions for L5 Changes

```bash
# New entity view (re-export pattern)
feat(view): add EntityName L5 view (re-export generic organisms)

# New entity with custom filter list
feat(view): add EntityName L5 view with hierarchy filter list page

# New molecule
feat(view): add historySection molecule to view sections

# Bug fix in escaping
fix(view): escape archived_reason in detail-section list rows

# New sub-atom
feat(view): add tooltip sub-atom for hover text rendering

# CSS change
feat(view): add .tier-table--editing modifier class to global-styles
```

**Rule:** L5-only changes use `view` scope. A new entity that touches L0–L6 commits one
commit per layer. CSS-only changes to `global-styles.ts` use `view` scope even though they
affect all pages.

**PR checklist for L5 changes:**
- [ ] `bun run typecheck` passes
- [ ] `escapeHtml()` called on all raw user/DB strings (no pre-formatted L4 values escaped)
- [ ] New entity view directory has `index.ts`
- [ ] New entity view re-exports or wraps generic organisms (don't duplicate page structure)
- [ ] Status form section wired for entities using lifecycle (is_active / archived fields)
- [ ] `fieldConfigJson` passed through to `formSection` (required for L6 browser validation)
- [ ] Filter options type-safe (custom interface per entity, not `Record<string, unknown>`)
- [ ] Spot-check rendered HTML in browser (typecheck does not catch template literal errors)

---

## Related Documents

- [LAYER-004: View Service Reference](LAYER-004-view-service-reference.md) — L4 view models that L5 consumes
- [LAYER-003: Controller Reference](LAYER-003-controller-reference.md) — how L3 Pages files call L5 page functions
- [LAYER-006: Browser Reference](LAYER-006-browser-reference.md) — how L6 reads `<script type="application/json">` data embedded by L5
