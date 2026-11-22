# Code QA.md

## Universal Quality Assurance Instructions for AI-Assisted / Vibe-Coded Applications

> **Purpose:** This file defines the minimum QA, testing, verification, regression, security, and release discipline that every coding agent must follow when building or modifying an application.
>
> Use this alongside the **Universal App Building Instructions** and any project-specific product requirements.
>
> These instructions are not optional unless a rule is explicitly marked as project-dependent.

---

# 1. Core Philosophy

AI-generated code must never be trusted simply because:

- it compiles,
- it looks reasonable,
- the UI appears correct,
- one manual test passed,
- the agent says the task is complete,
- or the generated diff seems small.

The standard is:

> **Do not trust the code. Trust the verification system surrounding the code.**

The agent should operate inside a deliberate QA gauntlet made up of:

1. explicit requirements,
2. constraints,
3. acceptance criteria,
4. automated tests,
5. security and permission checks,
6. regression tests,
7. quality gates,
8. production verification,
9. targeted human review where risk is high,
10. documentation of what changed and what was verified.

Code review is useful, but it must not be the only mechanism protecting the product.

---

# 2. Relationship to the Universal App Building Instructions

The **Universal App Building Instructions** govern how the product is understood and built.

This file governs how changes are verified.

The two should work together:

```text
Understand the problem
        ↓
Define the smallest safe change
        ↓
Define expected behaviour
        ↓
Classify risk
        ↓
Implement
        ↓
Run QA gauntlet
        ↓
Fix failures
        ↓
Verify affected critical flows
        ↓
Verify production where applicable
        ↓
Document outcome
```

No meaningful implementation task is complete until the applicable QA steps in this file have been satisfied.

---

# 3. General Agent Behaviour

For every coding task, the agent must:

- inspect the relevant existing implementation before editing,
- understand the intended user behaviour,
- identify affected components and flows,
- classify the risk of the change,
- define or confirm acceptance criteria,
- make the smallest safe change,
- add or update tests where behaviour changes,
- run applicable verification checks,
- fix failures before continuing,
- confirm regressions were not introduced,
- document what was tested,
- clearly state anything that was not tested.

The agent must never silently assume that a feature works.

The agent must never report a task as complete based only on code generation.

---

# 4. Risk Classification

Before implementation, classify the change as:

## LOW RISK

Examples:

- copy changes,
- labels,
- spacing,
- styling,
- non-functional visual adjustments,
- static content updates,
- simple presentational changes.

Minimum verification:

- build or compile check where applicable,
- visual/manual verification,
- affected-flow regression check.

---

## MEDIUM RISK

Examples:

- forms,
- CRUD behaviour,
- ordinary application state,
- navigation,
- data display,
- filtering,
- search,
- non-sensitive API interactions,
- local business logic,
- ordinary user-facing workflows.

Minimum verification:

- relevant unit/component tests,
- integration verification,
- error-state testing,
- affected-flow regression tests,
- production build check where applicable.

---

## HIGH RISK

Examples:

- authentication,
- authorization,
- permissions,
- payments,
- subscriptions,
- financial calculations,
- billing,
- database migrations,
- destructive operations,
- private user data,
- file access,
- external integrations,
- production configuration,
- infrastructure,
- public API contracts,
- AI actions with consequential outcomes,
- eligibility logic,
- scoring,
- progression rules,
- irreversible state transitions.

Minimum verification:

- unit tests,
- integration tests,
- critical-flow / end-to-end tests,
- edge-case testing,
- permission/security testing,
- regression testing,
- production build verification,
- rollback consideration,
- targeted human review,
- mutation testing where deterministic critical logic is involved.

When uncertain, choose the higher risk category.

---

# 5. Constraints Before Implementation

For every meaningful task, identify the constraints the implementation must respect.

Constraints may include:

## Product Constraints

Examples:

```text
A learner must not access a locked module.

A user must not submit the same assessment twice unless retakes are allowed.

A customer must not withdraw more than their available balance.
```

## Architectural Constraints

Examples:

```text
Frontend components must not access privileged database credentials.

Business logic must remain in the service layer.

Existing public API contracts must remain backward compatible.
```

## Security Constraints

Examples:

```text
Authorization must be enforced server-side.

Service-role credentials must never be exposed to the client.

Private files must not be accessible through predictable public URLs.
```

## Data Constraints

Examples:

```text
A migration must preserve existing records.

A failed payment must not create a successful subscription state.

Deleted parent records must not orphan dependent records unexpectedly.
```

## Process Constraints

Examples:

