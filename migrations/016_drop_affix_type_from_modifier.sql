-- migrations/016_drop_affix_type_from_modifier.sql
-- Drop affix_type from item_modifier now that it lives on item_modifier_binding.
-- All existing binding rows already carry the correct affix_type value (populated
-- by migration 015). The modifier row itself is universal — no affix semantics.

ALTER TABLE item_modifier DROP COLUMN affix_type;
