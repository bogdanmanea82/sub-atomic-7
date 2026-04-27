# LAYER-006: Browser Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 6 at a Glance

Layer 6 is the client-side JavaScript layer. It runs in the browser after the server renders
HTML. Its responsibilities are: inline form validation, async form submission, name
availability checks, cascading dropdown population, tab switching, tier and binding CRUD,
delete confirmation, and flash messaging across redirects.

**L6 imports from:** L0 (the `BrowserFieldConfig` type only — read from a JSON tag embedded
by L5, not imported at compile time).  
**Nothing imports from L6** — it is the outermost layer.

**Build:** `bun build src/browser/main.ts --outdir public --minify --target browser`  
**Output:** `public/main.js` — one bundle, loaded via `<script src="/public/main.js" defer>`
in every page from `mainLayout`.

**The L0→L6 bridge:** L5's `formSection` embeds `BrowserFieldConfig[]` as JSON in a
`<script id="field-config" type="application/json">` tag. L6 reads this on
`DOMContentLoaded` to drive all form validation — no hardcoded field rules anywhere in
browser code.

---

## Directory Map

```
src/browser/
├── main.ts                            — entry point: DOMContentLoaded, flash display, ENTITY_ROUTES router
├── sub-atoms/
│   ├── routing/
│   │   ├── route-config.ts            — EntityRouteConfig type definition
│   │   ├── entity-routes.ts           — ENTITY_ROUTES: readonly config array for all 8 entities
│   │   └── index.ts
│   ├── validation/
│   │   ├── validate-required.ts       — validateRequired: empty/whitespace check
│   │   ├── validate-string-length.ts  — validateStringLength: min/max char bounds
│   │   ├── validate-integer-range.ts  — validateIntegerRange: integer + range bounds
│   │   ├── validate-pattern.ts        — validatePattern: RegExp test
│   │   └── index.ts
│   └── utilities/
│       ├── fetch-json.ts              — fetchJson/postJson/putJson/deleteJson + ApiError
│       ├── escape-text.ts             — escapeText: XSS-safe DOM text insertion
│       ├── inject-styles.ts           — injectStylesOnce: dedup CSS injection via Set
│       ├── flash-message.ts           — setFlashMessage/consumeFlashMessage (sessionStorage)
│       ├── debounce.ts                — debounce: delays fn until input pauses
│       ├── throttle.ts                — throttle: rate-limits fn to one call per interval
│       └── index.ts
├── atoms/
│   ├── handlers/
│   │   ├── form-submit-handler.ts     — attachFormSubmitHandler: intercept, coerce, POST/PUT
│   │   ├── input-change-handler.ts    — attachInputChangeHandler: blur + debounced input
│   │   ├── name-availability-handler.ts — attachNameAvailabilityHandler: unique name check
│   │   ├── cascade-dropdown-handler.ts — attachCascadeDropdownHandler: parent→child select
│   │   ├── tab-switch-handler.ts      — attachTabSwitchHandler: hash-based tab navigation
│   │   ├── tier-row-handler.ts        — attachTierHandlers: dynamic tier row add/remove/sync
│   │   ├── tier-detail-handler.ts     — attachTierDetailHandler: tier CRUD on detail page
│   │   ├── binding-handler.ts         — attachBindingHandler: binding CRUD on detail/edit
│   │   ├── delete-handler.ts          — attachDeleteHandler: confirm then DELETE
│   │   ├── search-handler.ts          — attachSearchHandler: filter table rows by text
│   │   ├── duplicate-handler.ts       — showDuplicateNotice: info toast on duplicate page
│   │   └── index.ts
│   ├── validation/
│   │   ├── build-field-validator.ts   — buildFieldValidator: composes sub-atoms per BrowserFieldConfig
│   │   └── index.ts
│   └── routing/
│       ├── init-entity-routes.ts      — initEntityRoutes: path match → controller init
│       └── index.ts
├── molecules/
│   ├── ui/
│   │   ├── toast.ts                   — showToast: auto-dismiss notification (success/error/info)
│   │   ├── validation-errors.ts       — displayFieldError, displayFormErrors, clearFormErrors
│   │   ├── modal.ts                   — confirmModal: Promise-based confirmation dialog
│   │   ├── loading.ts                 — showLoading/hideLoading: full-screen spinner
│   │   └── index.ts
│   └── validation/
│       ├── validate-all-fields.ts     — validateAllFields: run all field validators, collect errors
│       └── index.ts
└── organisms/
    └── controllers/
        ├── form-controller.ts         — initFormController: create/edit page orchestration
        ├── detail-controller.ts       — initDetailController: detail page orchestration
        ├── list-controller.ts         — initListController: list page orchestration
        └── index.ts
```

---

## Entry Point (`src/browser/main.ts`)

```typescript
document.addEventListener("DOMContentLoaded", init)

function readFieldConfig(): readonly BrowserFieldConfig[] {
  const el = document.getElementById("field-config")
  if (!el) return []
  return JSON.parse(el.textContent ?? "[]") as BrowserFieldConfig[]
}

function init(): void {
  const flash = consumeFlashMessage()
  if (flash) showToast(flash.message, flash.type)

  const path = window.location.pathname
  const fieldConfig = readFieldConfig()

  for (const route of ENTITY_ROUTES) {
    if (initEntityRoutes(route, path, fieldConfig)) break
  }
}
```

