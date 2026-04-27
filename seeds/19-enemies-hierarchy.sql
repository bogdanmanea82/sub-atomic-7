-- seeds/19-enemies-hierarchy.sql
-- Inserts the full enemy hierarchy: 1 domain → 5 subdomains → 19 categories → 58 subcategories.
--
-- Subdomains:        Beasts, Humanoids, Undead, Constructs, Aberrations
--
-- Beasts (16):       Mammals (4), Reptiles (3), Birds (3), Insects (3), Aquatic (3)
-- Humanoids (12):    Bandits (3), Cultists (3), Knights (3), Tribesmen (3)
-- Undead (12):       Skeletons (3), Zombies (3), Ghosts (3), Vampires (3)
-- Constructs (9):    Golems (3), Animated Objects (3), Mechanisms (3)
-- Aberrations (9):   Demons (3), Eldritch (3), Slimes (3)

-- ══════════════════════════════════════════════════════════════════════════════
-- Domain (1)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO game_domain (id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'enemies', 'Enemies', 'All enemy types that appear in the game world', 200, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subdomains (5)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO game_subdomain (id, game_domain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE machine_name = 'enemies'),
   'beasts',      'Beasts',      'Natural creatures — animals and wild monsters',            100, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE machine_name = 'enemies'),
   'humanoids',   'Humanoids',   'Intelligent humanoid enemies — bandits, soldiers, tribes',  200, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE machine_name = 'enemies'),
   'undead',      'Undead',      'Reanimated dead — skeletons, zombies, spectral entities',   300, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE machine_name = 'enemies'),
   'constructs',  'Constructs',  'Artificial animate beings — golems, automatons',            400, true, now(), now()),
  (gen_random_uuid(), (SELECT id FROM game_domain WHERE machine_name = 'enemies'),
   'aberrations', 'Aberrations', 'Unnatural entities — demons, eldritch horrors, slimes',    500, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Categories (19)
-- ══════════════════════════════════════════════════════════════════════════════

-- Beasts → Mammals, Reptiles, Birds, Insects, Aquatic (5)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   'mammals',  'Mammals',  'Fur-bearing creatures — wolves, bears, lions',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   'reptiles', 'Reptiles', 'Scaled creatures — lizardmen, serpents, drakes',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   'birds',    'Birds',    'Avian enemies — harpies, rocs, thunderbirds',        300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   'insects',  'Insects',  'Arthropod enemies — giant spiders, wasps, swarms',  400, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   'aquatic',  'Aquatic',  'Water-dwelling creatures — sea monsters, fishfolk', 500, true, now(), now());

-- Humanoids → Bandits, Cultists, Knights, Tribesmen (4)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   'bandits',   'Bandits',   'Outlaw fighters — cutthroats, brigands, chiefs',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   'cultists',  'Cultists',  'Dark worshippers — acolytes, priests, zealots',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   'knights',   'Knights',   'Armoured soldiers — footsoldiers, paladins',      300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   'tribesmen', 'Tribesmen', 'Primitive warriors — fighters, shamans, chiefs',  400, true, now(), now());

-- Undead → Skeletons, Zombies, Ghosts, Vampires (4)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   'skeletons', 'Skeletons', 'Animated bones — warriors, archers, mages',           100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   'zombies',   'Zombies',   'Reanimated corpses — shamblers, brutes',               200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   'ghosts',    'Ghosts',    'Spectral entities — wraiths, specters',                300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   'vampires',  'Vampires',  'Blood-drinking undead — thralls, lords, ancients',     400, true, now(), now());

-- Constructs → Golems, Animated Objects, Mechanisms (3)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   'golems',           'Golems',           'Magically animated stone or metal beings',     100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   'animated_objects', 'Animated Objects', 'Enchanted everyday objects turned hostile',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   'mechanisms',       'Mechanisms',       'Clockwork and steam-powered mechanical foes',  300, true, now(), now());

-- Aberrations → Demons, Eldritch, Slimes (3)
INSERT INTO game_category (id, game_domain_id, game_subdomain_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   'demons',   'Demons',   'Infernal beings from the dark planes',            100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   'eldritch', 'Eldritch', 'Alien horrors beyond mortal comprehension',       200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   'slimes',   'Slimes',   'Amorphous oozes and puddings — corrosive foes',  300, true, now(), now());

-- ══════════════════════════════════════════════════════════════════════════════
-- Subcategories (58 total)
-- ══════════════════════════════════════════════════════════════════════════════

