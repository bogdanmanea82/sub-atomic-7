-- seeds/09-modifiers-shields.sql
-- 45 shield modifiers (15 per attribute × 3 attributes) + 1 tier each.

DO $$
DECLARE
  v_dom UUID;
  v_sub UUID;
  v_cat UUID;
  v_str UUID;
  v_dex UUID;
  v_int UUID;
BEGIN
  SELECT id INTO v_dom FROM game_domain WHERE name = 'Items';
  SELECT id INTO v_sub FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_cat FROM game_category WHERE name = 'Shields' AND game_subdomain_id = v_sub;
  SELECT id INTO v_str FROM game_subcategory WHERE name = 'Strength' AND game_category_id = v_cat;
  SELECT id INTO v_dex FROM game_subcategory WHERE name = 'Dexterity' AND game_category_id = v_cat;
  SELECT id INTO v_int FROM game_subcategory WHERE name = 'Intelligence' AND game_category_id = v_cat;

  -- ════════════════════════════════════════════════════════════════════════════
  -- SHIELDS — STRENGTH (15 mods: 6 core + 9 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_max_life',       'suffix', 'life_max',            'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_fire_res',       'suffix', 'fire_resistance',     'flat',      'scalar', 5,   40, 'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_cold_res',       'suffix', 'cold_resistance',     'flat',      'scalar', 5,   40, 'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_lightning_res',  'suffix', 'lightning_resistance','flat',      'scalar', 5,   40, 'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_chaos_res',      'suffix', 'chaos_resistance',    'flat',      'scalar', 5,   30, 'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_all_ele_res',    'suffix', 'fire_resistance',     'flat',      'scalar', 5,   20, 'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_strength',       'suffix', 'strength',            'flat',      'scalar', 5,   20, 'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_armour',         'prefix', 'armor_rating',        'flat',      'scalar', 20, 150, 'Added Armour');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_armour',          'prefix', 'armor_rating',        'increased', 'scalar', 10,  50, 'Increased Armour');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_max_mana',       'suffix', 'mana_max',            'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_life_regen',     'suffix', 'life_regen',          'flat',      'scalar', 5,   30, 'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_max_life',        'prefix', 'life_max',            'increased', 'scalar', 10,  40, 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_block_chance',    'prefix', 'block_chance',        'increased', 'scalar', 10,  30, 'Increased Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_block_chance',   'suffix', 'block_chance',        'flat',      'scalar', 3,   10, 'Added Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_stun_recovery',   'suffix', 'stun_threshold',      'increased', 'scalar', 10,  30, 'Increased Stun Recovery');

  -- ════════════════════════════════════════════════════════════════════════════
  -- SHIELDS — DEXTERITY (15 mods: 6 core + 9 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_max_life',       'suffix', 'life_max',            'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_fire_res',       'suffix', 'fire_resistance',     'flat',      'scalar', 5,   40, 'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_cold_res',       'suffix', 'cold_resistance',     'flat',      'scalar', 5,   40, 'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_lightning_res',  'suffix', 'lightning_resistance','flat',      'scalar', 5,   40, 'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_chaos_res',      'suffix', 'chaos_resistance',    'flat',      'scalar', 5,   30, 'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_all_ele_res',    'suffix', 'fire_resistance',     'flat',      'scalar', 5,   20, 'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_dexterity',      'suffix', 'dexterity',           'flat',      'scalar', 5,   20, 'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_evasion',        'prefix', 'evasion_rating',      'flat',      'scalar', 20, 150, 'Added Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_evasion',         'prefix', 'evasion_rating',      'increased', 'scalar', 10,  50, 'Increased Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_max_mana',       'suffix', 'mana_max',            'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_life_regen',     'suffix', 'life_regen',          'flat',      'scalar', 5,   30, 'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_max_life',        'prefix', 'life_max',            'increased', 'scalar', 10,  40, 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_block_chance',    'prefix', 'block_chance',        'increased', 'scalar', 10,  30, 'Increased Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_block_chance',   'suffix', 'block_chance',        'flat',      'scalar', 3,   10, 'Added Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_projectile_speed','prefix', 'accuracy_rating',     'increased', 'scalar', 10,  30, 'Increased Projectile Speed');

  -- ════════════════════════════════════════════════════════════════════════════
  -- SHIELDS — INTELLIGENCE (15 mods: 6 core + 9 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_max_life',       'suffix', 'life_max',            'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_fire_res',       'suffix', 'fire_resistance',     'flat',      'scalar', 5,   40, 'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_cold_res',       'suffix', 'cold_resistance',     'flat',      'scalar', 5,   40, 'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_lightning_res',  'suffix', 'lightning_resistance','flat',      'scalar', 5,   40, 'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_chaos_res',      'suffix', 'chaos_resistance',    'flat',      'scalar', 5,   30, 'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_all_ele_res',    'suffix', 'fire_resistance',     'flat',      'scalar', 5,   20, 'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_intelligence',   'suffix', 'intelligence',        'flat',      'scalar', 5,   20, 'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_energy_shield',  'prefix', 'life_max',            'flat',      'scalar', 10, 100, 'Added Energy Shield');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_energy_shield',   'prefix', 'life_max',            'increased', 'scalar', 10,  50, 'Increased Energy Shield');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_max_mana',       'suffix', 'mana_max',            'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_life_regen',     'suffix', 'life_regen',          'flat',      'scalar', 5,   30, 'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_max_life',        'prefix', 'life_max',            'increased', 'scalar', 10,  40, 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_block_chance',    'prefix', 'block_chance',        'increased', 'scalar', 10,  30, 'Increased Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_block_chance',   'suffix', 'block_chance',        'flat',      'scalar', 3,   10, 'Added Block Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_spell_damage',    'prefix', 'base_damage',         'increased', 'scalar', 10,  50, 'Increased Spell Damage');

END $$;
