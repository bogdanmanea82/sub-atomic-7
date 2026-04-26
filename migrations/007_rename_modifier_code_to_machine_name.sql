-- migrations/007_rename_modifier_code_to_machine_name.sql
-- Renames the `code` column to `machine_name` on item_modifier.
-- Aligns the modifier identifier field with the same convention used
-- by stat and character — all entities now use `machine_name` as their
-- stable snake_case programmatic key.

ALTER TABLE item_modifier RENAME COLUMN code TO machine_name;
