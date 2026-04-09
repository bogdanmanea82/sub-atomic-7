-- seeds/10-modifiers-jewellery.sql
-- 36 jewellery modifiers (18 Rings + 18 Amulets) + 1 tier each.

DO $$
DECLARE
  v_dom UUID;
  v_sub UUID;
  v_rings_cat UUID;
  v_amulets_cat UUID;
  v_rings UUID;
  v_amulets UUID;
BEGIN
  SELECT id INTO v_dom FROM game_domain WHERE name = 'Items';
  SELECT id INTO v_sub FROM game_subdomain WHERE name = 'Jewellery';
  SELECT id INTO v_rings_cat FROM game_category WHERE name = 'Rings' AND game_subdomain_id = v_sub;
  SELECT id INTO v_amulets_cat FROM game_category WHERE name = 'Amulets' AND game_subdomain_id = v_sub;
  SELECT id INTO v_rings FROM game_subcategory WHERE name = 'Rings' AND game_category_id = v_rings_cat;
  SELECT id INTO v_amulets FROM game_subcategory WHERE name = 'Amulets' AND game_category_id = v_amulets_cat;

  -- ════════════════════════════════════════════════════════════════════════════
  -- RINGS (18 mods)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_max_life',        'suffix', 'defensive', 'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_fire_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_cold_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_lightning_res',   'suffix', 'defensive', 'flat',      'additive',       'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_chaos_res',       'suffix', 'defensive', 'flat',      'additive',       'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_all_ele_res',     'suffix', 'defensive', 'flat',      'additive',       'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_strength',        'suffix', 'defensive', 'flat',      'additive',       'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_dexterity',       'suffix', 'defensive', 'flat',      'additive',       'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_intelligence',    'suffix', 'defensive', 'flat',      'additive',       'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_max_mana',        'suffix', 'resource',  'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_life_regen',      'suffix', 'resource',  'flat',      'additive',       'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_max_life',         'prefix', 'defensive', 'increased', 'multiplicative', 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_phys_damage',     'prefix', 'offensive', 'flat',      'additive',       'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_fire_damage',     'prefix', 'offensive', 'flat',      'additive',       'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_accuracy',        'suffix', 'offensive', 'flat',      'additive',       'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_attack_speed',     'suffix', 'offensive', 'increased', 'multiplicative', 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'life_leech',           'suffix', 'resource',  'flat',      'additive',       'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_crit_chance',      'suffix', 'offensive', 'increased', 'multiplicative', 'Increased Critical Strike Chance');

  -- ════════════════════════════════════════════════════════════════════════════
  -- AMULETS (18 mods)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_max_life',        'suffix', 'defensive', 'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_fire_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_cold_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_lightning_res',   'suffix', 'defensive', 'flat',      'additive',       'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_chaos_res',       'suffix', 'defensive', 'flat',      'additive',       'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_all_ele_res',     'suffix', 'defensive', 'flat',      'additive',       'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_strength',        'suffix', 'defensive', 'flat',      'additive',       'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_dexterity',       'suffix', 'defensive', 'flat',      'additive',       'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_intelligence',    'suffix', 'defensive', 'flat',      'additive',       'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_max_mana',        'suffix', 'resource',  'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_life_regen',      'suffix', 'resource',  'flat',      'additive',       'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_max_life',         'prefix', 'defensive', 'increased', 'multiplicative', 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_spell_damage',     'prefix', 'offensive', 'increased', 'multiplicative', 'Increased Spell Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_cast_speed',       'suffix', 'offensive', 'increased', 'multiplicative', 'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_crit_chance',      'suffix', 'offensive', 'increased', 'multiplicative', 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_crit_multi',      'suffix', 'offensive', 'flat',      'additive',       'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_ele_damage',       'prefix', 'offensive', 'increased', 'multiplicative', 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_mana_regen',       'suffix', 'resource',  'increased', 'additive',       'Increased Mana Regeneration');

END $$;