```text
Do not proceed while tests are failing.

Do not silently install new dependencies.

Do not change unrelated files.

Do not modify schema without an explicit migration.

Do not suppress errors simply to make tests pass.
```

The agent must treat these constraints as non-negotiable unless the product owner explicitly changes them.

---

# 6. Acceptance Criteria

Before coding, the expected result must be clear enough to test.

Acceptance criteria should cover, where relevant:

- visible user behaviour,
- successful path,
- invalid input,
- empty states,
- loading states,
- failure states,
- retries,
- permissions,
- data persistence,
- expected side effects,
- analytics events,
- external integration behaviour,
- mobile/responsive behaviour,
- accessibility requirements.

Weak:

```text
Users can upload documents.
```

Better:

```text
A signed-in user can upload a supported document.

Unsupported file types are rejected with a clear error.

Oversized files are rejected before processing.

The uploaded file is associated with the correct user.

Another user cannot access the file.

If the upload fails, no partial database record remains.

The user can retry without refreshing the page.
```

If acceptance criteria are unclear and materially affect implementation, the agent should ask before making irreversible decisions.

---

# 7. Gherkin / Behavioural Scenarios

For core journeys and high-risk workflows, express important behaviour using:

- **Given** — starting state
- **When** — user/system action
- **Then** — expected outcome

Example:

```gherkin
Feature: Submit assignment

Scenario: Enrolled student submits before deadline
  Given the student is enrolled
  And the assignment is open
  When the student uploads a valid submission
  Then the submission is stored
  And the student sees confirmation
  And the submission belongs to the correct student

Scenario: Unenrolled user attempts submission
  Given the user is not enrolled
  When the user calls the submission endpoint
  Then the request is rejected
  And no submission record is created
```

Use behavioural scenarios especially for:

- signup,
- onboarding,
- payments,
- subscriptions,
- purchases,
- financial transactions,
- assessments,
- course progression,
- permissions,
- admin actions,
- AI-assisted decisions,
- file access,
- destructive operations.

Where the project supports automated end-to-end testing, convert important scenarios into executable tests.

---

# 8. Testing Layers

Do not rely on one type of test.

Use the correct layer for the problem.

---

## 8.1 Unit Tests

Unit tests verify small pieces of deterministic logic.

Use them for:

- calculations,
- pricing,
- scoring,
- validation,
- eligibility,
- permissions,
- formatting logic,
- state transitions,
- parsers,
- data transformations,
- business rules.

Example:

```ts
expect(calculatePrice(100000, 0.05)).toBe(105000);
```

A unit test should assert meaningful behaviour.

Merely executing a function is not a useful test.

---

## 8.2 Component Tests

Use component tests where UI behaviour contains meaningful logic.

Test:

- form validation,
- button states,
- conditional rendering,
- loading states,
- error states,
- accessibility behaviour,
- key interactions.

Do not over-test trivial styling.

---

## 8.3 Integration Tests

Integration tests verify that components work together.

Examples:

- API + database,
- authentication + route protection,
- payment provider + application state,
- file upload + storage + database record,
- AI request + parser + persistence,
- frontend form + backend endpoint.

Integration tests should verify both success and failure cases.

---

## 8.4 End-to-End / Critical-Flow Tests

E2E tests verify real user journeys.

Examples:

```text
Sign up → verify account → complete onboarding.

Create course → publish → learner opens → submits assignment.

Checkout → payment success → entitlement granted.

Admin disables user → user loses protected access.

Candidate completes assessment → score stored → report visible.
```

E2E tests should focus on critical user journeys, not every possible interaction.

---

# 9. Critical-Flow Registry

Every serious project should maintain a list of flows that must remain healthy.

Recommended file:

```text
docs/testing/CRITICAL_FLOWS.md
```

Example:

```text
CF-01 User signs up
CF-02 User signs in
CF-03 User resets password
CF-04 User completes onboarding
CF-05 User performs the product's primary action
CF-06 User sees saved result
CF-07 User returns and sees persisted state
CF-08 Unauthorized user is denied protected access
CF-09 Admin performs core admin action
CF-10 Payment/subscription state updates correctly
```

For every meaningful code change:

1. identify affected critical flows,
2. run or verify them,
3. report their status.

Do not say "regression tested" without identifying what was actually checked.

---

# 10. Regression Testing

A new feature is not successful if it breaks an old one.

After meaningful changes:

- identify neighbouring functionality,
- rerun affected tests,
- rerun applicable critical flows,
- verify previously working behaviour remains intact,
- check for unintended schema/API changes,
- inspect likely downstream consumers.

Common regression risks:

- route changes,
- shared component changes,
- auth changes,
- schema changes,
- state-management changes,
- global CSS,
- shared utilities,
- dependency upgrades,
- API response changes,
- permission changes.

