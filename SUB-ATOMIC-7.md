SUB-ATOMIC-7
Content Management System
Complete Rebuild Specification for Claude Code

Architecture: Atomic Design · Database: PostgreSQL · Runtime: Bun + ElysiaJS
TypeScript · Strict Mode · Seven-Layer Architecture

How to read this document
This specification is written for Claude Code operating in Plan Mode with subagents. Every section is self-contained and independently executable. Read the Philosophy section first — it contains the reasoning behind every decision in this document. Without understanding the philosophy, the individual decisions appear arbitrary. With it, every decision becomes inevitable.

Part I — Architecture Philosophy
Everything in this document flows from one central insight discovered through design iteration: the CMS is not a collection of models that store game data. It is a hierarchy system with a modifier engine at its centre, and everything else — items, enemies, zones, dice, spells — are domain-specific expressions of that same engine.
Read this section before touching any code. The decisions documented here are not arbitrary — they are the result of reasoning through the long-term implications of each alternative. Changing them without understanding the reasoning will produce a system that works today and breaks in a year.

The Central Principle: Hierarchy IS the Business Logic
The hierarchy (Domain → Subdomain → Category → Subcategory) is not an organisational convenience. It is the system that determines what modifiers can roll on what entities. A modifier's position in the hierarchy implicitly defines its modifier pool context. This means game design decisions — which stats appear on which items — are expressed as configuration, not code.
⬡ Architecture Principle
When a content operator places a modifier under Items → Bases → Armour → Strength Body Armour, they are not tagging it for organisation. They are making a game design decision about where that stat lives in the world. The hierarchy IS the decision.

The Modifier as the Atomic Unit of Game Behaviour
Every stat change in the game — on an item, on an enemy, in a zone, on a die — is expressed as a modifier. This is not a simplification. It is a unifying principle that means the modifier model must be the most carefully designed entity in the system. Everything else delegates to it.
A modifier has two distinct responsibilities that must never be conflated:
⦁ Identity: what the modifier IS — its name, its type, its global tier definitions, its calculation method. These are stable and rarely change.
⦁ Relationships: where the modifier LIVES — its bindings to categories and subcategories, their weights and overrides. These evolve constantly as the game is balanced.
⬡ Architecture Principle
The single most important architectural decision in this system is keeping identity and relationships on separate screens in the modifier view — not because it looks clean, but because they change at different rates and for different reasons. Conflating them produces a model that is constantly being edited for the wrong reasons.

The ModifierBinding as the First-Class Entity
In most CMS systems, the relationship between a modifier and a subcategory is a junction table — two foreign keys, ignored by the application layer. In this system it is a first-class entity with its own UUID, its own lifecycle, and its own CMS screen.
The ModifierBinding is where game design decisions live. Not on the modifier. Not on the subcategory. On the relationship between them. It stores: is this modifier eligible on this subcategory (true/false), what weight should it roll at relative to its global weight, which tiers are eligible, and what level requirement governs those tiers in this specific context.
⬡ Architecture Principle
The ModifierBinding is the most powerful entity in the system. It is the mechanism by which hierarchy inheritance is expressed as explicit, queryable, auditable data. When the game engine calls the loot API after a monster kill, it reads ModifierBindings — not modifier definitions, not subcategory definitions. The binding IS the loot pool.

The Hybrid Inheritance Model
The system uses a hybrid inheritance model for modifier pools. This means:
⦁ Category-level modifiers are inherited by default by all subcategories beneath them. A modifier placed under Armour category is eligible on all armour subcategories.
⦁ Subcategories can extend — add modifiers that only apply to them and not their sibling subcategories.
⦁ Subcategories can exclude — explicitly opt out of inherited modifiers from their parent category.
⦁ Weight overrides — a subcategory can inherit a modifier but roll it at a different probability weight than the global default.
This inheritance is NOT resolved at runtime by the game engine. It is resolved at content-creation time in the CMS and stored as explicit ModifierBinding records. The game engine reads flat binding records — it never traverses the hierarchy. A cache system let's call it!
⚠ Critical Constraint
The game engine (API layer) must NEVER perform hierarchy traversal to resolve modifier pools. Pools must be pre-resolved into ModifierBinding records by the CMS. This is the performance contract the entire API design depends on.

