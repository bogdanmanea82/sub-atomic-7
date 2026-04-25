-- seeds/03-modifiers-weapons.sql
-- Weapon modifiers using two binding levels:
--   seed_insert_mod:     category-level  (shared pool for all subcategories in 1-Handed / 2-Handed)
--   seed_insert_mod_sub: subcategory-level (specialised pool for Dagger, Wand, Staff, Bow)
--
-- 1-Handed category pool (9 mods) — covers 1H Sword, 1H Axe, 1H Mace, Dagger, Wand
-- Dagger specialisation    (3 mods) — crit-focused additions
-- Wand specialisation      (3 mods) — cast/spell additions
-- 2-Handed category pool   (9 mods) — covers 2H Sword, 2H Axe, 2H Mace, Staff, Bow, Crossbow
-- Staff specialisation     (3 mods) — mana/cast additions
-- Bow specialisation       (3 mods) — range/dex additions
-- Total: 30 modifiers (120 tiers)

DO $$
DECLARE
  v_dom  UUID;
  v_wpn  UUID;
  -- categories
  v_1h   UUID;
  v_2h   UUID;
  -- representative subcategories for category-bound mods (satisfies NOT NULL FK)
  v_1h_sword UUID;
  v_2h_sword UUID;
  -- specialised subcategories (bound directly)
  v_dagger   UUID;
  v_wand     UUID;
  v_staff    UUID;
  v_bow      UUID;
BEGIN
  SELECT id INTO v_dom  FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_wpn  FROM game_subdomain WHERE name = 'Weapons';
  SELECT id INTO v_1h   FROM game_category  WHERE name = '1-Handed' AND game_subdomain_id = v_wpn;
  SELECT id INTO v_2h   FROM game_category  WHERE name = '2-Handed' AND game_subdomain_id = v_wpn;

  SELECT id INTO v_1h_sword FROM game_subcategory WHERE name = '1H Sword'  AND game_category_id = v_1h;
  SELECT id INTO v_2h_sword FROM game_subcategory WHERE name = '2H Sword'  AND game_category_id = v_2h;
  SELECT id INTO v_dagger   FROM game_subcategory WHERE name = 'Dagger'    AND game_category_id = v_1h;
  SELECT id INTO v_wand     FROM game_subcategory WHERE name = 'Wand'      AND game_category_id = v_1h;
  SELECT id INTO v_staff    FROM game_subcategory WHERE name = 'Staff'     AND game_category_id = v_2h;
  SELECT id INTO v_bow      FROM game_subcategory WHERE name = 'Bow'       AND game_category_id = v_2h;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1-HANDED category pool (shared by all 1H subcategories)
  -- ══════════════════════════════════════════════════════════════════════════

  -- Damage
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_base_damage',   'prefix', 'base_damage',               'flat',      'scalar',  2,  40,  'Added Weapon Damage');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_inc_damage',    'prefix', 'base_damage',               'increased', 'scalar',  5,  50,  'Increased Weapon Damage');
  -- Speed & accuracy
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_attack_speed',  'suffix', 'attack_speed',              'increased', 'scalar',  3,  20,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_accuracy',      'suffix', 'accuracy_rating',           'flat',      'scalar', 10, 150,  'Added Accuracy Rating');
  -- Critical
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_crit_chance',   'suffix', 'critical_strike_chance',    'increased', 'scalar',  3,  35,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_crit_multi',    'suffix', 'critical_strike_multiplier','flat',      'scalar', 10,  80,  'Added Critical Strike Multiplier');
  -- Utility
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_life',          'suffix', 'life_max',                  'flat',      'scalar',  5,  60,  'Added Maximum Life');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_strength',      'suffix', 'strength',                  'flat',      'scalar',  3,  20,  'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_1h, v_1h_sword, '1h_dexterity',     'suffix', 'dexterity',                 'flat',      'scalar',  3,  20,  'Added Dexterity');

  -- ══════════════════════════════════════════════════════════════════════════
  -- DAGGER specialisation (subcategory-level — crit-focused)
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_dagger, 'dagger_attack_speed', 'suffix', 'attack_speed',              'increased', 'scalar',  5,  30, 'Increased Attack Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_dagger, 'dagger_crit_chance',  'suffix', 'critical_strike_chance',    'increased', 'scalar',  8,  60, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_dagger, 'dagger_crit_multi',   'suffix', 'critical_strike_multiplier','flat',      'scalar', 15, 120, 'Added Critical Strike Multiplier');

  -- ══════════════════════════════════════════════════════════════════════════
  -- WAND specialisation (subcategory-level — cast/spell focused)
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_wand, 'wand_cast_speed',   'suffix', 'cast_speed',             'increased', 'scalar',  5,  30, 'Increased Cast Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_wand, 'wand_crit_chance',  'suffix', 'critical_strike_chance', 'increased', 'scalar',  5,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_1h, v_wand, 'wand_intelligence', 'suffix', 'intelligence',           'flat',      'scalar',  5,  25, 'Added Intelligence');

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2-HANDED category pool (shared by all 2H subcategories)
  -- Higher value ranges than 1H — two-handed weapons occupy both hands.
  -- ══════════════════════════════════════════════════════════════════════════

  -- Damage
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_base_damage',   'prefix', 'base_damage',               'flat',      'scalar',  5,  80,  'Added Weapon Damage');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_inc_damage',    'prefix', 'base_damage',               'increased', 'scalar',  8,  60,  'Increased Weapon Damage');
  -- Speed & accuracy
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_attack_speed',  'suffix', 'attack_speed',              'increased', 'scalar',  2,  15,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_accuracy',      'suffix', 'accuracy_rating',           'flat',      'scalar', 20, 200,  'Added Accuracy Rating');
  -- Critical
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_crit_chance',   'suffix', 'critical_strike_chance',    'increased', 'scalar',  3,  35,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_crit_multi',    'suffix', 'critical_strike_multiplier','flat',      'scalar', 10, 120,  'Added Critical Strike Multiplier');
  -- Utility
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_life',          'suffix', 'life_max',                  'flat',      'scalar', 10,  80,  'Added Maximum Life');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_strength',      'suffix', 'strength',                  'flat',      'scalar',  5,  25,  'Added Strength');
  -- Range (meaningful for large two-handers)
  PERFORM seed_insert_mod(v_dom, v_wpn, v_2h, v_2h_sword, '2h_range',         'suffix', 'attack_range',              'increased', 'scalar',  1,  10,  'Increased Attack Range');

  -- ══════════════════════════════════════════════════════════════════════════
  -- STAFF specialisation (subcategory-level — mana/cast focused)
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_staff, 'staff_cast_speed',   'suffix', 'cast_speed',   'increased', 'scalar',  5,  30,  'Increased Cast Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_staff, 'staff_mana',         'prefix', 'mana_max',     'flat',      'scalar', 20, 150,  'Added Maximum Mana');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_staff, 'staff_intelligence', 'suffix', 'intelligence', 'flat',      'scalar',  5,  30,  'Added Intelligence');

  -- ══════════════════════════════════════════════════════════════════════════
  -- BOW specialisation (subcategory-level — range/dex focused)
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_bow, 'bow_attack_speed', 'suffix', 'attack_speed',   'increased', 'scalar',  5,  25, 'Increased Attack Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_bow, 'bow_range',        'suffix', 'attack_range',   'increased', 'scalar',  2,  15, 'Increased Attack Range');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_2h, v_bow, 'bow_dexterity',    'suffix', 'dexterity',      'flat',      'scalar',  5,  30, 'Added Dexterity');

END;
$$;
