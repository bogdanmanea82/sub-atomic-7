# Atomic Design Refactoring Tracker

Status legend: `[ ]` = not started, `[x]` = done

---

## Layer 0 — Configuration

### Refactor 0.1: Extract Shared Reference Field Atoms (Medium Priority)
**Problem:** `GAME_DOMAIN_ID_FIELD` defined identically in 3 files, `GAME_SUBDOMAIN_ID_FIELD` in 2, `GAME_CATEGORY_ID_FIELD` in 1 (will duplicate as entities grow).

- [x] Create `src/config/universal/atoms/game-domain-ref-field-atom.ts` — exports `GAME_DOMAIN_REF_FIELD_ATOM`
- [x] Create `src/config/universal/atoms/game-subdomain-ref-field-atom.ts` — exports `GAME_SUBDOMAIN_REF_FIELD_ATOM`
- [x] Create `src/config/universal/atoms/game-category-ref-field-atom.ts` — exports `GAME_CATEGORY_REF_FIELD_ATOM`
- [x] Update `src/config/universal/atoms/index.ts` — add 3 new exports
- [x] Update `game-subdomain-config-factory.ts` — remove local constant, import from atoms
- [x] Update `game-category-config-factory.ts` — remove both local constants, import from atoms
- [x] Update `game-subcategory-config-factory.ts` — remove all three local constants, import from atoms
- [x] Run `bun run typecheck`

### Refactor 0.2: Add Missing Barrel Export (Low Priority)
**Problem:** `DISPLAY_FORMAT_SELECT` exists in `display-formats.ts` but not re-exported from barrel.

- [x] Add `DISPLAY_FORMAT_SELECT` to `src/config/universal/sub-atoms/index.ts`
- [x] Run `bun run typecheck`

### Refactor 0.3: Fix Inconsistent Import Path (Low Priority)
**Problem:** `created-at-field-atom.ts` imports from `"../sub-atoms/"` with trailing slash; all others use `"../sub-atoms"`.

- [x] Remove trailing slash from import in `src/config/universal/atoms/created-at-field-atom.ts`
- [x] Run `bun run typecheck`

---

## Layer 1 — Model

### Refactor 1.1: Split build-query.ts into Individual Query Atoms (High Priority)
**Problem:** `src/model/universal/atoms/build-query.ts` contains 6 exported functions in one file — each is an independent concern.

- [x] Create `src/model/universal/atoms/build-select-query.ts` — `buildSelectQuery`
- [x] Create `src/model/universal/atoms/build-paginated-select-query.ts` — `buildPaginatedSelectQuery`
- [x] Create `src/model/universal/atoms/build-count-query.ts` — `buildCountQuery`
- [x] Create `src/model/universal/atoms/build-insert-query.ts` — `buildInsertQuery`
- [x] Create `src/model/universal/atoms/build-update-query.ts` — `buildUpdateQuery`
- [x] Create `src/model/universal/atoms/build-delete-query.ts` — `buildDeleteQuery`
- [x] No barrel needed — Layer 1 atoms use direct file imports (no index.ts exists)
- [x] Delete `src/model/universal/atoms/build-query.ts`
- [x] Update `src/model/universal/molecules/create-entity.ts` — fix imports
- [x] Update all 4 entity model organisms — fix imports
- [x] Update `tests/model/atoms/build-query.test.ts` — fix imports
- [x] Run `bun run typecheck`
- [x] Run `bun test` — 178 pass, 0 fail

### Refactor 1.2: Format validate-datetime.ts (Low Priority)
**Problem:** Irregular spacing around braces and operators.

- [x] Run formatter on `src/model/universal/sub-atoms/validation/validate-datetime.ts`
- [x] Run `bun run typecheck`

---

## Layer 2 — Model Service

### Phase 2.1: Split execute-query.ts into Three Sub-atoms (Medium Priority)
**Problem:** `execute-query.ts` bundles 3 responsibilities (convertPlaceholders, executeSelect, executeWrite).

