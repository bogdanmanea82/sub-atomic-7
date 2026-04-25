-- seeds/03-modifiers-weapons.sql
-- 28 weapon modifiers: 15 Melee + 13 Ranged.
-- Each modifier is bound at category level — one entry covers all subcategories.
-- Melee representative subcategory: Sword  (satisfies game_subcategory_id NOT NULL FK)
-- Ranged representative subcategory: Bow

DO $$
DECLARE
  v_dom     UUID;
  v_weapons UUID;
  v_melee   UUID;
  v_ranged  UUID;
  v_sword   UUID;
  v_bow     UUID;
BEGIN
  SELECT id INTO v_dom     FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_weapons FROM game_subdomain WHERE name = 'Weapons';
  SELECT id INTO v_melee   FROM game_category  WHERE name = 'Melee'  AND game_subdomain_id = v_weapons;
  SELECT id INTO v_ranged  FROM game_category  WHERE name = 'Ranged' AND game_subdomain_id = v_weapons;
  SELECT id INTO v_sword   FROM game_subcategory WHERE name = 'Sword' AND game_category_id = v_melee;
  SELECT id INTO v_bow     FROM game_subcategory WHERE name = 'Bow'   AND game_category_id = v_ranged;

  -- ══════════════════════════════════════════════════════════════════════════
  -- MELEE (15) — bound to Melee category
  -- ══════════════════════════════════════════════════════════════════════════

  -- Damage — flat (range roll: live min-max per hit)
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_phys',       'prefix', 'base_damage',                'flat',      'range',  2,  80,  'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_fire',       'prefix', 'base_damage',                'flat',      'range',  2,  60,  'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_cold',       'prefix', 'base_damage',                'flat',      'range',  2,  60,  'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_lightning',  'prefix', 'base_damage',                'flat',      'range',  2,  60,  'Added Lightning Damage');
  -- Damage — increased (scalar: single % bonus frozen at item gen)
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_inc_phys',         'prefix', 'base_damage',                'increased', 'scalar', 12, 80,  'Increased Physical Damage');
  -- Speed & reach
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_inc_attack_speed', 'suffix', 'attack_speed',               'increased', 'scalar', 5,  30,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_inc_range',        'prefix', 'attack_range',               'increased', 'scalar', 1,  15,  'Increased Melee Range');
  -- Critical
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_inc_crit_chance',  'suffix', 'critical_strike_chance',     'increased', 'scalar', 5,  50,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_crit_multi', 'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10, 100, 'Added Critical Strike Multiplier');
  -- Accuracy
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_accuracy',   'suffix', 'accuracy_rating',            'flat',      'scalar', 15, 300, 'Added Accuracy Rating');
  -- Life & mana pools
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_life',       'suffix', 'life_max',                   'flat',      'scalar', 10, 80,  'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_mana',       'suffix', 'mana_max',                   'flat',      'scalar', 5,  60,  'Added Maximum Mana');
  -- Attribute
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_added_strength',   'suffix', 'strength',                   'flat',      'scalar', 3,  25,  'Added Strength');
  -- Leech (proxy: regen as nearest recovery stat)
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_life_leech',       'suffix', 'life_regen',                 'flat',      'scalar', 1,  3,   'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_melee, v_sword, 'melee_mana_leech',       'suffix', 'mana_regen',                 'flat',      'scalar', 1,  3,   'Mana Leech');

  -- ══════════════════════════════════════════════════════════════════════════
  -- RANGED (13) — bound to Ranged category
  -- ══════════════════════════════════════════════════════════════════════════

  -- Damage
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_phys',       'prefix', 'base_damage',                'flat',      'range',  2,  70,  'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_ele',        'prefix', 'base_damage',                'flat',      'range',  2,  55,  'Added Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_phys',         'prefix', 'base_damage',                'increased', 'scalar', 12, 70,  'Increased Physical Damage');
  -- Speed
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_attack_speed', 'suffix', 'attack_speed',               'increased', 'scalar', 5,  28,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_cast_speed',   'suffix', 'cast_speed',                 'increased', 'scalar', 5,  28,  'Increased Cast Speed');
  -- Range & accuracy
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_accuracy',     'prefix', 'accuracy_rating',            'increased', 'scalar', 15, 250, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_range',        'prefix', 'attack_range',               'increased', 'scalar', 1,  12,  'Increased Attack Range');
  -- Critical
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_inc_crit_chance',  'suffix', 'critical_strike_chance',     'increased', 'scalar', 5,  50,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_crit_multi', 'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10, 100, 'Added Critical Strike Multiplier');
  -- Life & attributes
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_life',       'suffix', 'life_max',                   'flat',      'scalar', 10, 70,  'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_dex',        'suffix', 'dexterity',                  'flat',      'scalar', 3,  22,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_added_int',        'suffix', 'intelligence',               'flat',      'scalar', 3,  22,  'Added Intelligence');
  -- Leech
  PERFORM seed_insert_mod(v_dom, v_weapons, v_ranged, v_bow, 'ranged_mana_leech',       'suffix', 'mana_regen',                 'flat',      'scalar', 1,  3,   'Mana Leech');
END;
$$;
