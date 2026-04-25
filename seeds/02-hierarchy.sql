-- seeds/02-hierarchy.sql
-- Inserts the full item hierarchy: 1 domain → 3 subdomains → 9 categories → 31 subcategories.
--
-- Weapons subdomain restructured into hand-slot categories:
--   1-Handed  → 1H Sword, 1H Axe, 1H Mace, Dagger, Wand
--   2-Handed  → 2H Sword, 2H Axe, 2H Mace, Staff, Bow, Crossbow
--   Off-hand  → Shield, Quiver, Focus
--   (Shields moved from Armour into Off-hand)
--
-- Armour subcategories named by material/style (Path C):
--   Str → Heavy <slot>  |  Dex → Evasion <slot>  |  Int → Energy Shield <slot>
--   Exceptions: Belts (Arcane Belt for Int), Shields (Tower Shield/Buckler/Runic Shield)
--
-- Jewellery: single category with Ring + Amulet subcategories (Path A).

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
   'Weapons',   'Weapons and off-hand equipment',             100, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Armour',    'Defensive body armour pieces',               200, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Jewellery', 'Accessory equipment for utility and stats',  300, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Categories
-- ══════════════════════════════════════════════════════════════════════════════

-- Weapons → 1-Handed, 2-Handed, Off-hand
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   '1-Handed', 'One-handed weapons — swords, axes, maces, daggers, wands',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   '2-Handed', 'Two-handed weapons — greatswords, axes, bows, staves',       200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   'Off-hand',  'Off-hand equipment — shields, quivers, foci',               300, true, now(), now());

-- Armour → Body Armour, Helmets, Boots, Gloves, Belts  (Shields moved to Off-hand)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Body Armour', 'Chest protection',   100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Helmets',     'Head protection',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Boots',       'Foot protection',    300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Gloves',      'Hand protection',    400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Belts',       'Waist equipment',    500, true, now(), now());

-- Jewellery → single "Jewellery" category
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   'Jewellery', 'Rings and amulets — finger and neck accessories', 100, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subcategories
-- ══════════════════════════════════════════════════════════════════════════════

-- 1-Handed → 1H Sword, 1H Axe, 1H Mace, Dagger, Wand
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '1-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '1H Sword', 'One-handed sword — balanced speed and damage', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '1-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '1H Axe',   'One-handed axe — high raw damage',            200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '1-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '1H Mace',  'One-handed mace — high stun potential',       300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '1-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Dagger',   'Fast one-handed weapon — crit-focused',        400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '1-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Wand',     'One-handed spell weapon — intelligence-based', 500, true, now(), now());

-- 2-Handed → 2H Sword, 2H Axe, 2H Mace, Staff, Bow, Crossbow
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '2H Sword',   'Two-handed sword — reach and damage',          100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '2H Axe',     'Two-handed axe — massive cleave damage',        200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   '2H Mace',    'Two-handed mace — high stun and armor-break',   300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Staff',      'Two-handed spell weapon — intelligence-based',  400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Bow',        'Two-handed ranged weapon — dexterity-based',    500, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = '2-Handed'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Crossbow',   'Mechanical two-handed ranged weapon',           600, true, now(), now());

-- Off-hand → Shield, Quiver, Focus
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Off-hand'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Shield', 'Defensive off-hand — blocks and armour',     100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Off-hand'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Quiver', 'Ammunition off-hand for bows',               200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category  WHERE name = 'Off-hand'
      AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Focus',  'Caster off-hand — amplifies spells',         300, true, now(), now());

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
   'Heavy Belt',    'Strength-based belt',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Belts'),
   'Evasion Belt',  'Dexterity-based belt',     200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category  WHERE name = 'Belts'),
   'Arcane Belt',   'Intelligence-based belt',  300, true, now(), now());

-- Jewellery → Ring, Amulet
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