-- Mammals → Wolf, Bear, Boar, Lion (4)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'mammals'),
   'wolf', 'Wolf', 'Pack hunter — fast, low damage, high in numbers',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'mammals'),
   'bear', 'Bear', 'Solitary predator — high health and stagger',      200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'mammals'),
   'boar', 'Boar', 'Aggressive charger — prone to charge attacks',     300, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'mammals'),
   'lion', 'Lion', 'Apex predator — high damage and pounce ability',   400, true, now(), now());

-- Reptiles → Lizardman, Serpent, Drake (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'reptiles'),
   'lizardman', 'Lizardman', 'Tribal scaled humanoid — weapon-wielding warrior',   100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'reptiles'),
   'serpent',   'Serpent',   'Giant snake — constriction and venom attacks',        200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'reptiles'),
   'drake',     'Drake',     'Wingless dragon kin — fire breath and tail swipe',   300, true, now(), now());

-- Birds → Harpy, Roc, Thunderbird (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'birds'),
   'harpy',       'Harpy',       'Flying humanoid predator — screech and dive',    100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'birds'),
   'roc',         'Roc',         'Colossal bird — can lift and drop enemies',      200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'birds'),
   'thunderbird', 'Thunderbird', 'Storm-wielding great eagle — lightning aura',    300, true, now(), now());

-- Insects → Giant Spider, Giant Wasp, Swarm (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'insects'),
   'giant_spider', 'Giant Spider', 'Web-spinning predator — poison and entanglement',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'insects'),
   'giant_wasp',   'Giant Wasp',   'Flying insect — sting venom and wing buffet',       200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'insects'),
   'swarm',        'Swarm',        'Mass of small insects — overwhelming numbers',      300, true, now(), now());

-- Aquatic → Sahuagin, Crab Warrior, Sea Witch (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'aquatic'),
   'sahuagin',    'Sahuagin',    'Fishfolk raider — trident and shark-calling',     100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'aquatic'),
   'crab_warrior', 'Crab Warrior', 'Armoured crustacean — high physical resistance', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'beasts'),
   (SELECT id FROM game_category  WHERE machine_name = 'aquatic'),
   'sea_witch',   'Sea Witch',   'Tidal spellcaster — curse and water attacks',     300, true, now(), now());

-- Bandits → Cutthroat, Brigand, Bandit Chief (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'bandits'),
   'cutthroat',   'Cutthroat',   'Light skirmisher — fast, high bleed chance',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'bandits'),
   'brigand',     'Brigand',     'Heavy fighter — armoured with two-handed weapon',  200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'bandits'),
   'bandit_chief', 'Bandit Chief', 'Leader with high stats and rally abilities',     300, true, now(), now());

-- Cultists → Acolyte, Dark Priest, Zealot (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'cultists'),
   'acolyte',    'Acolyte',    'Weak spellcaster — heals allies and casts curses',    100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'cultists'),
   'dark_priest', 'Dark Priest', 'Powerful cleric — summons undead and dark bolts',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'cultists'),
   'zealot',     'Zealot',     'Fanatic melee — sacrifices health for power',         300, true, now(), now());

-- Knights → Footsoldier, Paladin, Black Knight (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'knights'),
   'footsoldier',  'Footsoldier',  'Basic armoured infantryman — shield and sword',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'knights'),
   'paladin',      'Paladin',      'Holy warrior — healing aura and holy strikes',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'knights'),
   'black_knight', 'Black Knight', 'Cursed elite — high damage and fear aura',       300, true, now(), now());

-- Tribesmen → Tribal Warrior, Shaman, Chieftain (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'tribesmen'),
   'tribal_warrior', 'Tribal Warrior', 'Basic melee fighter — spear and bone armour',   100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'tribesmen'),
   'shaman',         'Shaman',         'Spirit caller — nature magic and totem buffs',  200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'humanoids'),
   (SELECT id FROM game_category  WHERE machine_name = 'tribesmen'),
   'chieftain',      'Chieftain',      'Tribe leader — empowers nearby tribesmen',       300, true, now(), now());

-- Skeletons → Skeleton Warrior, Skeleton Archer, Skeleton Mage (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'skeletons'),
   'skeleton_warrior', 'Skeleton Warrior', 'Sword-and-shield animated bone fighter',          100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'skeletons'),
   'skeleton_archer',  'Skeleton Archer',  'Ranged bone fighter — volley and kite',           200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'skeletons'),
   'skeleton_mage',    'Skeleton Mage',    'Spellcasting skeleton — bone spikes and curses',  300, true, now(), now());

