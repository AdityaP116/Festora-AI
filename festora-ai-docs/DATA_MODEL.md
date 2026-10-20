# Data Model
## Festora AI / Cloud Firestore

## 1. Modeling principles

- Keep all records scoped to an event and owner.
- Prefer subcollections for potentially growing task, guest, expense and vendor records.
- Do not duplicate computed totals unless there is a clear consistency strategy.
- Store currency at the event level and use the same currency for its monetary records.
- Store timestamps in a consistent Firestore-compatible format and event timezone as an IANA timezone string.
- Define document schemas in TypeScript and validate untrusted input at runtime.

## 2. Proposed paths

```text
users/{uid}
users/{uid}/events/{eventId}
users/{uid}/events/{eventId}/tasks/{taskId}
users/{uid}/events/{eventId}/expenses/{expenseId}
users/{uid}/events/{eventId}/vendors/{vendorId}
users/{uid}/events/{eventId}/guests/{guestId}
users/{uid}/events/{eventId}/planVersions/{versionId}
```

This owner-nested model simplifies single-owner MVP rules. If collaboration is introduced, reconsider the path model or implement a carefully tested membership/authorization layer. Do not casually move records after production data exists.

## 3. Event document

Suggested fields:
- `title: string`
- `eventType: "wedding" | "birthday" | "anniversary" | "college_event" | "community_event" | "other"`
- `startAt: Timestamp`
- `endAt?: Timestamp`
- `timezone: string` (IANA identifier)
- `location: { label: string; city?: string; countryCode?: string }`
- `currency: string` (ISO 4217 code, initially default `INR`)
- `guestCount: number`
- `budgetLimitMinor: number` (integer in the smallest currency unit; document currency exponent handling)
- `preferences: { theme?: string; dietary?: string[]; priorities?: string[]; accessibility?: string[]; notes?: string }`
- `status: "planning" | "in_progress" | "completed" | "archived"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `schemaVersion: number`

Use integer minor units for monetary storage where practical. Do not assume every currency has two decimal places; use currency-aware formatting and conversion rules. If the first implementation uses major-unit decimals, explicitly document precision and rounding, and test it.

## 4. Task document

- `title: string`
- `description?: string`
- `category: string` or controlled enum
- `priority: "low" | "medium" | "high" | "critical"`
- `status: "pending" | "in_progress" | "completed" | "cancelled"`
- `dueAt?: Timestamp`
- `isEventDayTask: boolean`
- `assignedToUid?: string`
- `source: "user" | "ai"`
- `planVersionId?: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `completedAt?: Timestamp`
- `revision: number`

Do not let a regenerated AI plan silently replace user-edited task fields.

## 5. Budget category / estimate

Recommended subcollection if categories need individual edits:
`budgets/{categoryId}` or a budget array on the event for a small MVP.

Fields:
- `name: string`
- `categoryKey: string`
- `estimatedAmountMinor: number`
- `source: "ai_estimate" | "user_estimate" | "vendor_quote"`
- `notes?: string`
- `updatedAt: Timestamp`
- `planVersionId?: string`

Do not treat category estimate as actual spending.

## 6. Expense document

- `description: string`
- `categoryKey: string`
- `estimatedAmountMinor?: number`
- `actualAmountMinor?: number`
- `currency: string`
- `expenseStatus: "planned" | "incurred" | "cancelled"`
- `paymentStatus: "unpaid" | "partially_paid" | "paid" | "refunded" | "not_applicable"`
- `vendorId?: string`
- `incurredAt?: Timestamp`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `source: "user" | "vendor_quote" | "imported"`

Avoid double-counting payments and expenses. If partial payments are implemented, use a separate payment subcollection and define how paid totals are calculated.

## 7. Vendor document

- `name: string`
- `category: string`
- `contactName?: string`
- `phone?: string`
- `email?: string`
- `website?: string`
- `quotedAmountMinor?: number`
- `currency?: string`
- `quoteReceivedAt?: Timestamp`
- `quoteValidUntil?: Timestamp`
- `bookingStatus: "researching" | "contacted" | "quoted" | "shortlisted" | "booked" | "rejected" | "cancelled"`
- `paymentStatus: "unpaid" | "partially_paid" | "paid" | "not_applicable"`
- `notes?: string`
- `source: "user_entered" | "verified_integration"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

Only use `verified_integration` when a real integration and provenance exist. AI suggestions should not be stored as verified vendors.

## 8. Guest document

- `displayName: string`
- `group?: string`
- `rsvpStatus: "not_invited" | "invited" | "confirmed" | "declined" | "maybe"`
- `dietaryPreferences?: string[]`
- `accessibilityNotes?: string`
- `plusOneCount?: number`
- `notes?: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

Guest and dietary data can be sensitive in context. Collect only what is needed and do not expose it publicly.

## 9. Plan version document

- `version: number`
- `schemaVersion: number`
- `generatedAt: Timestamp`
- `modelId: string`
- `inputsSnapshot: object` (minimize sensitive information)
- `plan: object` (validated schema)
- `changeSummary?: string`
- `createdByUid: string`
- `status: "proposed" | "applied" | "superseded" | "rejected"`

Never store provider secrets in plan documents.

## 10. Derived metrics

Compute in domain code:
- Estimated total = sum of active category estimates.
- Actual spend = sum of non-cancelled incurred expenses with actual amounts.
- Remaining budget = budget limit − actual spend.
- Projected final spend = actual spend + estimates for remaining planned expenses, with a documented rule preventing double counting.
- Budget variance = projected final spend − budget limit.
- Task completion = completed eligible tasks / all eligible tasks × 100.

If no eligible tasks exist, display an empty state rather than divide by zero. Document whether cancelled tasks are excluded.

## 11. Indexes

Add composite indexes only for implemented query patterns. Common candidates:
- Events ordered by `updatedAt` or `startAt`.
- Tasks filtered by status and ordered by `dueAt`.
- Vendors filtered by category or booking status.
- Guests filtered by RSVP status.

Confirm indexes using emulator and deployed query errors; do not preemptively invent a large index set.
