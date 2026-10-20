# Test Plan and Acceptance Criteria
## Festora AI

## 1. Testing strategy

Use:
- Vitest for domain and utility unit tests.
- React Testing Library for UI behavior.
- Firebase Emulator Suite for Firestore rules and integration tests.
- Backend function tests with mocked provider responses.
- Playwright or an equivalent E2E tool if included in the repository.
- Manual responsive/accessibility review before release.

Never claim tests passed unless commands were executed and results observed.

## 2. Unit tests

### Budget
- Empty list totals zero.
- Sum estimates correctly.
- Sum actual spend only from eligible records.
- Cancelled expenses are excluded according to the documented rule.
- Remaining budget can be negative and triggers an over-budget state.
- Projected spending does not double-count an expense and its payment.
- Currency minor-unit formatting and rounding are correct.

### Dates and tasks
- Invalid date strings are rejected.
- End date cannot precede start date.
- Timezone-aware event-day scheduling is consistent.
- Task completion percentage handles zero eligible tasks.
- Cancelled tasks are handled consistently.
- Post-event tasks are allowed only when explicitly supported.

### Schemas
- Valid plan is accepted.
- Missing required fields are rejected.
- Negative monetary amounts are rejected.
- Unsupported enum values are rejected.
- Excessively long strings/arrays are rejected.
- Invalid or contradictory dates are rejected.

## 3. Authentication and security tests

- Unauthenticated user cannot read private event data.
- User A can access their own event.
- User B cannot read User A's event.
- User B cannot create a child record under User A's event.
- A forged client-supplied UID does not grant access.
- Unauthorized function call is denied.
- Server function checks event ownership before privileged reads/writes.
- Secrets do not appear in client bundle or logs.
- Export for one event contains no records from another event.

## 4. AI integration tests

Use mocked provider responses for deterministic tests:
- Valid response returns a proposal.
- Malformed JSON is handled safely.
- Schema-invalid response is rejected or retried within a bounded limit.
- Provider timeout produces a safe error.
- Provider quota/rate limit is handled.
- Prompt injection in user notes does not override system behavior.
- Model output cannot set booking status to verified/booked.
- Duplicate request ID does not create duplicate tasks.
- Failed generation does not alter the last valid plan.
- Revision does not overwrite completed tasks, actual expenses or RSVP records.

Add a small number of opt-in live integration tests only when credentials and budget are configured. Keep them out of the default unit-test suite.

## 5. End-to-end acceptance tests

### E2E-01: New user journey
1. Register a test user.
2. Create an event.
3. Generate a plan using a controlled/mock provider.
4. Review and save the plan.
5. Confirm the plan appears in the workspace.
6. Refresh and confirm persistence.

Expected: event and plan remain available to the owner.

### E2E-02: Task and expense
1. Create a task and mark it complete.
2. Add an actual expense.
3. Check the dashboard.

Expected: task progress and budget metrics reflect the saved data.

### E2E-03: Isolation
1. Create an event as User A.
2. Sign in as User B.
3. Attempt to access the event ID and its child records.

Expected: access is denied without leaking private data.

### E2E-04: AI failure
1. Configure mock provider to time out or return invalid data.
2. Request a plan.

Expected: user sees a safe error, existing records remain unchanged, and retry is bounded.

### E2E-05: Revision safety
1. Create a completed task and actual expense.
2. request a broad plan revision.
3. review/apply the proposal.

Expected: protected records remain intact.

## 6. Build and quality gates

Before release:
- Lint passes.
- TypeScript type-check passes.
- Unit tests pass.
- Security rules tests pass.
- Production build passes.
- Critical E2E tests pass or documented blockers are accepted.
- No known critical/high security defect remains.
- Mobile layout and keyboard navigation reviewed.
- Deployment and rollback steps documented.

The exact commands must be taken from `package.json` and the actual Firebase setup; do not invent scripts.