Domain-Driven Entity Models
Every game entity type — Items, Enemies, Zones, Dice, Gems, Spells — is a domain-specific expression of the same base pattern. They share a common scaffold (name, code, description, hierarchy coupling, lifecycle) but load domain-specific field definitions based on their domain assignment.
This means adding a new entity type (e.g. Mounts in a future domain) requires: creating the domain configuration, defining the domain-specific fields in Layer 0 config, and the entity model loads those fields automatically. No new model, no new controller, no new view — just new configuration.
⬡ Architecture Principle
Entity models are configuration-driven, not code-driven. The goal is that a content designer with no programming knowledge can define a new entity type by writing Layer 0 configuration. The system adapts. This is the long-term entropy resistance strategy — complexity lives in config, not in code.

Part II — Database Schema (Clean Rebuild)
⚠ Critical Constraint
This is a clean rebuild. The existing migration files are superseded entirely. Create a new migration file (e.g. 001_rebuild_schema.sql) that drops and recreates all tables from scratch. Do not patch existing tables.

2.1 Core Hierarchy Tables
These five tables form the organisational skeleton of the entire system. Their structure is intentionally minimal — they exist to provide context, not to carry logic.

-- Game Domains: top-level isolation boundaries
CREATE TABLE game_domains (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
code VARCHAR(100) NOT NULL UNIQUE,
name VARCHAR(200) NOT NULL UNIQUE,
description TEXT,
sort_order INTEGER NOT NULL DEFAULT 1000,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game Subdomains: thematic groupings within a domain
CREATE TABLE game_subdomains (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
domain_id UUID NOT NULL REFERENCES game_domains(id) ON DELETE RESTRICT,
code VARCHAR(100) NOT NULL,
name VARCHAR(200) NOT NULL,
description TEXT,
sort_order INTEGER NOT NULL DEFAULT 1000,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_subdomain_code UNIQUE (domain_id, code),
CONSTRAINT uq_subdomain_name UNIQUE (domain_id, name)
);

-- Game Categories: functional classification within a subdomain
CREATE TABLE game_categories (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
domain_id UUID NOT NULL REFERENCES game_domains(id) ON DELETE RESTRICT,
subdomain_id UUID NOT NULL REFERENCES game_subdomains(id) ON DELETE RESTRICT,
code VARCHAR(100) NOT NULL,
name VARCHAR(200) NOT NULL,
description TEXT,
sort_order INTEGER NOT NULL DEFAULT 1000,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_category_code UNIQUE (subdomain_id, code),
CONSTRAINT uq_category_name UNIQUE (subdomain_id, name)
);

-- Game Subcategories: most granular classification, direct modifier context
CREATE TABLE game_subcategories (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
domain_id UUID NOT NULL REFERENCES game_domains(id) ON DELETE RESTRICT,
subdomain_id UUID NOT NULL REFERENCES game_subdomains(id) ON DELETE RESTRICT,
category_id UUID NOT NULL REFERENCES game_categories(id) ON DELETE RESTRICT,
code VARCHAR(100) NOT NULL,
name VARCHAR(200) NOT NULL,
description TEXT,
sort_order INTEGER NOT NULL DEFAULT 1000,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_subcategory_code UNIQUE (category_id, code),
CONSTRAINT uq_subcategory_name UNIQUE (category_id, name)
);

2.2 Modifier Tables
-- Modifiers: the central entity of the entire CMS
CREATE TABLE modifiers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
-- Identity
code VARCHAR(100) NOT NULL,
name VARCHAR(200) NOT NULL,
description TEXT,
-- Hard-coupled hierarchy (all four FKs, always denormalized)
domain_id UUID NOT NULL REFERENCES game_domains(id) ON DELETE RESTRICT,
subdomain_id UUID NOT NULL REFERENCES game_subdomains(id) ON DELETE RESTRICT,
category_id UUID NOT NULL REFERENCES game_categories(id) ON DELETE RESTRICT,
subcategory_id UUID NOT NULL REFERENCES game_subcategories(id) ON DELETE RESTRICT,
-- Dual type classification
affix_type VARCHAR(10) NOT NULL CHECK (affix_type IN ('prefix', 'suffix')),
semantic_cat VARCHAR(20) NOT NULL CHECK (
semantic_cat IN ('offensive','defensive','utility','resource')),
-- Value behaviour
value_type VARCHAR(15) NOT NULL CHECK (
value_type IN ('flat','increased','more','between')),
calc_method VARCHAR(15) NOT NULL CHECK (
calc_method IN ('additive','multiplicative')),
-- Soft delete
is_active BOOLEAN NOT NULL DEFAULT TRUE,
archived_at TIMESTAMPTZ,
archived_reason TEXT,
-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_modifier_code UNIQUE (subcategory_id, code),
CONSTRAINT uq_modifier_name UNIQUE (subcategory_id, name)
);

