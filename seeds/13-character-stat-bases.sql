-- seeds/13-character-stat-bases.sql
-- 69 junction rows: 3 character classes × 23 stats.
--
-- base_value follows stat data_type conventions:
--   multiplier stats (attack_speed, cast_speed, movement_speed): 100 = 1.0x
--   percentage stats (mana_regen): 175 = 1.75% per second
--   raw stats: value is the final integer
--
-- combination_type is 'flat' for all character class bases — base stat values
-- combine as direct additions before any multipliers are applied.
--
-- Uses a VALUES table joined to character and stat by machine_name,
-- so this file remains correct even if UUIDs are regenerated.

INSERT INTO character_stat_base (id, character_id, stat_id, combination_type, base_value, created_at, updated_at)
SELECT
  gen_random_uuid(),
  c.id,
  s.id,
  v.combination_type,
  v.base_value,
  now(),
  now()
FROM (
  VALUES
    -- ── Warrior ─────────────────────────────────────────────────────────────
    ('warrior', 'strength',                   'flat', 32),
    ('warrior', 'dexterity',                  'flat', 14),
    ('warrior', 'intelligence',               'flat', 14),
    ('warrior', 'life_max',                   'flat', 50),
    ('warrior', 'mana_max',                   'flat', 40),
    ('warrior', 'life_regen',                 'flat',  0),
    ('warrior', 'mana_regen',                 'flat', 175),
    ('warrior', 'base_damage',                'flat',  8),
    ('warrior', 'attack_speed',               'flat', 100),
    ('warrior', 'cast_speed',                 'flat', 100),
    ('warrior', 'critical_strike_chance',     'flat',   5),
    ('warrior', 'critical_strike_multiplier', 'flat', 150),
    ('warrior', 'accuracy_rating',            'flat',   0),
    ('warrior', 'attack_range',               'flat',   1),
    ('warrior', 'armor_rating',               'flat',  10),
    ('warrior', 'evasion_rating',             'flat',   0),
    ('warrior', 'block_chance',               'flat',   0),
    ('warrior', 'fire_resistance',            'flat',   0),
    ('warrior', 'cold_resistance',            'flat',   0),
    ('warrior', 'lightning_resistance',       'flat',   0),
    ('warrior', 'chaos_resistance',           'flat',   0),
    ('warrior', 'movement_speed',             'flat', 100),
    ('warrior', 'stun_threshold',             'flat',  50),

    -- ── Hunter ──────────────────────────────────────────────────────────────
    ('hunter', 'strength',                   'flat', 20),
    ('hunter', 'dexterity',                  'flat', 32),
    ('hunter', 'intelligence',               'flat', 14),
    ('hunter', 'life_max',                   'flat', 42),
    ('hunter', 'mana_max',                   'flat', 45),
    ('hunter', 'life_regen',                 'flat',  0),
    ('hunter', 'mana_regen',                 'flat', 175),
    ('hunter', 'base_damage',                'flat',  6),
    ('hunter', 'attack_speed',               'flat', 110),
    ('hunter', 'cast_speed',                 'flat', 100),
    ('hunter', 'critical_strike_chance',     'flat',   6),
    ('hunter', 'critical_strike_multiplier', 'flat', 150),
    ('hunter', 'accuracy_rating',            'flat',  10),
    ('hunter', 'attack_range',               'flat',  10),
    ('hunter', 'armor_rating',               'flat',   0),
    ('hunter', 'evasion_rating',             'flat',  15),
    ('hunter', 'block_chance',               'flat',   0),
    ('hunter', 'fire_resistance',            'flat',   0),
    ('hunter', 'cold_resistance',            'flat',   0),
    ('hunter', 'lightning_resistance',       'flat',   0),
    ('hunter', 'chaos_resistance',           'flat',   0),
    ('hunter', 'movement_speed',             'flat', 100),
    ('hunter', 'stun_threshold',             'flat',  42),

    -- ── Wizard ──────────────────────────────────────────────────────────────
    ('wizard', 'strength',                   'flat', 14),
    ('wizard', 'dexterity',                  'flat', 14),
    ('wizard', 'intelligence',               'flat', 32),
    ('wizard', 'life_max',                   'flat', 34),
    ('wizard', 'mana_max',                   'flat', 60),
    ('wizard', 'life_regen',                 'flat',  0),
    ('wizard', 'mana_regen',                 'flat', 225),
    ('wizard', 'base_damage',                'flat',  4),
    ('wizard', 'attack_speed',               'flat',  90),
    ('wizard', 'cast_speed',                 'flat', 110),
    ('wizard', 'critical_strike_chance',     'flat',   5),
    ('wizard', 'critical_strike_multiplier', 'flat', 150),
    ('wizard', 'accuracy_rating',            'flat',   0),
    ('wizard', 'attack_range',               'flat',   1),
    ('wizard', 'armor_rating',               'flat',   0),
    ('wizard', 'evasion_rating',             'flat',   0),
    ('wizard', 'block_chance',               'flat',   0),
    ('wizard', 'fire_resistance',            'flat',   0),
    ('wizard', 'cold_resistance',            'flat',   0),
    ('wizard', 'lightning_resistance',       'flat',   0),
    ('wizard', 'chaos_resistance',           'flat',   0),
    ('wizard', 'movement_speed',             'flat', 100),
    ('wizard', 'stun_threshold',             'flat',  34)

) AS v(character_name, stat_name, combination_type, base_value)
JOIN character_class c ON c.machine_name = v.character_name
JOIN stat s ON s.machine_name = v.stat_name;