**Boot sequence on every page:**
1. Read `<script id="field-config">` → `BrowserFieldConfig[]` (empty array on non-form pages)
2. Consume any flash message from `sessionStorage` and show toast
3. Loop `ENTITY_ROUTES` — stop on first match
4. The matched route's controller inits the page-specific behaviour

---

## Sub-Atoms: Routing (`src/browser/sub-atoms/routing/`)

### `route-config.ts` — `EntityRouteConfig` type

```typescript
interface EntityRouteConfig {
  readonly basePath: string               // e.g. "/game-domains"
  readonly apiBasePath: string            // e.g. "/api/game-domains"
  readonly displayName: string            // e.g. "Game Domain"
  readonly checkNameUrl?: string          // e.g. "/api/game-domains/check-name"
  readonly checkMachineNameUrl?: string   // e.g. "/api/game-domains/check-machine-name"
  readonly cascades?: readonly CascadeDropdownOptions[]  // form cascades
  readonly onListInit?: () => void        // extra init for list pages
  readonly onDetailInit?: () => void      // extra init for detail/show pages
  readonly onFormInit?: (form: HTMLFormElement) => void  // extra init for form pages
}
```

### `entity-routes.ts` — `ENTITY_ROUTES` array

Eight entries, one per entity. Each defines the URLs, API paths, and optional cascade/init hooks.

| Entity | `basePath` | `apiBasePath` | Cascades on form | Special hooks |
|---|---|---|---|---|
| GameDomain | `/game-domains` | `/api/game-domains` | none | — |
| GameSubdomain | `/game-subdomains` | `/api/game-subdomains` | none | — |
| GameCategory | `/game-categories` | `/api/game-categories` | none | `onListInit`: filter cascade domain→subdomain |
| GameSubcategory | `/game-subcategories` | `/api/game-subcategories` | domain→sub→cat | `onListInit`: 2 filter cascades; `onFormInit`: reset category on domain change |
| Stat | `/stats` | `/api/stats` | none | — |
| CharacterClass | `/character-classes` | `/api/character-classes` | none | `onFormInit`: stat sheet init (serialize `stat_sheet_json` on submit) |
| Item | `/items` | `/api/items` | domain→sub→cat→subcat | `onListInit`: 3 filter cascades; `onFormInit`: cascades + stat sheet init (serialize `stat_sheet_json` on submit) |
| Modifier | `/modifiers` | `/api/modifiers` | domain→sub→cat→subcat | `onListInit`: 3 filter cascades; `onDetailInit`: tabs+tiers+bindings; `onFormInit`: cascades+tiers+tabs+bindings |

**Form cascades** (name-attribute selectors):

| Config | Parent selector | Child selector | API |
|---|---|---|---|
| `domainToSubdomain` | `[name="game_domain_id"]` | `[name="game_subdomain_id"]` | `/api/game-subdomains?game_domain_id=X` |
| `subdomainToCategory` | `[name="game_subdomain_id"]` | `[name="game_category_id"]` | `/api/game-categories?game_subdomain_id=X` |
| `categoryToSubcategory` | `[name="game_category_id"]` | `[name="game_subcategory_id"]` | `/api/game-subcategories?game_category_id=X` |

**Filter cascades** (ID selectors, for list page filter bars):

| Config | Parent | Child |
|---|---|---|
| `filterDomainToSubdomain` | `#filter_game_domain_id` | `#filter_game_subdomain_id` |
| `filterSubdomainToCategory` | `#filter_game_subdomain_id` | `#filter_game_category_id` |
| `filterCategoryToSubcategory` | `#filter_game_category_id` | `#filter_game_subcategory_id` |

---

## Sub-Atoms: Validation (`src/browser/sub-atoms/validation/`)

Each function returns `string | null` — `null` means valid.

### `validate-required.ts`
```typescript
function validateRequired(value: string, fieldLabel: string): string | null
// Trims whitespace. Returns null or "${fieldLabel} is required"
```

### `validate-string-length.ts`
```typescript
function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldLabel: string,
): string | null
// Returns null, "must be at least N characters", or "must be no more than N characters"
```

### `validate-integer-range.ts`
```typescript
function validateIntegerRange(
  value: string,
  min: number,
  max: number,
  fieldLabel: string,
): string | null
// Parses via Number(), checks Number.isInteger(), then range bounds
// Returns null or "must be a whole number" / "must be at least N" / "must be no more than N"
```

### `validate-pattern.ts`
```typescript
function validatePattern(
  value: string,
  pattern: string | undefined,
  fieldLabel: string,
): string | null
// Skips if pattern is undefined. Creates RegExp, calls .test(value)
// Returns null or "${fieldLabel} format is invalid"
```

---

## Sub-Atoms: Utilities (`src/browser/sub-atoms/utilities/`)

### `fetch-json.ts`

