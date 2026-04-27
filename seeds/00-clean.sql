-- seeds/00-clean.sql
-- Deletes all seed data in reverse FK order.
-- Must clear child tables before parents (RESTRICT constraints require this).

-- modifier children (all CASCADE, but explicit for clarity)
DELETE FROM modifier_tier;
DELETE FROM item_modifier_binding;
DELETE FROM modifier_history;

-- modifier (references stat via RESTRICT)
DELETE FROM modifier;

-- item children
DELETE FROM item_stat_base;
DELETE FROM item;

-- game hierarchy (leaf → root)
DELETE FROM game_subcategory;
DELETE FROM game_category;
DELETE FROM game_subdomain;
DELETE FROM game_domain;

-- character_stat_base (references character and stat)
DELETE FROM character_stat_base;
DELETE FROM character_class;

-- formula (references stat via RESTRICT)
DELETE FROM formula;

-- stat (referenced by item_modifier, character_stat_base, formula — must be last)
DELETE FROM stat;