-- Modifier Tiers: global tier definitions owned by a modifier
CREATE TABLE modifier_tiers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
tier_index SMALLINT NOT NULL CHECK (tier_index >= 0),
min_value NUMERIC(12,4) NOT NULL,
max_value NUMERIC(12,4) NOT NULL,
level_req SMALLINT NOT NULL DEFAULT 1 CHECK (level_req >= 1),
spawn_weight INTEGER NOT NULL DEFAULT 100 CHECK (spawn_weight >= 0),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_tier_index UNIQUE (modifier_id, tier_index),
CONSTRAINT ck_value_range CHECK (max_value >= min_value)
);

2.3 ModifierBinding Table
This is the most important table in the system. It is the pre-resolved loot pool record that the game engine reads directly. It represents a single decision: this modifier is eligible (or not) on this category or subcategory, under these conditions.
CREATE TABLE modifier_bindings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
-- Target: either a category OR a subcategory (not both, not neither)
target_type VARCHAR(15) NOT NULL CHECK (
target_type IN ('category','subcategory')),
target_id UUID NOT NULL,
-- Inclusion: true = included, false = explicitly excluded
is_included BOOLEAN NOT NULL DEFAULT TRUE,
-- Weight override: NULL means use the global tier spawn_weight
weight_override INTEGER CHECK (weight_override IS NULL OR weight_override >= 0),
-- Tier range eligible in this context (NULL = all tiers)
min_tier_index SMALLINT,
max_tier_index SMALLINT,
-- Level requirement override for this context (NULL = use tier's level_req)
level_req_override SMALLINT,
-- Audit
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
-- A modifier can only have one binding per target
CONSTRAINT uq_binding UNIQUE (modifier_id, target_type, target_id)
);

-- Performance index: the game engine's primary query path
CREATE INDEX idx_bindings_target ON modifier_bindings (target_type, target_id)
WHERE is_included = TRUE AND is_active = TRUE;

CREATE INDEX idx_bindings_modifier ON modifier_bindings (modifier_id);

