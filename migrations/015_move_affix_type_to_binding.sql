-- migrations/015_move_affix_type_to_binding.sql
-- Move affix_type from item_modifier to item_modifier_binding.
-- affix_type is item-specific (prefix/suffix slot semantics); it belongs on the
-- binding row, not on the universal modifier row.

-- Step 1: add the column with a temporary default so NOT NULL is satisfiable
ALTER TABLE item_modifier_binding
  ADD COLUMN affix_type TEXT NOT NULL DEFAULT 'prefix'
  CONSTRAINT item_modifier_binding_affix_type_check CHECK (affix_type IN ('prefix', 'suffix'));

-- Step 2: populate from the parent modifier row (each binding inherits the affix_type
-- of the modifier it references)
UPDATE item_modifier_binding imb
  SET affix_type = im.affix_type
  FROM item_modifier im
  WHERE imb.modifier_id = im.id;

-- Step 3: remove the default — future inserts must specify affix_type explicitly
ALTER TABLE item_modifier_binding
  ALTER COLUMN affix_type DROP DEFAULT;