```typescript
export class ApiError extends Error {
  constructor(public message: string, public status: number) { super(message) }
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T>
export async function postJson<T>(url: string, data: Record<string, unknown>): Promise<T>
export async function putJson<T>(url: string, data: Record<string, unknown>): Promise<T>
export async function deleteJson<T>(url: string): Promise<T>
```

`fetchJson` always sends `Authorization: Bearer dev-admin-token` and
`Accept: application/json`. POST/PUT set `Content-Type: application/json`.

**204 No Content** returns `undefined as T` — callers that expect no body should ignore
the return value.

**Error extraction priority** (from JSON body):
1. `body.error` field (standard server error)
2. `body.summary` + `body.errors[0].path` (Elysia TypeBox 422 validation shape)
3. HTTP status text fallback

Throws `ApiError` on non-2xx responses. Callers catch this to show error toasts.

### `escape-text.ts`

```typescript
export function escapeText(text: string): string
```

Uses the browser DOM: creates a `<div>`, sets `.textContent = text`, reads back `.innerHTML`.
The browser escapes all HTML entities automatically. Safer and simpler than manual string
replacement. Used whenever browser-side code inserts user/server content into `innerHTML`.

### `inject-styles.ts`

```typescript
const injected = new Set<string>()

export function injectStylesOnce(id: string, css: string): void
```

Checks the module-level `Set` before creating a `<style>` tag. Multiple calls with the same
`id` are no-ops after the first. Each molecule that injects CSS has its own unique ID string
(`"toast"`, `"validation"`, `"modal"`, `"loading"`).

### `flash-message.ts`

```typescript
export type ToastType = "success" | "error" | "info"

export function setFlashMessage(message: string, type: ToastType): void
// Writes { message, type } to sessionStorage["flash_message"] as JSON

export function consumeFlashMessage(): { message: string; type: ToastType } | null
// Reads and immediately removes from sessionStorage — shows once only
```

**Pattern:** Set message → redirect via `window.location.href` → on next page's
`DOMContentLoaded`, `init()` consumes and shows the toast. Used after successful
create/update/delete operations that redirect to another page.

### `debounce.ts`

```typescript
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void
```

Delays `fn` until `delayMs` has passed with no new calls. Timer resets on each invocation.
Used for input validation (300ms) and name availability checks (400ms).

### `throttle.ts`

```typescript
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => void
```

First call fires immediately; subsequent calls within `intervalMs` are ignored.
Used for scroll/resize handlers.

---

## Atoms: Handlers (`src/browser/atoms/handlers/`)

Each handler is an `attach*` factory — it receives a DOM element and options, registers
event listeners, and returns nothing. Safe to call on pages where the target element does
not exist (the function returns early without throwing).

### `form-submit-handler.ts`

```typescript
interface FormSubmitCallbacks {
  readonly onValidate: (form: HTMLFormElement) => string[]
  readonly onErrors: (errors: string[]) => void
  readonly onLoading: (loading: boolean) => void
  readonly onSuccess: (data: unknown) => void
  readonly onError: (message: string) => void
}

export function attachFormSubmitHandler(
  form: HTMLFormElement,
  apiUrl: string,
  method: "POST" | "PUT",
  callbacks: FormSubmitCallbacks,
): void
```

Intercepts `submit`, calls `event.preventDefault()`, then:

**FormData coercion rules** (before sending to API):

| Input condition | Value sent |
|---|---|
| `"true"` / `"false"` string | native boolean |
| `<input type="number">` with value | `Number(value)` |
| `<input type="number">` empty | field omitted |
| `<select>` with `""` | field omitted |
| `<textarea>` empty | field omitted |
| everything else | string as-is |

This coercion means the JSON body the server receives matches the types `deriveBodySchema`
expects — booleans as booleans, numbers as numbers, optional empty fields absent.

### `input-change-handler.ts`

```typescript
export function attachInputChangeHandler(
  input: HTMLInputElement | HTMLTextAreaElement,
  fieldLabel: string,
  validator: (value: string, label: string) => string | null,
  displayError: (input: HTMLElement, error: string | null) => void,
  debounceMs = 300,
): void
```

Two event listeners:
- `blur` — validates immediately when focus leaves
- `input` — validates with `debounce(debounceMs)` while typing

Calls `validator(input.value, fieldLabel)` → passes result to `displayError`.

### `name-availability-handler.ts`

```typescript
interface NameAvailabilityOptions {
  readonly checkUrl: string         // e.g. "/api/game-domains/check-name"
  readonly originalName: string     // current name ("" for new)
  readonly excludeId?: string       // edit mode: exclude this ID from uniqueness check
  readonly startDisabled: boolean   // true on duplicate page
  readonly fieldName?: string       // "name" (default)
  readonly queryParam?: string      // "name" (default) or "machineName"
}

export function attachNameAvailabilityHandler(
  form: HTMLFormElement,
  options: NameAvailabilityOptions,
): void
```

Debounced (400ms) `input` listener on the named field.

