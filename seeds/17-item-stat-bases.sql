-- seeds/17-item-stat-bases.sql
-- ItemStatBase junction: implicit stats and requirements for all 31 item templates.
--
-- Values are prototyping baselines modeled after Path of Exile implicits.
-- combination_type is 'flat' for every row in this seed.
--
-- attack_speed / cast_speed / movement_speed: multiplier convention (100 = 1.0x).
-- block_chance / critical_strike_chance: percentage convention (value = integer %).
--
-- Stat and item UUIDs are resolved by machine_name join — stable across re-seeds.

INSERT INTO item_stat_base (id, item_id, stat_id, combination_type, base_value, created_at, updated_at)
SELECT
  gen_random_uuid(),
  i.id,
  s.id,
  v.combination_type,
  v.base_value,
  now(),
  now()
FROM (
  VALUES

    -- ── Belts ────────────────────────────────────────────────────────────────
    -- Heavy Belt: life + STR requirement
    ('heavy_belt',           'life_max',                  'flat', 30),
    ('heavy_belt',           'level_requirement',         'flat',  1),
    ('heavy_belt',           'strength_requirement',      'flat',  8),

    -- Evasion Belt: evasion + DEX requirement
    ('evasion_belt',         'evasion_rating',            'flat', 30),
    ('evasion_belt',         'level_requirement',         'flat',  1),
    ('evasion_belt',         'dexterity_requirement',     'flat',  8),

    -- Arcane Belt: mana + INT requirement
    ('arcane_belt',          'mana_max',                  'flat', 25),
    ('arcane_belt',          'level_requirement',         'flat',  1),
    ('arcane_belt',          'intelligence_requirement',  'flat',  8),

    -- ── Body Armour ──────────────────────────────────────────────────────────
    ('heavy_armour',         'armor_rating',              'flat', 80),
    ('heavy_armour',         'level_requirement',         'flat',  1),
    ('heavy_armour',         'strength_requirement',      'flat', 12),

    ('evasion_armour',       'evasion_rating',            'flat', 80),
    ('evasion_armour',       'level_requirement',         'flat',  1),
    ('evasion_armour',       'dexterity_requirement',     'flat', 12),

    ('energy_shield_armour', 'mana_max',                  'flat', 40),
    ('energy_shield_armour', 'level_requirement',         'flat',  1),
    ('energy_shield_armour', 'intelligence_requirement',  'flat', 12),

    -- ── Boots ────────────────────────────────────────────────────────────────
    -- movement_speed 100 = 1.0x baseline (explicit no-op — modifiers can adjust)
    ('heavy_boots',          'armor_rating',              'flat', 25),
    ('heavy_boots',          'movement_speed',            'flat', 100),
    ('heavy_boots',          'level_requirement',         'flat',  1),
    ('heavy_boots',          'strength_requirement',      'flat',  8),

    ('evasion_boots',        'evasion_rating',            'flat', 25),
    ('evasion_boots',        'movement_speed',            'flat', 100),
    ('evasion_boots',        'level_requirement',         'flat',  1),
    ('evasion_boots',        'dexterity_requirement',     'flat',  8),

    ('energy_shield_boots',  'mana_max',                  'flat', 20),
    ('energy_shield_boots',  'movement_speed',            'flat', 100),
    ('energy_shield_boots',  'level_requirement',         'flat',  1),
    ('energy_shield_boots',  'intelligence_requirement',  'flat',  8),

    -- ── Gloves ───────────────────────────────────────────────────────────────
    ('heavy_gloves',         'armor_rating',              'flat', 25),
    ('heavy_gloves',         'level_requirement',         'flat',  1),
    ('heavy_gloves',         'strength_requirement',      'flat',  8),

    ('evasion_gloves',       'evasion_rating',            'flat', 25),
    ('evasion_gloves',       'level_requirement',         'flat',  1),
    ('evasion_gloves',       'dexterity_requirement',     'flat',  8),

    ('energy_shield_gloves', 'mana_max',                  'flat', 20),
    ('energy_shield_gloves', 'level_requirement',         'flat',  1),
    ('energy_shield_gloves', 'intelligence_requirement',  'flat',  8),

    -- ── Helmets ──────────────────────────────────────────────────────────────
    ('heavy_helmet',         'armor_rating',              'flat', 40),
    ('heavy_helmet',         'level_requirement',         'flat',  1),
    ('heavy_helmet',         'strength_requirement',      'flat', 10),

    ('evasion_helmet',       'evasion_rating',            'flat', 40),
    ('evasion_helmet',       'level_requirement',         'flat',  1),
    ('evasion_helmet',       'dexterity_requirement',     'flat', 10),

    ('energy_shield_helmet', 'mana_max',                  'flat', 30),
    ('energy_shield_helmet', 'level_requirement',         'flat',  1),
    ('energy_shield_helmet', 'intelligence_requirement',  'flat', 10),

    -- ── Jewellery ────────────────────────────────────────────────────────────
    -- Jewellery has no attribute requirements at base
    ('ring',                 'life_max',                  'flat', 10),
    ('ring',                 'mana_max',                  'flat', 10),
    ('ring',                 'level_requirement',         'flat',  1),

    ('amulet',               'life_max',                  'flat', 15),
    ('amulet',               'mana_max',                  'flat', 15),
    ('amulet',               'level_requirement',         'flat',  1),

    -- ── 1-Handed Weapons ─────────────────────────────────────────────────────
    -- attack_speed: multiplier (110 = 1.1x)
    ('one_h_sword',          'base_damage',               'flat', 11),
    ('one_h_sword',          'attack_speed',              'flat', 115),
    ('one_h_sword',          'level_requirement',         'flat',  1),
    ('one_h_sword',          'strength_requirement',      'flat',  8),
    ('one_h_sword',          'dexterity_requirement',     'flat',  4),

    ('one_h_axe',            'base_damage',               'flat', 12),
    ('one_h_axe',            'attack_speed',              'flat', 110),
    ('one_h_axe',            'level_requirement',         'flat',  1),
    ('one_h_axe',            'strength_requirement',      'flat', 10),

    ('one_h_mace',           'base_damage',               'flat', 13),
    ('one_h_mace',           'attack_speed',              'flat', 100),
    ('one_h_mace',           'level_requirement',         'flat',  1),
    ('one_h_mace',           'strength_requirement',      'flat', 12),

    ('dagger',               'base_damage',               'flat',  8),
    ('dagger',               'attack_speed',              'flat', 130),
    ('dagger',               'critical_strike_chance',    'flat',  6),
    ('dagger',               'level_requirement',         'flat',  1),
    ('dagger',               'dexterity_requirement',     'flat',  8),

    -- cast_speed for wand (100 = 1.0x baseline)
    ('wand',                 'base_damage',               'flat',  7),
    ('wand',                 'attack_speed',              'flat', 120),
    ('wand',                 'cast_speed',                'flat', 110),
    ('wand',                 'level_requirement',         'flat',  1),
    ('wand',                 'intelligence_requirement',  'flat', 10),

    -- ── 2-Handed Weapons ─────────────────────────────────────────────────────
    ('two_h_sword',          'base_damage',               'flat', 22),
    ('two_h_sword',          'attack_speed',              'flat', 100),
    ('two_h_sword',          'level_requirement',         'flat',  1),
    ('two_h_sword',          'strength_requirement',      'flat', 12),
    ('two_h_sword',          'dexterity_requirement',     'flat',  6),

    ('two_h_axe',            'base_damage',               'flat', 25),
    ('two_h_axe',            'attack_speed',              'flat',  95),
    ('two_h_axe',            'level_requirement',         'flat',  1),
    ('two_h_axe',            'strength_requirement',      'flat', 16),

    ('two_h_mace',           'base_damage',               'flat', 28),
    ('two_h_mace',           'attack_speed',              'flat',  90),
    ('two_h_mace',           'level_requirement',         'flat',  1),
    ('two_h_mace',           'strength_requirement',      'flat', 18),

    ('staff',                'base_damage',               'flat', 20),
    ('staff',                'attack_speed',              'flat',  95),
    ('staff',                'cast_speed',                'flat', 100),
    ('staff',                'level_requirement',         'flat',  1),
    ('staff',                'intelligence_requirement',  'flat', 14),

    ('bow',                  'base_damage',               'flat', 18),
    ('bow',                  'attack_speed',              'flat', 110),
    ('bow',                  'attack_range',              'flat', 10),
    ('bow',                  'level_requirement',         'flat',  1),
    ('bow',                  'dexterity_requirement',     'flat', 14),

    ('crossbow',             'base_damage',               'flat', 22),
    ('crossbow',             'attack_speed',              'flat',  95),
    ('crossbow',             'attack_range',              'flat',  8),
    ('crossbow',             'level_requirement',         'flat',  1),
    ('crossbow',             'strength_requirement',      'flat',  8),
    ('crossbow',             'dexterity_requirement',     'flat',  8),

    -- ── Off-hand ─────────────────────────────────────────────────────────────
    ('focus',                'mana_max',                  'flat', 20),
    ('focus',                'cast_speed',                'flat', 105),
    ('focus',                'level_requirement',         'flat',  1),
    ('focus',                'intelligence_requirement',  'flat', 10),

    ('quiver',               'accuracy_rating',           'flat', 20),
    ('quiver',               'level_requirement',         'flat',  1),
    ('quiver',               'dexterity_requirement',     'flat', 10),

    -- block_chance: percentage (15 = 15%)
    ('shield',               'armor_rating',              'flat', 30),
    ('shield',               'block_chance',              'flat', 15),
    ('shield',               'level_requirement',         'flat',  1),
    ('shield',               'strength_requirement',      'flat', 10)

) AS v(item_machine_name, stat_machine_name, combination_type, base_value)
JOIN item i ON i.machine_name = v.item_machine_name
JOIN stat s ON s.machine_name = v.stat_machine_name;