Fix regressions before continuing to unrelated work.

---

# 11. Error-State Testing

Agents naturally optimize for the happy path.

QA must deliberately test failure.

For every meaningful flow, ask:

- What if the network fails?
- What if the API returns 4xx?
- What if the API returns 5xx?
- What if the response is malformed?
- What if the request times out?
- What if the user double-clicks?
- What if the resource no longer exists?
- What if state changed in another tab?
- What if the database write partially fails?
- What if the external service is unavailable?
- What if the user has insufficient permission?
- What if the user submits invalid or unexpected input?

Failures should be:

- contained,
- understandable,
- recoverable where possible,
- non-destructive,
- logged appropriately.

---

# 12. Security and Permission QA

Security must be tested as behaviour.

Do not assume a hidden UI element equals authorization.

Always verify server-side protection.

For protected operations, test at least:

```text
Authorized user → allowed.

Unauthorized user → denied.

Wrong-role user → denied.

Unauthenticated user → denied.

Tampered request → denied.

Direct API call bypassing UI → denied.
```

Also verify:

- secrets are not client-exposed,
- logs do not leak sensitive data,
- user input is validated,
- file uploads are restricted,
- destructive endpoints require authorization,
- object-level access is enforced,
- tenant boundaries cannot be crossed,
- admin privileges cannot be forged,
- private data is not cached or publicly exposed unintentionally.

Security failures are release blockers.

---

# 13. Database and Migration QA

Schema changes are high-risk.

Before applying a migration:

- inspect current schema,
- understand dependent code,
- verify data assumptions,
- determine backward-compatibility requirements,
- define rollback or recovery approach.

Test:

- migration succeeds on representative data,
- existing records remain valid,
- new constraints do not unexpectedly reject old data,
- defaults behave correctly,
- nullability assumptions are safe,
- indexes are appropriate,
- foreign-key behaviour is intentional,
- destructive changes are explicitly approved.

Never delete or rewrite production data merely to make a migration easier.

---

# 14. External Integration QA

For external services such as:

- payment providers,
- email,
- SMS,
- authentication providers,
- analytics,
- AI APIs,
- storage providers,
- calendars,
- webhooks,
- third-party SaaS APIs,

verify:

- credentials/configuration,
- successful request,
- failure response,
- retry behaviour,
- timeout behaviour,
- idempotency where relevant,
- duplicate webhook handling,
- stale-event handling,
- signature verification where applicable,
- correct state transitions,
- user-safe error messaging.

Never assume the external service behaves perfectly.

---

# 15. AI Feature QA

AI features require additional testing because outputs are probabilistic.

Test:

- valid output,
- malformed output,
- missing fields,
- hallucinated information,
- refusal behaviour,
- timeout,
- provider error,
- unsafe or inappropriate output,
- prompt injection where relevant,
- unexpected language,
- extremely long input,
- empty input,
- inconsistent output format.

Where AI output affects consequential actions:

- use deterministic validation before acting,
- constrain output schemas,
- enforce permissions independently of the model,
- do not let the model override hard business rules,
- require human confirmation where appropriate.

AI output must never be the sole authorization mechanism.

---

# 16. Test Coverage Policy

Coverage is useful, but coverage alone is not proof of quality.

Coverage answers:

> "Did tests execute this code?"

It does not answer:

> "Would the tests detect that the behaviour is wrong?"

Use coverage as a signal for untested areas.

Prefer branch coverage over vanity line coverage for business logic.

Suggested risk-based guidance:

## Critical Logic

Examples:

- finance,
- payments,
- permissions,
- scoring,
- eligibility,
- subscriptions,
- progression,
- destructive safeguards.

Target:

```text
Near-complete branch coverage wherever practical.
```

## General Application Logic

Maintain a reasonable project-defined baseline.

## Presentation-Only Code

Do not create meaningless tests purely to increase coverage.

Coverage must never replace:

- meaningful assertions,
- integration tests,
- end-to-end tests,
- security checks,
- mutation testing,
- manual UX verification.

Do not chase 100% coverage for its own sake.

---

# 17. Mutation Testing

Mutation testing verifies the strength of the tests themselves.

A mutation testing tool deliberately changes source code, for example:

```ts
balance >= amount
```

to:

```ts
balance > amount
```

or:

```ts
price * 1.05
```

to:

```ts
price * 0.05
```

Then the tests are rerun.

## Mutation Killed

A test fails.

Good: the test suite noticed the defect.

## Mutation Survived

Tests still pass.

This suggests:

- the behaviour is not tested,
- the assertion is weak,
- the test is exercising code without validating it,
- an important edge case is missing.

