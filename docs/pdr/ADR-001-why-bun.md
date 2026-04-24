# ADR-001: Why Bun (not Node.js)

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

Use **Bun** as the JavaScript runtime, bundler, and test runner.

---

## Context

The project needed a runtime that could:
- Execute TypeScript natively without a separate compilation step
- Bundle the client-side browser code without a separate bundler config
- Run tests without installing a separate test framework
- Integrate with PostgreSQL via a driver that works in the Bun environment

The prototype goal is fast iteration. Every additional tool in the chain (transpiler, bundler,
test runner) is another configuration surface that can break.

---

## Rationale

Bun provides all four requirements in a single binary:
- `bun run` — executes TypeScript directly, no `ts-node` or `tsc --watch` needed
- `bun build` — bundles the browser entry point (`src/browser/main.ts → public/main.js`)
- `bun test` — runs the test suite with built-in test runner
- PostgreSQL driver (`postgres` package) — compatible with Bun's module system

The development workflow collapses to two commands:
```
bun run dev    — start the server with hot reload
bun test       — run all tests
```

No webpack config, no Jest config, no Babel config. For a prototype, this is the right
trade-off.

---

## Trade-offs

| Trade-off | Assessment |
|---|---|
| Bun is younger than Node.js — some packages have Bun-specific edge cases | Acceptable — the packages in use (ElysiaJS, postgres) are Bun-first or well-tested on Bun |
| Bun's module resolution differs from Node's in edge cases | Has not caused issues in this project |
| WSL2 compatibility | Works correctly; no Linux-specific workarounds needed beyond HTTPS for git push |

---

## Consequences

- `bun.lock` replaces `package-lock.json` / `yarn.lock`
- Scripts in `package.json` assume `bun` is available in PATH
- Test files use `import { describe, it, expect } from "bun:test"` (not Jest globals)
- The browser bundle is `public/main.js` produced by `bun build`
