# Architecture and Technical Design
## Festora AI

## 1. Baseline architecture

### Browser
- React + Vite + TypeScript.
- React Router for navigation.
- Tailwind CSS for styling.
- Firebase client SDK for authentication and authorized Firestore operations.
- Zod for client-side input validation and safe parsing where schemas are shared.
- React Hook Form for form state.
- Recharts for visualization only; chart values must come from application calculations.

### Trusted backend
- Firebase Cloud Functions with TypeScript.
- Verify Firebase ID tokens or use the supported callable-function authentication context.
- Validate input, authorize event ownership, enforce limits, call Gemini and validate responses.
- Store Gemini API key using Firebase/Google Cloud secret management.

### Persistence
- Cloud Firestore.
- Version-controlled `firestore.rules` and `firestore.indexes.json`.
- Emulator Suite for local testing.

## 2. Request flow: plan generation

1. User submits event inputs from the browser.
2. Client performs basic validation for usability.
3. Client calls the authenticated backend function.
4. Backend validates authentication and authorization.
5. Backend validates request shape and limits.
6. Backend assembles the system instruction and normalized event facts.
7. Backend calls Gemini using server-side credentials.
8. Backend parses and validates the response against the versioned schema.
9. Backend performs deterministic checks, including amount/date invariants.
10. Backend returns a proposal or stores a draft according to the chosen persistence design.
11. User reviews and confirms saving/applying the plan.
12. The system stores a plan version and creates/upserts task records without overwriting protected user data.

Never trust a client-supplied `userId` as proof of identity. Derive identity from the verified token.

## 3. Architectural boundaries

- UI components: render state and collect user actions.
- Feature modules: coordinate screens and feature workflows.
- Services/repositories: encapsulate Firestore operations.
- Domain layer: budget calculations, status transitions and date rules.
- AI service: prompt construction, provider call, parsing and schema validation.
- Cloud Functions: trusted operations and privileged integration boundaries.
- Security rules: enforce client access to database resources.
- Tests: validate each boundary independently.

## 4. Suggested source layout

```text
src/
  app/
  components/
    ui/
    layout/
  features/
    auth/
    events/
    planning/
    tasks/
    budget/
    vendors/
    guests/
  lib/
    firebase.ts
    validation.ts
  services/
    event-service.ts
    task-service.ts
    budget-service.ts
    ai-service.ts
  domain/
    budget-calculations.ts
    task-rules.ts
    date-rules.ts
  types/
functions/
  src/
    index.ts
    generate-event-plan.ts
    propose-plan-revision.ts
    schemas/
    services/
      gemini-client.ts
      authorization.ts
      rate-limits.ts
```

Adapt to the existing repository instead of blindly restructuring it.

## 5. Error model

Return safe, stable error codes to the client:
- `UNAUTHENTICATED`
- `PERMISSION_DENIED`
- `INVALID_ARGUMENT`
- `NOT_FOUND`
- `RESOURCE_EXHAUSTED`
- `AI_PROVIDER_UNAVAILABLE`
- `AI_OUTPUT_INVALID`
- `CONFLICT`
- `INTERNAL`

Do not return provider credentials, raw stack traces, secret values or sensitive prompts to clients. Log a correlation/request ID and sanitized diagnostic metadata.

## 6. Idempotency and concurrency

- Avoid creating duplicate tasks on retry.
- Use stable IDs or a plan-application operation ID for generated task imports.
- Use transactions/batched writes where appropriate, respecting Firestore limits.
- For concurrent edits, use an `updatedAt`/version check or document a last-write-wins policy.
- Do not perform unbounded batch writes.
- A failed AI generation must leave the last valid plan untouched.

## 7. Observability

Capture:
- Request ID, function name, outcome and latency.
- AI model identifier/config version, token/cost metadata when available and safe.
- Validation failure category.
- Rate-limit events.
- Sanitized error details.

Do not log API keys, auth tokens, full guest lists, payment details or unnecessary free-text personal data.

## 8. Hosting and deployment

- Frontend: Firebase Hosting or Vercel.
- Backend: Firebase Cloud Functions.
- Configure environment-specific Firebase projects.
- Separate development and production credentials.
- Test production build and deployed security rules.
- Confirm required billing plan, region support, quotas and current runtime requirements before deployment.