**State machine:**
- Empty input → clear error, enable submit
- Duplicate mode + name unchanged from original → disable submit ("Change the name before saving")
- Edit mode + name unchanged from original → clear error, enable submit (no check needed)
- Otherwise → `GET ${checkUrl}?${queryParam}=${name}&excludeId=${id}`
  - `available: true` → clear error, enable submit
  - `available: false` → set error ("already in use"), disable submit
  - Network error → clear error, enable submit (server will validate on POST)

### `cascade-dropdown-handler.ts`

```typescript
interface CascadeDropdownOptions {
  readonly parentSelector: string    // CSS selector for parent select
  readonly childSelector: string     // CSS selector for child select
  readonly apiUrl: string            // base API URL, e.g. "/api/game-subdomains"
  readonly filterParam: string       // query param name, e.g. "game_domain_id"
  readonly labelField: string        // field name for option text, e.g. "name"
  readonly valueField: string        // field name for option value, e.g. "id"
  readonly placeholder?: string      // default: "-- Select --"
}

export function attachCascadeDropdownHandler(
  form: HTMLFormElement,
  options: CascadeDropdownOptions,
): void
```

On parent `change`:
1. Reset child to placeholder only
2. If parent value empty → stop (leave child as placeholder)
3. `GET ${apiUrl}?${filterParam}=${parentValue}`
4. Build `<option>` elements from `result.data` using `labelField`/`valueField`
5. Append to child select

Used for both form cascades (name selectors) and filter bar cascades (ID selectors).

### `tab-switch-handler.ts`

```typescript
export function attachTabSwitchHandler(): void
```

No-op if no `.tab-bar` found. Reads `.tab-bar__tab[data-tab]` buttons and
`#panel-{tabId}` panels.

**Click:** activates target tab, hides all other panels, updates `aria-selected`, pushes
`#tabId` to URL hash via `history.replaceState`.

**Keyboard:** Left/Right arrows cycle through non-disabled tabs; Enter/Space activates.

**On load:** reads `location.hash.slice(1)` — if it matches a non-disabled tab ID,
activates that tab immediately (preserves tab state across page refresh).

### `tier-row-handler.ts` (form pages)

```typescript
export function attachTierHandlers(form: HTMLFormElement): void
```

Manages the dynamic tier table on create/edit forms.

**DOM elements used:**

| Selector | Role |
|---|---|
| `#tier-rows` | `<tbody>` containing tier rows |
| `#add-tier-btn` | triggers row append |
| `#tiers-json-input` | hidden field that carries tier state to server |
| `.tier-row[data-tier-index]` | each tier row |
| `[data-field="tier_min_value"]` | min value input in row |
| `[data-field="tier_max_value"]` | max value input in row |
| `[data-field="tier_level_req"]` | level requirement input |
| `[data-field="tier_spawn_weight"]` | spawn weight input |
| `.btn-remove-tier` | remove row button (event-delegated) |

**`syncTierJson()`** (called on every add/remove/change):
Reads all rows, builds JSON array, writes to `#tiers-json-input`.

**Serialized format written to hidden field:**
```json
[
  { "tier_index": 0, "min_value": "1.5", "max_value": "3.0", "level_req": "1", "spawn_weight": "100" },
  { "tier_index": 1, "min_value": "3.5", "max_value": "6.0", "level_req": "10", "spawn_weight": "60" }
]
```

Values are strings (as read from inputs) — L2 `parseTiersFromInput` coerces them.
`#tiers-json-input` has name `tiers_json` — listed in `MODIFIER_CONFIG.nonColumnKeys`
(passthroughKeys in L3) so it survives TypeBox `Value.Clean()`.

### `tier-detail-handler.ts` (detail/edit pages — JSON CRUD)

```typescript
export function attachTierDetailHandler(): void
```

Manages tier CRUD on the detail page via API calls, without full page reload.

**Modifier ID extraction:** `window.location.pathname.match(/\/modifiers\/([^/]+)/)[1]`

**DOM elements used:**

| Selector | Role |
|---|---|
| `#tier-section` | container |
| `.tier-inline-form` | hidden form for add/edit |
| `[data-field="min_value"]` etc. | form inputs |
| `.tier-add-btn` | shows inline form |
| `.tier-edit-btn` | populates form, sets `dataset.editingIndex` |
| `.tier-delete-btn` | confirms then deletes |
| `#tier-detail-table` | rebuilt after every mutation |
| `.tier-inline-form__error` | error display |

**API calls:**

| Action | Endpoint | Method |
|---|---|---|
| Add tier | `/api/modifiers/${id}/tiers` | POST |
| Update tier | `/api/modifiers/${id}/tiers/${index}` | PUT |
| Delete tier | `/api/modifiers/${id}/tiers/${index}` | DELETE |

All mutations return the full updated tier set — the table is rebuilt from `result.data`
rather than patching individual rows.

### `binding-handler.ts` (detail/edit pages — JSON CRUD)

```typescript
export function attachBindingHandler(): void
```

Manages binding CRUD via API. Uses event delegation on `.binding-panel` for all button
clicks — only one listener needed for dynamically inserted rows.

**DOM elements used:**

