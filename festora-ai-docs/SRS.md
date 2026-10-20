# Software Requirements Specification (SRS)
## Festora AI

- Version: 1.0
- Status: Baseline specification
- Related document: `PRD.md`

## 1. Purpose and scope

This SRS defines observable software behavior, interfaces, constraints and quality requirements for Festora AI. It is implementation guidance, not proof that a feature already exists.

## 2. System context

The system comprises:
- Browser client: React + Vite + TypeScript.
- Identity provider: Firebase Authentication.
- Persistent data: Cloud Firestore.
- Trusted backend: Firebase Cloud Functions.
- Generative AI: Gemini API called from backend code.
- Optional hosting and monitoring: Firebase Hosting or Vercel, Google Cloud/Firebase logging.

The browser is untrusted. All security-sensitive operations must be enforced by Firestore rules or trusted backend authorization.

## 3. User classes

- Visitor: can view public marketing pages only.
- Authenticated event owner: can manage their own events and associated records.
- Collaborator: not in MVP; if introduced, access must be explicitly granted through membership and role checks.
- Administrator/operator: no general administrative dashboard is required for MVP. Operational access must follow least privilege.

## 4. Functional requirements

### 4.1 Authentication and authorization
- SRS-AUTH-01: Users shall be able to sign up, sign in and sign out using the configured Firebase Authentication method.
- SRS-AUTH-02: Private routes shall require a valid authenticated session.
- SRS-AUTH-03: The UI shall not treat hidden navigation as an authorization control.
- SRS-AUTH-04: Data reads and writes shall be denied unless the caller is authorized for the target resource.
- SRS-AUTH-05: Expired or invalid sessions shall produce a recoverable sign-in flow.

### 4.2 Event management
- SRS-EVT-01: A user shall be able to create an event with title, event type, start date/time or date, timezone, location, guest count, currency and budget limit.
- SRS-EVT-02: End date/time shall be optional unless required by the selected event configuration.
- SRS-EVT-03: The system shall reject negative budgets, invalid guest counts, invalid date ranges and unsupported enum values.
- SRS-EVT-04: Users shall be able to view, edit and archive or delete their own events.
- SRS-EVT-05: Destructive operations shall require confirmation and explain the scope of deletion.
- SRS-EVT-06: The system shall store timestamps in a consistent server-compatible format and preserve the event timezone for local scheduling.

### 4.3 AI plan generation
- SRS-AI-01: The client shall submit an authenticated request to a trusted backend function.
- SRS-AI-02: The backend shall verify the caller and validate the request before calling Gemini.
- SRS-AI-03: The AI output shall match a versioned schema and pass runtime validation before persistence.
- SRS-AI-04: The plan shall include summary, theme, budget proposal, tasks, milestones or schedule, vendor categories, assumptions and risks as defined in `AI_SPEC.md`.
- SRS-AI-05: The system shall label generated costs as estimates unless they are sourced from a recorded quote.
- SRS-AI-06: The system shall handle timeouts, provider errors, quota limits and malformed output with safe, actionable errors.
- SRS-AI-07: The system shall enforce configurable limits on request size, generation count and retry count.
- SRS-AI-08: The backend shall not accept AI-generated claims of vendor availability or booking as verified facts.
- SRS-AI-09: The system shall record the schema version and plan version metadata for each saved plan.

### 4.4 Plan editing and revision
- SRS-REV-01: Users shall be able to edit generated plan fields where permitted.
- SRS-REV-02: A requested AI revision shall be scoped to the requested sections.
- SRS-REV-03: The system shall present a proposed change set before applying changes to protected records.
- SRS-REV-04: Completed tasks, actual expenses, RSVP statuses and confirmed booking/payment records shall not be overwritten silently by AI.
- SRS-REV-05: The system shall preserve prior plan versions or a change history sufficient to recover the prior plan.

### 4.5 Tasks
- SRS-TASK-01: Tasks shall have an ID, title, category, status, priority and optional description, due date and assignee.
- SRS-TASK-02: Task status shall use a defined enum such as `pending`, `in_progress`, `completed`, `cancelled`.
- SRS-TASK-03: Users shall be able to create, edit, complete and reopen tasks.
- SRS-TASK-04: Due dates shall be validated against event context; exceptions such as post-event follow-up shall be explicit.
- SRS-TASK-05: Dashboard progress shall be derived from task records using documented rules.