2.4 Base Asset Tables
Base assets are the white (unmodified) game objects. Every domain has its own entity type but they share the same scaffold. The item_bases table is the first implementation — other domains mirror it with domain-specific fields.
-- Item Bases: white item templates (Items domain only, first implementation)
CREATE TABLE item_bases (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
-- Identity
code VARCHAR(100) NOT NULL,
name VARCHAR(200) NOT NULL,
description TEXT,
-- Hard-coupled hierarchy
domain_id UUID NOT NULL REFERENCES game_domains(id) ON DELETE RESTRICT,
subdomain_id UUID NOT NULL REFERENCES game_subdomains(id) ON DELETE RESTRICT,
category_id UUID NOT NULL REFERENCES game_categories(id) ON DELETE RESTRICT,
subcategory_id UUID NOT NULL REFERENCES game_subcategories(id) ON DELETE RESTRICT,
-- Item-specific fields (domain-specific, loaded by config)
item_level SMALLINT NOT NULL DEFAULT 1 CHECK (item_level >= 1),
strength_req SMALLINT,
dexterity_req SMALLINT,
intelligence_req SMALLINT,
socket_count SMALLINT NOT NULL DEFAULT 0 CHECK (socket_count >= 0 AND socket_count <= 6),
-- Soft delete + audit
is_active BOOLEAN NOT NULL DEFAULT TRUE,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_item_base_code UNIQUE (subcategory_id, code),
CONSTRAINT uq_item_base_name UNIQUE (subcategory_id, name)
);

-- Implicit modifier assignments: which modifiers are implicit on which item bases
CREATE TABLE item_base_implicits (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
item_base_id UUID NOT NULL REFERENCES item_bases(id) ON DELETE CASCADE,
modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE RESTRICT,
-- Which tier appears at which item level (tier_index from modifier_tiers)
tier_index SMALLINT NOT NULL,
-- Audit
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT uq_implicit UNIQUE (item_base_id, modifier_id)
);

Part III — Modifier Model: Four-Screen Specification
The modifier view is composed of four screens (tabs). Each screen is an independent concern. Each screen maps to a distinct set of database operations. Build them in order — Screen 1 is the prerequisite for all others.
⬡ Architecture Principle
The four-screen structure reflects the separation between modifier identity (Screen 1), modifier relationships (Screen 2), modifier application (Screen 3), and modifier history (Screen 4, deferred). These concerns change at different rates and for different reasons. Their separation is not cosmetic — it is architectural.

Screen 1 — Definition & Global Tiers
◎ Scope
Creates or edits the modifier's identity: its position in the hierarchy, its classification, its value behaviour, and its global tier definitions. This is the source of truth for what the modifier IS.

Section A: Hierarchy Selection
Four cascading dropdowns that resolve the modifier's position in the hierarchy. Each dropdown is populated by querying active records from its respective table filtered by the selection above it.
Field Source Table Behaviour
Game Domain game_domains Loads all active domains on page open. Selection triggers subdomain load.
Game Subdomain game_subdomains Filtered by domain_id. Disabled until domain selected.
Game Category game_categories Filtered by subdomain_id. Disabled until subdomain selected.
Game Subcategory game_subcategories Filtered by category_id. Disabled until category selected.
On create: all four dropdowns are editable. On update: all four are locked and displayed as read-only text. To relocate a modifier, use Duplicate and archive the original.

Section B: Modifier Identity Fields
Field Type Required Validation
name text input Yes 2-200 chars, unique within subcategory
code text input Yes 3-100 chars, lowercase alphanumeric + underscore, unique within subcategory
description textarea No Max 1000 chars
affix_type select: prefix | suffix Yes Must be one of the two options
semantic_cat select: offensive | defensive | utility | resource Yes Must be one of the four options
value_type select: flat | increased | more | between Yes Determines how value range is interpreted
calc_method select: additive | multiplicative Yes Determines how modifier stacks with others

Section C: Global Tier Definitions
A dynamic table where each row is one tier. Tiers are always managed inline — never on a separate screen. The tier_index column is auto-managed (read-only in the UI, maintained by the form).
Column Type Required Rules
Tier Index auto-integer (read-only) Auto 0-based, gapless, auto-assigned
Min Value numeric Yes Any numeric value
Max Value numeric Yes Must be >= min_value
Level Req integer Yes >=1, must be strictly greater than previous tier
Spawn Weight integer Yes >=0, default 100, must be <= previous tier's weight
⦁ 'Add Tier' button appends row with tier_index auto-set, weight defaulting to 100, level_req defaulting to 1.
⦁ 'Remove' button removes row and re-indexes remaining rows 0-based from top.
⦁ Minimum one tier required to save.
⦁ Persistence strategy: on every save, DELETE all tiers for this modifier then batch INSERT the submitted set. Single transaction.

