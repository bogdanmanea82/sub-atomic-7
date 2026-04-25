-- seeds/09-modifiers-offhand.sql
-- Off-hand modifiers — all bound at subcategory level (seed_insert_mod_sub).
-- Each off-hand type has its own specialised pool; no shared category-level pool.
--
-- Shield (8 mods) — defence, block, life, resistances
-- Quiver (4 mods) — accuracy, speed, crit, dexterity
-- Focus  (4 mods) — cast speed, mana, crit, intelligence
-- Total: 16 modifiers (64 tiers)

DO $$
DECLARE
  v_dom    UUID;
  v_wpn    UUID;
  v_offh   UUID;
  v_shield UUID;
  v_quiver UUID;
  v_focus  UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_wpn    FROM game_subdomain WHERE name = 'Weapons';
  SELECT id INTO v_offh   FROM game_category  WHERE name = 'Off-hand' AND game_subdomain_id = v_wpn;
  SELECT id INTO v_shield FROM game_subcategory WHERE name = 'Shield' AND game_category_id = v_offh;
  SELECT id INTO v_quiver FROM game_subcategory WHERE name = 'Quiver' AND game_category_id = v_offh;
  SELECT id INTO v_focus  FROM game_subcategory WHERE name = 'Focus'  AND game_category_id = v_offh;

  -- ══════════════════════════════════════════════════════════════════════════
  -- SHIELD (8) — defence, block, life, resistances
  -- ══════════════════════════════════════════════════════════════════════════

  -- Defence
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_armour',      'prefix', 'armor_rating',    'flat',      'scalar', 20, 300, 'Armor Rating');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_evasion',     'prefix', 'evasion_rating',  'flat',      'scalar', 15, 250, 'Evasion Rating');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_block',       'suffix', 'block_chance',    'increased', 'scalar',  3,  18, 'Increased Block Chance');
  -- Life
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_life',        'prefix', 'life_max',        'flat',      'scalar', 20, 150, 'Maximum Life');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_life_regen',  'suffix', 'life_regen',      'flat',      'scalar',  2,  18, 'Life Regeneration');
  -- Resistances
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_fire_res',    'suffix', 'fire_resistance', 'increased', 'scalar',  6,  40, 'Fire Resistance');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_cold_res',    'suffix', 'cold_resistance', 'increased', 'scalar',  6,  40, 'Cold Resistance');
  -- Attribute
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_shield, 'shield_strength',    'suffix', 'strength',        'flat',      'scalar',  3,  18, 'Added Strength');

  -- ══════════════════════════════════════════════════════════════════════════
  -- QUIVER (4) — accuracy, speed, crit, dexterity
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_quiver, 'quiver_accuracy',    'prefix', 'accuracy_rating',         'flat',      'scalar', 20, 200, 'Added Accuracy Rating');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_quiver, 'quiver_attack_speed','suffix', 'attack_speed',            'increased', 'scalar',  3,  20, 'Increased Attack Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_quiver, 'quiver_crit_chance', 'suffix', 'critical_strike_chance',  'increased', 'scalar',  3,  35, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_quiver, 'quiver_dexterity',   'suffix', 'dexterity',               'flat',      'scalar',  5,  25, 'Added Dexterity');

  -- ══════════════════════════════════════════════════════════════════════════
  -- FOCUS (4) — cast speed, mana, crit, intelligence
  -- ══════════════════════════════════════════════════════════════════════════

  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_focus, 'focus_cast_speed',   'prefix', 'cast_speed',             'increased', 'scalar',  5,  30, 'Increased Cast Speed');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_focus, 'focus_mana',         'prefix', 'mana_max',               'flat',      'scalar', 20, 150, 'Added Maximum Mana');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_focus, 'focus_crit_chance',  'suffix', 'critical_strike_chance', 'increased', 'scalar',  5,  40, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod_sub(v_dom, v_wpn, v_offh, v_focus, 'focus_intelligence', 'suffix', 'intelligence',           'flat',      'scalar',  5,  30, 'Added Intelligence');

END;
$$;
