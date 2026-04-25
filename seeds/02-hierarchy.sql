-- seeds/02-hierarchy.sql
-- Inserts the full item hierarchy: 1 domain → 3 subdomains → 9 categories → 26 subcategories.
--
-- Path A: Jewellery restructured — single "Jewellery" category with Ring / Amulet subcategories.
-- Path C: Armour subcategories renamed to slot-specific descriptive names so CMS dropdowns
--         show "Heavy Armour", "Evasion Helmet", etc. instead of repeated "Strength / Dexterity".
--
-- Armour naming pattern:
--   Str  → Heavy <slot>    (Tower Shield for Shields)
--   Dex  → Evasion <slot>  (Buckler for Shields)
--   Int  → Energy Shield <slot>  (Arcane Belt / Runic Shield for those slots)

-- ══════════════════════════════════════════════════════════════════════════════
-- Domain
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO game_domain (id, name, description, sort_order, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Items', 'All equippable item types in the game', 100, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subdomains
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO game_subdomain (id, game_domain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Weapons',   'Offensive equipment for dealing damage',         100, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Armour',    'Defensive equipment for protection',             200, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Jewellery', 'Accessory equipment for utility and stats',      300, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Categories
-- ══════════════════════════════════════════════════════════════════════════════

-- Weapons → Melee, Ranged
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   'Melee',  'Close-range weapons',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   'Ranged', 'Long-range weapons',   200, true, now(), now());

-- Armour → Body Armour, Helmets, Boots, Gloves, Belts, Shields
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Body Armour', 'Chest protection',                100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Helmets',     'Head protection',                 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Boots',       'Foot protection',                 300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Gloves',      'Hand protection',                 400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Belts',       'Waist equipment',                 500, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Shields',     'Off-hand defensive equipment',    600, true, now(), now());

-- Jewellery → single "Jewellery" category (Path A: Ring + Amulet become subcategories)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   'Jewellery', 'Rings and amulets — finger and neck accessories', 100, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subcategories
-- ══════════════════════════════════════════════════════════════════════════════

-- Melee → Sword, Axe, Mace
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Melee'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Sword', 'Balanced melee weapon',    100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Melee'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Axe',   'Heavy cleaving weapon',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Melee'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Mace',  'Blunt crushing weapon',    300, true, now(), now());

-- Ranged → Bow, Crossbow, Wand
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Ranged'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Bow',      'Dexterity-based ranged weapon',   100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Ranged'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Crossbow', 'Mechanical ranged weapon',        200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Ranged'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Wand',     'Spell-casting ranged weapon',     300, true, now(), now());

-- Body Armour → Heavy Armour (Str), Evasion Armour (Dex), Energy Shield Armour (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Body Armour'),
   'Heavy Armour',          'Strength-based chest protection',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Body Armour'),
   'Evasion Armour',        'Dexterity-based chest protection',     200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Body Armour'),
   'Energy Shield Armour',  'Intelligence-based chest protection',  300, true, now(), now());

-- Helmets → Heavy Helmet (Str), Evasion Helmet (Dex), Energy Shield Helmet (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Helmets'),
   'Heavy Helmet',          'Strength-based headgear',              100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Helmets'),
   'Evasion Helmet',        'Dexterity-based headgear',             200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Helmets'),
   'Energy Shield Helmet',  'Intelligence-based headgear',          300, true, now(), now());

-- Boots → Heavy Boots (Str), Evasion Boots (Dex), Energy Shield Boots (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Boots'),
   'Heavy Boots',           'Strength-based footwear',              100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Boots'),
   'Evasion Boots',         'Dexterity-based footwear',             200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Boots'),
   'Energy Shield Boots',   'Intelligence-based footwear',          300, true, now(), now());

-- Gloves → Heavy Gloves (Str), Evasion Gloves (Dex), Energy Shield Gloves (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Gloves'),
   'Heavy Gloves',          'Strength-based handwear',              100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Gloves'),
   'Evasion Gloves',        'Dexterity-based handwear',             200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Gloves'),
   'Energy Shield Gloves',  'Intelligence-based handwear',          300, true, now(), now());

-- Belts → Heavy Belt (Str), Evasion Belt (Dex), Arcane Belt (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Belts'),
   'Heavy Belt',    'Strength-based belt',            100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Belts'),
   'Evasion Belt',  'Dexterity-based belt',           200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Belts'),
   'Arcane Belt',   'Intelligence-based belt',        300, true, now(), now());

-- Shields → Tower Shield (Str), Buckler (Dex), Runic Shield (Int)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Shields'),
   'Tower Shield',  'Strength-based heavy shield',    100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Shields'),
   'Buckler',       'Dexterity-based light shield',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Shields'),
   'Runic Shield',  'Intelligence-based magic shield', 300, true, now(), now());

-- Jewellery → Ring, Amulet  (Path A: subcategories of the single Jewellery category)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   (SELECT id FROM game_category  WHERE name = 'Jewellery'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Jewellery')),
   'Ring',    'Finger accessories',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   (SELECT id FROM game_category  WHERE name = 'Jewellery'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Jewellery')),
   'Amulet',  'Neck accessories',    200, true, now(), now());
