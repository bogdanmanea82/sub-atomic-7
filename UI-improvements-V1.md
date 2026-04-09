# UI Improvements V1
**Project:** RPG CMS
**Target Resolution:** 1920×1080 (16:9)
**Stack:** Bun + ElysiaJS + PostgreSQL + TypeScript (HTML template literals)
**Scope:** CSS and HTML template changes only — no routing, backend, or business logic changes.

---

## Implementation Order

Changes are ordered from foundational (global, affects all pages) to specific (per-page). Complete each phase before moving to the next.

---

## Phase 1 — Global: Layout & Navigation (All Pages)

These changes apply site-wide and should be implemented first, as all subsequent phases depend on them.

### 1.1 Full-Width Container

**Problem:** All pages use a narrow centered container, leaving 400–500px of dead space on each side at 1920px wide.

**Fix:**
- Remove any `max-width` constraint on the main content wrapper for list and detail pages.
- Set `padding: 0 24px` on the content container so content reaches close to screen edges with a small breathing margin.
- The homepage is the only exception — it may retain a wider but still generous `max-width` of `1400px` centered.

### 1.2 Navbar Height

**Problem:** The navbar is taller than necessary, consuming vertical space at 1080p height.

**Fix:**
- Reduce vertical padding on navbar items to `10px 16px`.
- Ensure the total navbar height lands around `48px–52px` rather than the current ~64px+.
- Keep all existing links and the active state highlight unchanged.

### 1.3 Global Typography

**Problem:** All-caps bold table headers are visually heavy. Column labels and field labels lack visual hierarchy relative to their values.

**Fix:**
- Switch table `<th>` headers from all-caps to sentence case.
- Set `<th>` font-weight to `600` (instead of `700` or `800`).
- Field labels in detail views: use `font-weight: 500` in a muted color (`#666` or similar) to visually distinguish them from values.
- Apply `font-family: monospace` globally to any element rendering a `code` identifier value (e.g. `flat_dexterity`).

### 1.4 Primary Action Button Style

**Problem:** "New" actions appear as plain text links, which are easy to miss and have weak affordance as a primary action.

**Fix:**
- Style all primary action buttons (New, Add, etc.) as proper `<button>` or `<a>` elements with:
  - A border or subtle fill (outline style preferred to avoid clashing with the dark navbar)
  - `padding: 6px 14px`
  - Rounded corners (`border-radius: 6px`)
- Use **icon only** (e.g. `+` or a plus SVG icon) with a `title="New [EntityName]"` attribute for hover tooltip — no text label needed.
- Secondary action icons (Edit ✏️, Delete 🗑️, View 👁) follow the same icon-only + tooltip pattern.

### 1.5 Icon-Only Action Buttons (Global Pattern)

Applies to all list pages and detail pages wherever Edit, Delete, or View actions exist.

- **View/Open:** eye icon or arrow icon → `title="View"`
- **Edit:** pencil icon → `title="Edit"`
- **Delete:** trash icon → `title="Delete"`
- Default color: muted/gray
- Hover color: blue for Edit, red for Delete
- No text labels next to icons

---

## Phase 2 — Global: Table Styles (All List Pages)

These styles apply to every list/index page across all entities (Game Domains, Subdomains, Categories, Subcategories, Modifiers).

### 2.1 Use Semantic `<table>` Elements

**Problem:** List pages may be using div-based layouts for tabular data.

**Fix:**
- Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements for all database record lists.
- Apply `border-collapse: collapse` on the table.
- Set `width: 100%` so the table fills the full content container.

### 2.2 Compact Row Height

**Problem:** Row padding is too generous (~20px), limiting visible rows to ~8 at 1080p. Should show 18–22 rows.

**Fix:**
- Set `td` and `th` padding to `8px 12px`.

### 2.3 Column Width Constraints

Use `<colgroup>` / `<col>` elements or `min-width`/`max-width` on `<th>` to prevent columns from collapsing or overflowing:

| Column | min-width | max-width | Notes |
|---|---|---|---|
| Code | 140px | 220px | Monospace font, clickable link |
| Affix Type | 80px | 100px | Short enum values |
| Semantic Category | 100px | 140px | |
| Value Type | 70px | 90px | |
| Calculation Method | 100px | 140px | |
| Name | 160px | 280px | Text wrap allowed |
| Description | 120px | — | Grows to fill remaining space |
| Active/Status | 48px | 64px | Icon/badge only |
| Actions | 80px | 100px | Icon buttons |

### 2.4 Sticky Table Header

**Fix:** Add `position: sticky; top: 0; background: <match page bg>` to `<thead>` so column headers remain visible when scrolling long lists.

### 2.5 Row Hover State

**Problem:** No visual feedback when hovering rows, making it hard to track horizontally across a wide table.

**Fix:** Add `tr:hover { background-color: rgba(0,0,0,0.035); }` (or a light tint matching the existing color scheme).

### 2.6 Active/Status Column — Badge Instead of Text

