# ADR-005: Why GraphQL is Deferred (not added immediately)

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

**Defer GraphQL to game implementation time.** The CMS layer (all five current entities)
stays REST. GraphQL will be added additively when the first game runtime entities exist.

---

## Context

The project's ultimate consumer is a game engine (Unity or Godot) that needs to query
deeply nested game data: zones with enemies with abilities with modifier effects. This is
a textbook GraphQL use case.

The question at hand was: add GraphQL now (while building the CMS) or defer it until the
game runtime entities exist?

---

## Rationale

**There are no game runtime entities yet.** The five current entities (GameDomain,
GameSubdomain, GameCategory, GameSubcategory, ItemModifier) are CMS authoring entities.
A game engine never fetches a list of game domains directly — it fetches zones, enemies,
and loot tables that *reference* the taxonomy hierarchy. Those entities don't exist yet.

Building a GraphQL schema for entities that don't exist is speculative engineering. The
schema would need to be redesigned when the actual game entities are built. The deferral
costs nothing.

**Zero migration cost at deferral time.** When GraphQL is added:
- L2 service methods (`findById`, `findMany`) become resolvers with no rewrite
- The REST routes are untouched — GraphQL is mounted at `/graphql` additively
- All five CMS entities will need GraphQL types too (modifiers are referenced at runtime),
  but those types are derived from the same L0 config that already drives REST schemas

**CMS = REST is the right permanent architecture.** The CMS HTML rendering and AJAX calls
(bindings management) are REST-native. There is no benefit to replacing them with GraphQL
mutations. The hybrid design — CMS as REST, game runtime as GraphQL — is not a stepping
stone but the intended final state.

---

## Trade-offs

| Trade-off | Assessment |
|---|---|
| Two API surfaces (REST + GraphQL) to maintain | Intentional. They serve different clients with different requirements |
| GraphQL mutations (creating game content from the game client) are not possible until Phase B | Acceptable — the game client is read-only in the prototype; mutations come from the CMS |
| Deferral means the GraphQL layer is not designed yet | This is correct — premature GraphQL schema design would need revision anyway |

---

## When to Revisit

This decision should be revisited when:
1. The first game runtime entity (Zone, Enemy, or Ability) is being designed, OR
2. A Unity/Godot prototype client is being built and needs a data API

At that point, the GraphQL addition follows the plan documented in PDR-007.

---

## Consequences

- `GET /openapi` documents the REST API only — no GraphQL schema
- The CMS browser layer (`src/browser/`) continues to use `fetchJson()` for AJAX calls
  against REST endpoints
- L2 services are written to be transport-agnostic now — the GraphQL resolver wrapper
  when it comes will be trivially thin
