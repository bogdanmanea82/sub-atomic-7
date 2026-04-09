-- seeds/02-hierarchy.sql
-- Inserts the full item hierarchy: 1 domain → 3 subdomains → 10 categories → 26 subcategories.

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
   'Weapons', 'Offensive equipment for dealing damage', 100, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Armour', 'Defensive equipment for protection', 200, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE name = 'Items'),
   'Jewellery', 'Accessory equipment for utility and stats', 300, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Categories
-- ══════════════════════════════════════════════════════════════════════════════

-- Weapons → Melee, Ranged
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   'Melee', 'Close-range weapons', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   'Ranged', 'Long-range weapons', 200, true, now(), now());

-- Armour → Body Armour, Helmets, Boots, Gloves, Belts, Shields
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Body Armour', 'Chest protection', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Helmets', 'Head protection', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Boots', 'Foot protection', 300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Gloves', 'Hand protection', 400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Belts', 'Waist equipment', 500, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   'Shields', 'Off-hand defensive equipment', 600, true, now(), now());

-- Jewellery → Rings, Amulets
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   'Rings', 'Finger accessories', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   'Amulets', 'Neck accessories', 200, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subcategories
-- ══════════════════════════════════════════════════════════════════════════════

-- Helper: look up domain once (used in all subcategory inserts)
-- Melee → Sword, Axe, Mace
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Melee' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Sword', 'Balanced melee weapon', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Melee' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Axe', 'Heavy cleaving weapon', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Melee' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Mace', 'Blunt crushing weapon', 300, true, now(), now());

-- Ranged → Bow, Crossbow, Wand
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Ranged' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Bow', 'Dexterity-based ranged weapon', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Ranged' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Crossbow', 'Mechanical ranged weapon', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Weapons'),
   (SELECT id FROM game_category WHERE name = 'Ranged' AND game_subdomain_id = (SELECT id FROM game_subdomain WHERE name = 'Weapons')),
   'Wand', 'Spell-casting ranged weapon', 300, true, now(), now());

-- Body Armour → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Body Armour'),
   'Strength', 'Armour-based body protection', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Body Armour'),
   'Dexterity', 'Evasion-based body protection', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Body Armour'),
   'Intelligence', 'Energy shield body protection', 300, true, now(), now());

-- Helmets → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Helmets'),
   'Strength', 'Armour-based headgear', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Helmets'),
   'Dexterity', 'Evasion-based headgear', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Helmets'),
   'Intelligence', 'Energy shield headgear', 300, true, now(), now());

-- Boots → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Boots'),
   'Strength', 'Armour-based footwear', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Boots'),
   'Dexterity', 'Evasion-based footwear', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Boots'),
   'Intelligence', 'Energy shield footwear', 300, true, now(), now());

-- Gloves → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Gloves'),
   'Strength', 'Armour-based handwear', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Gloves'),
   'Dexterity', 'Evasion-based handwear', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Gloves'),
   'Intelligence', 'Energy shield handwear', 300, true, now(), now());

-- Belts → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Belts'),
   'Strength', 'Armour-based belt', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Belts'),
   'Dexterity', 'Evasion-based belt', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Belts'),
   'Intelligence', 'Energy shield belt', 300, true, now(), now());

-- Shields → Strength, Dexterity, Intelligence
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Shields'),
   'Strength', 'Armour-based shield', 100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Shields'),
   'Dexterity', 'Evasion-based shield', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Armour'),
   (SELECT id FROM game_category WHERE name = 'Shields'),
   'Intelligence', 'Energy shield shield', 300, true, now(), now());

-- Rings → Rings (single subcategory)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   (SELECT id FROM game_category WHERE name = 'Rings'),
   'Rings', 'All ring types', 100, true, now(), now());

-- Amulets → Amulets (single subcategory)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain WHERE name = 'Items'),
   (SELECT id FROM game_subdomain WHERE name = 'Jewellery'),
   (SELECT id FROM game_category WHERE name = 'Amulets'),
   'Amulets', 'All amulet types', 100, true, now(), now());
