-- seeds/11-stats.sql
-- Authoritative stat registry: 23 stats covering attributes, resources,
-- offensive, defensive, and utility dimensions.
--
-- data_type values: raw (integer is final value), percentage (integer = %),
--                   multiplier (integer / 100 = multiplier, 100 = 1.0x)
-- value_min / value_max: valid range for this stat's stored integer
-- default_value: baseline before any modifiers are applied
--
-- Subsequent seeds reference stats by machine_name lookup:
--   (SELECT id FROM stat WHERE machine_name = 'fire_resistance')

INSERT INTO stat (id, machine_name, name, data_type, value_min, value_max, default_value, category, created_at, updated_at)
VALUES

  -- ── Attributes ───────────────────────────────────────────────────────────
  (gen_random_uuid(), 'strength',     'Strength',     'raw', 1,    999,    10,  'attribute', now(), now()),
  (gen_random_uuid(), 'dexterity',    'Dexterity',    'raw', 1,    999,    10,  'attribute', now(), now()),
  (gen_random_uuid(), 'intelligence', 'Intelligence', 'raw', 1,    999,    10,  'attribute', now(), now()),

  -- ── Resources ────────────────────────────────────────────────────────────
  (gen_random_uuid(), 'life_max',    'Maximum Life',        'raw',        1,    100000, 50,  'resource', now(), now()),
  (gen_random_uuid(), 'mana_max',    'Maximum Mana',        'raw',        0,    100000, 40,  'resource', now(), now()),
  (gen_random_uuid(), 'life_regen',  'Life Regeneration',   'raw',        0,    10000,  0,   'resource', now(), now()),
  -- mana_regen: percentage of max mana per second; 175 = 1.75%
  (gen_random_uuid(), 'mana_regen',  'Mana Regeneration',   'percentage', 0,    1000,   175, 'resource', now(), now()),

  -- ── Offensive ────────────────────────────────────────────────────────────
  (gen_random_uuid(), 'base_damage',                'Base Damage',                'raw',        0,    100000, 5,   'offensive', now(), now()),
  -- attack_speed: multiplier; 100 = 1.0x, 110 = 1.1x
  (gen_random_uuid(), 'attack_speed',               'Attack Speed',               'multiplier', 10,   1000,   100, 'offensive', now(), now()),
  (gen_random_uuid(), 'cast_speed',                 'Cast Speed',                 'multiplier', 10,   1000,   100, 'offensive', now(), now()),
  (gen_random_uuid(), 'critical_strike_chance',     'Critical Strike Chance',     'percentage', 0,    100,    5,   'offensive', now(), now()),
  -- crit multiplier: 150 = 150% (1.5x). Stored as percentage integer.
  (gen_random_uuid(), 'critical_strike_multiplier', 'Critical Strike Multiplier', 'percentage', 100,  1000,   150, 'offensive', now(), now()),
  (gen_random_uuid(), 'accuracy_rating',            'Accuracy Rating',            'raw',        0,    100000, 0,   'offensive', now(), now()),
  (gen_random_uuid(), 'attack_range',               'Attack Range',               'raw',        1,    100,    1,   'offensive', now(), now()),

  -- ── Defensive ────────────────────────────────────────────────────────────
  (gen_random_uuid(), 'armor_rating',        'Armor Rating',        'raw',        0,    100000, 0,   'defensive', now(), now()),
  (gen_random_uuid(), 'evasion_rating',      'Evasion Rating',      'raw',        0,    100000, 0,   'defensive', now(), now()),
  (gen_random_uuid(), 'block_chance',        'Block Chance',        'percentage', 0,    75,     0,   'defensive', now(), now()),
  -- Resistances: floor -100 (curses/debuffs can push below zero)
  (gen_random_uuid(), 'fire_resistance',      'Fire Resistance',      'percentage', -100, 75,     0,   'defensive', now(), now()),
  (gen_random_uuid(), 'cold_resistance',      'Cold Resistance',      'percentage', -100, 75,     0,   'defensive', now(), now()),
  (gen_random_uuid(), 'lightning_resistance', 'Lightning Resistance', 'percentage', -100, 75,     0,   'defensive', now(), now()),
  (gen_random_uuid(), 'chaos_resistance',     'Chaos Resistance',     'percentage', -100, 75,     0,   'defensive', now(), now()),

  -- ── Utility ──────────────────────────────────────────────────────────────
  -- movement_speed: multiplier; 100 = 1.0x
  (gen_random_uuid(), 'movement_speed',  'Movement Speed',  'multiplier', 10,   1000,   100, 'utility', now(), now()),
  (gen_random_uuid(), 'stun_threshold',  'Stun Threshold',  'raw',        1,    100000, 50,  'utility', now(), now());
