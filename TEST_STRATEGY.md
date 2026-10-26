# Festora AI — Comprehensive Test Strategy & Architecture Guide

**Version**: 1.0  
**Status**: Active & Implemented  
**Author**: Test Architecture, QA Automation, and DevOps Engineering  

---

## 1. Quality Objectives & Philosophy

Festora AI is an AI-powered event planning platform where financial accuracy, cross-tenant isolation, prompt injection resistance, and plan revision safety are paramount. The testing architecture is designed to enforce:
1. **Financial & Numerical Invariants**: Zero tolerance for negative spend, negative budget limits, or double-counted payments.
2. **Deterministic Quality Gates**: Every merge/push to mainline must pass type checks, lint checks, unit tests, contract tests, security rules, and production bundle generation.
3. **Defense-in-Depth Security**: Verification that client-supplied IDs are never trusted as identity proof, and secrets/credentials never appear in client bundles.
4. **Data Preservation during Plan Revisions**: Plan revisions must never overwrite completed tasks, user-created tasks, or actual incurred expenses.

---

## 2. Test Architecture & Pyramids

```
         /\
        /  \     E2E / Browser Acceptance (Journeys 1 to 4)
       /----\    
      /      \   Contract & API Integration Tests
     /--------\  
    /          \ Database Persistence & Security Rules
   /------------\
  /              \ Unit Tests (Domain calculations, Schemas, Services)
 /----------------\
```

### A. Unit Testing (`tests/budget.test.ts`, `tests/task-rules.test.ts`, `tests/ai-schema.test.ts`, `tests/backend-services.test.ts`)
- **Focus**: Pure logic with zero side effects.
- **Rules Tested**:
  - Empty budget list totals 0.
  - Cancelled tasks and expenses are excluded from completion percentage and active spend.
  - Minor-unit currency conversions (paise/cents).
  - Authorization token parser (`Bearer dev_token_*`, `test_token_*`).
  - Rate-limit sliding window algorithms.

### B. Contract Testing (`tests/api-contracts.test.ts`)
- **Focus**: Formal alignment between frontend `ApiClient` and backend Cloud Function request/response schemas.
- **Rules Tested**:
  - Request payload structure (`ValidatedEventInputSchema`).
  - Error envelope matching `API_CONTRACTS.md` (`ApiError` with `code`, `status`, `requestId`).
  - Field bounds (title length 3–120 characters, guestCount 1–50,000, non-negative budgetLimitMinor).

### C. Database & Persistence Testing (`tests/database-persistence.test.ts`)
- **Focus**: Verifying data persistence invariants and hierarchical Firestore isolation (`users/{ownerUid}/events/{eventId}`).
- **Rules Tested**:
  - Cross-tenant access denial (User B cannot read or delete User A's events).
  - Subcollection cascades (`tasks`, `expenses`, `budgets`, `planVersions`).
  - Immutable plan version audit logging (snapshots cannot be deleted or mutated).

### D. Security & Injection Defense (`tests/security.test.ts`, `tests/authorization.test.ts`)
- **Focus**: Threat modeling, prompt injection resilience, XSS sanitization, and secret boundary protection.
- **Rules Tested**:
  - Prompt injection payloads in event notes are treated as raw literal context rather than instruction overrides.
  - Unauthenticated requests receive `UNAUTHENTICATED`.
  - Forged tokens and mismatched caller UIDs trigger `PERMISSION_DENIED`.
  - Client bundles are checked for absent server credentials.

### E. Performance & Scalability Benchmarks (`tests/performance.test.ts`)
- **Focus**: Ensuring synchronous domain operations and data transformations do not freeze the UI thread or backend loop.
- **Benchmarks**:
  - Budget calculations over 1,000 categories & expenses in < 50ms.
  - Task progress metrics over 5,000 items in < 50ms.
  - Bulk currency formatting over 1,000 items completed within verified memory bounds.

### F. End-to-End Integration Suite (`tests/e2e-integration.test.ts`, `tests/plan-revision-safety.test.ts`)
- **Focus**: Complete user journeys matching `TEST_PLAN.md`:
  - **Journey 1**: Returning user session restoration.
  - **Journey 2**: Full event lifecycle (Create -> AI Plan -> Apply Plan -> User Modifications -> AI Revision -> Preserve User Work).
  - **Journey 3**: Cross-tenant isolation boundaries.
  - **Journey 4**: Failure recovery, validation errors, and rate-limiting.

---

## 3. Test Execution Commands

| Test Category | Command |
|---|---|
| Run all automated tests | `npm test` or `npx vitest run` |
| Run test suite with code coverage | `npx vitest run --coverage` |
| Run focused performance benchmarks | `npx vitest run tests/performance.test.ts` |
| Run security & injection suite | `npx vitest run tests/security.test.ts` |
| Run contracts & schema verification | `npx vitest run tests/api-contracts.test.ts` |
| Run full production build verification | `npm run build && npm --prefix functions run build` |

---

## 4. Test Data & Environment Isolation

1. **Synthetic Data**: Tests generate synthetic UIDs (`user_david`, `owner_john`, `rate_tester_*`) and temporary mock objects.
2. **Local Storage Sandboxing**: Node/V8 environments utilize an isolated in-memory storage provider to prevent parallel test cross-talk.
3. **No Production Database Pollution**: All integration tests operate either in-memory or against configured Firebase Emulators.
