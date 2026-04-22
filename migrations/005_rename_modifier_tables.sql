-- migrations/005_rename_modifier_tables.sql
-- Rename modifier tables to item_modifier tables.
-- Modifier becomes a first-class factory; item_modifier is the first concrete type.

ALTER TABLE modifier         RENAME TO item_modifier;
ALTER TABLE modifier_tier    RENAME TO item_modifier_tier;
ALTER TABLE modifier_binding RENAME TO item_modifier_binding;
ALTER TABLE modifier_history RENAME TO item_modifier_history;