| Selector | Role |
|---|---|
| `.binding-panel` | event delegation root |
| `.binding-section[data-section]` | per-type section (category / subcategory) |
| `.binding-add-btn[data-target-type]` | opens add form |
| `.binding-form[data-target-type]` | hidden form |
| `[data-field="target_id"]` etc. | form inputs |
| `.binding-row[data-binding-id]` | table rows |
| `.binding-edit-btn`, `.binding-delete-btn` | row action buttons |
| `.binding-table` | rebuilt/patched on mutations |
| `.binding-empty` | empty state |

**API calls:**

| Action | Endpoint | Method |
|---|---|---|
| List bindings | `/api/modifiers/${id}/bindings` | GET |
| Create | `/api/modifiers/${id}/bindings` | POST |
| Update | `/api/modifiers/${id}/bindings/${bindingId}` | PUT |
| Delete | `/api/modifiers/${id}/bindings/${bindingId}` | DELETE |
| Category options | `/api/game-categories` | GET |
| Subcategory options | `/api/game-subcategories` | GET |

**Nullable field handling:** empty string in form → `null` in API body (not `""`).

**Target options caching:** loaded once per section type, reused for subsequent opens.

### `delete-handler.ts`

```typescript
interface DeleteHandlerCallbacks {
  readonly onConfirm: (entityName: string) => Promise<boolean>
  readonly onLoading: (loading: boolean) => void
  readonly onSuccess: () => void
  readonly onError: (message: string) => void
}

export function attachDeleteHandler(
  form: HTMLFormElement,
  apiUrl: string,
  entityName: string,
  callbacks: DeleteHandlerCallbacks,
): void
```

Intercepts form `submit`. Calls `onConfirm` → if `true`, calls `deleteJson(apiUrl)`,
then `onSuccess` or `onError`. Wraps with `onLoading(true/false)`.

### `search-handler.ts`

```typescript
export function attachSearchHandler(
  searchInput: HTMLInputElement,
  rowSelector: string,
  debounceMs = 200,
): void
```

Debounced `input` listener. Compares `row.textContent.toLowerCase()` against query.
Sets `row.style.display = ""` (show) or `"none"` (hide). Client-side only — does not
call any API.

### `duplicate-handler.ts`

```typescript
export function showDuplicateNotice(): void
```

Shows an info toast: *"Duplicating entry — update the Name and Description before saving."*
Duration: 8 seconds. Called once when the duplicate form initialises.

---

## Atoms: Validation (`src/browser/atoms/validation/`)

### `build-field-validator.ts`

```typescript
export function buildFieldValidator(
  fieldConfig: BrowserFieldConfig,
): (value: string, label: string) => string | null
```

Composes sub-atom validators based on `BrowserFieldConfig`:

1. If `required` → run `validateRequired`; return error if present
2. If value empty after trim → return `null` (stop; no further checks on optional empty)
3. If `type === "string"`:
   - If `minLength` + `maxLength` → run `validateStringLength`
   - If `pattern` → run `validatePattern`
4. If `type === "enum"` + `values` → check `values.includes(value)` → `"Invalid option"` if not
5. If `type === "integer"` + `min` + `max` → run `validateIntegerRange`
6. If `type === "decimal"` + `min`/`max` → parse float, check bounds

Returns first error or `null`. Called once per field when setting up `inputChangeHandler`.

---

## Atoms: Routing (`src/browser/atoms/routing/`)

### `init-entity-routes.ts`

```typescript
export function initEntityRoutes(
  config: EntityRouteConfig,
  path: string,
  fieldConfig: readonly BrowserFieldConfig[],
): boolean
```

Returns `true` if the path matched (stops the outer loop in `main.ts`).

**Path matching and controller dispatch:**

| URL pattern | Match | Controller | Extra |
|---|---|---|---|
| `{basePath}/new` | exact | `initFormController` (POST) | cascades, `onFormInit`, name+machine_name checks; `startDisabled: false` |
| `{basePath}/{id}/duplicate` | regex | `initFormController` (POST) | same as create + `showDuplicateNotice`; `startDisabled: true` |
| `{basePath}/{id}/edit` | regex | `initFormController` (PUT to `/api/{id}`) | `startDisabled: false`, `excludeId: id` |
| `{basePath}/{id}` | regex | `initDetailController` | `onDetailInit()` if defined |
| `{basePath}` | exact | `initListController` | `onListInit()` if defined |

**Form enhancements applied for all form pages:**
- Each cascade in `config.cascades` → `attachCascadeDropdownHandler`
- If `config.checkNameUrl` → `attachNameAvailabilityHandler` for `name` field
- If `config.checkMachineNameUrl` → `attachNameAvailabilityHandler` for `machine_name` field
- `config.onFormInit(form)` called if defined

---

## Molecules: UI (`src/browser/molecules/ui/`)

### `toast.ts`

```typescript
export type ToastType = "success" | "error" | "info"

export function showToast(
  message: string,
  type: ToastType = "info",
  durationMs = 5000,
): void
```

Creates `#toast-container` (fixed, top-right) on first call. Each toast is a flex row:
message text + dismiss button. Auto-dismisses after `durationMs` with a 300ms fade-out
transition. Multiple toasts stack vertically.