Screen 1 Save Behaviour
⦁ Save button at bottom of screen. Saves modifier identity + full tier set atomically.
⦁ On create: INSERT modifier, then batch INSERT tiers. Both or neither.
⦁ On update: UPDATE modifier fields, then DELETE+INSERT tiers. Single transaction.
⦁ On success: reload Screen 1 with saved data. Flash success message.

Screen 2 — Category & Subcategory Bindings
◎ Scope
Manages the ModifierBinding records that define where this modifier is eligible in the game world. This is the relationship screen — it defines the modifier's connections to the hierarchy, not the modifier itself.
This screen is only accessible after Screen 1 has been saved (modifier must exist before bindings can be created).

Screen 2 Layout
The screen is divided into two panels: Category Bindings (left) and Subcategory Bindings (right). Each panel is an independent table of binding records for this modifier.

Binding Record Display
Each panel shows a table of all existing bindings for this modifier at that level:
Column Source Description
Target Name JOIN to categories / subcategories Human-readable name of the bound entity
Included modifier_bindings.is_included Toggle: true (included) / false (excluded). Green/red visual indicator.
Weight Override modifier_bindings.weight_override NULL displays as 'Global default'. Integer shows override value.
Min Tier modifier_bindings.min_tier_index NULL displays as 'All tiers'. Otherwise shows tier index.
Max Tier modifier_bindings.max_tier_index NULL displays as 'All tiers'. Otherwise shows tier index.
Level Req Override modifier_bindings.level_req_override NULL displays as 'Per tier default'. Integer shows override.
Actions — Edit and Remove buttons per row.

Adding a Binding
An 'Add Binding' button above each panel opens an inline form row or modal with:
⦁ Target selector: searchable dropdown of all active categories (or subcategories) in the hierarchy.
⦁ is_included toggle: default true (included).
⦁ weight_override: number input, placeholder 'Leave empty for global default'.
⦁ min_tier_index / max_tier_index: number inputs, placeholder 'Leave empty for all tiers'.
⦁ level_req_override: number input, placeholder 'Leave empty for per-tier default'.
⦁ Save inserts a new modifier_bindings record.
⚠ Critical Constraint
A modifier can only have one binding per target. If the operator attempts to add a binding for a target that already has one, the system must reject it with a clear error: 'This modifier already has a binding for [Target Name]. Edit the existing binding instead.'

Inherited Bindings Display
Below the explicit bindings table, a read-only section displays 'Inherited from Category' — subcategories that will inherit this modifier's eligibility from a category-level binding. These are informational only. Operators who want to override inheritance for a specific subcategory add an explicit subcategory binding.

Screen 3 — Entity Assignment
◎ Scope
Displays and manages which base assets (items, enemies, etc.) use this modifier as an implicit modifier. This screen is domain-driven — it loads different content based on the modifier's domain.

Domain-Driven Tab Loading
The screen renders tabs dynamically based on the modifier's domain_id. Each tab corresponds to the entity type of that domain:
Domain Tab Label Source Table Entity Type
Items Item Bases item_bases + item_base_implicits White item templates
Dice (future) Dice Bases dice_bases + dice_base_implicits Die templates
Enemies (future) Enemy Bases enemy_bases + enemy_base_implicits Enemy templates
Gems (future) Gem Bases gem_bases + gem_base_implicits Gem templates

