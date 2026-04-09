Layer 0 Refactoring Plan

Refactor 1: Extract Shared Reference Field Atoms  
 Problem: GAME_DOMAIN_ID_FIELD is defined identically in 3 files, GAME_SUBDOMAIN_ID_FIELD in 2 files, GAME_CATEGORY_ID_FIELD in 1 file (but will duplicate as more entities are added).  
 Action: Create three new atom files in src/config/universal/atoms/:

┌──────────────────────────────────┬───────────────────────────────┬────────────────────────────────────────────────────────┐
│ New File │ Exports │ Used By │
├──────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ game-domain-ref-field-atom.ts │ GAME_DOMAIN_REF_FIELD_ATOM │ GameSubdomain, GameCategory, GameSubcategory factories │
├──────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ game-subdomain-ref-field-atom.ts │ GAME_SUBDOMAIN_REF_FIELD_ATOM │ GameCategory, GameSubcategory factories │
├──────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ game-category-ref-field-atom.ts │ GAME_CATEGORY_REF_FIELD_ATOM │ GameSubcategory factory │
└──────────────────────────────────┴───────────────────────────────┴────────────────────────────────────────────────────────┘

Each file follows the existing atom pattern:
import sub-atoms → compose via spread → export as const

Then update:

- src/config/universal/atoms/index.ts — add 3 new exports
- game-subdomain-config-factory.ts — remove local GAME_DOMAIN_ID_FIELD, import from atoms
- game-category-config-factory.ts — remove both local constants, import from atoms
- game-subcategory-config-factory.ts — remove all three local constants, import from atoms

Files created: 3
Files modified: 4 (3 factories + 1 barrel)

---

Refactor 2: Add Missing Barrel Export

Problem: DISPLAY_FORMAT_SELECT exists in display-formats.ts but is not re-exported from src/config/universal/sub-atoms/index.ts.

Action: Add DISPLAY_FORMAT_SELECT to the export list in src/config/universal/sub-atoms/index.ts.

Files modified: 1

---

Refactor 3: Fix Inconsistent Import Path

Problem: src/config/universal/atoms/created-at-field-atom.ts imports from "../sub-atoms/" with trailing slash. All other atoms use "../sub-atoms".

Action: Remove trailing slash from the import in created-at-field-atom.ts.

Files modified: 1

---

Execution Order

1. Refactor 1 first (structural change — creates files, updates imports)
2. Refactor 2 second (barrel fix)
3. Refactor 3 last (trivial style fix)
4. Run bun run typecheck after each refactor
5. Run existing tests to verify no regressions

---

Total Impact

┌──────────────────────────────┬─────────────────────────────────────────────┐
│ Metric │ Count │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ New files created │ 3 │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Files modified │ 6 │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Files deleted │ 0 │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Lines of duplication removed │ ~30 (across 3 factories) │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Risk level │ Low — pure data constants, no logic changes │
└──────────────────────────────┴─────────────────────────────────────────────┘

That's the complete Layer 0 plan. Write it down and let me know when you're ready for Layer 1 audit.

Layer 1 Refactoring Plan

Refactor 1: Split build-query.ts into Individual Query Atoms  
 Problem: src/model/universal/atoms/build-query.ts contains 6 exported functions — one per query type. Each is an independent concern that composes different sub-atoms and changes for different reasons.  
 Action: Split into 6 individual atom files in src/model/universal/atoms/:

┌─────────────────────────────────┬───────────────────────────┬───────────────────────────────────────────────────────────────────────────────┐
│ New File │ Function │ Sub-atoms Composed │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-select-query.ts │ buildSelectQuery │ queryBuildSelect + queryBuildWhere │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-paginated-select-query.ts │ buildPaginatedSelectQuery │ queryBuildSelect + queryBuildWhere + queryBuildOrderBy + queryBuildPagination │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-count-query.ts │ buildCountQuery │ queryBuildCount + queryBuildWhere │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-insert-query.ts │ buildInsertQuery │ queryBuildInsert │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-update-query.ts │ buildUpdateQuery │ queryBuildUpdate + queryBuildWhere │
├─────────────────────────────────┼───────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ build-delete-query.ts │ buildDeleteQuery │ queryBuildWhere (+ inline DELETE FROM) │
└─────────────────────────────────┴───────────────────────────┴───────────────────────────────────────────────────────────────────────────────┘

Then update:

- src/model/universal/atoms/index.ts — replace single build-query re-export with 6 individual re-exports
- Delete src/model/universal/atoms/build-query.ts

Update consumers (imports change from direct file to barrel):

- src/model/universal/molecules/create-entity.ts — imports buildInsertQuery
- src/model/entities/game-domain/game-domain-model.ts — imports buildSelectQuery, buildPaginatedSelectQuery, buildCountQuery, buildUpdateQuery, buildDeleteQuery
- src/model/entities/game-subdomain/game-subdomain-model.ts — same as above
- src/model/entities/game-category/game-category-model.ts — same as above
- src/model/entities/game-subcategory/game-subcategory-model.ts — same as above
- tests/model/atoms/build-query.test.ts — update imports (may also split test file to match)

Files created: 6
Files deleted: 1
Files modified: 7 (1 barrel + 1 molecule + 4 organisms + 1 test)

---

Refactor 2: Format validate-datetime.ts

Problem: Irregular spacing around braces and operators on a few lines.

Action: Run formatter on src/model/universal/sub-atoms/validation/validate-datetime.ts to normalize spacing.

Files modified: 1

---

Execution Order

1. Refactor 1 first (structural split — create files, update imports, delete original)
2. Refactor 2 second (cosmetic)
3. Run bun run typecheck after Refactor 1
4. Run bun test to verify no regressions

---

Total Impact

┌───────────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Metric │ Count │
├───────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ New files created │ 6 │
├───────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Files deleted │ 1 │
├───────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Files modified │ 8 │
├───────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Net new files │ +5 │
├───────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Risk level │ Low — each function moves unchanged into its own file, only imports update │
└───────────────────┴────────────────────────────────────────────────────────────────────────────┘

That's the Layer 1 plan. Write it down and I'll start the Layer 2 audit.

Layer 2 — Model Service: Refactoring Plan

--- Phase 1: Split execute-query.ts into three sub-atoms
Current state: src/model-service/sub-atoms/database/execute-query.ts contains three responsibilities — placeholder conversion, read execution, and write execution — in a single file.

Action items:

1. Create src/model-service/sub-atoms/database/convert-placeholders.ts
   - Move the convertPlaceholders function into its own sub-atom
   - Export it as a named export
   - Single responsibility: adapt ? placeholders to PostgreSQL $n format

2. Create src/model-service/sub-atoms/database/execute-select.ts
   - Move executeSelect into its own file
   - Import convertPlaceholders from the new sub-atom
   - Single responsibility: execute a query and return rows

3. Create src/model-service/sub-atoms/database/execute-write.ts
   - Move executeWrite into its own file
   - Import convertPlaceholders from the new sub-atom
   - Single responsibility: execute a query without returning rows