CSS injected once via `injectStylesOnce("toast", ...)`. Color by type: success → green,
error → red, info → blue.

### `validation-errors.ts`

```typescript
export function displayFieldError(input: HTMLElement, error: string | null): void
// Finds nearest .form-field wrapper, adds/removes .form-field--invalid class and .field-error div

export function displayFormErrors(form: HTMLFormElement, errors: string[]): void
// Creates .form-errors summary div, inserts before first child

export function clearFormErrors(form: HTMLFormElement): void
// Removes .form-errors div

export function clearAllFieldErrors(form: HTMLFormElement): void
// Removes all .field-error divs, all .form-field--invalid classes
```

All error text is escaped via `escapeText` before DOM insertion.
CSS injected once: field error (red text), invalid border, form summary (red banner).

### `modal.ts`

```typescript
export function confirmModal(title: string, message: string): Promise<boolean>
```

Creates a full-screen overlay with a centered dialog. Returns `Promise<boolean>`:
- Confirm button click → `true`
- Cancel button / Escape key / overlay background click → `false`

Modal removes itself from DOM after resolution. All event listeners cleaned up.
CSS injected once via `injectStylesOnce("modal", ...)`.

### `loading.ts`

```typescript
export function showLoading(): void
export function hideLoading(): void
```

`showLoading` creates `#loading-overlay` — fixed, full-screen, semi-transparent white
with a spinning circle. Guards against multiple overlays (checks if element already exists).
CSS injected once. `hideLoading` removes the element.

---

## Molecules: Validation (`src/browser/molecules/validation/`)

### `validate-all-fields.ts`

```typescript
export function validateAllFields(
  form: HTMLFormElement,
  fields: readonly BrowserFieldConfig[],
): string[]
```

Iterates every field in `fields`:
1. Finds `[name="${field.name}"]` in the form
2. Calls `buildFieldValidator(field)(input.value, field.label)`
3. Calls `displayFieldError(input, error)` to update UI immediately
4. Collects non-null errors into return array

Returns all error messages (not just the first). Callers use array length to decide
whether to submit. Called by `formController` as the `onValidate` callback.

---

## Organisms: Controllers (`src/browser/organisms/controllers/`)

Page-level orchestrators. Each receives options and composes atoms + molecules.

### `form-controller.ts`

```typescript
interface FormControllerOptions {
  readonly formSelector: string        // ".entity-form"
  readonly apiUrl: string              // e.g. "/api/game-domains" (create) or "/api/game-domains/{id}" (edit)
  readonly method: "POST" | "PUT"
  readonly redirectUrl: string         // e.g. "/game-domains"
  readonly fields: readonly BrowserFieldConfig[]
  readonly successMessage: string
}

export function initFormController(options: FormControllerOptions): void
```

No-op if `formSelector` not found. For each field in `options.fields`:
- Finds the input element
- Builds a validator from `BrowserFieldConfig`
- Attaches `inputChangeHandler` with per-field error display

Attaches `formSubmitHandler`:
- `onValidate` → `clearAllFieldErrors` + `clearFormErrors` + `validateAllFields`
- `onErrors` → `displayFormErrors`
- `onLoading` → `showLoading` / `hideLoading`
- `onSuccess` → `setFlashMessage(options.successMessage, "success")` + `window.location.href = redirectUrl`
- `onError` → `showToast(message, "error")`

### `detail-controller.ts`

```typescript
interface DetailControllerOptions {
  readonly deleteFormSelector: string  // "form[action$='/delete']"
  readonly apiUrl: string              // e.g. "/api/game-domains/{id}"
  readonly entityName: string
  readonly redirectUrl: string         // e.g. "/game-domains"
}

export function initDetailController(options: DetailControllerOptions): void
```

No-op if delete form not found. Attaches `deleteHandler`:
- `onConfirm` → `confirmModal("Delete Entity", "Are you sure?")`
- `onLoading` → `showLoading` / `hideLoading`
- `onSuccess` → `setFlashMessage("EntityName deleted.", "success")` + redirect
- `onError` → `showToast(message, "error")`

### `list-controller.ts`

```typescript
interface ListControllerOptions {
  readonly tableSelector: string       // ".data-table"
  readonly rowSelector: string         // ".data-table tbody tr"
  readonly apiBasePath: string         // e.g. "/api/game-domains"
  readonly redirectUrl: string         // e.g. "/game-domains"
}

export function initListController(options: ListControllerOptions): void
```

No-op if table not found.

1. Creates and inserts a search `<input>` above the table (or into `.list-toolbar`)
2. Attaches `searchHandler` for live row filtering
3. Finds all `form[action$='/delete']` rows in the table
4. For each delete form:
   - Extracts entity ID from `row.dataset.id`
   - Extracts entity name from first `<td>` text content
   - Attaches `deleteHandler` with confirm modal + loading + flash + redirect

---

## Cross-Layer Dependency Map