- [x] Create `src/model-service/sub-atoms/database/convert-placeholders.ts` — placeholder conversion
- [x] Create `src/model-service/sub-atoms/database/execute-select.ts` — read execution (imports convertPlaceholders)
- [x] Create `src/model-service/sub-atoms/database/execute-write.ts` — write execution (imports convertPlaceholders)
- [x] Delete `src/model-service/sub-atoms/database/execute-query.ts`
- [x] Update `src/model-service/sub-atoms/database/index.ts` barrel
- [x] Run `bun run typecheck`

### Phase 2.2: Fix Paginated Workflow Hierarchy Bypass (Medium Priority)
**Problem:** `select-many-paginated-workflow.ts` line 8 imports `executeSelect` directly from sub-atoms, bypassing the CRUD atom layer.

- [x] Replace `executeSelect` import with `selectMany` from `../../atoms/crud` in `select-many-paginated-workflow.ts`
- [x] Change count query execution to use `selectMany(db, countQuery)` instead of `executeSelect(db, countQuery)`
- [x] Remove `executeSelect` import from this file
- [x] Run `bun run typecheck`

### Phase 2.3: Extract Uniqueness Check into a Reusable Atom (High Priority)
**Problem:** Inline uniqueness-check logic duplicated across 8 methods (create + update x 4 entities).

- [x] Create `src/model-service/atoms/uniqueness/check-name-uniqueness.ts` — universal uniqueness checker
- [x] Create `src/model-service/atoms/uniqueness/index.ts` barrel
- [x] Refactor `game-domain-service.ts` create() and update() — replace inline blocks with `checkNameUniqueness`
- [x] Refactor `game-subdomain-service.ts` create() and update()
- [x] Refactor `game-category-service.ts` create() and update()
- [x] Refactor `game-subcategory-service.ts` create() and update()
- [x] Run `bun run typecheck`
- [ ] Test create and update for all 4 entities (requires running app against database)

### Phase 2.4: Disambiguate Workflow Interface Names (Low Priority)
**Problem:** Four workflow files each define a local `EntityModel<TEntity>` interface — names collide if imported together.

- [x] Rename interface in `create-entity-workflow.ts` to `CreateEntityModel<TEntity>`
- [x] Rename interface in `select-entity-workflow.ts` to `SelectEntityModel<TEntity>`
- [x] Rename interface in `select-many-workflow.ts` to `SelectManyEntityModel<TEntity>`
- [x] Rename interface in `update-entity-workflow.ts` to `UpdateEntityModel<TEntity>`
- [x] Rename interface in `delete-entity-workflow.ts` to `DeleteEntityModel`
- [x] Run `bun run typecheck`

### Phase 2.5: Centralize getConnection() in Service Organisms (Low Priority — Deferred)
**Problem:** Each of 6 methods in 4 service organisms calls `getConnection()` independently (24 calls).

- [ ] **DEFERRED** — Revisit when transaction support is added. Current per-method pattern is explicit and correct.

---

## Layer 3 — Controller

### Phase 3.1: Extract setHtml into a Response Sub-atom (Medium Priority)
**Problem:** All 4 pages files define an identical `setHtml` function.

- [x] Create `src/controller/sub-atoms/response/set-html-content-type.ts` — shared `setHtml`
- [x] Update `src/controller/sub-atoms/response/index.ts` barrel
- [x] Remove local `setHtml` from `game-domain-pages.ts` and add import
- [x] Remove local `setHtml` from `game-subdomain-pages.ts` and add import
- [x] Remove local `setHtml` from `game-category-pages.ts` and add import
- [x] Remove local `setHtml` from `game-subcategory-pages.ts` and add import
- [x] Run `bun run typecheck`

### Phase 3.2: Extract Option-Fetching into Shared Controller Sub-atoms (High Priority)
**Problem:** `getDomainOptions()`, `getAllSubdomainOptions()`, etc. duplicated across pages files with identical patterns.

