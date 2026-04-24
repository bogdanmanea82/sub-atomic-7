# ADR-002: Why ElysiaJS (not Express / Fastify / Hono)

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

Use **ElysiaJS** as the HTTP framework.

---

## Context

The project needed an HTTP framework that:
- Is TypeScript-native (not retrofitted with types)
- Integrates with TypeBox for schema-based validation
- Can generate OpenAPI documentation from route schemas
- Works efficiently with Bun (ideally Bun-first)
- Keeps the controller layer thin — no framework magic in business logic

---

## Rationale

ElysiaJS is designed for Bun and TypeScript from the start. Key properties:

**End-to-end type inference.** When a route declares a TypeBox schema, the handler receives
a typed `body` parameter — no cast, no `as` assertion. The type flows from the schema declaration
into the handler and through to the response type.

**TypeBox integration.** ElysiaJS uses TypeBox (`t.Object`, `t.String`, `t.Numeric`, etc.)
as its schema system. TypeBox schemas are standard JSON Schema-compatible objects at runtime,
which means they double as OpenAPI schema definitions with zero conversion overhead.

**OpenAPI generation.** The `@elysiajs/openapi` plugin reads the TypeBox schemas already
declared on routes and produces a valid OpenAPI 3.0 spec. No separate API documentation
tool required — the schemas that validate requests also document them.

**Plugin composition.** ElysiaJS routes are composed via `.use()` — the same pattern as
the rest of the codebase's atomic composition approach. Middleware (auth, error handling,
validation) is a plugin, not a global interceptor.

---

## Trade-offs

| Trade-off | Assessment |
|---|---|
| Smaller ecosystem than Express/Fastify | Acceptable — the project doesn't depend on framework-specific middleware libraries |
| `Context` import causes type integrity loss | Solved with structural typing (see PDR-002 and PDR-007) |
| Framework is relatively new — API surface may change | The layer architecture isolates framework coupling to L3 only; a framework swap would touch only controller files |
| `set.status` is optional (`status?:`) not required — a subtle TypeScript gotcha | Documented and solved; all handler factories use `{ status?: number \| string }` |

---

## Consequences

- All HTTP coupling is confined to Layer 3 (`src/controller/`)
- Handler factories use structural typing, never `import type { Context } from "elysia"`
- OpenAPI documentation is generated automatically from route schemas — no separate
  documentation step
- Adding a new entity's routes requires only a new entry in `src/controller/entities/`
  following the established pattern
