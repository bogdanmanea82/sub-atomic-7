-- seeds/05-modifiers-helmets.sql
-- 12 helmet modifiers — bound to Helmets category.
-- Representative subcategory: Energy Shield Helmet (Int).

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_helm   UUID;
  v_helm_i UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_helm   FROM game_category  WHERE name = 'Helmets' AND game_subdomain_id = v_armour;
  SELECT id INTO v_helm_i FROM game_subcategory WHERE name = 'Energy Shield Helmet' AND game_category_id = v_helm;

  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_mana',      'prefix', 'mana_max',            'flat',      'scalar', 20, 150, 'Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_life',      'prefix', 'life_max',            'flat',      'scalar', 20, 130, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_mana_regen',      'suffix', 'mana_regen',          'increased', 'scalar', 10, 100, 'Mana Regeneration');
  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_armour',    'prefix', 'armor_rating',        'flat',      'scalar', 15, 220, 'Armor Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_evasion',   'prefix', 'evasion_rating',      'flat',      'scalar', 15, 200, 'Evasion Rating');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_fire_res',        'suffix', 'fire_resistance',     'increased', 'scalar', 6,  35,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_cold_res',        'suffix', 'cold_resistance',     'increased', 'scalar', 6,  35,  'Cold Resistance');
  -- Offensive support
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_accuracy',  'suffix', 'accuracy_rating',     'flat',      'scalar', 15, 200, 'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_inc_cast_speed',  'suffix', 'cast_speed',          'increased', 'scalar', 5,  25,  'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_inc_crit_chance', 'suffix', 'critical_strike_chance', 'increased', 'scalar', 5, 40, 'Increased Critical Strike Chance');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_int',       'suffix', 'intelligence',        'flat',      'scalar', 4,  22,  'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_armour, v_helm, v_helm_i, 'helm_added_strength',  'suffix', 'strength',            'flat',      'scalar', 3,  18,  'Added Strength');
END;
$$;
