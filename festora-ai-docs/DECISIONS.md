# Architecture Decisions and Open Questions
## Festora AI

This document records the current baseline. Change a decision only after explaining the impact and updating affected documents.

## Accepted baseline decisions

### D-001: React + Vite + TypeScript
Reason: matches the current project setup selected by the owner. Inspect existing files and versions before changing configuration.

### D-002: ESLint
Reason: selected during project initialization. Preserve the generated configuration and adapt it to the installed React/TypeScript versions.

### D-003: Firebase for MVP backend
Reason: reduces infrastructure overhead for authentication and persistence. Security Rules and server-side authorization still require careful implementation.

### D-004: Gemini called server-side
Reason: the API key must not be exposed in the browser, and generation needs validation, quotas and error handling.

### D-005: Single-owner events in MVP
Reason: simpler authorization and data model. Collaboration is P2 unless explicitly promoted.

### D-006: AI proposes, user confirms
Reason: event plans can affect real expenses and bookings. AI must not make irreversible decisions.

### D-007: Deterministic budget calculations
Reason: arithmetic must be reproducible and testable; the LLM supplies proposals, not authoritative totals.

### D-008: Estimates are not verified market quotes
Reason: no vendor marketplace or live pricing source is specified for MVP.

## Open questions to resolve during implementation

1. Which Firebase project and deployment region will be used?
2. Which currently supported Gemini model is available for the project's account, region and quota?
3. Will monetary values use integer minor units throughout? Recommended: yes, with currency-aware formatting.
4. Is event deletion soft-delete or permanent deletion? Ensure subcollections are handled.
5. Does AI generation return an in-memory proposal first or persist a proposal document immediately? Either is acceptable if failure and idempotency behavior are defined.
6. Are vendor and guest management part of the first release or P1?
7. Is PDF export required, or is print-friendly HTML sufficient for MVP?
8. Is collaboration required before public launch?
9. Which privacy policy, retention period and user deletion workflow apply to the intended deployment?

Do not silently invent answers to these open questions. Choose a minimal, reversible default when safe, record it, and ask the owner when it materially affects scope, security, cost or data migration.