```
L0 Configuration (src/config/types/browser-field-config.ts)
  BrowserFieldConfig type ─────────── imported at compile time (type only)

L5 View (src/view/)
  formSection embeds BrowserFieldConfig[] as JSON in <script id="field-config">
  tierFormSection embeds TierFieldMeta[] in <script id="tier-field-config">

L6 Browser (src/browser/)
  main.ts reads <script id="field-config"> → BrowserFieldConfig[]
  → passed to initEntityRoutes → initFormController → buildFieldValidator per field
  → per-field validation matches L0 constraints: minLength, maxLength, pattern, min, max, values

L3 Controller (API endpoints called at runtime)
  fetchJson/postJson/putJson/deleteJson → /api/* routes
  name availability → GET /api/{entity}/check-name
  cascade → GET /api/{child-entity}?{parent_field}={id}
  tier CRUD → /api/modifiers/:id/tiers/:index
  binding CRUD → /api/modifiers/:id/bindings/:id
```

---

## HTTP Status Code Handling in Browser

| Status | `fetchJson` behaviour |
|---|---|
| 2xx with body | Parse JSON, return as `T` |
| 204 No Content | Return `undefined` |
| 422 (TypeBox) | Extract `body.errors[0].path` → throw `ApiError` |
| 4xx / 5xx | Extract `body.error` → throw `ApiError` |
| Network error | Throw standard `Error` |

L3 returns 422 from TypeBox schema validation (schema mismatch) and 400 from service
validation (business rules). Both arrive as non-2xx — `fetchJson` extracts the error
message and throws, which the handler's `onError` callback catches and passes to
`showToast`.

---

## Workflows

### Workflow A: Adding a New Entity to L6

**Preconditions:** L3 check-name and check-machine-name routes exist. L3 API CRUD routes exist.

**1. Add entry to `ENTITY_ROUTES`** (`src/browser/sub-atoms/routing/entity-routes.ts`):

```typescript
{
  basePath: "/entity-name",
  apiBasePath: "/api/entity-name",
  displayName: "Entity Name",
  checkNameUrl: "/api/entity-name/check-name",
  checkMachineNameUrl: "/api/entity-name/check-machine-name",
  // cascades: [domainToSubdomain, ...] if hierarchical
  // onListInit: () => { attachCascadeDropdownHandler(...) } if filtered list
}
```

**2. Rebuild the bundle:**
```bash
bun build src/browser/main.ts --outdir public --minify --target browser
```

**3. Start server and test:**
```bash
bun run dev
```

- Open `/entity-name/new` — browser validation should fire on submit
- Type in name field — name availability check should appear after 400ms
- Submit with invalid data — field errors appear inline
- Submit valid data — redirect to detail page with success toast

That is the complete L6 addition for a simple entity.

---

### Workflow B: Adding Cascade Dropdowns to a New Entity

If the new entity has FK parent fields with dropdowns:

1. Add cascade configs to the existing `domainToSubdomain` / `subdomainToCategory` /
   `categoryToSubcategory` constants, or define new ones with matching API endpoints
2. Add them to `cascades` array in the entity's `ENTITY_ROUTES` entry
3. For the list page filter bar, define filter cascade configs (ID selectors:
   `#filter_parent_field_id`) and call `attachCascadeDropdownHandler` in `onListInit`

No new handler code — the existing `attachCascadeDropdownHandler` handles any API URL and
field selector.

---

### Workflow C: Adding a Custom Detail Page Handler

If a new entity needs browser-side behaviour on its detail page (tabs, nested CRUD, etc.):

1. Create atom handler(s) in `src/browser/atoms/handlers/` following existing patterns
2. Add `onDetailInit` to the entity's `ENTITY_ROUTES` entry:
   ```typescript
   onDetailInit: () => {
     attachTabSwitchHandler()
     attachMyCustomHandler()
   }
   ```
3. Rebuild bundle

---

### Workflow D: Debugging Browser Validation

```
SYMPTOM: Field validates on submit but not while typing
→ Check attachInputChangeHandler is called for this field in initFormController
→ Check the field name in BrowserFieldConfig matches the HTML input name attribute exactly
→ Check fieldConfig JSON is populated: inspect <script id="field-config"> in page source

SYMPTOM: Validation fires but wrong rule (e.g. pattern instead of length)
→ Check buildFieldValidator: rules are applied in order; required first, then type-specific
→ Check BrowserFieldConfig for the field: are the correct properties present?
→ Log: JSON.parse(document.getElementById("field-config").textContent) in browser console

SYMPTOM: Name availability check never fires
→ Check entity has checkNameUrl in ENTITY_ROUTES
→ Check input name attribute: must be "name" (or "machine_name" for machine name check)
→ Check network tab: is GET /api/entity/check-name being sent?
→ Check debounce: check fires 400ms after last keypress — type and wait

SYMPTOM: Cascade dropdown not populating
→ Check network tab: is the API call being made on parent change?
→ Check parent selector in cascade config matches the HTML select element
→ Check API response: is it { success: true, data: [...] } with name/id fields?
→ Check filterParam matches the query param expected by L3 (e.g. game_domain_id)

SYMPTOM: Form submits but redirect doesn't happen
→ Check formSubmitHandler onSuccess: is setFlashMessage called before location change?
→ Check apiUrl: is it the correct /api/ path for the entity?
→ Check network tab: what status code and body does the API return?
→ Check onError: is the error toast showing? That means the API call failed

SYMPTOM: Flash message toast not appearing after redirect
→ Check sessionStorage in browser DevTools: is "flash_message" key present before redirect?
→ Check consumeFlashMessage is called in main.ts init (it removes the key after reading)
→ Check showToast is being called with the correct arguments

SYMPTOM: Delete confirmation modal appears but delete doesn't fire
→ Check confirmModal resolves to true on Confirm button click
→ Check deleteJson is being called with the correct API URL
→ Check: does the entity have a GET /:id route? The delete URL must be /api/{entity}/{id}

SYMPTOM: Tier rows lost after page reload on edit form
→ Tier rows are rendered server-side (L5) — if they appear then disappear, check L6 tier
  handler is not clearing rows on init
→ If rows never appear: check L3 pages passes tierRows from tiersToFormRows to prepareEditForm
→ Check: tiers_json hidden field is in ENTITY_CONFIG.nonColumnKeys (passthroughKeys in L3)
```