Use mutation testing especially for deterministic critical logic:

- pricing,
- financial calculations,
- permissions,
- assessment scoring,
- progression,
- eligibility,
- subscription state,
- destructive-operation safeguards.

Mutation testing does not necessarily need to run after every tiny change.

It may run:

- on critical modules in CI,
- before major releases,
- nightly,
- after changes to high-risk business logic.

Surviving mutations in critical logic must be:

1. reviewed,
2. killed with stronger tests,
3. or explicitly justified.

---

# 18. Quality Gates

A task must not be marked complete until all applicable gates have passed.

Recommended standard sequence:

```text
1. Formatting
2. Linting
3. Static type checking
4. Unit tests
5. Component tests where relevant
6. Integration tests
7. Critical-flow / E2E tests
8. Security and permission checks
9. Production build
10. Regression checks
11. Manual UX verification
12. Production verification where deployed
13. Documentation / PED update
```

Every gate should be reported as one of:

```text
PASS
FAIL
NOT APPLICABLE
NOT RUN — reason required
```

Never hide a skipped check.

---

# 19. Stop Conditions

The agent must stop feature work and resolve the problem first when:

- the build fails,
- type checking fails,
- required tests fail,
- a critical flow breaks,
- authentication is unreliable,
- authorization can be bypassed,
- production deployment fails,
- a migration is unsafe,
- data corruption is detected,
- a critical integration is broken,
- unexpected destructive behaviour occurs,
- secrets are exposed,
- high-severity security issues are found.

Do not continue layering new features onto an unstable foundation.

---

# 20. Human Review Triggers

Automated tests reduce the need to inspect every generated line, but some changes still require targeted human review.

Human review is required or strongly recommended for:

- authentication,
- authorization,
- payment logic,
- financial formulas,
- database migrations,
- destructive operations,
- secret management,
- encryption,
- public API contracts,
- infrastructure,
- production deployment configuration,
- major architecture changes,
- consequential AI behaviour,
- security-sensitive code.

Human review should focus on:

- decision correctness,
- architecture,
- dangerous assumptions,
- diff boundaries,
- permission model,
- data impact,
- test evidence,
- rollback path.

This does not require manually reading every line generated by the agent.

---

# 21. Manual UX Verification

Automated tests are not enough for user-facing changes.

Where relevant, manually verify:

- mobile layout,
- desktop layout,
- touch interactions,
- keyboard navigation,
- focus states,
- loading states,
- empty states,
- errors,
- disabled states,
- success confirmations,
- responsive breakpoints,
- long text,
- small screens,
- accessibility basics.

The feature should not merely function.

It should be understandable and usable.

---

# 22. Production Build Verification

Before declaring release readiness:

- run the production build,
- resolve build warnings that indicate real defects,
- verify environment-variable expectations,
- ensure no development-only dependency is required at runtime,
- ensure routes resolve correctly,
- ensure static assets load,
- ensure server/client boundaries are correct,
- verify production configuration where possible.

"Works in development" is not equivalent to "works in production."

---

# 23. Production Verification

After deployment, verify the actual deployed system where applicable.

Check:

- deployment succeeded,
- application loads,
- critical route works,
- core API works,
- authentication works,
- primary user action works,
- logs show no new critical errors,
- monitoring/analytics are receiving events,
- external integrations are functioning.

For high-risk releases, also verify the rollback mechanism.

Never claim production success without checking production.

---

# 24. Observability and Logging

Important systems should fail visibly.

Use appropriate:

- error logging,
- structured server logs,
- application monitoring,
- integration logs,
- job status tracking,
- metrics,
- alerts.

Do not:

- swallow exceptions silently,
- log secrets,
- log passwords,
- log access tokens,
- expose sensitive user data unnecessarily.

A system that cannot reveal failure is difficult to QA.

---

# 25. Performance QA

For performance-sensitive changes, verify:

- load time,
- API latency,
- repeated database queries,
- unnecessary re-renders,
- oversized bundles,
- expensive loops,
- unbounded queries,
- memory leaks,
- missing cleanup,
- large file handling,
- background task behaviour.

Do not optimize prematurely.

But do not ship obvious scalability defects.

---

# 26. Accessibility QA

For user-facing interfaces, check:

- semantic HTML,
- labels,
- keyboard access,
- visible focus,
- sufficient contrast,
- descriptive controls,
- form errors,
- screen-reader meaning,
- modal focus handling,
- image alt text where applicable.

Accessibility defects affecting core flows should be treated as product defects, not cosmetic issues.

---

# 27. Dependency QA

Before adding or upgrading a dependency:

