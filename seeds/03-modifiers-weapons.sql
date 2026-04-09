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
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Sword unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_melee_range',      'prefix', 'offensive',  'increased', 'additive',       'Increased Melee Range');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_sword, 'flat_accuracy',        'suffix', 'offensive',  'flat',      'additive',       'Added Accuracy Rating');

  -- ════════════════════════════════════════════════════════════════════════════
  -- AXE (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Axe unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_area_of_effect',   'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Area of Effect');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_axe, 'inc_stun_duration',    'prefix', 'utility',    'increased', 'additive',       'Increased Stun Duration');

  -- ════════════════════════════════════════════════════════════════════════════
  -- MACE (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Mace unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_stun_duration',    'prefix', 'utility',    'increased', 'additive',       'Increased Stun Duration');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_melee, v_mace, 'inc_area_of_effect',   'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Area of Effect');

  -- ════════════════════════════════════════════════════════════════════════════
  -- BOW (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Bow unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_projectile_speed', 'prefix', 'offensive',  'increased', 'additive',       'Increased Projectile Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_bow, 'flat_evasion',         'suffix', 'defensive',  'flat',      'additive',       'Added Evasion Rating');

  -- ════════════════════════════════════════════════════════════════════════════
  -- CROSSBOW (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Crossbow unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_projectile_speed', 'prefix', 'offensive',  'increased', 'additive',       'Increased Projectile Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_crossbow, 'inc_stun_duration',    'prefix', 'utility',    'increased', 'additive',       'Increased Stun Duration');

  -- ════════════════════════════════════════════════════════════════════════════
  -- WAND (16 mods: 12 core + 4 unique)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_phys_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_fire_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_cold_damage',      'prefix', 'offensive',  'flat',      'additive',       'Added Cold Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_lightning_damage', 'prefix', 'offensive',  'flat',      'additive',       'Added Lightning Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_phys_damage',      'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_attack_speed',     'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_crit_chance',      'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_crit_multi',      'suffix', 'offensive',  'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_accuracy',         'suffix', 'offensive',  'increased', 'additive',       'Increased Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_max_life',        'suffix', 'defensive',  'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'life_leech',           'suffix', 'resource',   'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'mana_leech',           'suffix', 'resource',   'flat',      'additive',       'Mana Leech');
  -- Wand unique
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_spell_damage',     'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Spell Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_cast_speed',       'suffix', 'offensive',  'increased', 'multiplicative', 'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'flat_max_mana',        'suffix', 'resource',   'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_ranged, v_wand, 'inc_ele_damage',       'prefix', 'offensive',  'increased', 'multiplicative', 'Increased Elemental Damage');

END $$;
