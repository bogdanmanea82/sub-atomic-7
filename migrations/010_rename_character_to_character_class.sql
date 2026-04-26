-- migrations/010_rename_character_to_character_class.sql
-- Rename the character table to character_class.
-- "character" is reserved for future full player composition (assets + modifiers + class).
-- character_stat_base.character_id FK follows automatically (PostgreSQL renames FK targets).

ALTER TABLE "character" RENAME TO character_class;