Entity Assignment Tab Content
Each tab shows two sections: currently assigned assets, and an assignment interface.
Currently Assigned (read section)
A table of all base assets that currently use this modifier as an implicit, showing: asset name, asset level, which tier is assigned, the resulting value range at that tier.
Assign to Asset (write section)
An 'Assign Modifier' button opens a search/browse interface:
⦁ Search field filters assets by name within the modifier's domain.
⦁ Hierarchy breadcrumb navigation allows browsing: Category → Subcategory → Asset list.
⦁ Selecting an asset opens an assignment config: which tier index to assign, confirmation of resulting value range at that tier.
⦁ Save inserts a record into item_base_implicits (or equivalent for other domains).
The asset must already exist in the database. This screen does not create assets — it assigns modifiers to existing assets.

Screen 4 — History & Versioning (Deferred)
⏸ Deferred to Future Version
History and versioning is explicitly deferred until the CMS has been used in real conditions and the team understands what actually needs to be logged. Build a placeholder tab that displays 'History tracking coming in a future version.' Do not implement any logging infrastructure at this stage. When the time comes, this will become its own first-class entity in the system.

Part IV — Refactoring Sequence
The clean rebuild follows a strict sequence. Each phase must be completed and verified before the next begins. Claude Code in Plan Mode should validate each checkpoint before proceeding.
⚠ Critical Constraint
This is a clean rebuild — not a migration patch. The existing five models are being replaced entirely. Do not attempt to preserve existing controller or service logic. The new architecture is different enough that patching will produce unmaintainable hybrid code.

Phase 0 — Migration File
⚙ Subagent Task
Subagent: Database. Creates the new migration file. Independent task, no dependencies.

1. Create /migrations/001_rebuild_schema.sql
2. Drop all existing tables in reverse dependency order (Object-Items first, Game-Domains last).
3. Recreate all tables from the schema defined in Part II of this document.
4. Create all indexes defined in Part II.
5. Seed one Game-Domain record: code='items', name='Items Domain' to enable immediate testing.
6. Run migration. Verify zero errors. Verify all tables exist with correct columns.
7. Checkpoint: bun run typecheck passes. Database connects. All tables queryable.

Phase 1 — Hierarchy Models (Four models, sequential)
⚙ Subagent Task
Subagent: Hierarchy. Builds all four hierarchy models in dependency order. These are structurally identical — build the pattern once on game_domains and replicate for the rest.
Build in this order: game_domains → game_subdomains → game_categories → game_subcategories. Each must be complete (model + service + controller + routes + views) before the next begins.
Every hierarchy model must implement:
⦁ Model layer: findAll, findById, findByDomainId (for subdomains+), create, update, softDelete, restore.
⦁ Service layer: validation (required fields, uniqueness, hierarchy chain integrity), cascade archive logic.
⦁ Controller: standard CRUD routes. Server-side validation only. No client-side validation.
⦁ Views: index with hierarchy breadcrumbs, create form with cascading dropdowns, edit form, detail view.
⦁ Checkpoint: All four hierarchy models CRUD without errors. Cascading dropdowns work end to end.

Phase 2 — IMPORTANT!!! This model might be already configured like this, Make sure to check first, and if no changes are required keep the current code.
Modifier Model Screen 1 (Definition + Tiers)
⚙ Subagent Task
Subagent: Modifier-Definition. Builds Screen 1 of the modifier model. Depends on Phase 1 completion.

1. Model layer: modifiers table operations + modifier_tiers table operations.
2. Service: create (atomic: modifier + tiers), updateBasicInfo, updateTiers (delete+insert), softDelete, restore, duplicate.
3. Service validation: all rules from Section 5 of the Modifier Workflow document.
4. Controller: routes for all operations.
5. View: Screen 1 with all four sections as defined in Part III — hierarchy cascade, identity fields, tier table.
6. Tier form: dynamic add/remove rows with auto tier_index management.
7. Checkpoint: Full modifier CRUD works. Tiers create/update/delete atomically with parent. Duplicate produces independent record.

