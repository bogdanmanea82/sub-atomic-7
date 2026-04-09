-- Migration 002: Add sort_order to hierarchy tables, value_type + calc_method to modifier,
-- and change hierarchy FK constraints from CASCADE to RESTRICT.

-- ══════════════════════════════════════════════════════════════════════════════
-- Part A: Add sort_order to all 4 hierarchy tables
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE game_domain ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE game_subdomain ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE game_category ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE game_subcategory ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1000;

-- ══════════════════════════════════════════════════════════════════════════════
-- Part B: Add value_type and calc_method to modifier
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE modifier ADD COLUMN value_type VARCHAR(15) NOT NULL DEFAULT 'flat'
  CHECK (value_type IN ('flat','increased','more','between'));
ALTER TABLE modifier ADD COLUMN calc_method VARCHAR(15) NOT NULL DEFAULT 'additive'
  CHECK (calc_method IN ('additive','multiplicative'));

-- ══════════════════════════════════════════════════════════════════════════════
-- Part C: Change hierarchy FK constraints from CASCADE to RESTRICT
-- The modifier_tier.modifier_id FK stays CASCADE (tiers are subordinate).
-- ══════════════════════════════════════════════════════════════════════════════

-- game_subdomain: 1 FK → game_domain
ALTER TABLE game_subdomain DROP CONSTRAINT game_subdomain_game_domain_id_fkey;
ALTER TABLE game_subdomain ADD CONSTRAINT game_subdomain_game_domain_id_fkey
  FOREIGN KEY (game_domain_id) REFERENCES game_domain(id) ON DELETE RESTRICT;

-- game_category: 2 FKs → game_domain, game_subdomain
ALTER TABLE game_category DROP CONSTRAINT game_category_game_domain_id_fkey;
ALTER TABLE game_category ADD CONSTRAINT game_category_game_domain_id_fkey
  FOREIGN KEY (game_domain_id) REFERENCES game_domain(id) ON DELETE RESTRICT;

ALTER TABLE game_category DROP CONSTRAINT game_category_game_subdomain_id_fkey;
ALTER TABLE game_category ADD CONSTRAINT game_category_game_subdomain_id_fkey
  FOREIGN KEY (game_subdomain_id) REFERENCES game_subdomain(id) ON DELETE RESTRICT;

-- game_subcategory: 3 FKs → game_domain, game_subdomain, game_category
ALTER TABLE game_subcategory DROP CONSTRAINT game_subcategory_game_domain_id_fkey;
ALTER TABLE game_subcategory ADD CONSTRAINT game_subcategory_game_domain_id_fkey
  FOREIGN KEY (game_domain_id) REFERENCES game_domain(id) ON DELETE RESTRICT;

ALTER TABLE game_subcategory DROP CONSTRAINT game_subcategory_game_subdomain_id_fkey;
ALTER TABLE game_subcategory ADD CONSTRAINT game_subcategory_game_subdomain_id_fkey
  FOREIGN KEY (game_subdomain_id) REFERENCES game_subdomain(id) ON DELETE RESTRICT;

ALTER TABLE game_subcategory DROP CONSTRAINT game_subcategory_game_category_id_fkey;
ALTER TABLE game_subcategory ADD CONSTRAINT game_subcategory_game_category_id_fkey
  FOREIGN KEY (game_category_id) REFERENCES game_category(id) ON DELETE RESTRICT;

-- modifier: 4 FKs → game_domain, game_subdomain, game_category, game_subcategory
ALTER TABLE modifier DROP CONSTRAINT modifier_game_domain_id_fkey;
ALTER TABLE modifier ADD CONSTRAINT modifier_game_domain_id_fkey
  FOREIGN KEY (game_domain_id) REFERENCES game_domain(id) ON DELETE RESTRICT;

ALTER TABLE modifier DROP CONSTRAINT modifier_game_subdomain_id_fkey;
ALTER TABLE modifier ADD CONSTRAINT modifier_game_subdomain_id_fkey
  FOREIGN KEY (game_subdomain_id) REFERENCES game_subdomain(id) ON DELETE RESTRICT;

ALTER TABLE modifier DROP CONSTRAINT modifier_game_category_id_fkey;
ALTER TABLE modifier ADD CONSTRAINT modifier_game_category_id_fkey
  FOREIGN KEY (game_category_id) REFERENCES game_category(id) ON DELETE RESTRICT;

ALTER TABLE modifier DROP CONSTRAINT modifier_game_subcategory_id_fkey;
ALTER TABLE modifier ADD CONSTRAINT modifier_game_subcategory_id_fkey
  FOREIGN KEY (game_subcategory_id) REFERENCES game_subcategory(id) ON DELETE RESTRICT;