4. Delete the original execute-query.ts
5. Update src/model-service/sub-atoms/database/index.ts barrel to re-export from the three new files instead of from execute-query. Keep convertPlaceholders as an internal-only export (not re-exported from the barrel) unless other
   layers need it. Actually, since only the two sibling sub-atoms use it, it should still be exported from the barrel for consistency — atoms and molecules never call it directly.

Verification: All existing imports of executeSelect and executeWrite go through the barrel (../../sub-atoms/database), so no import paths break. Run bun run typecheck to confirm.

---

Phase 2: Fix the paginated workflow hierarchy bypass

Current state: src/model-service/molecules/workflows/select-many-paginated-workflow.ts line 8 imports executeSelect directly from the sub-atom layer, bypassing the CRUD atom layer. The data query goes through selectMany (correct), but
the count query skips the atom.

Action items:

1. In select-many-paginated-workflow.ts, replace the direct executeSelect import with selectMany from ../../atoms/crud
2. Change the count query execution from:
   executeSelect(db, countQuery)
3. to:
   selectMany(db, countQuery)
4. This works because selectMany returns Record<string, unknown>[], and the count result is accessed as countRows[0]?.["total"] — the array-of-rows interface is compatible.
5. Remove the executeSelect import entirely from this file

Why this matters: The CRUD atom selectMany wraps errors with "Select many failed: ..." context. By bypassing it, count query errors get raw database messages while data query errors get wrapped messages — inconsistent error formatting.
After this fix, both queries flow through the same atom with the same error handling.

Verification: Run bun run typecheck. Functionally identical — only the error wrapping changes.

---

Phase 3: Extract uniqueness check into a reusable atom

Current state: All four entity service organisms contain inline uniqueness-check logic in both create() and update() methods — 8 nearly identical blocks of code. Each block extracts a name field, optionally extracts a scope field,
calls selectManyWorkflow, and returns a validation error if a match is found.

Action items:

1. Create src/model-service/atoms/uniqueness/check-name-uniqueness.ts
   - Single function: checkNameUniqueness
   - Parameters:
     - db: SQL — database connection
     - model: EntityModel<TEntity> — model organism (needs prepareSelect and deserialize)
     - name: string — the name value to check
     - scope?: Record<string, unknown> — optional parent scope (e.g., { game_domain_id: "uuid" })
     - excludeId?: string — ID to exclude on updates (so the current record doesn't conflict with itself)
   - Returns: { available: true } or { available: false; error: string }
   - The function calls selectManyWorkflow internally to check for matches
   - The error message should be passed in or derived from config — keeps the atom entity-agnostic

2. Create src/model-service/atoms/uniqueness/index.ts barrel
3. Refactor all four entity service create() methods:
   - Replace the inline 8-line uniqueness block with a single call to checkNameUniqueness
   - Pass scope as needed: GameDomain passes no scope, GameSubdomain passes { game_domain_id }, GameCategory passes { game_subdomain_id }, GameSubcategory passes { game_category_id }
   - Pass excludeId as undefined for creates

4. Refactor all four entity service update() methods:
   - Same as above but pass excludeId: id so the current record is excluded from the check

Naming convention for the error message: The entity services currently hardcode messages like "A Game Domain with this name already exists.". The atom could accept an entityLabel: string parameter (sourced from config displayName) and
build the message generically: "A ${entityLabel} with this name already exists." with optional scope context.

Verification: Run bun run typecheck. Test create and update for all four entities to confirm uniqueness checks still fire correctly.

---

Phase 4 (Low Priority): Disambiguate workflow interface names

Current state: Four workflow files each define a local interface called EntityModel<TEntity> with different method requirements. One defines PaginatedEntityModel<TEntity>. The delete workflow defines EntityModel (non-generic). If two
workflow types are ever imported into the same file, the names collide.

Action items:

1. Rename each local interface to reflect its workflow:
   - create-entity-workflow.ts → CreateEntityModel<TEntity>
   - select-entity-workflow.ts → SelectEntityModel<TEntity>
   - select-many-workflow.ts → SelectManyEntityModel<TEntity>
   - update-entity-workflow.ts → UpdateEntityModel<TEntity>
   - delete-entity-workflow.ts → DeleteEntityModel
   - select-many-paginated-workflow.ts → keep PaginatedEntityModel<TEntity> (already unique)

2. These are local (non-exported) interfaces, so no external imports break. The rename is purely for internal clarity.

Verification: bun run typecheck — no external impact.

---

Phase 5 (Low Priority): Centralize getConnection() in service organisms

Current state: Each of the 6 methods in each of the 4 service organisms calls getConnection() independently — 24 identical calls scattered across the codebase.

Action items:

This is a design choice with tradeoffs. Two options:

Option A — Lazy closure (minimal change):
Wrap each service in a function that calls getConnection() once:
function createService() {
const db = getConnection();
return {
async create(input) { /_ uses db _/ },
async findById(id) { /_ uses db _/ },
// ...
};
}
export const GameDomainService = createService();
The connection is resolved once at first import, not on every method call.

Option B — Keep current pattern (no change):
The current approach is explicit and debuggable. Each method gets a fresh reference to the singleton. If the singleton pattern in get-connection.ts is ever replaced with request-scoped connections (for transactions), the per-method
call actually becomes the correct pattern.

Recommendation: Defer this. The current pattern is verbose but not incorrect, and it keeps the door open for future transaction support. Flag for revisiting when transaction support is added.

---

Execution Order

┌──────┬──────────────────────────────────┬──────────┬───────────────────────────────────────────────────────┐
│ Step │ Phase │ Priority │ Risk │
├──────┼──────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ 1 │ Phase 1: Split execute-query │ Medium │ Low — internal restructuring, barrels absorb change │
├──────┼──────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ 2 │ Phase 2: Fix hierarchy bypass │ Medium │ Low — one import change, same runtime behavior │
├──────┼──────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ 3 │ Phase 3: Extract uniqueness atom │ High │ Medium — touches all 4 entity services, needs testing │
├──────┼──────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ 4 │ Phase 4: Rename interfaces │ Low │ None — local non-exported names only │
├──────┼──────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ 5 │ Phase 5: Centralize connection │ Low │ Deferred — revisit with transaction support │
└──────┴──────────────────────────────────┴──────────┴───────────────────────────────────────────────────────┘

Phases 1 and 2 can be done independently in any order. Phase 3 is the highest-value change — it eliminates the largest source of duplication in Layer 2 and establishes the pattern for all future entities.

---

Copy this plan down, then say continue and I'll proceed with the Layer 3 audit.

Layer 3 — Controller: Refactoring Plan

--- Phase 1: Extract setHtml into a response sub-atom
Current state: All 4 pages files define an identical setHtml function that sets the content-type header to text/html; charset=utf-8.

Action items:

1. Create src/controller/sub-atoms/response/set-html-content-type.ts
   - Move the setHtml function into this file
   - Single responsibility: set the HTML content-type header on a response

2. Update src/controller/sub-atoms/response/index.ts barrel to re-export setHtml
3. Remove the local setHtml function from all 4 pages files:
   - game-domain-pages.ts
   - game-subdomain-pages.ts
   - game-category-pages.ts
   - game-subcategory-pages.ts

4. Replace each with an import from ../../sub-atoms/response

Verification: bun run typecheck. No behavioral change.

---

Phase 2: Extract option-fetching into shared controller sub-atoms

Current state: getDomainOptions() appears in 3 pages files. getAllSubdomainOptions() appears in 2. getSubdomainOptionsForDomain(id) appears in 2. Each follows the identical pattern: call XxxService.findMany(conditions?) → map result to
SelectOption[].

Action items:

1. Create src/controller/sub-atoms/options/entity-to-options.ts
   - Single function: mapEntityToOptions
   - Takes an array of entities (as Record<string, unknown>[]) and returns SelectOption[]
   - Maps { name, id } → { label, value } — the transformation that all option helpers share
   - Single responsibility: transform entity rows into select options

2. Create src/controller/sub-atoms/options/fetch-options.ts
   - Single function: fetchOptions
   - Parameters:
     - service: { findMany(conditions?: Record<string, unknown>): Promise<{ success: boolean; data: unknown[] }> } — structural type, not a full EntityService
     - conditions?: Record<string, unknown> — optional filter
   - Calls service.findMany(conditions), then delegates to mapEntityToOptions
   - Returns Promise<readonly SelectOption[]>
   - Single responsibility: fetch entities from a service and convert to options

3. Create src/controller/sub-atoms/options/index.ts barrel
4. Update src/controller/sub-atoms/index.ts to re-export from ./options
5. Refactor all pages files to replace local helpers with fetchOptions:
   - getDomainOptions() → fetchOptions(GameDomainService)
   - getAllSubdomainOptions() → fetchOptions(GameSubdomainService)
   - getAllCategoryOptions() → fetchOptions(GameCategoryService)
   - getSubdomainOptionsForDomain(id) → fetchOptions(GameSubdomainService, { game_domain_id: id })
   - getCategoryOptionsForSubdomain(id) → fetchOptions(GameCategoryService, { game_subdomain_id: id })

6. Delete all local getXxxOptions and getXxxOptionsForYyy functions from pages files

Why two sub-atoms instead of one: mapEntityToOptions is a pure synchronous transform — useful on its own when you already have entities in hand. fetchOptions is the async orchestrator that calls a service and then the mapper.
Separating them keeps each at single responsibility and allows reuse of just the mapping logic if needed.

Verification: bun run typecheck. Test all form pages to confirm dropdowns still populate correctly.

---

Phase 3: Extract reference lookup building into a shared sub-atom

Current state: buildDomainLookup(options) in game-subdomain-pages, buildReferenceLookup(domain, subdomain) in game-category-pages, buildReferenceLookup(domain, subdomain, category) in game-subcategory-pages. All follow the same inner
loop: for (opt of options) map[opt.value] = opt.label.

Action items:

1. Create src/controller/sub-atoms/options/build-reference-lookup.ts
   - Single function: buildReferenceLookup
   - Parameters: entries: Array<{ fieldName: string; options: readonly SelectOption[] }>
   - Returns ReferenceLookup (a Record<string, Record<string, string>>)
   - Loops through each entry, builds the { value: label } map, assigns to the field name key
   - Single responsibility: convert option arrays into a lookup map keyed by field name

2. Update src/controller/sub-atoms/options/index.ts barrel to include the new export
3. Refactor pages files to use the universal builder:

4. game-subdomain-pages.ts:
   const lookup = buildReferenceLookup([
   { fieldName: "game_domain_id", options: domainOptions },
   ]);

5. game-category-pages.ts:
   const lookup = buildReferenceLookup([
   { fieldName: "game_domain_id", options: domainOptions },
   { fieldName: "game_subdomain_id", options: subdomainOptions },
   ]);

6. game-subcategory-pages.ts:
   const lookup = buildReferenceLookup([
   { fieldName: "game_domain_id", options: domainOptions },
   { fieldName: "game_subdomain_id", options: subdomainOptions },
   { fieldName: "game_category_id", options: categoryOptions },
   ]);
7. Delete all local buildDomainLookup and buildReferenceLookup functions from pages files

Why an array of entries: This design scales to any number of reference fields without changing the function signature. Adding a fifth hierarchy level just means adding another entry to the array.

Verification: bun run typecheck. Test list and detail pages to confirm UUID-to-name resolution still works.

---

Phase 4: Extract check-name into a handler atom factory

Current state: All 4 controller organisms contain an inline check-name route handler that extracts query params, validates them, queries the service for conflicts, filters by excludeId, and returns { available: boolean }. The logic is
nearly identical across all four, varying only in the scope field name (game_domain_id, game_subdomain_id, game_category_id, or none for GameDomain).

Action items:

1. Create src/controller/atoms/handlers/check-name-handler.ts
   - Factory function: makeCheckNameHandler
   - Parameters:
     - service: { findMany(conditions?: Record<string, unknown>): Promise<{ success: boolean; data: unknown[] }> } — minimal structural type
     - scopeField?: string — the query param that scopes uniqueness (e.g., "gameDomainId")
     - scopeDbField?: string — the corresponding database column (e.g., "game_domain_id")
   - Returns an async handler that:
     - Extracts name, excludeId, and optionally the scope param from the query
     - Returns { available: false } if required fields are empty
     - Calls service.findMany with the name and optional scope condition
     - Filters out excludeId if provided
     - Returns { available: conflicts.length === 0 }
   - For GameDomain (no scope): call with scopeField and scopeDbField both undefined

2. Update src/controller/atoms/handlers/index.ts barrel to include makeCheckNameHandler
3. Refactor all 4 controller organisms to replace inline handlers:

4. game-domain-controller.ts:
   .get("/api/game-domains/check-name", makeCheckNameHandler(GameDomainService))

5. game-subdomain-controller.ts:
   .get("/api/game-subdomains/check-name", makeCheckNameHandler(
   GameSubdomainService, "gameDomainId", "game_domain_id"
   ))

6. game-category-controller.ts:
   .get("/api/game-categories/check-name", makeCheckNameHandler(
   GameCategoryService, "gameSubdomainId", "game_subdomain_id"
   ))

7. game-subcategory-controller.ts:
   .get("/api/game-subcategories/check-name", makeCheckNameHandler(
   GameSubcategoryService, "gameCategoryId", "game_category_id"
   ))
8. Delete all inline check-name handlers from controller files

Relationship to Layer 2 refactoring: Once the Layer 2 uniqueness atom is extracted (Layer 2 Phase 3), this handler could optionally delegate to it instead of reimplementing the query + filter pattern. However, the Layer 3 handler
serves a different purpose (optimistic browser check) than the Layer 2 uniqueness guard (authoritative server-side validation). Keeping both is correct — but both should call the same underlying logic.

Verification: bun run typecheck. Test name availability checking on all create and edit forms.

---

Phase 5: Fix the entities/index.ts barrel

Current state: src/controller/entities/index.ts only re-exports GameDomainController. The other three controllers are imported directly by their entity-specific paths in src/index.ts.

Action items:

Option A — Complete the barrel:
Update src/controller/entities/index.ts to re-export all four controllers:
export { GameDomainController } from "./game-domain";
export { GameSubdomainController } from "./game-subdomain";
export { GameCategoryController } from "./game-category";
export { GameSubcategoryController } from "./game-subcategory";
Update src/index.ts to import all four from the barrel.

Option B — Remove the barrel:
Delete src/controller/entities/index.ts entirely. src/index.ts already imports from entity-specific paths — keep that pattern.

Recommendation: Option A. Barrels are used consistently throughout the codebase and provide a clean single import point.

Verification: bun run typecheck. No behavioral change.

---

Phase 6 (Low Priority): Document the pages cross-layer pattern

Current state: Pages files import from Layer 4 (View Service) and Layer 5 (View), which doesn't fit the strict "layers only depend downward" rule. This is architecturally intentional — pages orchestrate the full request→data→view cycle
— but undocumented.

Action items:

1. Add a comment block at the top of one representative pages file (e.g., game-domain-pages.ts) explaining the pattern:
   // Pages files bridge Layer 3 (HTTP) with Layers 4-5 (presentation).
   // They import from View Service and View — this is by design.
   // The "downward only" rule applies to the Config→Model→Service vertical.
   // Pages are horizontal orchestrators that legitimately span Layers 3-5.
2. Optionally update the Layer 3 section of any architecture documentation to acknowledge this pattern.

No code change. Documentation only.

---

Phase 7 (Low Priority): Address type casting verbosity

Current state: Pages files use as unknown as Record<string, unknown> and as unknown as { name: string } extensively to bridge between typed entity types and the untyped records that View Service expects.

Action items:

This is a design tradeoff. Two approaches:

Option A — Create a toRecord sub-atom:
export function toRecord<T extends object>(entity: T): Record<string, unknown> {
return entity as unknown as Record<string, unknown>;
}
Reduces casting to toRecord(result.data) — more readable but doesn't eliminate the underlying type gap.

Option B — Adjust View Service signatures:
Make View Service generic so it accepts typed entities directly. This is a larger change that touches Layer 4.

Recommendation: Defer to the Layer 4 audit. If Layer 4 reveals opportunities to accept typed entities, the casting problem disappears at the source. For now, the casts are safe (entities are always plain objects) and the verbosity is
cosmetic.

---

Execution Order

┌──────┬───────────────────────────────────────┬──────────┬────────────────────────────────────────────────────────────┐
│ Step │ Phase │ Priority │ Risk │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 1 │ Phase 1: Extract setHtml │ Medium │ None — trivial extraction │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 2 │ Phase 2: Extract option-fetching │ High │ Low — replaces local helpers with shared imports │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 3 │ Phase 3: Extract reference lookup │ Medium │ Low — same pattern as Phase 2 │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 4 │ Phase 4: Extract check-name handler │ High │ Medium — touches all 4 controllers, needs endpoint testing │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 5 │ Phase 5: Fix barrel │ Low │ None — import path change only │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 6 │ Phase 6: Document cross-layer pattern │ Low │ None — documentation only │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ 7 │ Phase 7: Type casting │ Low │ Deferred to Layer 4 audit │
└──────┴───────────────────────────────────────┴──────────┴────────────────────────────────────────────────────────────┘

Phases 1–3 can be done as a batch — they all address duplication in the pages files. Phase 4 is independent and can be done in parallel. Phase 5 is a quick cleanup.

The highest-impact changes are Phases 2 and 4. Phase 2 eliminates the option-fetching duplication that grows with every new entity. Phase 4 eliminates the inline check-name handlers that are the largest atomic violation in the
controller layer.

---

Copy this plan down, then say continue and I'll proceed with the Layer 4 audit.

Layer 4 — View Service: Refactoring Plan

--- Phase 1: Extract mapInputType into a formatter sub-atom
Current state: src/view-service/molecules/views/build-form-view.ts contains a private mapInputType function (lines 10–27) that maps FieldConfig.displayFormat values to HTML input type strings. This is a distinct concern from form
assembly and will grow as new display formats are added.

Action items:

1. Create src/view-service/sub-atoms/formatters/format-input-type.ts
   - Move mapInputType into this file and rename to formatInputType for consistency with other formatters
   - Export as named export
   - Single responsibility: map a FieldConfig display format to an HTML input type string

2. Update src/view-service/sub-atoms/formatters/index.ts barrel to include formatInputType
3. Update build-form-view.ts to import formatInputType from ../../sub-atoms/formatters and remove the local mapInputType function

Verification: bun run typecheck. No behavioral change.

---

Phase 2: Move BrowserFieldConfig shape to Layer 0

Current state: src/view-service/molecules/views/build-browser-field-config.ts defines a local BrowserField interface that must match BrowserFieldConfig in Layer 6 exactly. Changes to one must be manually mirrored in the other with no
compile-time enforcement.

Action items:

1. Create src/config/types/browser-field-config.ts
   - Move the BrowserField interface here and rename to BrowserFieldConfig
   - This becomes the single source of truth — Layer 0 owns the shape
   - Single responsibility: define the browser-consumable field config shape

2. Update src/config/types/index.ts barrel to export BrowserFieldConfig
3. Update src/view-service/molecules/views/build-browser-field-config.ts:
   - Import BrowserFieldConfig from @config/types
   - Remove the local BrowserField interface
   - Update the return type to BrowserFieldConfig[]

4. Update the Layer 6 browser code that defines BrowserFieldConfig:
   - Import the type from @config/types instead of defining it locally
   - Note: This depends on whether the Layer 6 build (browser bundle) can resolve @config path aliases. If the browser bundle uses a separate build that can't access server-side config types, keep the Layer 6 type as a type-only import

(erased at compile time) or defer this step until the Layer 6 audit confirms the import path works.

Why Layer 0: Configuration types are Layer 0's responsibility. This shape describes what fields look like — it's config vocabulary, not view logic. Both Layer 4 and Layer 6 consume it, and Layer 0 is the only layer both can depend on
without violating boundary rules.

Verification: bun run typecheck. If the browser bundle has a separate tsconfig, verify that too.

---

Phase 3: Simplify view service form method signatures

Current state: Entity view service organisms accept positional select-option parameters that grow with each hierarchy level. GameSubcategory's prepareCreateForm already takes 5 parameters. Internally, the organisms unpack these named
params into a Record<string, readonly SelectOption[]> map — exactly the shape buildFormView already accepts.

Action items:

1. Refactor all four entity view services to accept a single selectOptions map instead of positional option parameters on form methods:

1. Before (GameCategory example):
   prepareCreateForm(
   domainOptions: readonly SelectOption[],
   subdomainOptions: readonly SelectOption[],
   values?: Record<string, unknown>,
   errors?: Record<string, string>,
   ): FormView {
   return buildFormView(CONFIG, values, errors, {
   game_domain_id: domainOptions,
   game_subdomain_id: subdomainOptions,
   });
   }

1. After:
   prepareCreateForm(
   selectOptions: Record<string, readonly SelectOption[]>,
   values?: Record<string, unknown>,
   errors?: Record<string, string>,
   ): FormView {
   return buildFormView(CONFIG, values, errors, selectOptions);
   }
1. Apply the same change to all form methods across all four view services:
   - prepareCreateForm
   - prepareEditForm
   - prepareDuplicateForm

1. For GameDomainViewService (no dropdowns): pass {} or omit the parameter (make it optional with = {}).
1. Update all call sites in Layer 3 pages files to pass the options map directly:

1. Before (game-category-pages.ts):
   GameCategoryViewService.prepareCreateForm(domainOptions, subdomainOptions);

1. After:
   GameCategoryViewService.prepareCreateForm({
   game_domain_id: domainOptions,
   game_subdomain_id: subdomainOptions,
   });

Why this matters: Every new entity currently requires modifying the view service's method signatures. With the map pattern, adding a fifth hierarchy level requires zero changes to the view service — just pass a map with one more key.
The organism becomes truly entity-agnostic.

Side benefit: All four view service organisms become structurally identical in their form methods. This opens the door to a future universal view service factory (similar to how createCrudRoutes universalizes controller routes).

Verification: bun run typecheck. Test all create, edit, and duplicate forms to confirm dropdowns still render.

---

Phase 4: Handle duplicate title in the molecule

Current state: All four view services override the title in prepareDuplicateForm by spreading the buildFormView result:
const view = buildFormView(CONFIG, sourceValues, undefined, options);
return { ...view, title: `Duplicate ${CONFIG.displayName}` };

Action items:

1. Add an optional titleOverride parameter to buildFormView:

export function buildFormView(
config: EntityConfig,
currentValues?: Record<string, unknown>,
errors?: Record<string, string>,
selectOptions?: Record<string, readonly SelectOption[]>,
titleOverride?: string,
): FormView {
// ...existing logic...
const title = titleOverride
?? (currentValues ? `Edit ${config.displayName}` : `New ${config.displayName}`);
return { title, fields };
} 2. Update all four prepareDuplicateForm methods to pass the title instead of spreading:

prepareDuplicateForm(selectOptions, sourceValues): FormView {
return buildFormView(
CONFIG, sourceValues, undefined, selectOptions,
`Duplicate ${CONFIG.displayName}`,
);
} 3. Remove the spread + override pattern from all organisms

Verification: bun run typecheck. Test all duplicate forms.

---

Phase 5: Move ReferenceLookup type to view-service/types/

Current state: ReferenceLookup is defined in src/view-service/atoms/field-display/prepare-field.ts alongside the function that uses it. Layer 3 pages files import it directly from this atom path (@view-service/atoms/field-display),
which is unconventional — types are typically housed in the types directory.

Action items:

1. Move the ReferenceLookup type definition to src/view-service/types/view-models.ts (alongside DisplayField, SelectOption, etc.)
2. Update src/view-service/types/index.ts barrel to export ReferenceLookup
3. Update src/view-service/atoms/field-display/prepare-field.ts to import ReferenceLookup from ../../types
4. Update src/view-service/atoms/field-display/index.ts to re-export from types instead of from prepare-field:
   export { prepareField } from "./prepare-field";
   export type { ReferenceLookup } from "../../types";
5. Or simply remove the re-export from the atom barrel, since consumers should import types from the types barrel.
6. Update Layer 3 pages files that import ReferenceLookup:
   - Change import type { ReferenceLookup } from "@view-service/atoms/field-display" to import type { ReferenceLookup } from "@view-service/types"

Verification: bun run typecheck. Import paths change, no behavioral change.

---

Phase 6 (Low Priority): Fix the entities/index.ts barrel

Current state: src/view-service/entities/index.ts only re-exports GameDomainViewService. Same inconsistency as Layer 3.

Action items:

Update src/view-service/entities/index.ts to re-export all four:
export { GameDomainViewService } from "./game-domain";
export { GameSubdomainViewService } from "./game-subdomain";
export { GameCategoryViewService } from "./game-category";
export { GameSubcategoryViewService } from "./game-subcategory";

Verification: bun run typecheck. No behavioral change.

---

Phase 7 (Low Priority): Split dual-export formatter files

Current state: format-date.ts, format-boolean.ts, and format-text.ts each export two functions. Technically two responsibilities per file by strict atomic rules.

Action items:

Recommendation: Defer. The dual exports are thematically cohesive (two date formatters, two boolean formatters, two text formatters). Splitting them would create 3 additional files of ~10 lines each with no functional benefit. The
barrel re-exports would remain identical. The "violation" is cosmetic, and the cognitive overhead of 8 formatter files vs 5 is worse than the minor bundling.

If the project later adds many more formatter variants per type (e.g., formatDateRelative, formatDateISO, formatBooleanEmoji), then splitting becomes worthwhile. For now, leave as-is.

---

Execution Order

┌──────┬────────────────────────────────────────┬──────────┬──────────────────────────────────────────────────────────┐
│ Step │ Phase │ Priority │ Risk │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 1 │ Phase 1: Extract mapInputType │ Medium │ None — single function extraction │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 2 │ Phase 2: Move BrowserFieldConfig to L0 │ Medium │ Low — type-only move, verify browser bundle │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 3 │ Phase 3: Simplify form signatures │ Medium │ Medium — touches all 4 view services + all 4 pages files │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 4 │ Phase 4: Duplicate title in molecule │ Low │ None — parameter addition │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 5 │ Phase 5: Move ReferenceLookup type │ Low │ None — import path change │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 6 │ Phase 6: Fix barrel │ Low │ None — barrel consistency │
├──────┼────────────────────────────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ 7 │ Phase 7: Split formatters │ Low │ Deferred │
└──────┴────────────────────────────────────────┴──────────┴──────────────────────────────────────────────────────────┘

Phases 1 and 2 are independent and can be done in any order. Phase 3 is the highest-impact change — it eliminates the growing-parameter-list problem and makes view services entity-agnostic on form methods. Phase 4 depends on Phase 3
(if you're already changing form method signatures, do both at once). Phase 5 is a standalone cleanup.

Coordination note: Phase 3 here and Layer 3 Phase 2 (extract option-fetching) touch the same call sites in pages files. These should ideally be done together in a single pass to avoid double-editing the same files.

---

Copy this plan down, then say continue and I'll proceed with the Layer 5 audit.

Layer 5 — View: Refactoring Plan

--- Phase 1: Extract delete form into a sub-atom
Current state: The inline delete form pattern appears in two places — table-row.ts (line 18–20) and detail-page.ts (line 15–17). Both render an identical <form method="POST"> with a danger button. The action links (View, Edit,
Duplicate) use the link sub-atom correctly, but Delete bypasses the sub-atom layer.

Action items:

1. Create src/view/sub-atoms/elements/delete-form.ts
   - Single function: deleteForm
   - Parameters: action: string (the POST URL, e.g., ${basePath}/${id}/delete), label: string = "Delete", small: boolean = false
   - Returns the <form method="POST" ...><button> HTML string
   - Uses escapeHtml for the action URL and label
   - small controls whether btn--small class is added (table rows use small, detail page uses normal)
   - Single responsibility: render a POST form with a danger button

2. Update src/view/sub-atoms/elements/index.ts barrel to export deleteForm
3. Update src/view/atoms/components/table-row.ts:
   - Import deleteForm from ../../sub-atoms
   - Replace the inline form (lines 18–20) with deleteForm(\${basePath}/${row.id}/delete`, "Delete", true)`

4. Update src/view/organisms/pages/detail-page.ts:
   - Import deleteForm from ../../sub-atoms
   - Replace the inline form (lines 15–17) with deleteForm(\${basePath}/${id}/delete`)`

Verification: bun run typecheck. Visually confirm delete buttons still render on list and detail pages.

---

Phase 2: Drive navigation from a config array

Current state: main-layout.ts lines 12–16 hardcode four navItem() calls. Every new entity requires manually adding a line here.

Action items:

1. Create src/view/sub-atoms/elements/nav-config.ts
   - Export a constant array of navigation items:
     export const NAV_ITEMS: readonly { label: string; href: string }[] = [
     { label: "Home", href: "/" },
     { label: "Game Domains", href: "/game-domains" },
     { label: "Game Subdomains", href: "/game-subdomains" },
     { label: "Game Categories", href: "/game-categories" },
     { label: "Game Subcategories", href: "/game-subcategories" },

]; - Single responsibility: define the navigation item list - Alternative location: This could go in Layer 0 (src/config/) as a navigation config if you want all entities to register themselves centrally. Either location works — Layer 5 is closer to the consumer, Layer 0 is more canonical for
"configuration drives behavior." Choose based on preference. 2. Update the navigation() helper in main-layout.ts to iterate over the array:
import { NAV_ITEMS } from "../../sub-atoms/elements/nav-config";

function navigation(currentPath: string): string {
const items = NAV_ITEMS.map((item) =>
navItem(item.label, item.href, item.href === "/"
? currentPath === "/"
: currentPath.startsWith(item.href))
).join("");
return `<nav class="main-nav">
      <a href="/" class="main-nav__brand">RPG CMS</a>
      <ul class="main-nav__links">${items}</ul>
    </nav>`;
} 3. Remove the hardcoded navItem calls from navigation()

Why this matters: Adding a new entity becomes a one-line addition to the NAV_ITEMS array instead of editing main-layout.ts internals. This follows the configuration-drives-behavior principle — the layout reads what to render, it
doesn't decide what to render.

Verification: bun run typecheck. Visually confirm all nav items still appear and highlight correctly.

---

Phase 3: Extract CSS into a dedicated sub-atom

Current state: main-layout.ts contains ~95 lines of CSS inside a <style> tag, covering every component in the application. This makes the layout file 149 lines long — most of it styling rather than structure.

Action items:

1. Create src/view/sub-atoms/elements/styles.ts
   - Export a single function: globalStyles(): string
   - Move the entire <style>...</style> block (lines 42–137 of main-layout.ts) into this function
   - Single responsibility: return the application's CSS as an HTML style tag string

2. Update main-layout.ts to import and call globalStyles():
import { globalStyles } from "../../sub-atoms/elements/styles";
// ...
<head>
  ...
  ${globalStyles()}
</head>
3. Remove the inline <style> block from mainLayout

Why a function, not a constant: A function allows future parameterization (e.g., theme variables, dark mode toggle) without changing the call site. For now it returns a static string, but the function signature leaves the door open.

Future consideration: If a CSS build system is ever added (external .css file, CSS modules), this sub-atom becomes the single point of change — replace the inline <style> with a <link> tag. All of main-layout.ts stays untouched.

Verification: bun run typecheck. Visually confirm all pages render identically.

---

Phase 4 (Low Priority): Split input.ts into element-specific sub-atoms

Current state: src/view/sub-atoms/elements/input.ts handles four HTML element types (textarea, checkbox, select, generic <input>) via branching logic. Each branch is 1–5 lines.

Action items:

Recommendation: Defer. The current function is 20 lines total. Splitting into four sub-atoms (render-textarea.ts, render-checkbox.ts, render-select.ts, render-input.ts) plus a dispatcher would create 5 files for 20 lines of code. The
overhead exceeds the benefit at current complexity.

Trigger to revisit: When any branch exceeds ~8 lines, or when a new input type is added (e.g., <input type="date">, <input type="color">, radio buttons). At that point, the dispatcher pattern becomes worthwhile.

---

Phase 5 (Low Priority): Fix the entities/index.ts barrel

Current state: src/view/entities/index.ts only re-exports from game-domain. Same pattern as Layers 3 and 4.

Action items:

Update to re-export all four:
export _ from "./game-domain";
export _ from "./game-subdomain";
export _ from "./game-category";
export _ from "./game-subcategory";

Note: Since all four entity barrels re-export the same five generic page functions (listPage, detailPage, etc.), re-exporting all four from a single barrel would cause name collisions. This barrel pattern doesn't work for Layer 5
entities the way it does in other layers — each entity re-exports the same function names.

Revised recommendation: Either remove entities/index.ts entirely (callers already import from entity-specific paths like @view/entities/game-domain), or keep it exporting only GameDomain as a historical first-entity reference. The
barrel is fundamentally incompatible with the re-export pattern used by entity view barrels.

Severity: Low. The barrel is vestigial and harmless.

---

Phase 6 (Low Priority): Extract EntityCardData and home page helpers

Current state: home-page.ts exports the EntityCardData interface (imported by src/index.ts) and contains two private helpers (entityCard, layerRow).

Action items:

Recommendation: Defer. The home page is a one-off organism with no reuse. The EntityCardData interface is consumed by exactly one caller (src/index.ts). Extracting it into view-service/types/ would be technically cleaner but adds a
file for a single-use type. The private helpers are home-page-specific markup that wouldn't be reused.

Trigger to revisit: If other pages start rendering entity cards (e.g., a dashboard, a search results page), then entityCard should become a shared atom.

---

Execution Order

┌──────┬───────────────────────────────────────┬──────────┬────────────────────────────────────────────────┐
│ Step │ Phase │ Priority │ Risk │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 1 │ Phase 1: Extract delete form sub-atom │ Low │ None — small extraction, two call sites │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 2 │ Phase 2: Config-driven navigation │ Medium │ Low — array iteration replaces hardcoded calls │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 3 │ Phase 3: Extract CSS into sub-atom │ Medium │ None — move-only, no logic change │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 4 │ Phase 4: Split input.ts │ Low │ Deferred │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 5 │ Phase 5: Fix barrel │ Low │ Revise or remove — name collision issue │
├──────┼───────────────────────────────────────┼──────────┼────────────────────────────────────────────────┤
│ 6 │ Phase 6: Home page helpers │ Low │ Deferred │
└──────┴───────────────────────────────────────┴──────────┴────────────────────────────────────────────────┘

Phases 1–3 are independent and can be done in any order. Phase 2 has the highest long-term value — it eliminates a manual step when adding new entities. Phase 3 makes main-layout.ts dramatically shorter and more readable.

Cross-layer coordination: Phase 2 (nav config) pairs well with Layer 0 if you choose to put the nav items there. If the Layer 0 refactoring plan includes adding a navigation registry, that would be the canonical home for NAV_ITEMS.

---

Copy this plan down, then say continue and I'll proceed with the Layer 6 (Browser) audit — the final layer.

Layer 6 — Browser: Refactoring Plan

--- Phase 1: Extract escapeText into a shared sub-atom
Current state: modal.ts (line 99–103) and validation-errors.ts (line 106–110) both define an identical escapeText function that uses DOM API to escape HTML. This is the browser equivalent of Layer 5's escapeHtml.

Action items:

1. Create src/browser/sub-atoms/utilities/escape-text.ts


    - Move the escapeText function into this file
    - Export as named export
    - Single responsibility: escape a string for safe HTML insertion using DOM API

2. Update src/browser/sub-atoms/utilities/index.ts barrel to export escapeText
3. Update src/browser/molecules/ui/modal.ts:


    - Import escapeText from ../../sub-atoms/utilities
    - Remove the local escapeText function (lines 98–103)

4. Update src/browser/molecules/ui/validation-errors.ts:


    - Import escapeText from ../../sub-atoms/utilities
    - Remove the local escapeText function (lines 105–110)

Verification: bun run typecheck and rebuild browser bundle. Confirm modal and validation error display still escape content correctly.

---

Phase 2: Fix cascade-dropdown-handler.ts to use fetchJson

Current state: cascade-dropdown-handler.ts line 48 calls fetch(url) directly instead of using the fetchJson sub-atom. Every other API call in Layer 6 goes through fetchJson.

Action items:

1. Update src/browser/atoms/handlers/cascade-dropdown-handler.ts:


    - Import fetchJson from ../../sub-atoms/utilities
    - Replace the raw fetch + manual JSON parsing (lines 48–56) with:
    interface CascadeResponse {
    readonly success: boolean;
    readonly data: Record<string, unknown>[];

}
const result = await fetchJson<CascadeResponse>(url);
if (!result.success || !Array.isArray(result.data)) return; - The catch block (line 64) still works — fetchJson throws on error, same as the current manual error handling - Remove the if (!response.ok) return; guard — fetchJson handles this by throwing

Verification: Rebuild browser bundle. Test cascading dropdowns on GameCategory and GameSubcategory create/edit forms.

---

Phase 3: Extract buildFieldValidator and validateAllFields from form-controller.ts

Current state: form-controller.ts bundles a validator factory (buildFieldValidator, lines 53–89) and a form-level validator (validateAllFields, lines 94–113) inside the organism. These are atom-level and molecule-level logic
respectively.

Action items:

1. Create src/browser/atoms/validation/build-field-validator.ts


    - Move buildFieldValidator into this file
    - Import validation sub-atoms (validateRequired, validateStringLength, validateIntegerRange, validatePattern)
    - Accept BrowserFieldConfig as parameter (import the type)
    - Return a FieldValidator function
    - Single responsibility: compose validation sub-atoms into a single field validator based on config

2. Create src/browser/molecules/validation/validate-all-fields.ts


    - Move validateAllFields into this file
    - Import buildFieldValidator from the atom
    - Import displayFieldError from the UI molecules
    - Accept (form: HTMLFormElement, fields: readonly BrowserFieldConfig[]) and return string[]
    - Single responsibility: run validation across all form fields and collect errors

3. Create barrel files:


    - src/browser/atoms/validation/index.ts
    - src/browser/molecules/validation/index.ts

4. Update src/browser/atoms/index.ts to re-export from ./validation
5. Update src/browser/molecules/index.ts to re-export from ./validation
6. Update form-controller.ts:


    - Remove buildFieldValidator and validateAllFields functions
    - Import buildFieldValidator from ../../atoms/validation
    - Import validateAllFields from ../../molecules/validation
    - The organism now purely orchestrates: find form → wire per-field handlers → wire submit handler

Verification: bun run typecheck. Rebuild browser bundle. Test form validation on all create/edit pages.

---

Phase 4: Refactor main.ts into a data-driven router

Current state: main.ts is a 416-line init() function with hardcoded if/else chains for every entity route. Each entity repeats the same pattern for 6 routes with minor variations (URL prefix, success message, cascade dropdowns).

Action items:

This is the largest refactoring in the entire audit. Break it into sub-steps:

Step 4a: Define a route configuration type

1. Create src/browser/sub-atoms/routing/route-config.ts


    - Define an EntityRouteConfig interface:
    export interface EntityRouteConfig {
    readonly basePath: string;           // e.g. "/game-domains"
    readonly apiBasePath: string;        // e.g. "/api/game-domains"
    readonly entityLabel: string;        // e.g. "Game Domain"
    readonly checkNameUrl?: string;      // e.g. "/api/game-domains/check-name"
    readonly cascades?: CascadeDropdownOptions[];  // cascade dropdown configs (empty for GameDomain)

} - Single responsibility: define the shape of entity route configuration 2. Create src/browser/sub-atoms/routing/index.ts barrel

Step 4b: Create an entity route initializer atom

1. Create src/browser/atoms/routing/init-entity-routes.ts


    - Single function: initEntityRoutes(config: EntityRouteConfig, fieldConfig: readonly BrowserFieldConfig[])
    - Contains the path-matching logic for one entity (new, duplicate, edit, detail, list)
    - Calls the appropriate controller (initFormController, initListController, initDetailController)
    - Wires name availability and cascade dropdowns based on config
    - Returns boolean (true if a route matched, false if not)
    - Single responsibility: initialize browser controllers for one entity based on config and URL

2. Create src/browser/atoms/routing/index.ts barrel

Step 4c: Define entity route configs

1. Create src/browser/sub-atoms/routing/entity-routes.ts


    - Export an array of EntityRouteConfig objects — one per entity:
    export const ENTITY_ROUTES: readonly EntityRouteConfig[] = [
    {
      basePath: "/game-domains",
      apiBasePath: "/api/game-domains",
      entityLabel: "Game Domain",
      checkNameUrl: "/api/game-domains/check-name",
    },
    {
      basePath: "/game-subdomains",
      apiBasePath: "/api/game-subdomains",
      entityLabel: "Game Subdomain",
    },
    {
      basePath: "/game-categories",
      apiBasePath: "/api/game-categories",
      entityLabel: "Game Category",
      cascades: [/* domain→subdomain config */],
    },
    {
      basePath: "/game-subcategories",
      apiBasePath: "/api/game-subcategories",
      entityLabel: "Game Subcategory",
      cascades: [/* domain→subdomain, subdomain→category configs */],
    },

]; - Single responsibility: list all entity route configurations

Step 4d: Rewrite main.ts as a thin loop

1. Replace the 416-line init() body with:
   function init(): void {
   const flash = consumeFlashMessage();
   if (flash) showToast(flash.message, flash.type);


    const fieldConfig = readFieldConfig();

    for (const config of ENTITY_ROUTES) {
      if (initEntityRoutes(config, fieldConfig)) return;
    }

} 2. main.ts shrinks from ~416 lines to ~20 lines

Cascade handling detail: The cascade dropdown configs for GameCategory and GameSubcategory are already expressed as CascadeDropdownOptions objects in the current main.ts (lines 214–222, 306–324). These move directly into the
EntityRouteConfig.cascades array. The downstream ripple reset (domain change clears category dropdown) is handled by the initEntityRoutes atom based on the cascade chain length.

Name availability handling detail: GameDomain uses check-name without a scope field. GameSubdomain/Category/Subcategory don't currently use browser-side name availability. The checkNameUrl config field is optional — only entities that
need it provide a URL.

Verification: Rebuild browser bundle. Test all entity pages end-to-end: list, detail, create, edit, duplicate. Test cascade dropdowns on category and subcategory forms. Test name availability on domain create/edit/duplicate.

---

Phase 5 (Low Priority): Extract injectStylesOnce sub-atom

Current state: Four molecules (toast.ts, modal.ts, loading.ts, validation-errors.ts) each contain an identical pattern:
let stylesInjected = false;
function injectStyles(): void {
if (stylesInjected) return;
const style = document.createElement("style");
style.textContent = CSS_STRING;
document.head.appendChild(style);
stylesInjected = true;
}

Action items:

1. Create src/browser/sub-atoms/utilities/inject-styles.ts


    - Single function: injectStylesOnce(id: string, css: string): void
    - Uses the id as a data attribute to track whether styles are already injected (avoids per-module boolean flags)
    - Checks for document.querySelector(\style[data-id="${id}"]`)` before injecting
    - Single responsibility: inject a CSS string into the document head exactly once

2. Update all four molecules to use injectStylesOnce:
   import { injectStylesOnce } from "../../sub-atoms/utilities";
   // Replace injectStyles() calls with:
   injectStylesOnce("toast", TOAST_STYLES);
3. Remove the local stylesInjected flags and injectStyles functions from all four molecules

Verification: Rebuild browser bundle. Confirm all UI components still render their styles correctly.

---

Phase 6 (Low Priority): Decompose name-availability-handler.ts

Current state: The handler bundles value extraction, mode-specific short-circuit logic, URL building, API fetching, button state management, and error display in one 93-line function.

Action items:

Recommendation: Defer. The function is long but linear — no branching spaghetti. Each section is clearly commented. The mode logic (duplicate vs edit) is specific to name availability and unlikely to be reused. Extracting sub-atoms
would create 3–4 files consumed by only this one handler.

Trigger to revisit: If other fields need availability checking (e.g., unique codes, slugs), then the check-availability pattern should be generalized. At that point, extract:

- buildAvailabilityUrl(baseUrl, name, excludeId?) — URL builder sub-atom
- updateButtonState(button, available, errorDisplay) — UI state sub-atom
- The mode short-circuit logic stays in the handler (it's handler-specific behavior)

---

Phase 7 (Low Priority): Move BrowserFieldConfig to Layer 0

Cross-reference: This is the same issue identified in Layer 4 Phase 2. The type is defined in form-controller.ts (Layer 6) and build-browser-field-config.ts (Layer 4).

Action items: See Layer 4 refactoring plan, Phase 2. Once the type is in Layer 0 (src/config/types/browser-field-config.ts), update:

- form-controller.ts to import BrowserFieldConfig from @config/types
- Remove the local interface definition (lines 28–38)

Note on browser bundle: The browser bundle is built by Bun from src/browser/main.ts. The @config path alias must resolve correctly for the browser build. If the browser bundle uses a separate tsconfig that doesn't include @config, this
import will fail. Verify the build configuration first.

Alternative if path alias doesn't work: Use a relative import path from the browser directory to src/config/types/. This crosses the layer boundary in the import path but not in the dependency direction (Layer 6 depending on Layer 0 is
correct).

---

Execution Order

┌──────┬────────────────────────────────────┬──────────┬───────────────────────────────────────────────────────────────────┐
│ Step │ Phase │ Priority │ Risk │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 1 │ Phase 1: Extract escapeText │ Medium │ None — trivial extraction │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 2 │ Phase 2: Fix cascade fetch │ Medium │ Low — one import + call change │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 3 │ Phase 3: Extract validator factory │ Medium │ Low — move functions to proper layers │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 4 │ Phase 4: Data-driven main.ts │ High │ High — complete rewrite of entry point, requires thorough testing │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 5 │ Phase 5: Extract injectStylesOnce │ Low │ None — mechanical replacement │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 6 │ Phase 6: Decompose name handler │ Low │ Deferred │
├──────┼────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────────────┤
│ 7 │ Phase 7: Move BrowserFieldConfig │ Medium │ Coordinate with Layer 4 Phase 2 │
└──────┴────────────────────────────────────┴──────────┴───────────────────────────────────────────────────────────────────┘

Phases 1–3 are independent and can be done in any order. Phase 4 is the single highest-impact change in the entire codebase audit — it transforms a 416-line hardcoded router into a ~20-line data-driven loop. It's also the riskiest
because it touches every entity's browser initialization. Phase 7 should be done together with Layer 4 Phase 2 as a single cross-layer task.

---

That completes the full seven-layer atomic design audit and refactoring plan. Here's a summary of what was covered:

┌───────────────────┬───────────────┬───────────────────────────────────────────────────┬─────────────────┐
│ Layer │ Files Audited │ Findings │ High Priority │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 0 — Config │ 33 │ Reference field duplication │ 1 │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 1 — Model │ 35 │ build-query.ts bundles 6 queries │ 1 │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 2 — Model Service │ 23 │ Uniqueness logic duplicated 8× │ 1 │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 3 — Controller │ 39 │ Inline check-name + option-fetching duplication │ 2 │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 4 — View Service │ 29 │ Growing parameter lists, BrowserField duplication │ 0 (all Medium) │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 5 — View │ 34 │ CSS/nav hardcoded in layout │ 0 (all Medium) │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ 6 — Browser │ 32 │ main.ts 416-line hardcoded router │ 1 │
├───────────────────┼───────────────┼───────────────────────────────────────────────────┼─────────────────┤
│ Total │ 225 │ ~35 findings │ 6 high-priority │
└───────────────────┴───────────────┴───────────────────────────────────────────────────┴─────────────────┘

The six high-priority items to tackle first:

1. Layer 0: Extract shared reference field constants
2. Layer 1: Split build-query.ts into individual query atoms
3. Layer 2: Extract uniqueness check into a reusable atom
4. Layer 3: Extract check-name handler + option-fetching sub-atoms
5. Layer 3: Extract setHtml, reference lookup builders
6. Layer 6: Rewrite main.ts as data-driven router