---

### Workflow E: Testing L6 Behaviour

L6 has no unit test setup — behaviour is verified manually and via integration tests
against the running server.

**Manual smoke test checklist for a form page:**
```
□ Open /entity/new
□ Submit empty form → required field errors appear inline
□ Type valid name → availability check clears error after 400ms
□ Type duplicate name → "already in use" error, submit button disabled
□ Fill all fields correctly → submit → redirect to detail with success toast
□ Open /entity/{id}/edit → fields pre-populated
□ Clear required field → error appears on blur
□ Submit → redirect back to detail with success toast
□ Open /entity/{id}/duplicate → duplicate notice toast appears
□ Submit without changing name → submit button disabled ("Change name" error)
□ Change name → submit button re-enables
□ Open /entity list → search input present
□ Type partial name → non-matching rows hidden
□ Click delete icon on row → confirmation modal appears
□ Confirm delete → redirect to list with success toast
```

**Browser DevTools checks:**
```bash
# Verify field config is embedded
document.getElementById("field-config")?.textContent

# Verify route matched
# (add console.log to initEntityRoutes for debugging)

# Check cascade fetch
# Network tab: filter by "api" — verify cascade calls on dropdown change

# Check flash before redirect
sessionStorage.getItem("flash_message")
```

---

### Workflow F: Rebuilding the Bundle

The bundle must be rebuilt after any change to `src/browser/`:

```bash
# Development build (unminified, faster)
bun build src/browser/main.ts --outdir public --target browser

# Production build (minified)
bun build src/browser/main.ts --outdir public --minify --target browser

# The output file is public/main.js
# It is gitignored — build before running or deploying
```

`public/main.js` is served by `src/index.ts`:
```typescript
.get("/public/main.js", () => Bun.file("public/main.js"))
```

If the file is missing, the browser loads no JS and all L6 behaviour is absent (forms still
work via standard HTML POST — L5's server-side form handling remains functional).

---

### Workflow G: Git Conventions for L6 Changes

```bash
# New entity route config
feat(browser): add EntityName to ENTITY_ROUTES with check-name + cascade config

# New atom handler
feat(browser): add attachHistoryPanelHandler atom for history tab interaction

# New cascade config
feat(browser): add filterStatToFormula cascade config for formula entity

# Bug fix
fix(browser): prevent double flash message on rapid form submit

# Rebuild reminder
# L6 changes require a rebuild — add note in commit if public/main.js is regenerated
refactor(browser): extract tier serialization to shared utility
```

**Rule:** L6-only changes use `browser` scope. After any L6 change, rebuild the bundle
before committing to ensure `public/main.js` is not stale during testing.

**PR checklist for L6 changes:**
- [ ] `bun run typecheck` passes (tsconfig includes browser DOM types)
- [ ] Bundle rebuilt: `bun build src/browser/main.ts --outdir public --minify --target browser`
- [ ] New entity added to `ENTITY_ROUTES` with correct `basePath` and `apiBasePath`
- [ ] `checkNameUrl` and `checkMachineNameUrl` set if entity has uniqueness checks
- [ ] Cascade configs use correct selector type: name-attr for forms, ID for filter bars
- [ ] `escapeText()` used on all user/API-returned content inserted via `innerHTML`
- [ ] `injectStylesOnce` used for any dynamically injected CSS (not raw `<style>` append)
- [ ] Flash message set before redirect (not after)
- [ ] Manual smoke test: create/edit/delete cycle + name check + cascade (where applicable)

---

## Related Documents

- [LAYER-005: View Reference](LAYER-005-view-reference.md) — how L5 embeds `BrowserFieldConfig` JSON in HTML
- [LAYER-003: Controller Reference](LAYER-003-controller-reference.md) — API endpoints L6 calls at runtime
- [LAYER-000: Configuration Reference](LAYER-000-configuration-reference.md) — `BrowserFieldConfig` type definition
