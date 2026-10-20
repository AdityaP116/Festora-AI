# Implementation Plan
## Festora AI

## Phase 0 — Repository audit
- Inspect existing source, package scripts, dependencies, environment files and Git status.
- Preserve existing work.
- Identify whether Firebase and Gemini are already configured.
- Report facts, risks, missing requirements and recommended next steps.
- Do not rewrite files until the audit and plan are approved or the user has explicitly asked for autonomous implementation.

Exit criteria: repository baseline and commands are documented.

## Phase 1 — Foundation
- Configure linting, TypeScript and routing.
- Build responsive layout and design primitives.
- Set up Firebase client initialization.
- Add environment example and safe configuration handling.
- Define core types and validation schemas.

Exit criteria: app builds, routes work, no secrets committed.

## Phase 2 — Authentication and event CRUD
- Implement sign-up/sign-in/sign-out.
- Implement protected routes.
- Add event creation, listing, edit and archive/delete behavior.
- Implement Firestore rules and emulator tests.

Exit criteria: user can create and reopen their own event; isolation tests pass.

## Phase 3 — AI planning vertical slice
- Add server-side Gemini secret.
- Implement generation function, input schema and output schema.
- Add prompt, bounded error handling and rate limits.
- Display plan proposal and review.
- Save versioned plan after acceptance.

Exit criteria: real or controlled provider response flows securely into the UI and is persisted only after validation.

## Phase 4 — Tasks, timeline and budget
- Implement task CRUD and status transitions.
- Implement budget categories and expense records.
- Add deterministic calculation functions.
- Build event overview, task list and budget UI.
- Test edge cases and persistence.

Exit criteria: all core calculations and task changes are verified.

## Phase 5 — P1 features
- Vendors and quote records.
- Guest list and RSVP.
- Targeted plan revisions and review-before-apply.
- Export/print.
- Warnings and filters.

Exit criteria: each feature has tests and documented limitations.

## Phase 6 — Hardening and deployment
- Security review and rules tests.
- Build and test production bundle.
- Configure hosting and functions.
- Verify secrets, domains, quotas, billing alerts and logs.
- Run end-to-end acceptance suite.
- Update README and known limitations.

Exit criteria: deployment works and acceptance criteria in `PRD.md` and `TEST_PLAN.md` pass.

## Prioritization rule

A complete, tested vertical slice is more valuable than many disconnected pages. Do not start optional features while core event persistence, AI validation, budget correctness or access control is broken.
