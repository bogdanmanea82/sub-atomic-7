-- migrations/017_rename_item_modifier_to_modifier.sql
-- Rename item_modifier and item_modifier_tier to their universal names.
-- item_modifier_binding is NOT renamed — it remains the item-specific binding table.
--
-- PostgreSQL automatically updates FK references on other tables (item_modifier_binding,
-- item_modifier_tier, item_modifier_history) when the referenced table is renamed,
-- so no FK drop-and-recreate is needed.

-- ── Table renames ─────────────────────────────────────────────────────────

ALTER TABLE item_modifier         RENAME TO modifier;
ALTER TABLE item_modifier_tier    RENAME TO modifier_tier;
ALTER TABLE item_modifier_history RENAME TO modifier_history;

-- ── Index renames on item_modifier_binding ────────────────────────────────
-- The generic names (idx_bindings_*) become ambiguous once enemy_modifier_binding
-- is added. Rename them now while we are touching the binding infrastructure.

ALTER INDEX idx_bindings_target   RENAME TO idx_item_modifier_binding_target;
ALTER INDEX idx_bindings_modifier RENAME TO idx_item_modifier_binding_modifier;
