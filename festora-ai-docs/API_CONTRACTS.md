# Backend Function Contracts
## Festora AI

The project uses Firebase Cloud Functions rather than assuming a traditional REST server. The contracts below are logical API contracts; implement them using the selected Firebase callable/HTTP function style and document the exact transport.

## 1. Common requirements

- Authenticate every private operation.
- Derive UID from verified authentication context, never from a trusted client field.
- Validate request bodies using Zod.
- Enforce event ownership/membership before reading or writing event data.
- Return stable error codes and safe messages.
- Apply payload size, request rate and AI cost limits.
- Add request IDs and sanitized logs.
- Never expose provider secrets or raw stack traces.

## 2. `generateEventPlan`

### Request
```json
{
  "eventInput": {
    "eventType": "birthday",
    "title": "Birthday Celebration",
    "startDate": "2027-03-14",
    "timezone": "Asia/Kolkata",
    "location": { "label": "Mumbai, India" },
    "guestCount": 60,
    "currency": "INR",
    "budgetLimitMinor": 10000000,
    "preferences": {
      "theme": "modern garden party",
      "dietary": ["vegetarian"],
      "priorities": ["food", "photography"]
    }
  },
  "requestId": "client-generated-idempotency-key"
}
```

### Success
```json
{
  "proposalId": "server-generated-id",
  "schemaVersion": 1,
  "plan": {},
  "warnings": []
}
```

The `plan` must match `AI_SPEC.md`; empty object above is a placeholder for documentation, not a valid production plan.

### Behavior
- Validate request and authenticated user.
- Call the configured AI provider.
- Validate structured output.
- Return a proposal; do not overwrite saved event records without explicit user acceptance.
- Apply rate limits and bounded retries.

## 3. `applyEventPlan`

Request contains `eventId`, `proposalId`, and an explicit accepted change set or version reference. Server rechecks ownership, validates proposal status and prevents duplicate application. Use idempotency/version checks to avoid duplicate tasks.

## 4. `proposePlanRevision`

Request:
```json
{
  "eventId": "event-id",
  "currentPlanVersion": 2,
  "request": "Reduce projected spend by 15% while preserving catering quality",
  "sections": ["budget", "costSavingIdeas"]
}
```

Behavior:
- Verify ownership and current version.
- Limit request length.
- Return a proposed revision.
- Do not modify actual expense, guest RSVP, completed task or confirmed booking records.
- Require explicit user acceptance before applying.

## 5. Standard event/task/expense operations

For CRUD operations, use the Firebase SDK with restrictive Firestore rules where possible. If operations require privileged backend logic, define a server function and authorize it explicitly.

### Event
- Create event.
- Get/list own events.
- Update event.
- Archive/delete with confirmation and documented cascade policy.

### Task
- Create/update task.
- Transition status.
- Complete/reopen task.
- Prevent malformed dates/status values.

### Expense
- Create/update/cancel expense.
- Distinguish estimates, actuals and payments.
- Recalculate dashboard metrics from canonical records.

### Vendor and guest
- Implement in P1 unless product owner explicitly upgrades scope.
- Keep records private and event-scoped.

## 6. Error contract

Use stable codes:
- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `NOT_FOUND`
- `INVALID_ARGUMENT`
- `RESOURCE_EXHAUSTED`
- `AI_PROVIDER_UNAVAILABLE`
- `AI_OUTPUT_INVALID`
- `CONFLICT`
- `INTERNAL`

Client messages should be actionable but not expose secrets or implementation details. Include a request/correlation ID where useful.