Phase 3 — Modifier Model Screen 2 (Bindings)
⚙ Subagent Task
Subagent: Modifier-Bindings. Builds Screen 2. Depends on Phase 2 completion.

1. Model layer: modifier_bindings table — create, update, delete, findByModifier, findByTarget.
2. Service: validateBinding (unique per target, valid target exists), resolveInheritedBindings (for display only).
3. View: Screen 2 with Category Bindings panel and Subcategory Bindings panel as defined in Part III.
4. Inherited bindings read-only display section.
5. Add/Edit binding inline form or modal.
6. Checkpoint: Bindings create/update/delete correctly. Uniqueness constraint enforced with clear error. Inherited display shows correct subcategories.

Phase 4 — Item Base Model
⚙ Subagent Task
Subagent: ItemBase. Builds the first domain-specific entity model. Depends on Phase 3 completion.

1. Model layer: item_bases table operations + item_base_implicits table operations.
2. Service: create, update, softDelete, assignImplicit (adds item_base_implicits record), removeImplicit.
3. View: item base form with domain-specific fields (item_level, stat requirements, socket_count) loaded from Layer 0 config.
4. Item base index and detail views.
5. Checkpoint: Item bases create/edit/archive correctly. Implicit assignment works from item base page and from modifier Screen 3.

Phase 5 — Modifier Model Screen 3 (Entity Assignment)
⚙ Subagent Task
Subagent: Modifier-EntityTab. Builds Screen 3. Depends on Phase 4 completion.

1. Screen 3 tab loads based on modifier's domain_id.
2. Items tab: queries item_base_implicits JOIN item_bases for current assignments.
3. Search/browse interface for asset assignment.
4. Tier assignment config on selection.
5. Screen 4 placeholder tab with deferred message.
6. Checkpoint: Screen 3 loads correctly for Items domain. Assignment adds item_base_implicits record. Current assignments display correctly.

Phase 6 — Layer 0 Config Integration
⚙ Subagent Task
Subagent: Config. Integrates the domain-driven config pattern from Layer 0 into the entity models.

1. Define domain entity configs in Layer 0: ItemsDomainConfig, (placeholders for future domains).
2. Each config defines: domain code, entity table name, domain-specific fields with types and labels.
3. Entity model views load field definitions from config — not hardcoded in the view.
4. Adding a new domain config should automatically enable that domain's tab in modifier Screen 3.
5. Checkpoint: Adding a placeholder DiceDomainConfig causes a Dice Bases tab to appear in Screen 3 (empty but present). No view code changes required.

Part V — Claude Code Operating Instructions
This section is written directly for Claude Code. It describes how to use this document, how to approach the rebuild, and what to do when encountering ambiguity.

5.1 How to Read This Document
⦁ Part I (Philosophy) is mandatory reading before any implementation. Every decision in Parts II-IV is explained by a principle in Part I. If a decision seems arbitrary, re-read Part I.
⦁ Part II (Database) is the ground truth for all table structures. Do not infer column types or constraints — they are all specified explicitly.
⦁ Part III (Modifier Screens) is the UI specification. Build each screen exactly as described before adding enhancements.
⦁ Part IV (Sequence) is the implementation order. Do not skip phases. Do not begin a phase before its prerequisites are checkpointed.

5.2 When You Encounter Ambiguity
This document is detailed but not exhaustive. When you encounter a decision not covered here, apply these principles in order:

1. Does the decision affect the database schema? If yes, stop and ask the operator before proceeding. Schema changes are expensive to undo.
2. Does it affect the Layer 0 config pattern? If yes, stop and ask. Config patterns affect every subsequent entity.
3. Can it be decided by the philosophy in Part I? If yes, apply the relevant principle and document your reasoning in a code comment.
4. If none of the above apply, choose the simplest implementation and add a TODO comment explaining what was assumed and why.