**Problem:** The word "Active" in a full-width column wastes space.

**Fix:**
- Replace with a small colored dot/circle badge:
  - 🟢 `#22c55e` filled circle = Active
  - ⚪ `#9ca3af` filled circle = Inactive/Archived
- Add `title="Active"` or `title="Inactive"` for tooltip.
- Column header: "●" or "Status", narrow fixed width.

### 2.7 Toolbar Row (Search + New Button)

**Problem:** Search bar spans full width alone; "New" action is isolated in the top-right corner.

**Fix:**
- Create a single flex toolbar row below the page title containing:
  - Left side: Search input (`max-width: 480px`) + optional filter dropdowns (if applicable per entity)
  - Right side: Primary action button (e.g. "+ New Modifier")
- Page title sits in its own row above the toolbar.

### 2.8 Empty State

**Fix:** When a search or filter returns no results, show a centered message inside the table body: _"No records found."_ — rather than an empty `<tbody>`.

### 2.9 Alternating Row Striping (Optional — Low Priority)

Add subtle `tr:nth-child(even) { background-color: rgba(0,0,0,0.02); }` for easier horizontal reading across wide tables. Only implement if the hover state alone feels insufficient.

---

## Phase 3 — List Pages: Entity-Specific Changes

### 3.1 Modifiers List Page (`/modifiers`)

#### Redundant Hierarchy Columns
**Problem:** Game Domain, Game Subdomain, Game Category, and Game Subcategory are repeated identically on every visible row — pure visual noise.

**Fix (Option A — Preferred):**
- Add filter `<select>` dropdowns above the table for Domain → Subdomain → Category → Subcategory (cascading or independent, whichever is simpler to implement).
- Remove those four columns from the table entirely. The table starts at **Code**.

**Fix (Option B — Simpler fallback):**
- Collapse the four columns into a single **"Path"** column: `Items / Jewellery / Rings` in muted text.
- Apply `max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.

#### Code Column as Clickable Link
**Fix:**
- Wrap the code value in `<a href="/modifiers/{id}">` to navigate to the detail/view page.
- Style consistently with the existing teal link color already used in the app.

#### Apply all Phase 2 table styles to this page.

---

### 3.2 Other Entity List Pages (Game Domains, Subdomains, Categories, Subcategories)

Apply all Phase 2 table styles to each of these pages. Identify the primary identifier column on each (name, code, or slug) and make it a clickable link to its detail/view page, consistent with the Modifiers pattern.

---

## Phase 4 — Detail / View Pages

These changes apply to all `/:entity/:id` view pages. Use the Modifiers view (`/modifiers/:id`) as the reference implementation, then apply the same pattern to all other entity detail pages.

### 4.1 Wider Content Card

**Problem:** The detail card is narrow, wasting horizontal space at 1920px.

**Fix:** Set card `max-width: 1100px` centered, with `margin: 0 auto` and `padding: 24px`.

### 4.2 Page Header Row (Title + Actions)

**Problem:** The "← Back" link and the title are separate from any actions. There are no Edit or Delete buttons visible on the view page.

**Fix:**
- Replace the standalone "← Back" link with a **breadcrumb**: `Modifiers / Added Dexterity`
  - "Modifiers" links back to the list page
  - The current record name is plain text (non-clickable)
- Below the breadcrumb, place a flex row with:
  - Left: Page title (e.g. "Added Dexterity") as `<h1>`
  - Right: Action icon buttons — ✏️ Edit (`title="Edit"`) and 🗑️ Delete (`title="Delete"`)

### 4.3 Two-Column Field Layout

**Problem:** A single vertical column of 17 fields is inefficient on a 1920px wide screen. Most field values are short.

**Fix:**
- Split the key-value fields into two columns using CSS grid: `grid-template-columns: 1fr 1fr`
- Each column is a label–value pair row, visually separated by a light horizontal border.
- Suggested left column: Game Domain, Game Subdomain, Game Category, Game Subcategory, Code, Affix Type, Semantic Category
- Suggested right column: Value Type, Calculation Method, Name, Description, Active, (Archived fields if present)

### 4.4 Field Label Styling

**Fix:**
- Label: `font-weight: 500`, color `#666`, `min-width: 160px`, `max-width: 180px`
- Value: default weight and color
- Code field value: `font-family: monospace`

### 4.5 Active Field — Badge

**Fix:** Replace the text value "Active" with the same colored dot badge used in the list page (green dot = Active, grey dot = Inactive). The label column already says "Active" so the value badge alone is sufficient.

### 4.6 Conditionally Hide Empty Archive Fields

**Problem:** "Archived At" and "Archived Reason" display `—` on non-archived records, adding visual clutter.

**Fix:**
- Only render Archive fields in the template if the values are non-null/non-empty.
- If the record IS archived, consider showing a yellow/orange banner at the top of the card: _"This record is archived."_

### 4.7 Demote Metadata to Footer

**Problem:** "Created" and "Updated" timestamps receive the same visual weight as gameplay-relevant fields.