### 4.6 Budget and expenses
- SRS-BUD-01: Each event shall have one configured currency.
- SRS-BUD-02: Amounts shall be non-negative and represented consistently (integer minor units preferred where supported, or validated decimal amounts with documented rounding).
- SRS-BUD-03: Category estimates, vendor quotes, actual expenses and payments shall not be conflated.
- SRS-BUD-04: Totals, variance and remaining budget shall be calculated in application code.
- SRS-BUD-05: The UI shall show when projected spend exceeds the budget limit.
- SRS-BUD-06: Currency conversion shall not be implied unless an explicit conversion service and rate timestamp are implemented.
- SRS-BUD-07: The system shall avoid double-counting the same expense or payment.

### 4.7 Vendors and guests (P1 unless explicitly moved into MVP)
- SRS-VEN-01: Vendor records shall be event-scoped and include a category and status.
- SRS-VEN-02: A vendor's quoted amount shall be labeled as a user-recorded quote and may include quote date/validity.
- SRS-VEN-03: Vendor booking status shall be distinct from AI recommendations.
- SRS-GST-01: Guest records shall be private and event-scoped.
- SRS-GST-02: RSVP statuses shall use a defined enum.
- SRS-GST-03: Dietary or accessibility notes shall be collected only when needed and exposed only to authorized users.

### 4.8 Dashboard and export
- SRS-DASH-01: The dashboard shall display event summaries, task progress, upcoming deadlines and budget status.
- SRS-DASH-02: Metrics shall be computed from persisted records and documented calculation rules.
- SRS-EXP-01: Export/print shall not include secrets or data from another event.
- SRS-EXP-02: Export should clearly distinguish estimates from recorded actual amounts.

## 5. External interface requirements

### 5.1 Browser UI
- Responsive for modern desktop and mobile browsers.
- Forms must have labels, validation messages and keyboard accessibility.
- Every asynchronous action must expose loading, success or error feedback.
- No button may imply an action that is not implemented.

### 5.2 Firebase
- Use the supported Firebase client SDK for browser operations.
- Use trusted server SDKs only in server environments.
- Firestore rules must be version controlled and tested with the Emulator Suite.
- Privileged server operations must independently verify user and resource authorization.

### 5.3 Gemini
- Use a currently supported model and SDK/API version, verified against official documentation at implementation time.
- Keep credentials in server-side secret storage.
- Use structured output/schema support when supported by the selected model.
- Treat model output as untrusted input.

## 6. Non-functional requirements

### Security
- No private API keys in client bundles, Git history or public logs.
- Deny-by-default data access.
- Validate and normalize all user and AI input.
- Apply rate limiting/quotas to costly AI operations.
- Avoid logging guest personal data or full prompts unless justified and disclosed.
- Protect against prompt injection in user-supplied free text by treating it as data, not system instructions.

### Reliability
- Errors must be visible and actionable.
- AI failures must not corrupt existing event data.
- Mutations should be idempotent where practical.
- Handle duplicate submissions and concurrent edits.
- Preserve previously saved data when a generation attempt fails.

### Performance
- Avoid loading every event subcollection unnecessarily.
- Paginate or limit large guest/task/vendor lists.
- Use indexes for actual query patterns.
- Set and measure performance budgets after an initial baseline; do not claim unmeasured targets.

### Maintainability
- Strict TypeScript where practical.
- Reusable schemas shared where safe between client and server.
- Separate UI, data access, domain calculations and AI integration.
- Automated tests for critical calculations and authorization.
- Keep documentation synchronized with implementation.

### Accessibility
- Semantic HTML and accessible labels.
- Keyboard-operable navigation, forms, dialogs and menus.
- Visible focus states.
- Sufficient contrast and status messages not conveyed by color alone.
- Respect reduced-motion preferences.

### Compatibility
- Support current stable versions of major browsers; verify exact support matrix before release.
- Use responsive layouts.
- Avoid browser-only APIs without fallbacks when they affect core workflows.

## 7. Data integrity invariants

1. Every event belongs to an owner.
2. Every child record belongs to an event.
3. Every event and child record is accessible only to authorized principals.
4. Currency is consistent within an event.
5. AI-generated estimates are not treated as actual expenses.
6. Actual expenses are not overwritten by AI regeneration.
7. Confirmed bookings and payment records require explicit user action or a verified integration.
8. Plan output must validate before it is saved as a valid plan.
9. Budget totals are derived from stored records and deterministic calculations.
10. Event timezone is respected when calculating local deadlines and schedules.

## 8. Acceptance testing

Acceptance tests are defined in `TEST_PLAN.md`. Release is blocked by any reproducible unauthorized data access, leaked secret, incorrect core budget calculation, destructive AI overwrite, or false claim of a verified booking.
