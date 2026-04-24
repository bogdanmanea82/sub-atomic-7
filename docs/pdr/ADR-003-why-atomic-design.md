# ADR-003: Why Atomic Design Architecture

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

Use a **seven-layer atomic architecture** (L0 Configuration → L6 Browser) with strict
unidirectional dependencies and sub-atom → atom → molecule → organism composition within
each layer.

---

## Context

Earlier versions of the codebase bundled logic across concerns. Validation lived in
controllers. Display logic lived in services. Database queries lived in route handlers.

When a bug appeared, it was impossible to isolate without reading large, mixed-concern
files. When a field type changed, five different places needed updating because each layer
had its own copy of the field's constraints.

The decision was to restructure the entire system around a single principle:
**single responsibility at every level, unidirectional dependencies, configuration as
the single source of truth.**

---

## Rationale

**Localised changes.** Because each layer depends only downward, a change in L3 (Controller)
cannot propagate upward and break L5 (View). There is no shared mutable state across layers —
only shared configuration (L0) that all layers read.

**Write-once-share-everywhere.** Universal sub-atoms (field constraints, serializers,
validators) are defined once in `src/config/universal/` and `src/model/universal/`. Adding
a new entity doesn't require writing a new validator — the universal validator reads the
entity's L0 config and applies the rules automatically.

**Config-driven behaviour.** L0 Configuration is not documentation — it is active instruction.
When a field's `required` flag changes in L0, L1 validation, L3 schema, and L6 browser
validation all update automatically without code changes.

**Sub-atom → atom → molecule → organism.** The internal composition hierarchy within each
layer enforces the same principle recursively. An atom orchestrates sub-atoms but implements
no logic itself. If you use "and" to describe what an atom does, it is two atoms that need splitting.

---

## Trade-offs

| Trade-off | Assessment |
|---|---|
| More files and more indirection than a flat structure | Worthwhile — changes stay localised; finding the right file is predictable once the pattern is understood |
| New contributors face a steeper initial learning curve | Mitigated by PDR-002 (layer reference) and the fact that all seven layers follow the same internal structure |
| Some operations require touching multiple layers | This is a feature, not a bug — it makes the scope of a change explicit |

---

## Consequences

- Every new entity follows the same 7-layer structure; no entity is "special"
- The `BaseEntityConfigFactory` template method enforces L0 contract compliance at compile time
- Layer violations (e.g., importing a controller from a model) are immediately visible
  in import statements and caught by code review
- The pattern scales: adding a new entity type (EnemyModifier) requires only new files in
  each layer — no modifications to existing files
