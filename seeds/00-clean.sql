-- seeds/00-clean.sql
-- Deletes all seed data in reverse FK order (RESTRICT constraints require this).

DELETE FROM modifier_tier;
DELETE FROM modifier;
DELETE FROM game_subcategory;
DELETE FROM game_category;
DELETE FROM game_subdomain;
DELETE FROM game_domain;