-- Zombies → Shambler, Zombie Brute, Plague Carrier (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'zombies'),
   'shambler',      'Shambler',      'Standard zombie — slow but relentless',              100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'zombies'),
   'zombie_brute',  'Zombie Brute',  'Bloated corpse — high health and knockback slam',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'zombies'),
   'plague_carrier', 'Plague Carrier', 'Disease vector — spreads debuffs on contact',     300, true, now(), now());

-- Ghosts → Wraith, Specter, Poltergeist (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'ghosts'),
   'wraith',      'Wraith',      'Life-draining shade — phase through walls',        100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'ghosts'),
   'specter',     'Specter',     'Fear-inducing apparition — terror and possession',  200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'ghosts'),
   'poltergeist', 'Poltergeist', 'Object-hurling spirit — ranged debris attacks',    300, true, now(), now());

-- Vampires → Vampire Thrall, Vampire Lord, Ancient Vampire (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'vampires'),
   'vampire_thrall',  'Vampire Thrall',  'Dominated servant — fast melee and lifesteal',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'vampires'),
   'vampire_lord',    'Vampire Lord',    'Vampire noble — shapeshifts, bats, blood magic',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'undead'),
   (SELECT id FROM game_category  WHERE machine_name = 'vampires'),
   'ancient_vampire', 'Ancient Vampire', 'Millennia-old horror — peak resistances and aura',  300, true, now(), now());

-- Golems → Stone Golem, Iron Golem, Crystal Golem (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'golems'),
   'stone_golem',   'Stone Golem',   'Durable rock construct — high armour, slow',      100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'golems'),
   'iron_golem',    'Iron Golem',    'Heavy metal construct — high damage, magnetic',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'golems'),
   'crystal_golem', 'Crystal Golem', 'Gem construct — reflects spells, cuts on hit',    300, true, now(), now());

-- Animated Objects → Animated Armor, Flying Sword, Gargoyle (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'animated_objects'),
   'animated_armor', 'Animated Armor', 'Enchanted suit — high physical defence',         100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'animated_objects'),
   'flying_sword',   'Flying Sword',   'Levitating blade — fast and hard to target',     200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'animated_objects'),
   'gargoyle',       'Gargoyle',       'Stone sentinel — ambushes from stationary pose', 300, true, now(), now());

-- Mechanisms → Automaton, Steam Guardian, Clockwork Spider (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'mechanisms'),
   'automaton',        'Automaton',        'General-purpose clockwork soldier',               100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'mechanisms'),
   'steam_guardian',   'Steam Guardian',   'Boiler-powered heavy — vents scalding steam',    200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'constructs'),
   (SELECT id FROM game_category  WHERE machine_name = 'mechanisms'),
   'clockwork_spider', 'Clockwork Spider', 'Multi-legged mechanism — fast and swarms',        300, true, now(), now());

-- Demons → Imp, Demon Warrior, Pit Fiend (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'demons'),
   'imp',          'Imp',          'Weak demon minion — fire bolts and harassment',     100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'demons'),
   'demon_warrior', 'Demon Warrior', 'Hulking infernal fighter — flame-wreathed axe',   200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'demons'),
   'pit_fiend',    'Pit Fiend',    'Greater demon lord — multiple phases and aura',     300, true, now(), now());

-- Eldritch → Cultist Horror, Star Spawn, Elder Horror (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'eldritch'),
   'cultist_horror', 'Cultist Horror', 'Transformed worshipper — tentacles and madness',  100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'eldritch'),
   'star_spawn',     'Star Spawn',     'Alien invader — reality distortion attacks',      200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'eldritch'),
   'elder_horror',   'Elder Horror',   'Ancient alien entity — sanity drain and void',   300, true, now(), now());

-- Slimes → Green Slime, Black Pudding, Gelatinous Cube (3)
INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, machine_name, name, description, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'slimes'),
   'green_slime',     'Green Slime',     'Basic ooze — acid damage and split on kill',       100, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'slimes'),
   'black_pudding',   'Black Pudding',   'Corrosive sludge — destroys equipment on contact', 200, true, now(), now()),
  (gen_random_uuid(),
   (SELECT id FROM game_domain    WHERE machine_name = 'enemies'),
   (SELECT id FROM game_subdomain WHERE machine_name = 'aberrations'),
   (SELECT id FROM game_category  WHERE machine_name = 'slimes'),
   'gelatinous_cube', 'Gelatinous Cube', 'Room-filling ooze — engulfs and digests prey',    300, true, now(), now());
