# PDR-001: Vision & Scope

**Status:** Active  
**Last updated:** 2026-04-27

---

## What is sub-atomic-7?

Sub-atomic-7 is a prototype **Content Management System for RPG game data**. It provides a
structured way to author, organise, and relate the hierarchical entities that define a role-playing
game world — game domains, subdomains, categories, subcategories, stats (measurable attributes),
character classes (player archetypes with configurable stat sheets), items (game objects scoped
to the hierarchy that carry modifier rolls), and the modifiers that define what gameplay effects
each item can have.

This is not a game engine. It does not simulate gameplay, resolve dice rolls, or manage player
state. It is the authoring layer that produces well-structured, relational game data which a
game engine can later consume.

---

## The Game Concept

An RPG game world is organised as a strict five-level taxonomy:

```
Game Domain
  └── Game Subdomain
        └── Game Category
              └── Game Subcategory
                    └── Item Modifier
```

**Example path:** Fantasy World → Items → Weapons → 1-Handed Swords → STR Requirement Modifier

This hierarchy is not cosmetic. Each level scopes the entities below it through foreign-key
relationships in the database. A modifier declared at the Subcategory level belongs exclusively
to that subcategory's context. The taxonomy is the primary organising principle of the entire
system.

**Modifiers are the atomic unit of game behavior.** A modifier encodes a single, measurable
effect: how much damage a weapon adds, how much movement speed a boot reduces, how many
hit points a ring grants. Every item, enemy, zone, or spell ultimately derives its behavior
from the modifiers associated with it.

The **binding system** is where game rules are encoded as data. A binding declares that a
specific modifier is eligible (or ineligible) in a specific subcategory. This is how the rule
"Poison Damage can only appear on Wands" is expressed: a binding record, not a code condition.

---

## Prototype Goals

The prototype is considered **operationally complete** when:

1. The full five-level taxonomy is authorable through the CMS UI
2. The modifier system supports tiers (value ranges per progression level), bindings
   (eligibility scoping), and lifecycle management (active/deactivated/archived)
3. The factory pattern is proven extensible — a second modifier type (e.g., EnemyModifier)
   can be added without modifying any existing entity code
4. The API is documented and machine-readable (OpenAPI at `/openapi`)
5. The architecture is documented and navigable by a new contributor

The prototype does not need to:
- Handle production traffic volumes
- Implement advanced authentication or authorisation
- Support a live game client (that is the next phase)

---

## What is Explicitly Out of Scope

| Topic | Why Out of Scope |
|---|---|
| Production operations (monitoring, SLAs, on-call) | Prototype phase — these concerns belong to a hardening phase |
| Player-facing runtime API | Game runtime entities (Zone, Enemy, Ability) don't exist yet; GraphQL addition is deferred (see PDR-007) |
| Authentication hardening | Current auth is placeholder; production auth is a separate phase |
| AssetTemplate pattern and non-item asset types | The `Item` entity (first concrete asset type) is complete. The AssetTemplate pattern (shared modifier pool declarations) and additional asset types (Enemy assets, Spell assets, Zone assets) remain deferred (see PDR-006) |
| Full EnemyModifier vertical (L1–L6) | EnemyModifierBinding infra is complete; full EnemyModifier entity (brainstorm needed first) |
| Zone, Spell, Map modifier types | Extension of the proven factory pattern; deferred after EnemyModifier |
| Deployment pipeline / CI | Outside prototype scope |

---

## Related Documents

- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — how the system is structured internally
- [PDR-003: Database Design](PDR-003-database-design.md) — the relational model behind the taxonomy
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — deep dive into the core game mechanic
- [PDR-008: Roadmap](PDR-008-roadmap.md) — what comes after the prototype is stable