5.3 Technology Constraints
Concern Decision Rationale
Validation Server-side only (service layer). No client-side validation. Single source of truth. No duplication of logic.
HTML Rendering TypeScript tagged template literals. No templating engine. Consistent with existing Layer 5 architecture.
HTTP Routing ElysiaJS. All routes registered through ElysiaJS. Existing framework. Do not introduce Express.
Database PostgreSQL via existing DB connection layer. Do not change the connection pattern.
Transactions Any operation that touches two or more tables must use a transaction. Atomicity is non-negotiable for data integrity.
UUIDs gen_random_uuid() at DB level. Never generate UUIDs in application code. Consistent, collision-resistant, DB-native.

5.4 The Modifier is Central — Protect Its Integrity
⬡ Architecture Principle
If you find yourself writing logic in a controller or view that makes game design decisions — deciding which modifiers are eligible, resolving inheritance, calculating loot probabilities — stop. That logic belongs in the modifier_bindings table and the service that reads it. The API layer reads pre-resolved data. It does not make decisions.

5.5 Subagent Coordination
When operating with multiple subagents, assign by phase as specified in Part IV. Each subagent operates independently within its phase. Cross-phase dependencies are explicit — a subagent must not begin work that depends on an incomplete checkpoint from a previous phase.
Communication between subagents happens through the database and the Layer 0 config files — not through shared application state. If subagent A needs a table that subagent B is building, A waits for B's checkpoint before reading that table.

5.6 Definition of Done for Each Phase
⦁ All specified tables exist with correct columns, types, and constraints.
⦁ bun run typecheck passes with zero errors.
⦁ All CRUD operations work end to end for the models in that phase.
⦁ Server-side validation rejects invalid input with clear error messages.
⦁ Soft delete and restore work correctly.
⦁ No hardcoded game logic in controllers or views.

Part VI — Quick Reference

Entity Relationship Summary
Entity Owned By Relationship Type Notes
game_domains — Root Top-level isolation boundary
game_subdomains game_domains FK RESTRICT Thematic grouping
game_categories game_subdomains FK RESTRICT Functional classification
game_subcategories game_categories FK RESTRICT Direct modifier context
modifiers game_subcategories FK RESTRICT (all 4) All 4 hierarchy FKs denormalized
modifier_tiers modifiers FK CASCADE Owned entirely by parent modifier
modifier_bindings modifiers + target FK CASCADE (modifier) First-class entity, not junction table
item_bases game_subcategories FK RESTRICT (all 4) First domain-specific entity
item_base_implicits item_bases + modifiers FK CASCADE (item) + RESTRICT (modifier) Implicit modifier assignments

Modifier Four-Screen Summary
Screen Name Primary Concern Status
1 Definition & Global Tiers What the modifier IS Build in Phase 2
2 Category & Subcategory Bindings Where the modifier LIVES Build in Phase 3
3 Entity Assignment What uses the modifier Build in Phase 5
4 History & Versioning How the modifier changed over time Deferred — placeholder only

Value Type Reference
value_type Meaning Example
flat Adds a fixed amount +10 to maximum life
increased Percentage increase to a base value +25% increased fire damage
more Multiplicative percentage increase +20% more attack speed
between Rolls a value within a range and adds it Adds 5 to 15 lightning damage

ModifierBinding Inheritance Rules
⦁ Category binding, is_included=true: all subcategories under that category inherit eligibility unless a subcategory-level binding explicitly excludes.
⦁ Category binding, is_included=false: modifier is blocked at category level. Individual subcategories can override with is_included=true.
⦁ Subcategory binding: always takes precedence over any category-level binding for that specific subcategory.
⦁ No binding exists: modifier is not eligible. Eligibility is always explicit — never assumed.
⦁ weight_override=NULL: use the global spawn_weight from modifier_tiers for that tier.
⦁ weight_override=0: modifier is technically included but will never roll. Useful for 'possible but disabled' states.