- [x] Create `src/controller/sub-atoms/options/fetch-options.ts` — `fetchOptions` (combines fetch + map in one sub-atom)
- [x] Create `src/controller/sub-atoms/options/index.ts` barrel
- [x] Update `src/controller/sub-atoms/index.ts` to re-export from `./options`
- [x] Refactor all pages files to replace local helpers with `fetchOptions(Service, conditions?)`
- [x] Delete all local `getXxxOptions` and `getXxxOptionsForYyy` functions from pages files
- [x] Run `bun run typecheck`
- [ ] Test all form pages to confirm dropdowns populate correctly (requires running app)

### Phase 3.3: Extract Reference Lookup Building into a Shared Sub-atom (Medium Priority)
**Problem:** `buildDomainLookup`, `buildReferenceLookup` duplicated across pages files with identical inner loops.

- [x] Create `src/controller/sub-atoms/options/build-reference-lookup.ts` — universal `buildReferenceLookup`
- [x] Update `src/controller/sub-atoms/options/index.ts` barrel
- [x] Refactor `game-subdomain-pages.ts` to use universal builder
- [x] Refactor `game-category-pages.ts` to use universal builder
- [x] Refactor `game-subcategory-pages.ts` to use universal builder
- [x] Delete all local `buildDomainLookup` / `buildReferenceLookup` from pages files
- [x] Run `bun run typecheck`
- [ ] Test list and detail pages for UUID-to-name resolution (requires running app)

### Phase 3.4: Extract check-name into a Handler Atom Factory (High Priority)
**Problem:** All 4 controller organisms contain inline check-name route handlers (~20 lines each) with near-identical logic.

- [x] Create `src/controller/atoms/handlers/check-name-handler.ts` — `makeCheckNameHandler` factory
- [x] Update `src/controller/atoms/handlers/index.ts` barrel
- [x] Refactor `game-domain-controller.ts` — replace inline handler with `makeCheckNameHandler(GameDomainService)`
- [x] Refactor `game-subdomain-controller.ts` — replace with `makeCheckNameHandler(GameSubdomainService, "gameDomainId", "game_domain_id")`
- [x] Refactor `game-category-controller.ts` — replace with `makeCheckNameHandler(GameCategoryService, "gameSubdomainId", "game_subdomain_id")`
- [x] Refactor `game-subcategory-controller.ts` — replace with `makeCheckNameHandler(GameSubcategoryService, "gameCategoryId", "game_category_id")`
- [x] Delete all inline check-name handlers from controller files
- [x] Run `bun run typecheck`
- [ ] Test name availability checking on all create/edit forms (requires running app)

### Phase 3.5: Fix the entities/index.ts Barrel (Low Priority)
**Problem:** `src/controller/entities/index.ts` only re-exports `GameDomainController`.

- [x] Update `src/controller/entities/index.ts` to re-export all 4 controllers
- [x] Update `src/index.ts` to import all 4 from the barrel
- [x] Run `bun run typecheck`

### Phase 3.6: Document the Pages Cross-Layer Pattern (Low Priority)
**Problem:** Pages files import from Layers 4-5, which appears to violate "downward only" but is architecturally intentional.

- [x] Add explanatory comment block at top of `game-domain-pages.ts`
- [x] No code change — documentation only

### Phase 3.7: Address Type Casting Verbosity (Low Priority — Deferred)
**Problem:** Pages files use `as unknown as Record<string, unknown>` extensively.

- [ ] **DEFERRED** — Revisit after Layer 4 refactoring. If View Service accepts typed entities, casting disappears at the source.

---

## Layer 4 — View Service

### Phase 4.1: Extract mapInputType into a Formatter Sub-atom (Medium Priority)
**Problem:** `build-form-view.ts` contains a private `mapInputType` function — distinct concern from form assembly.

- [x] Create `src/view-service/sub-atoms/formatters/format-input-type.ts` — rename `mapInputType` to `formatInputType`
- [x] Update `src/view-service/sub-atoms/formatters/index.ts` barrel
- [x] Update `build-form-view.ts` to import `formatInputType` and remove local function
- [x] Run `bun run typecheck`

### Phase 4.2: Move BrowserFieldConfig Shape to Layer 0 (Medium Priority)
**Problem:** `BrowserField` interface in Layer 4 must match `BrowserFieldConfig` in Layer 6 exactly — no compile-time enforcement.