- verify it is actually necessary,
- prefer existing project capabilities where reasonable,
- inspect compatibility,
- inspect maintenance status,
- consider bundle/runtime impact,
- consider security implications.

After dependency changes:

- reinstall cleanly where practical,
- run build,
- run tests,
- verify critical flows.

Never add dependencies simply because generated code used them.

---

# 28. Bug-Fix Rule

When fixing a reproducible bug:

1. reproduce the bug,
2. identify root cause,
3. add a regression test when practical,
4. make the smallest safe fix,
5. verify the test fails before the fix where feasible,
6. verify the test passes after the fix,
7. rerun affected critical flows.

Do not merely patch the visible symptom if the root cause remains.

---

# 29. QA for Destructive Operations

Operations such as:

- delete,
- revoke,
- cancel,
- refund,
- reset,
- overwrite,
- purge,
- downgrade,
- remove access,

require special testing.

Verify:

- correct authorization,
- confirmation where appropriate,
- correct target resource,
- idempotency or safe retry,
- dependent data behaviour,
- auditability,
- recovery/undo where required,
- user feedback.

Accidental destructive behaviour is a release blocker.

---

# 30. Definition of Done

A task is only done when:

- the intended behaviour is implemented,
- acceptance criteria are satisfied,
- applicable automated tests pass,
- security boundaries are verified,
- affected critical flows pass,
- regressions are checked,
- production build passes,
- manual UX verification is complete where relevant,
- deployment is verified where applicable,
- documentation is updated,
- unresolved risks are explicitly reported.

Code existing in the repository does not mean the task is done.

---

# 31. Product Evolution Document (PED) / Project Documentation

After meaningful changes, update the project's PED or equivalent engineering/product log.

Record:

- what changed,
- why it changed,
- affected components,
- affected critical flows,
- architectural decisions,
- schema changes,
- dependencies added,
- bugs discovered,
- failures encountered,
- fixes applied,
- tests added,
- QA performed,
- known limitations,
- technical debt,
- follow-up work,
- rollback considerations where relevant.

Documentation must reflect reality.

Do not record tests as passed if they were not run.

---

# 32. Required Completion Report

At the end of every meaningful coding task, the agent must provide a concise completion report.

Use this structure:

```text
TASK
What was requested.

IMPLEMENTED
What changed.

FILES / COMPONENTS
Key files or systems affected.

RISK
Low / Medium / High.

TESTS ADDED OR UPDATED
List tests.

QA RESULTS
Formatting: PASS / N/A
Lint: PASS / N/A
Type check: PASS / N/A
Unit tests: PASS / N/A
Integration tests: PASS / N/A
E2E / Critical flows: PASS / N/A
Security / permissions: PASS / N/A
Production build: PASS / N/A
Manual UX: PASS / N/A
Production verification: PASS / N/A

CRITICAL FLOWS VERIFIED
List the exact flows checked.

KNOWN LIMITATIONS
Anything still unresolved.

NOT TESTED
Anything that could not be tested and why.

DOCUMENTATION
PED/docs updated: Yes / No.

READY
Ready / Not ready.
```

Never use vague statements such as:

```text
Everything should work now.
```

Prefer evidence:

```text
All 42 tests pass.
Production build completed successfully.
CF-02, CF-04 and CF-07 were verified.
Unauthorized API access returns 403.
Mobile flow tested at 375px width.
```

---

# 33. Recommended Agent Workflow

Use this workflow for every meaningful change:

```text
1. Understand the task.
2. Inspect existing implementation.
3. Identify affected flows.
4. Classify risk.
5. Define constraints.
6. Define acceptance criteria.
7. Write/update tests where appropriate.
8. Implement the smallest safe change.
9. Run relevant automated checks.
10. Test failure and edge cases.
11. Test permissions/security.
12. Run affected critical flows.
13. Fix regressions.
14. Run production build.
15. Perform manual UX checks.
16. Run mutation testing for critical deterministic logic where applicable.
17. Perform targeted human review for high-risk changes.
18. Deploy only when gates pass.
19. Verify production where applicable.
20. Update PED/docs.
21. Produce completion report.
```

---

# 34. Final Rule

The agent's job is not merely to produce code.

The agent's job is to produce **verified behaviour**.

The governing principle is:

> **Instructions constrain the agent.  
> Tests verify behaviour.  
> Security checks protect boundaries.  
> Critical-flow tests protect the product.  
> Mutation tests verify test strength.  
> Quality gates determine whether work may proceed.  
> Human review covers consequential decisions.  
> Production verification proves the release actually works.**

When in doubt, prefer a smaller verified change over a larger unverified one.
