# Sub-Atomic-7

A configuration-driven content management system for tabletop RPG content, built as a deliberate exercise in atomic architecture at a level of decomposition that most web applications never reach. The project's interesting claim is not the CMS it produces but the architectural discipline it practices: seven-layer separation of concerns with strict boundaries, write-once-share-everywhere composition across entities, and a single configuration layer that every other layer reads from at the moment it needs to act.

This README is written for a reader evaluating the project on its architectural merits rather than its feature completeness. The code works — five entities are modeled, the seven-layer pipeline runs end to end on both read and write paths, and the write-once-share-everywhere principle is operational rather than aspirational — but this is a personal architectural exploration, not a production system. The roadmap section names what is deliberately deferred and why, and the lessons-learned section names what earlier iterations got wrong. Both are honest rather than performative.

**Stack:** TypeScript · Bun · ElysiaJS · PostgreSQL

---

## Table of Contents

1. [What this project is and what it is not](#what-this-project-is-and-what-it-is-not)
2. [The architectural claim](#the-architectural-claim)
3. [Why seven layers and not three](#why-seven-layers-and-not-three)
4. [The write-once-share-everywhere principle](#the-write-once-share-everywhere-principle)
5. [Walking through a field: name as a tracer](#walking-through-a-field-name-as-a-tracer)
6. [Why atomic decomposition is a cognitive tool, not a framework convention](#why-atomic-decomposition-is-a-cognitive-tool-not-a-framework-convention)
7. [Stack rationale](#stack-rationale)
8. [Four iterations: the path here](#four-iterations-the-path-here)
9. [Lessons learned](#lessons-learned)
10. [Current state](#current-state)
11. [Roadmap](#roadmap)
12. [Getting started](#getting-started)
13. [Project structure](#project-structure)
14. [About this project](#about-this-project)

---

## What this project is and what it is not

Sub-Atomic-7 is a CMS for managing tabletop RPG content — game domains, subdomains, categories, subcategories, and modifiers, along with the lifecycle and relationships that connect them. That is the surface of the project. The substance underneath is an architectural investigation into how far configuration-driven design can be pushed before it collapses under its own abstraction weight, and what the cost is of refusing to let that collapse happen.

The project is not a framework, not a library, and not a template meant to be cloned and adapted for other domains. It is a single-developer exploration of one specific architectural idea applied to one specific content model, published publicly because the ideas it demonstrates are most valuable when other practitioners can read and criticize them. The code is not seeking contributors. The architecture is not up for community input. The reason the repository is public is that a system-architect-grade conversation can only happen when the code is visible, and the code exists to make the conversation possible.

The project is also not production-ready, and nothing in this README claims otherwise. Authentication, caching, observability, and audit logging are all absent from the current build. These absences are not oversights. Each of them is a cross-cutting concern that will eventually need to live across all seven layers, and introducing cross-cutting concerns into an architecture before the architecture itself is stable produces the kind of entanglement that makes systems unsupportable over time. The roadmap section names each of these concerns explicitly, names the concrete technology choice that will be used to implement it, and names what needs to be true of the foundation before work on that concern begins. None of the missing features will be difficult to build once the foundation can support them cleanly. Building them prematurely would be difficult and the result would be worse.

## The architectural claim

The central claim of Sub-Atomic-7 is that adding a new entity to the system should be a matter of writing configuration rather than writing code, and that changing an existing entity's behavior — its validation rules, its writable fields, its display formatting, its relationships to other entities — should be a matter of editing a single declaration that every layer picks up automatically on the next request. This claim is not about developer convenience. It is about eliminating the class of bugs that exists when the same concept is expressed in multiple places and those expressions are allowed to drift.

In a conventional web application, the rule that a user's name must be between three and a hundred characters long is typically stated at least three times: once in the browser-side validation JavaScript, once in the server-side request validation, and once implicitly in the database schema. These three statements of the same rule are maintained separately, and the discipline required to keep them synchronized is a discipline that decays over time. Every developer who has worked on a production web application for more than a few months has encountered the bug where the client happily accepts a value the server rejects, or the server accepts a value that violates the database constraint, or the database constraint changed and the validation code did not. The bug is not any developer's fault. It is the predictable consequence of expressing the same concept in multiple places that are free to drift.

The write-once-share-everywhere principle attacks this problem at its root. The rule is expressed exactly once, in the configuration layer. Every other layer — the browser, the server's request validator, the database's schema-validation pre-insert check, the HTML form's rendered `maxlength` attribute, the response formatter's display rules — reads from that single definition at the moment it needs to act. The rule cannot drift because there is only one rule. The three places become one place, and a category of bug that has plagued web development since the web began becomes structurally impossible.

Whether this is worth the architectural investment is a legitimate question. The investment is real — seven layers cost more to build and more to understand than three, and a configuration layer rich enough to drive every other layer is itself a non-trivial piece of infrastructure. The answer the project is testing is that for a system whose long-term cost is dominated by the cost of evolving and maintaining entities rather than the cost of initially defining them, the investment pays for itself within the first few iterations of the content model and compounds thereafter. The project is a prototype of that bet. The roadmap is a statement of what would need to be true for the bet to pay off in a real production context.

## Why seven layers and not three

The conventional web application is built on a three-layer separation that most developers learn as Model-View-Controller. This separation is useful and has stood up well over several decades of practice, but it conflates distinctions that turn out to matter when the architecture is under stress. Sub-Atomic-7 takes each of the three MVC layers and splits it into its constituent concerns, producing seven layers where traditional MVC has three. The split is not arbitrary — each new boundary corresponds to a real difference in responsibility that becomes visible the moment you try to reason carefully about what a given piece of code should and should not do.

The Model in traditional MVC is two things at once. It is the definition of what an entity is — its fields, its validation rules, its persistence schema — and it is the set of business operations that can be performed on entities, with the transactions and orchestration that make those operations safe. These two responsibilities are genuinely different. The definition is static and declarative; the operations are dynamic and procedural. Fusing them into a single "model" object means either that the object carries business logic that has no business being near the schema, or that the schema ends up scattered across operation implementations. Sub-Atomic-7 splits this into Layer 0 Configuration (the pure declarative definition) and Layer 1 Model (the primitives that act on a single record: validate, serialize, query-build), with Layer 2 Model Service sitting above both and carrying the business operations that compose Layer 1 primitives within transaction boundaries. This three-way split — definition, record primitives, business operations — is the minimum necessary to keep each concern legible on its own terms.

The View in traditional MVC is similarly overloaded. It is asked to both prepare the data for display and actually render the HTML, and the data-preparation work frequently bleeds into the templates themselves because the template is the most convenient place to put a small formatting transformation. The result is templates that are harder to test than they should be and data layers that know more about presentation than they should. Sub-Atomic-7 splits this into Layer 4 View Service (which reads Layer 0's display configuration and transforms raw entity data into the shape a template can render) and Layer 5 View (which composes pure HTML rendering primitives without any data-preparation logic). The split makes both sides testable in isolation and both sides stable against changes in the other.

The Controller in traditional MVC is the least overloaded of the three but still carries a boundary problem: the same code typically handles HTTP concerns (parsing requests, setting response headers, mapping errors to status codes) and dispatch concerns (deciding which business operation to invoke with which parameters). Sub-Atomic-7 keeps these together in Layer 3 Controller because separating them further would produce a layer too thin to justify its own existence, but it treats the controller as deliberately minimal — the HTTP surface, not the business layer. A route handler reads the writable-field policy from Layer 0 configuration, filters the incoming payload, and hands off to a Layer 2 service operation. It never contains business logic, because business logic has its own layer.

The final split is the one that conventional three-layer architectures do not make at all: the browser. In most web applications, client-side JavaScript is either an afterthought bolted onto the server-rendered output or a full separate application with its own stack and its own state management. Sub-Atomic-7 treats the browser as Layer 6 of the same atomic architecture, reading from the same Layer 0 configuration the server reads. This is the unusual move and it is where the write-once-share-everywhere principle pays its largest dividends, because it means client-side validation and server-side validation are not *similar* rules maintained in parallel — they are the *same rules* read from the same source. The browser is not a separate application that communicates with the server. It is the outermost layer of a single application that happens to have its outermost layer running in a different runtime.

Seven layers is not a number with mystical significance. It is the number that fell out when each of the overloaded MVC concerns was split along the boundary where it actually belonged. An architecture with six or eight layers would be possible, but seven is what this particular problem produced, and the number is load-bearing only in the sense that changing it would require either re-fusing responsibilities that benefit from being separated or separating responsibilities that benefit from being kept together. Neither move would make the architecture clearer.

## The write-once-share-everywhere principle

The principle is named deliberately to distinguish it from the more familiar DRY (don't repeat yourself) principle, which it superficially resembles and substantively differs from. DRY is about reducing duplication within a codebase. Write-once-share-everywhere is about eliminating the boundary condition where the same concept is allowed to exist in multiple architectural layers at all.

DRY applied to a conventional web application would say: extract the validation rules into a shared module and have both the client and the server import them. This is a good practice and it works, but it has an asymmetry that becomes important at scale. The shared module is code, which means it has to be compiled or bundled into both runtime contexts, which means either the client and server share a build toolchain (adding complexity) or the module has to be published separately and depended on (adding versioning overhead). The shared module also tends to grow beyond its original scope, accumulating utility functions that make sense on one side of the client-server boundary but not the other, until it becomes a junk drawer that neither side fully trusts.

Write-once-share-everywhere solves the same problem by a different route. Instead of extracting shared code, it extracts shared *data*. The field definition for `name` is not a function to be imported; it is a plain object with properties like `required: true`, `minLength: 3`, and `maxLength: 100`. This object is small, serializable, and context-free. The server reads it and uses it to validate requests. The client reads the same object — serialized as JSON at build or startup time — and uses it to validate forms. The HTML renderer reads it and uses it to set the `maxlength` attribute on the input element. The response formatter reads it and uses it to determine which fields are safe to return to the client. No code is shared. Data is shared, and each layer interprets the data according to its own local concerns.

The practical consequence of this shift is that every layer can be written in the style that suits it, against the runtime that suits it, without compromising the single source of truth. Server-side validation is a TypeScript function that operates on a typed object. Client-side validation is a minimal JavaScript module that operates on form elements. HTML rendering is a template literal that produces markup. These three things look nothing alike as code. They are fundamentally the same logic because they all read from the same declaration, and they can be kept fundamentally the same because the declaration they read is the only place the logic actually lives.

This is the shift that matters. Not less duplication — *no* duplication, architecturally enforced by the shape of the system rather than by developer discipline. The principle works at the level of architecture, not at the level of technique.

## Walking through a field: name as a tracer

The clearest way to understand what write-once-share-everywhere means in practice is to pick a single field and follow it through the system. The `name` field is present on every entity and appears in every layer, which makes it ideal for this purpose.

In Layer 0, `name` is declared once as a field atom. The declaration is plain configuration — the kind of thing a non-programmer could read — and it expresses every property of the field that any other layer might need to know:

```typescript
// Layer 0: authored once, consumed everywhere
export const nameField: FieldAtom = {
  name: 'name',
  type: 'string',
  required: true,
  minLength: 3,
  maxLength: 100,
  label: 'Name',
  writable: true,
};
```

This field atom is then composed into a molecule called `STANDARD_ENTITY_FIELDS` that groups the fields every entity shares — `name`, `description`, `is_active` — into a single reusable bundle. The molecule is consumed by every entity's configuration through a base factory, rather than being imported and spelled out individually each time an entity is defined. The consequence is that every entity in the system inherits the exact same `name` field without restating it, and changing the field's maximum length from 100 to 200 is a single edit that every entity picks up automatically.

Now watch the same field travel upward through the layers on a write path. A user opens a form in the browser and types a value into the name input. Before the form is submitted, Layer 6 reads the field configuration and runs client-side validation — it checks that the value is not empty, that it is at least three characters, and that it is not longer than a hundred. These rules are not hardcoded in the browser bundle; they are read from the same configuration the server will later consult. The form submits to an endpoint handled by Layer 3. The controller reads the writable-field policy from the same configuration — sees that `name` is marked `writable: true` — and includes it in the payload it passes to Layer 2. The service layer wraps the operation in a transaction and hands off to Layer 1, which reads the validation rules from the same configuration one more time, validates the incoming record against them, and writes to the database if validation passes. Three separate validation checks, in three different runtime contexts, all reading the same rules. Not similar rules. The same rules.

On the read path the same field travels back out. A request arrives at Layer 3 for an entity's details. The controller dispatches to Layer 2, which reads from the database through Layer 1. The resulting record passes to Layer 4, which reads the display configuration for `name` — the `label: 'Name'` and any format directives — and prepares a structure the template can render. Layer 5 composes that structure into HTML using small primitives like `formField` and `escapeHtml`. The HTML reaches the browser, where Layer 6 is ready to handle subsequent interactions with the same field using the same configuration it used for validation on the way in.

The field's journey through seven layers touches configuration four times on the way in and twice on the way out, and every one of those touches reads from the same declaration. The rule cannot drift. There is nowhere for it to drift to.

## Why atomic decomposition is a cognitive tool, not a framework convention

Atomic design as a term originated in front-end development to describe how reusable UI components could be composed from smaller UI components, and most developers who have encountered the term encountered it in that context. The framing is unfortunate because it suggests that atomic design is a technique for a specific kind of programming, when in fact the underlying idea — identify the smallest meaningful unit in a system, compose it upward with strict boundaries, and maintain the same compositional pattern at every scale — is a general-purpose cognitive tool for understanding any complex system at all.

A complex system is one in which no single person can hold every detail in their head at once. Every practitioner who works on such a system needs some mechanism for reasoning about parts of it without having to reason about the whole, and the quality of the system's architecture is largely a question of how well that mechanism works. Atomic decomposition offers a particularly good mechanism because it produces a legible hierarchy: at any given moment, the practitioner can zoom to a specific layer, and within that layer to a specific level (organisms, molecules, atoms, sub-atoms), and find a piece of code that does one thing, is small enough to understand in isolation, and has a clearly defined relationship to the code around it. The discipline of keeping that legibility intact is the architectural work. The framework is incidental.

What Sub-Atomic-7 pushes further than most atomic-design applications is the insistence on sub-atoms as a real compositional level, rather than treating atoms as the smallest unit. Most atomic-design codebases draw the line at the atom level because dividing smaller than that feels excessive. But a function like "validate that a string's length is within a range" is not an atom — it is a primitive operation that shows up inside validation logic across many different contexts (client-side form validation, server-side request validation, configuration schema validation), and treating it as a sub-atom that can be composed into different atoms for different contexts is what makes write-once-share-everywhere work at the validation level. The same argument applies to string escaping, to date formatting, to query-parameter extraction, to every small operation that keeps getting reinvented in codebases that stop decomposing one level too early.

Pushing decomposition to the sub-atom level has a cost. It produces more files, it requires more orchestration, and it makes the cognitive startup cost of contributing to the codebase higher — a new contributor has to understand the atomic vocabulary before they can meaningfully navigate the directory structure. Sub-Atomic-7 accepts this cost because the returns compound as the system grows: every new entity reuses sub-atoms that are already tested and trusted, every validation rule added to Layer 0 configuration is immediately enforced at every level without additional implementation work, and every change to a sub-atom propagates cleanly because the sub-atom's contract is narrow enough to reason about completely. The cost is paid once, at architecture time. The returns are collected continuously, at every subsequent increment of the system.

Whether this tradeoff is worth making is ultimately a judgment call about the expected longevity and evolution rate of the system. For a throwaway prototype, sub-atomic decomposition is overkill. For a system that will evolve over years with many entities added and many rules changed, it pays for itself within a few iterations. Sub-Atomic-7 is architecturally optimized for the latter case, which is also the case most enterprise systems actually find themselves in after a few years, regardless of what the original authors intended.

## Stack rationale

Every technology choice in this project was deliberate. The reasoning behind each one is worth naming, because choosing well at the stack level is itself an architectural act and the choices reveal what the architect prioritized.

**TypeScript** is the foundation because the atomic architecture depends heavily on precise type contracts between layers. Layer 0 configuration has a specific shape, and every layer that reads it needs to know that shape statically so the compiler can catch a mismatch at build time rather than letting it surface as a runtime error in production. TypeScript's structural typing and generic type system are particularly well-suited to this style, because they let the system express "a function that operates on any entity's configuration without knowing in advance which entity" in a way that preserves type safety end-to-end. The choice of TypeScript over plain JavaScript is not aesthetic — it is architectural, because the kind of verification TypeScript provides is the kind of verification this architecture depends on being possible.

**Bun** is the runtime because its startup time, built-in test runner, package manager, and hot-reload dev server together produce an iteration loop tight enough that the cost of running the full system is negligible. For a codebase whose discipline depends on bottom-up testing — sub-atoms first, then atoms, then molecules, then organisms — a runtime that punishes test-running is an architectural liability. Bun removes that friction almost entirely. It also has first-class TypeScript support without a separate build step, which eliminates a class of toolchain complexity that larger Node-based stacks tend to accumulate.

**ElysiaJS** is the HTTP framework because it provides type-safe routing without decorators, code generation, or runtime reflection. Routes are ordinary TypeScript functions, request and response types flow naturally through the type system, and the framework fits inside the atomic architecture without fighting it. Heavier frameworks like Nest or Fastify with their ecosystem of plugins tend to impose their own opinions about where business logic lives, and those opinions conflict with the strict layer boundaries this architecture requires. ElysiaJS is thin enough to be invisible when it should be and capable enough to handle the HTTP layer properly.

**PostgreSQL** is the database for reasons that go beyond its current use in the project. The immediate reasons are that it provides real transaction support, proper constraint enforcement, and a concurrency model appropriate for any system that will eventually see more than one user at a time. The architectural reasons, which matter more, are that Postgres supports the operational patterns the roadmap will eventually require: logical and physical replication for high availability, partitioning for large tables, sharding through extensions like Citus when horizontal scaling becomes necessary, and a mature ecosystem of backup and recovery tooling. Choosing Postgres now commits the project to a database that can grow into whatever production shape eventually becomes necessary, which is substantially easier than migrating later. The earlier iteration of the project used SQLite and eventually hit the point where the embedded-database tradeoff stopped making sense; Postgres is the considered choice that replaces it.

**TypeScript template literals** are used for server-side HTML rendering in Layer 5 instead of a heavier templating engine or JSX. The reasoning is that template literals are already a first-class language feature, they compose naturally with TypeScript's type system, and they avoid the complexity of introducing a separate rendering pipeline with its own conventions and tooling. For a system whose architectural center of gravity is "compose small primitives into larger primitives," template literals happen to be an ideal rendering primitive because they *are* small primitives by default and composition is the natural way to use them. An earlier iteration of the project used EJS templates, and the decision to move to template literals was the decision to let the rendering layer participate in the same architectural discipline as every other layer rather than standing outside it with its own conventions.

## Four iterations: the path here

Sub-Atomic-7 is the fourth iteration of this project. Each iteration exposed limitations in the previous one clearly enough that a new architecture became the honest response, and the full arc is worth naming because it shows the thinking that produced the current state rather than presenting the current state as if it arrived fully formed.

The first iteration was a conventional monolithic web application. Entities were defined directly in the code, each with its own model class, its own controller methods, and its own view templates. The architecture worked, in the sense that it produced a functioning CMS, but the cost of adding a new entity was high — each new entity required its own full stack of code, and most of that code was near-duplicate of the code for existing entities. Near-duplicate is worse than full-duplicate because it creates the illusion that the pieces are different when they are almost the same, which makes maintenance harder rather than easier.

The second iteration cleaned up the monolith into a three-layer MVC architecture with proper separation between models, controllers, and views. This was a meaningful improvement — the layers became reasonable to test in isolation, and the discipline of keeping business logic out of controllers and presentation logic out of models produced code that was substantially easier to reason about. But the duplication problem remained. Adding a new entity still required a new model, a new controller, and new templates, and the similarities between entities were still expressed as near-duplicate code rather than as shared structure.

The third iteration was the breakthrough. This was where atomic design entered the project, and where the realization took hold that the repeating structure across entities was not incidental duplication but architectural information that deserved to be named. Sub-atoms, atoms, molecules, and organisms became the vocabulary for describing that structure, and the directory layout of the project began to reflect compositional hierarchy rather than entity boundaries. But iteration three had a critical flaw: while the atomic vocabulary was in place, the code was still largely duplicated per entity. Each entity had its own atoms, its own molecules, its own organisms — the structure was clean, but the reuse was still manual and still decayed over time as entities drifted from each other.

The fourth iteration, which is the current state of Sub-Atomic-7, is where write-once-share-everywhere took hold as an explicit architectural commitment rather than an aspiration. The key insight was that the atomic structure of iteration three was correct, but the implementations at each level needed to be *universal* rather than entity-specific, consumed by entities through configuration reference rather than copied per entity. This required adding Layer 0 as a first-class architectural element — a configuration layer rich enough that every other layer could read from it and make entity-specific decisions without containing entity-specific code. Once Layer 0 was in place, the rest of the architecture could be rebuilt around shared universal primitives, and the duplication problem that had survived from iteration one through iteration three finally became structurally impossible.

The arc from iteration one to iteration four is the arc from "entities are implemented" through "entities are organized" through "entities are composed from clean primitives" to "entities are declared, and everything else is consequence." Each step exposed the limits of the previous one. The current iteration is not the end of the arc — iteration five will almost certainly expose limits in iteration four — but it is the point at which the architectural ideas the project was chasing from the beginning finally cohere into a system that does what the ideas promised.

## Lessons learned

Several things about earlier iterations were wrong in ways worth naming explicitly, because the lessons are more credible than retrospective triumph would be.

The monolith-to-MVC transition was oversold in my own thinking at the time. MVC felt like the answer to the monolith's problems, and for a while it was — the separation of concerns was real and the code became more legible. But I let MVC do more work than it could actually do. Three layers are not enough to carry the weight of a system with a rich content model, because the Model and the View each overload two genuinely different responsibilities, and the conflation eventually surfaces as code that does not belong where it lives. I spent longer inside MVC than I should have, defending the architecture rather than noticing it was leaking.

Atomic design as introduced in iteration three felt like the answer immediately, but I implemented it at the wrong level. I kept atoms as the smallest unit and treated sub-atoms as unnecessary overdecomposition. This was wrong, and it is the single biggest thing iteration three got wrong. Without sub-atoms, the atoms themselves have to contain primitive operations directly, which means primitive operations get reimplemented inside different atoms for different contexts, which reintroduces the duplication problem one level up from where it started. Pushing decomposition to the sub-atom level is not excess — it is the level at which primitive operations become genuinely shareable across contexts, and stopping at atoms is stopping one level too early.

The EJS-to-template-literals migration taught me something specific about framework adoption: heavier templating engines bring opinions that conflict with architectural discipline, and the convenience they offer is smaller than it looks because the parts of templating they automate are the parts you want to be explicit about. EJS felt productive at first, and for simple templates it was. But every template that needed conditional logic, or loop structure, or conditional inclusion of sub-templates ended up with EJS-flavored control flow that did not compose cleanly with the TypeScript code around it. Template literals felt more primitive, and were, but the primitiveness turned out to be the point — the rendering layer could participate in the same compositional discipline as every other layer, rather than standing apart with its own conventions.

The SQLite-to-Postgres migration taught me that "we can migrate later" is a lie developers tell themselves. The migration was not hard in the sense of requiring heroic engineering, but it did expose assumptions about the database that were not explicit enough to migrate cleanly — places where SQLite-specific behavior had leaked into the Model layer, places where the code assumed embedded-database semantics without saying so. Choosing the production-appropriate database early, even when the immediate needs could be met by something lighter, would have saved the cost of that migration. For iteration five and beyond, I will choose the production-appropriate technology at the start for every layer, on the theory that the cost of migrating later is always higher than the cost of running a heavier tool earlier.

The broader lesson across all four iterations is that architecture is not a thing you design once and then execute against. It is a thing you redesign each time the system teaches you something new about itself, and the discipline is knowing when to stop defending the current architecture and start listening to what the code is trying to tell you. Each iteration of Sub-Atomic-7 produced a moment where the current architecture stopped feeling like the right frame for the problem, and the right response was to rebuild rather than to patch. That willingness is the thing I want most to carry forward into iteration five, whenever the project earns it.

## Current state

Five entities are currently modeled and fully functional: `GameDomain`, `GameSubdomain`, `GameCategory`, `GameSubcategory`, and `Modifier`. Each supports the full set of CRUD operations through HTTP endpoints, each passes through the full seven-layer pipeline on both read and write paths, and each shares the same underlying primitive library without duplication. The Modifier entity is the most architecturally complex of the five because it carries its own sub-entities (tiers and bindings), and its implementation is the clearest demonstration that the universal primitive library can accommodate real complexity without requiring entity-specific exceptions.

The universal primitive library — the sub-atoms, atoms, and molecules that every entity composes — is substantially complete for the core operations. Validation, persistence, query building, HTML rendering, and browser-side form handling are all implemented through shared primitives. The claim that "adding the sixth entity would require almost no new code" is operational rather than theoretical: the next entity to be added will exercise this claim directly, and either validate it or expose gaps in the primitive library that need to be filled.

What is not present in the current build is every cross-cutting concern listed in the roadmap. The system has no authentication, no authorization, no caching, no audit logging beyond the modifier-specific history table, no backup automation, no security audit, no observability infrastructure, no rate limiting, and no internationalization. These absences are deliberate and are addressed individually in the roadmap section below.

## Roadmap

The roadmap is organized by priority rather than by timeline, because timelines for a personal project are more honestly expressed as "this is what comes next when I return to this project" than as dated commitments. Each item names the concrete technology choice that will be used and what condition needs to be true of the foundation before work on that item begins.

**Authentication and authorization.** Auth0 for identity, JWT for session representation. The architectural choice to defer auth until the foundation is stable is deliberate: authentication and authorization are cross-cutting concerns that need to be present at multiple layers simultaneously (route guarding at Layer 3, operation authorization at Layer 2, row-level access at Layer 1, and field-level access determined by Layer 0 configuration), and introducing them before the architectural shape of those layers is settled produces entanglement that is expensive to unwind later. With the layer structure now stable, auth integration is the next major piece of work. The authorization model will be permission-based rather than role-based, with permissions declared in Layer 0 configuration alongside field definitions and enforced uniformly at every layer that needs them.

**Caching.** Redis for the cache store. Three distinct caching concerns need different policies and will be addressed separately: read-through caching for expensive queries (particularly the materialized-view computations in Layer 4), HTTP response caching for public read endpoints, and Layer 0 configuration caching so that the single-source-of-truth lookups do not become a per-request cost. The architectural question that needs answering before implementation is the invalidation strategy, and that question is coupled to the audit model described below, so caching cannot land cleanly without the audit work being in place.

**Audit logging.** A dedicated audit model implemented as a cross-cutting concern with its own Layer 0 configuration, its own Layer 1 primitives, and integration hooks at Layer 2 that capture every mutation as an immutable event record. The existing `modifier_history` table is a narrower version of this pattern specific to modifier lifecycle events, and the generalized audit system will subsume it. The architectural interest of this work is that the audit system will itself be an entity in the sense that Sub-Atomic-7 uses the word — defined in Layer 0 configuration, implemented through the same universal primitives as every other entity, consumed through the same seven-layer pipeline — which is a useful test of whether the architecture generalizes to cross-cutting concerns cleanly or requires special-casing.

**Backup and restore.** Logical dumps via `pg_dump` for point-in-time recovery, physical replication via streaming replication for high availability. Recovery-point objective targeted at under one minute of data loss under normal operating conditions; recovery-time objective targeted at under fifteen minutes for single-node failure. These targets are appropriate for a system with the operational profile this project will eventually have, and revising them downward would require architectural changes (multi-region deployment, synchronous replication) that are not in scope for this iteration.

**Observability.** Structured logging at every layer with correlation IDs threaded through the full request pipeline, metrics exposed in Prometheus format, distributed tracing via OpenTelemetry. Error reporting to an aggregation service (Sentry or equivalent). Observability is the concern that is most commonly underinvested in during early development and most commonly regretted once the system is live, so building it in during the foundational work rather than retrofitting it later is a deliberate choice.

**Security hardening.** Input sanitization beyond current validation (particularly for any user-generated content that will eventually be rendered back to users), rate limiting at the HTTP layer, CSRF protection on mutation endpoints, Content Security Policy headers, secure cookie configuration, and a formal security audit of the complete seven-layer pipeline before any public-facing deployment. The architectural design of the system already prevents some classes of vulnerability by construction (SQL injection is structurally impossible because all queries pass through parameterized builders in Layer 1), but input handling and output escaping require explicit attention at each layer.

**Schema migrations.** Currently migrations are raw SQL files applied by hand. A proper migration tool with up-and-down migrations, transactional application, and integration with the Layer 0 configuration system so that changes to field definitions can generate corresponding schema migrations automatically. This is one of the more architecturally interesting future items because it would make Layer 0 not just the single source of truth for runtime behavior but also the single source of truth for schema evolution.

**Horizontal scaling.** Postgres was chosen partly because it supports the scaling patterns that would eventually be needed: table partitioning for large entities, logical replication for read replicas, and sharding via Citus when single-node capacity is exceeded. None of this is work for the immediate future, but the database choice preserves the option without requiring migration away from Postgres.

**Background jobs.** For any work that should not happen inside an HTTP request — scheduled maintenance tasks, bulk imports, long-running computations, notification dispatch. The likely choice is a lightweight job queue backed by Postgres rather than introducing a separate queueing system, on the principle that adding infrastructure components should require justification rather than being the default.

**Internationalization.** Layer 0 configuration is the natural home for locale-aware field labels, format strings, and display rules. The architectural integration is straightforward — field definitions grow a locale dimension — but the operational concern of managing translations across a growing content model is real work that requires dedicated attention.

**API versioning.** Once the system has external API consumers, versioning becomes necessary. The likely pattern is URL-prefixed versioning with version contracts expressed in Layer 0 configuration (each field carrying a `since` and optional `until` version), so that version-specific behavior is declared rather than implemented.

Each item in this roadmap is a cross-cutting concern that touches multiple layers. That is why the foundation work had to come first. With the seven-layer architecture stable and the universal primitive library substantially complete, the roadmap items can each be approached as integration work against a known foundation, rather than as architectural work that reshapes the foundation while introducing new concerns at the same time. That separation is the architectural payoff that justifies the deferrals.

## Getting started

The project assumes Bun is installed. Installation instructions for all supported platforms are at [bun.sh](https://bun.sh).

Clone the repository and install dependencies:

```bash
git clone https://github.com/bogdanmanea82/sub-atomic-7.git
cd sub-atomic-7
bun install
```

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

Start the Postgres container:

```bash
bun run db:up
```

Apply the SQL migrations from the `migrations/` directory in order using `psql` or your preferred Postgres client.

Start the development server:

```bash
bun run dev
```

The server starts at `http://localhost:3000` with hot reload.

### Scripts

| Command | Description |
|---|---|
| `bun run dev` | Development server with hot reload |

## Project structure

```
src/
├── config/           # Layer 0: field atoms, molecules, entity configs
├── model/            # Layer 1: validation, serialization, query builders
├── model-service/    # Layer 2: business operations, transaction boundaries
├── controller/       # Layer 3: ElysiaJS routes, HTTP surface
├── view-service/     # Layer 4: display data preparation
├── view/             # Layer 5: HTML rendering primitives and pages
├── browser/          # Layer 6: client-side validation and handlers
└── index.ts          # Server entry point

migrations/           # SQL migration files
public/               # Static assets and browser bundle output
```

Within each layer, the internal organization follows the same atomic pattern: `sub-atoms/` for single-concern primitives, `atoms/` for category orchestrators, `molecules/` for operation-level compositions, and `organisms/` for feature-level compositions. This repeating structure is itself a visual confirmation that the architectural discipline is consistent across layers — if it were not, the directory trees would not look identical.

## About this project

Sub-Atomic-7 is a personal project and a deliberate architectural exploration. It is maintained by a single developer. Issues and discussions are welcome, but there is no expectation of external contributions and the architectural direction is not up for community input.

The project serves two purposes that happen to align. It is a genuine learning laboratory — a place to work through TypeScript's type system, ElysiaJS patterns, PostgreSQL integration, and the broader question of how far configuration-driven architecture can be pushed before it collapses under its own abstraction weight. It is also a portfolio artifact that demonstrates how I think about integration architecture and layered system design, which is work I have been doing in one form or another since 1999 across LAMP, Magento orchestration, VoIP/SDK integration, BGP networking, and EV charging infrastructure. The vocabulary has changed across those eras. The underlying pattern — identify the right primitives, compose them cleanly, make the composition visible — has not.

The code is public because the ideas it demonstrates are most valuable when they can be read and criticized by other practitioners, not because it is seeking to become a shared codebase. A reader who finishes this README and disagrees with the architectural choices has understood the project. A reader who finishes this README and wants to apply some of the ideas to their own work has also understood the project. A reader who finishes this README thinking it is over-engineered for what it does is correct, in the specific sense that the architecture was chosen for a system much larger than the current one, and the current one is an exercise in getting the architecture right before the system is large. Whether the exercise is worth doing depends on whether the architect in question values the discipline of getting the shape right over the expedience of shipping quickly. This one does.