- [x] Create `src/config/types/browser-field-config.ts` — single source of truth
- [x] Update `src/config/types/index.ts` barrel to export `BrowserFieldConfig`
- [x] Update `src/view-service/molecules/views/build-browser-field-config.ts` — import from `@config/types`, remove local interface
- [x] Update Layer 6 `form-controller.ts` — import from `@config/types`, remove local interface
- [x] Verify browser bundle resolves `@config` path alias (if not, use relative import)
- [x] Run `bun run typecheck`

### Phase 4.3: Simplify View Service Form Method Signatures (Medium Priority)
**Problem:** Positional select-option parameters grow with each hierarchy level. GameSubcategory already takes 5 params.

- [x] Refactor `GameDomainViewService` form methods to accept `selectOptions: Record<string, readonly SelectOption[]>` (no change needed — has no options)
- [x] Refactor `GameSubdomainViewService` form methods to accept options map
- [x] Refactor `GameCategoryViewService` form methods to accept options map
- [x] Refactor `GameSubcategoryViewService` form methods to accept options map
- [x] Update all call sites in Layer 3 pages files to pass options map
- [x] Run `bun run typecheck`
- [ ] Test all create, edit, and duplicate forms (requires running app)

### Phase 4.4: Handle Duplicate Title in the Molecule (Low Priority)
**Problem:** All 4 view services spread `buildFormView` result to override title for duplicates.

- [x] Add optional `titleOverride` parameter to `buildFormView`
- [x] Update all 4 `prepareDuplicateForm` methods to pass title instead of spreading
- [x] Remove spread + override pattern from all organisms
- [x] Run `bun run typecheck`
- [ ] Test all duplicate forms (requires running app)

### Phase 4.5: Move ReferenceLookup Type to view-service/types/ (Low Priority)
**Problem:** `ReferenceLookup` defined in `prepare-field.ts` alongside its function — types should live in types directory.

- [x] Move `ReferenceLookup` type to `src/view-service/types/view-models.ts`
- [x] Update `src/view-service/types/index.ts` barrel
- [x] Update `prepare-field.ts` to import from `../../types`
- [x] Update `src/view-service/atoms/field-display/index.ts` re-export
- [x] Update all consumers (3 view services, 2 molecules, 1 controller sub-atom)
- [x] Run `bun run typecheck`

### Phase 4.6: Fix the entities/index.ts Barrel (Low Priority)
**Problem:** `src/view-service/entities/index.ts` only re-exports `GameDomainViewService`.

- [x] Update `src/view-service/entities/index.ts` to re-export all 4 view services
- [x] Run `bun run typecheck`

### Phase 4.7: Split Dual-Export Formatter Files (Low Priority — Deferred)
**Problem:** `format-date.ts`, `format-boolean.ts`, `format-text.ts` each export 2 functions.

- [ ] **DEFERRED** — Thematically cohesive. Split only when formatter variants grow significantly.

---

## Layer 5 — View

### Phase 5.1: Extract Delete Form into a Sub-atom (Low Priority)
**Problem:** Inline delete form pattern in `table-row.ts` and `detail-page.ts` bypasses the sub-atom layer.

- [x] Create `src/view/sub-atoms/elements/delete-form.ts` — `deleteForm(action, label?, small?)`
- [x] Update `src/view/sub-atoms/elements/index.ts` barrel
- [x] Update `src/view/atoms/components/table-row.ts` — import and use `deleteForm`
- [x] Update `src/view/organisms/pages/detail-page.ts` — import and use `deleteForm`
- [x] Run `bun run typecheck`
- [ ] Visually confirm delete buttons render on list and detail pages (requires running app)

### Phase 5.2: Drive Navigation from a Config Array (Medium Priority)
**Problem:** `main-layout.ts` hardcodes four `navItem()` calls. Every new entity requires manual edit.

- [x] Create `src/view/sub-atoms/elements/nav-config.ts` — export `NAV_ITEMS` array
- [x] Update `navigation()` helper in `main-layout.ts` to iterate over `NAV_ITEMS`
- [x] Remove hardcoded `navItem` calls from `navigation()`
- [x] Run `bun run typecheck`
- [ ] Visually confirm all nav items appear and highlight correctly (requires running app)