**Fix:**
- Remove Created/Updated from the main field grid.
- Render them as a single muted footer line below the card:
  `Created 08 Mar 2026, 16:11  ·  Updated 08 Mar 2026, 16:11`
  in `font-size: 0.8rem; color: #999;`

### 4.8 Related Sub-Tables (e.g. Modifier Tiers)

**Problem:** The "Modifier Tiers" sub-section below the detail card has no visual separation and no action affordance.

**Fix:**
- Add a clear section heading with a horizontal divider above it.
- Apply the same Phase 2 compact table styles to the tiers table.
- Add a `+ Add Tier` icon button (icon only, `title="Add Tier"`) in the section header row, right-aligned.

---

## Phase 5 — Homepage (`/`)

The homepage is informational — it shows entity cards with record counts, an architecture layer table, and an API route reference. It is not a data management page so it should feel like a dashboard, not a list view.

### 5.1 Hero Section — Reduce Wasted Vertical Space

**Problem:** The hero card (RPG CMS title + tagline + tech stack) is very tall relative to its content. It occupies the entire top of the page for a small amount of text.

**Fix:**
- Reduce vertical padding inside the hero card significantly.
- Keep the title, subtitle, and tech stack line — but tighten the spacing so the Entities section appears sooner without scrolling.
- Consider moving the tech stack badges ("Built with Bun + ElysiaJS...") to inline styled `<code>`-like pill tags on one line rather than plain bold text.

### 5.2 Entity Cards — Improve Grid Layout

**Problem:** The 5 entity cards sit in a 3-column grid that breaks to 2 columns for the last row, leaving an awkward asymmetric layout (3 cards top row, 2 cards bottom row). All cards have the same visual weight despite entities having different importance/record counts.

**Fix:**
- Use a CSS grid with `repeat(auto-fill, minmax(280px, 1fr))` so cards distribute evenly regardless of count.
- At 1920px this will likely give 4–5 cards per row, fitting all 5 entities in a single row — cleaner and more efficient.
- Add a subtle hover state on each card (`box-shadow` lift or border color change) to reinforce that they are clickable navigation elements.
- Make the **entire card** a clickable link (`<a>` wrapping the card) to the entity's list page — not just the title.
- The record count (e.g. "394 records") should be visually prominent — consider making it larger and bolder, displayed as a stat number above or below the entity name.

### 5.3 Architecture Table — Widen and Clean Up

**Problem:** The Architecture layer table is narrower than the rest of the page content, and sits left-aligned, looking inconsistent.

**Fix:**
- Extend the table to match the full content width.
- Apply the same `<th>` styling from Phase 2 (sentence case, weight 600, subtle bottom border on thead).
- The colored numbered badges (0–6) are a nice touch — keep them.
- Remove the link styling from layer names that are not actually navigable (if any are plain text currently styled as links, normalize them).

### 5.4 API Section — Three-Column Card Layout

**Problem:** The three API cards (JSON API, HTML Pages, System) are a good structure but sit in a narrow container and don't use full width.

**Fix:**
- Extend the three cards to full content width using a `grid-template-columns: 1fr 1fr 1fr` layout.
- Ensure monospace styling on all route strings (`font-family: monospace; font-size: 0.85rem`).
- The cards currently end abruptly at the bottom of the page with no footer — add a minimal footer line (e.g. "RPG CMS · v1" in muted small text) for a polished finish.

### 5.5 General Homepage Spacing

**Problem:** Sections (Entities, Architecture, API) have inconsistent spacing and the page feels like an afterthought compared to the functionality pages.

**Fix:**
- Standardize section gap to `48px` between each major section.
- Standardize section heading (`<h2>`) style: same font size, weight, and margin across all sections.
- Ensure the homepage also benefits from the wider container (Phase 1.1), so sections align with the same left/right padding as all other pages.

---

## Summary Table — Implementation Order

| Phase | Area | Priority |
|---|---|---|
| 1 | Global layout, navbar, typography, button styles | 🔴 Do first |
| 2 | Global table styles (all list pages) | 🔴 Do first |
| 3 | Modifiers list page specifics + other entity lists | 🟠 Do second |
| 4 | Detail/view pages (all entities) | 🟠 Do second |
| 5 | Homepage improvements | 🟡 Do third |

---

## Out of Scope for This Pass

- Edit/New form pages (separate brief to follow)
- Pagination logic (follow-up task if not already implemented)
- JavaScript interactivity beyond native HTML `title` tooltips
- Any routing, controller, or database changes
- Confirmation dialogs for Delete (just render the button; wiring is backend scope)
- Dark mode

---

## Reference Screenshots

- **List page:** `/modifiers` — narrow layout, redundant columns, truncated Active column, oversized rows
- **Detail page:** `/modifiers/6ee9f653-1cff-4609-aa60-2d1dee7907ef` — single-column fields, no actions, wasted width, metadata mixed with data
- **Homepage:** `/` — oversized hero, asymmetric entity card grid, narrow architecture table
