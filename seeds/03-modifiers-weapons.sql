-- seeds/03-modifiers-weapons.sql
-- 96 weapon modifiers (16 per subcategory × 6 subcategories) + 1 tier each.
-- Weapon subcategories: Sword, Axe, Mace (Melee) + Bow, Crossbow, Wand (Ranged)

DO $$
DECLARE
  v_dom UUID;
  v_sub UUID;
  v_melee UUID;
  v_ranged UUID;
  v_sword UUID;
  v_axe UUID;
  v_mace UUID;
  v_bow UUID;
  v_crossbow UUID;
  v_wand UUID;
BEGIN
  -- Look up hierarchy IDs
  SELECT id INTO v_dom FROM game_domain WHERE name = 'Items';
  SELECT id INTO v_sub FROM game_subdomain WHERE name = 'Weapons';
  SELECT id INTO v_melee FROM game_category WHERE name = 'Melee' AND game_subdomain_id = v_sub;
  SELECT id INTO v_ranged FROM game_category WHERE name = 'Ranged' AND game_subdomain_id = v_sub;
  SELECT id INTO v_sword FROM game_subcategory WHERE name = 'Sword' AND game_category_id = v_melee;
  SELECT id INTO v_axe FROM game_subcategory WHERE name = 'Axe' AND game_category_id = v_melee;
  SELECT id INTO v_mace FROM game_subcategory WHERE name = 'Mace' AND game_category_id = v_melee;
  SELECT id INTO v_bow FROM game_subcategory WHERE name = 'Bow' AND game_category_id = v_ranged;
  SELECT id INTO v_crossbow FROM game_subcategory WHERE name = 'Crossbow' AND game_category_id = v_ranged;
  SELECT id INTO v_wand FROM game_subcategory WHERE name = 'Wand' AND game_category_id = v_ranged;

  -- ════════════════════════════════════════════════════════════════════════════
  -- SWORD (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Sword unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_melee_range',       'prefix', 'attack_range',               'increased', 'scalar', 10,  30, 'Increased Melee Range');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_accuracy',         'suffix', 'accuracy_rating',            'flat',      'scalar', 20, 100, 'Added Accuracy Rating');

  -- ════════════════════════════════════════════════════════════════════════════
  -- AXE (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Axe unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_area_of_effect',    'prefix', 'attack_range',               'increased', 'scalar', 10,  40, 'Increased Area of Effect');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_stun_duration',     'prefix', 'stun_threshold',             'increased', 'scalar', 10,  40, 'Increased Stun Duration');

  -- ════════════════════════════════════════════════════════════════════════════
  -- MACE (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Mace unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_stun_duration',     'prefix', 'stun_threshold',             'increased', 'scalar', 10,  40, 'Increased Stun Duration');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_area_of_effect',    'prefix', 'attack_range',               'increased', 'scalar', 10,  40, 'Increased Area of Effect');

  -- ════════════════════════════════════════════════════════════════════════════
  -- BOW (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Bow unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_projectile_speed',  'prefix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Projectile Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_evasion',          'suffix', 'evasion_rating',             'flat',      'scalar', 20, 150, 'Added Evasion Rating');

  -- ════════════════════════════════════════════════════════════════════════════
  -- CROSSBOW (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Crossbow unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_projectile_speed',  'prefix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Projectile Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_stun_duration',     'prefix', 'stun_threshold',             'increased', 'scalar', 10,  40, 'Increased Stun Duration');

  -- ════════════════════════════════════════════════════════════════════════════
  -- WAND (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_phys_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   50, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_fire_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_cold_damage',      'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_lightning_damage', 'prefix', 'base_damage',                'flat',      'range',  1,   40, 'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_phys_damage',       'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_attack_speed',      'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_crit_chance',       'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_crit_multi',       'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_accuracy',          'suffix', 'accuracy_rating',            'increased', 'scalar', 10,  30, 'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_max_life',         'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'life_leech',            'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'mana_leech',            'suffix', 'mana_regen',                 'flat',      'scalar', 1,   3,  'Mana Leech');
  -- Wand unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_spell_damage',      'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Spell Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_cast_speed',        'suffix', 'cast_speed',                 'increased', 'scalar', 5,   20, 'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_max_mana',         'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_ele_damage',        'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');

END $$;