### Phase 5.3: Extract CSS into a Dedicated Sub-atom (Medium Priority)
**Problem:** `main-layout.ts` contains ~95 lines of CSS. Layout file is 149 lines — mostly styling.

- [x] Create `src/view/sub-atoms/elements/global-styles.ts` — `globalStyles(): string`
- [x] Move entire `<style>` block from `main-layout.ts` into this function
- [x] Update `main-layout.ts` to import and call `globalStyles()`
- [x] Run `bun run typecheck`
- [ ] Visually confirm all pages render identically (requires running app)

### Phase 5.4: Split input.ts into Element-Specific Sub-atoms (Low Priority — Deferred)
**Problem:** `input.ts` handles 4 HTML element types via branching in one 20-line function.

- [ ] **DEFERRED** — Too small to benefit from splitting. Revisit when any branch exceeds ~8 lines or new input types are added.

### Phase 5.5: Fix the entities/index.ts Barrel (Low Priority)
**Problem:** `src/view/entities/index.ts` only re-exports from `game-domain`. Name collisions prevent a full barrel.

- [ ] **REVISED** — Either remove the barrel entirely or keep as-is. The re-export pattern causes name collisions. Vestigial and harmless.

### Phase 5.6: Extract EntityCardData and Home Page Helpers (Low Priority — Deferred)
**Problem:** `home-page.ts` bundles `EntityCardData` interface + 2 private helpers.

- [ ] **DEFERRED** — Single-use type consumed by one caller. Revisit if entity cards are reused on other pages.

---

## Layer 6 — Browser

### Phase 6.1: Extract escapeText into a Shared Sub-atom (Medium Priority)
**Problem:** `modal.ts` and `validation-errors.ts` both define identical `escapeText` functions.

- [x] Create `src/browser/sub-atoms/utilities/escape-text.ts` — shared `escapeText`
- [x] Update `src/browser/sub-atoms/utilities/index.ts` barrel
- [x] Update `src/browser/molecules/ui/modal.ts` — import from sub-atoms, remove local function
- [x] Update `src/browser/molecules/ui/validation-errors.ts` — import from sub-atoms, remove local function
- [x] Run `bun run typecheck`
- [x] Rebuild browser bundle

### Phase 6.2: Fix cascade-dropdown-handler.ts to Use fetchJson (Medium Priority)
**Problem:** `cascade-dropdown-handler.ts` calls raw `fetch()` instead of `fetchJson` sub-atom.

- [x] Update `src/browser/atoms/handlers/cascade-dropdown-handler.ts` — import `fetchJson`, replace raw `fetch` + manual JSON parsing
- [x] Remove manual `if (!response.ok) return;` guard
- [x] Rebuild browser bundle
- [ ] Test cascading dropdowns on GameCategory and GameSubcategory forms (requires running app)

### Phase 6.3: Extract Validator Factory from form-controller.ts (Medium Priority)
**Problem:** `form-controller.ts` bundles `buildFieldValidator` (atom-level) and `validateAllFields` (molecule-level) inside the organism.

- [x] Create `src/browser/atoms/validation/build-field-validator.ts` — validator factory atom
- [x] Create `src/browser/atoms/validation/index.ts` barrel
- [x] Create `src/browser/molecules/validation/validate-all-fields.ts` — form-level validation molecule
- [x] Create `src/browser/molecules/validation/index.ts` barrel
- [x] Update `src/browser/atoms/index.ts` to re-export from `./validation`
- [x] Update `src/browser/molecules/index.ts` to re-export from `./validation`
- [x] Update `form-controller.ts` — remove functions, import from new locations
- [x] Run `bun run typecheck`
- [x] Rebuild browser bundle
- [ ] Test form validation on all create/edit pages (requires running app)

### Phase 6.4: Refactor main.ts into a Data-Driven Router (High Priority)
**Problem:** `main.ts` is 416 lines with hardcoded if/else chains for every entity route. Largest violation in the audit.

