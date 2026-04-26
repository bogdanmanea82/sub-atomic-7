-- seeds/12-characters.sql
-- Three playable character archetypes: Warrior, Hunter, Wizard.
-- IDs are stable gen_random_uuid() — referenced by 13-character-stat-bases.sql
-- via (SELECT id FROM character WHERE machine_name = '...') lookups.

INSERT INTO character_class (id, machine_name, name, description, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'warrior', 'Warrior',
   'A resilient melee fighter who excels in close combat. High life and armour, moderate strength-based offence.',
   true, now(), now()),

  (gen_random_uuid(), 'hunter', 'Hunter',
   'An agile ranged fighter who relies on speed and precision. High evasion and dexterity, strong ranged offence.',
   true, now(), now()),

  (gen_random_uuid(), 'wizard', 'Wizard',
   'A powerful spellcaster who channels elemental forces. High mana and energy shield, strong spell damage.',
   true, now(), now());
