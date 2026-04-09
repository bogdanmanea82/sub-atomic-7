# AGENTS.md - Agent Guidelines for Sub-Atomic-7

## Essential Commands

### Build & Development
- `bun run dev` - Development server with hot reload
- `bun run start` - Production server
- `bun run typecheck` - TypeScript strict mode type checking (REQUIRED after changes)

### Testing
- `bun test` - Run all tests
- `bun test --watch` - Run tests in watch mode
- `bun test path/to/specific.test.ts` - Run single test file

### Database
- `bun run db:up` - Start PostgreSQL via Docker
- `bun run db:down` - Stop PostgreSQL
- `bun run db:logs` - View database logs

## Architecture Overview

This is a seven-layer atomic design framework with strict layer boundaries:

| Layer | Path Alias | Purpose | Dependencies |
|-------|------------|---------|-------------|
| 0 - Configuration | `@config/*` | Pure data, field specs | None |
| 1 - Model | `@model/*` | Validation, queries, no framework | Config |
| 2 - Model Service | `@model-service/*` | Business workflows, transactions | Config, Model |
| 3 - Controller | `@controller/*` | HTTP handling (ElysiaJS) | All lower layers |
| 4 - View Service | `@view-service/*` | Display preparation | Config |
| 5 - View | `@view/*` | HTML rendering | Config, View Service |
| 6 - Browser | Client-side state | Shared Config |

**CRITICAL:** Layers only depend downward. Never import upward.

## Code Style Guidelines

### Imports
- Use path aliases defined in tsconfig.json
- Group imports: external libs → internal aliases → relative imports
- No `export *` - use named exports only
- Import sub-atoms directly, never through re-exports

```typescript
// ✅ Correct
import { validateRequired } from "../sub-atoms/validation/validate-required";
import type { EntityConfig } from "@config/types";

// ❌ Wrong
import * as validation from "../sub-atoms/validation";
import { EntityConfig } from "../../../config/types";
```

### Naming Conventions
- **Files:** kebab-case (`id-field-atom.ts`, `validate-entity.ts`)
- **Constants:** UPPER_SNAKE_CASE (`ID_FIELD_ATOM`, `DISPLAY_FORMATS`)
- **Functions:** camelCase with descriptive verbs (`validateEntity`, `buildQuery`)
- **Types:** PascalCase for interfaces/types (`ValidationErrors`, `ValidatedData`)
- **Sub-atoms:** include type suffix (`validate-string-length.ts`, `serialize-datetime.ts`)

### TypeScript Requirements
- **Strict mode fully enabled** - all type checking active
- Use `as const` for configuration objects that shouldn't be modified
- Prefer readonly types: `readonly [fieldName: string]: string`
- Always type function parameters and return values
- Use discriminant unions for field.type switching

### Atomic Design Patterns

#### Sub-atoms (smallest units)
- Single responsibility functions
- No framework dependencies
- Pure functions when possible
- Export individual functions, not objects

#### Atoms
- Coordinate sub-atoms but don't implement logic
- Handle orchestration and error collection
- Import sub-atoms directly, never through index files

#### Molecules
- Combine atoms into cohesive functionality
- May contain simple business logic
- Still framework-independent

### Error Handling
- Collect multiple validation errors before throwing
- Use Error augmentation for structured error data:
```typescript
const error = new Error("Validation failed");
(error as Error & { errors: ValidationErrors }).errors = errors;
throw error;
```
- Always include field name in validation error messages
- Use specific error types for different failure modes

### Configuration Patterns
- Use `...FIELD_MARKERS.system` and `...DISPLAY_FORMATS.hidden` spreads
- Auto-generated fields should have `autoGenerate: true`
- All configuration must be `as const` for type inference
- Include descriptive comments explaining field purpose

### File Organization
- **Sub-atoms:** `layer/universal/sub-atoms/category/`
- **Atoms:** `layer/universal/atoms/` 
- **Molecules:** `layer/universal/molecules/`
- **Types:** `config/types/` for shared interfaces
- **Index files:** Only for re-exporting related functionality

### Testing Requirements
- Test files: `*.test.ts` in same directory as implementation
- Test both success and failure cases
- Test type edge cases (null, undefined, wrong types)
- Use Bun test framework

## Verification Workflow

After ANY code changes:
1. Run `bun run typecheck` - must pass with zero errors
2. Run relevant tests with `bun test path/to/specific.test.ts`
3. Only proceed if both pass cleanly

## Common Anti-Patterns to Avoid

- ❌ Layer boundary violations (importing upward)
- ❌ Business logic in Configuration layer
- ❌ Framework dependencies in Model layer
- ❌ Missing explicit return types
- ❌ Using `any` instead of proper typing
- ❌ Export * from index files
- ❌ Complex nested logic in sub-atoms

## Learning Resources

For architectural guidance, refer to `.claude/skills/`:
- `atomic-design-patterns/` - Architecture decisions
- `typescript-syntax-tutor/` - Implementation examples  
- `typescript-foundations/` - Syntax clarification

When unsure about where code belongs, consult the layer guides in `.claude/layers/` or ask: "Which layer should this logic belong in?"