**Step 4a: Define route config type**
- [x] Create `src/browser/sub-atoms/routing/route-config.ts` — `EntityRouteConfig` interface
- [x] Create `src/browser/sub-atoms/routing/index.ts` barrel

**Step 4b: Create entity route initializer atom**
- [x] Create `src/browser/atoms/routing/init-entity-routes.ts` — `initEntityRoutes(config, fieldConfig)`
- [x] Create `src/browser/atoms/routing/index.ts` barrel

**Step 4c: Define entity route configs**
- [x] Create `src/browser/sub-atoms/routing/entity-routes.ts` — `ENTITY_ROUTES` array

**Step 4d: Rewrite main.ts**
- [x] Replace 416-line `init()` body with ~20-line data-driven loop (main.ts now 43 lines)
- [x] Rebuild browser bundle (37 modules, 15.11 KB — down from 18.63 KB)
- [ ] Test ALL entity pages end-to-end: list, detail, create, edit, duplicate (requires running app)
- [ ] Test cascade dropdowns on category and subcategory forms (requires running app)
- [ ] Test name availability on domain create/edit/duplicate (requires running app)

### Phase 6.5: Extract injectStylesOnce Sub-atom (Low Priority)
**Problem:** Four UI molecules repeat identical style injection pattern with per-module boolean flags.

- [x] Create `src/browser/sub-atoms/utilities/inject-styles.ts` — `injectStylesOnce(id, css)`
- [x] Update `toast.ts` — use `injectStylesOnce("toast", TOAST_STYLES)`
- [x] Update `modal.ts` — use `injectStylesOnce("modal", MODAL_STYLES)`
- [x] Update `loading.ts` — use `injectStylesOnce("loading", LOADING_STYLES)`
- [x] Update `validation-errors.ts` — use `injectStylesOnce("validation", ERROR_STYLES)`
- [x] Remove local `stylesInjected` flags and `injectStyles` functions from all 4 molecules
- [x] Rebuild browser bundle (14.82 KB — down from 18.74 KB at start of Layer 6)

### Phase 6.6: Decompose name-availability-handler.ts (Low Priority — Deferred)
**Problem:** Handler bundles 6 concerns in 93 lines.

- [ ] **DEFERRED** — Function is long but linear with clear comments. Revisit if other fields need availability checking.

### Phase 6.7: Move BrowserFieldConfig to Layer 0 (Medium Priority — Cross-Layer)
**Problem:** Same as Layer 4 Phase 2. Type defined locally in both Layer 4 and Layer 6.

- [x] **Completed during Phase 4.2** — `BrowserFieldConfig` now in `@config/types`, imported by `form-controller.ts`
- [x] Remove local `BrowserFieldConfig` interface from `form-controller.ts`
- [x] Verify browser bundle resolves `@config` path alias
- [x] Rebuild browser bundle

---

## Cross-Layer Coordination Notes

| Task | Layers Touched | Note |
|------|---------------|------|
| Phase 4.2 + Phase 6.7 | L0, L4, L6 | BrowserFieldConfig moves to Layer 0 — do as single task |
| Phase 3.2 + Phase 4.3 | L3, L4 | Option-fetching + form signatures touch same call sites — do together |
| Phase 3.7 | L3, L4 | Type casting deferred until L4 accepts typed entities |
| Phase 2.5 | L2 | Connection centralization deferred until transaction support |

---

## Summary

| Layer | Phases | High Priority | Medium Priority | Low/Deferred |
|-------|--------|---------------|-----------------|--------------|
| 0 — Config | 3 | 0 | 1 | 2 |
| 1 — Model | 2 | 1 | 0 | 1 |
| 2 — Model Service | 5 | 1 | 2 | 2 |
| 3 — Controller | 7 | 2 | 1 | 4 |
| 4 — View Service | 7 | 0 | 4 | 3 |
| 5 — View | 6 | 0 | 2 | 4 |
| 6 — Browser | 7 | 1 | 3 | 3 |
| **Total** | **37** | **5** | **13** | **19** |
