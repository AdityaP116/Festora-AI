# Product Requirements Document (PRD)
## Festora AI — Celebration & Event Planner

- Status: Baseline specification
- Version: 1.0
- Product owner: Project owner
- Last updated: 2026-10-20

## 1. Product summary

Festora AI is a web application that helps people plan celebrations and events using AI-generated plans plus conventional planning tools. It converts user-provided event details into an editable plan with a budget proposal, task checklist, milestones, day-of schedule, vendor requirements and personalized ideas. Users can save the plan, track actual work and spending, and return later.

Festora AI is not merely a chat interface. Its core value is a persistent event workspace with deterministic calculations, user-controlled changes and clear separation between AI suggestions and verified facts.

## 2. Problem statement

Event planning commonly spreads details across chats, spreadsheets, notes and vendor conversations. Users struggle to:
- Build a realistic first draft from incomplete requirements.
- Allocate a finite budget across event categories.
- Know which tasks are urgent and when they should happen.
- Keep estimates distinct from confirmed quotes and actual expenses.
- Update the plan when a constraint changes without losing completed work.
- Coordinate details in one place.

## 3. Product goals

1. Create an event plan from structured user inputs.
2. Turn AI output into editable and persistent records.
3. Provide correct budget arithmetic and transparent estimate status.
4. Make tasks and deadlines actionable.
5. Preserve user decisions and records during AI revisions.
6. Protect private event and guest data.
7. Provide a usable responsive experience on desktop and mobile.

## 4. Non-goals for the initial MVP

- Automatically booking venues or vendors.
- Processing payments or holding deposits.
- Claiming live vendor availability or verified prices without a real integration and evidence.
- Public vendor marketplace, reviews or ranking system.
- Sending invitations or messages automatically.
- Full multi-user collaboration and complex permissions.
- Native mobile apps.
- Autonomous agents that take irreversible actions.
- Guaranteed budget accuracy or professional event-management advice.

## 5. Target users and primary use cases

### Personas
- Family or individual planning a birthday, anniversary or wedding.
- Couple or family coordinating a multi-function celebration.
- Student club or community organizer planning a gathering.
- Small event organizer who wants an editable first draft.

### Primary use cases
- Create an event with type, dates, location, guest count, currency, budget and preferences.
- Generate a plan with themes, budget categories, tasks, milestones and schedule.
- Review assumptions and adjust recommendations.
- Track task progress and deadlines.
- Record expenses and compare actual spending with budget.
- Record vendor options, quotes and booking status.
- Manage a guest list and RSVP status.
- Revise a specific part of the plan without overwriting confirmed user data.
- Print or export a summary.

## 6. Product principles

- User control: AI proposes; the user reviews and decides.
- Truthfulness: distinguish generated estimates, user-entered information and verified external facts.
- Deterministic core: calculations, access control and persistence belong in application code.
- Safe revisions: never silently overwrite actual spending, confirmed bookings, RSVP responses or completed tasks.
- Explainability: show important assumptions and the reason for recommendations.
- Privacy by default: event records are private unless explicit sharing is implemented.
- Progressive delivery: finish the core end-to-end workflow before adding optional features.

## 7. MVP scope

### P0 — required
- Authentication: sign up, sign in, sign out.
- Event CRUD: create, read, update and archive/delete with confirmation.
- Event creation wizard with validation.
- Secure server-side AI plan generation.
- Schema-validated AI output.
- Persisted plan and plan version.
- Task checklist with status, priority, due date and category.
- Budget categories, expense records and deterministic calculations.
- Event overview dashboard.
- Useful loading, empty, error and retry states.
- Firestore security rules and tests.
- Responsive layout and basic accessibility.
- Setup and deployment documentation.

### P1 — next
- Vendor records and quote comparisons.
- Guest list and RSVP tracking.
- Plan revision proposals with review-before-apply.
- Printable/exportable event summary.
- Deadline and budget warnings.
- Multiple functions within one event (e.g. mehendi, ceremony and reception).
- Search, sorting and filtering for tasks and vendors.

### P2 — later
- Collaboration with owner/editor/viewer roles.
- Calendar integration and reminders.
- Multilingual UI and AI output.
- Invitation copy/artwork generation.
- Verified vendor integrations.
- Analytics and reusable event templates.

## 8. Functional product requirements

- FR-01: A user can authenticate and access only authorized private data.
- FR-02: A user can create and edit an event.
- FR-03: An event has a type, title, date/time or date range, timezone, location, guest count, currency, budget and preferences.
- FR-04: The system validates event inputs before persistence and before AI generation.
- FR-05: The system can generate a structured plan through a server-side Gemini integration.
- FR-06: The system validates AI output before saving it.
- FR-07: The user can review and edit generated content.
- FR-08: Task changes persist across reloads.
- FR-09: Budget calculations are performed by application code.
- FR-10: Estimates, quotes, actual expenses and payments have distinct semantics.
- FR-11: The system can display event progress, upcoming tasks and budget status.
- FR-12: AI revisions do not automatically overwrite protected user records.
- FR-13: The application handles AI timeouts, quota errors, malformed output and network failures.
- FR-14: Private keys are never shipped to the browser.
- FR-15: Destructive actions require confirmation and show clear outcomes.

## 9. User journey

1. Visitor opens the landing page.
2. User registers or signs in.
3. User creates an event using a multi-step wizard.
4. User reviews event inputs and requests a plan.
5. Backend validates authorization and input, calls Gemini, validates output and returns a plan proposal.
6. User reviews the proposal and saves it.
7. User edits tasks, categories and estimates; changes persist.
8. User records actual expenses and optional vendor/guest information.
9. Dashboard displays progress and budget metrics.
10. User returns later and continues planning.

## 10. Success metrics

Track product metrics without collecting unnecessary personal data:
- Event creation completion rate.
- AI generation success rate.
- Percentage of generated plans saved.
- Percentage of saved plans with at least one task completed.
- Task completion rate.
- Frequency of AI output validation failures.
- Budget calculation defect count (target: zero).
- Unauthorized data access test failures (target: zero).
- Frontend crash/error rate.
- Median AI generation latency and estimated cost per generation.

Set numeric targets only after collecting baseline usage data; do not invent current performance.

## 11. Constraints and assumptions

- Initial target is a web app.
- Initial currency default is INR, but currency is stored per event.
- Dates must be interpreted using the event's timezone.
- AI output may be incorrect and must be validated.
- Vendor prices are estimates unless supported by user-entered quotes or an explicitly integrated source.
- External service pricing, quotas and supported model names can change; verify at implementation time.
- The current repository may contain code not reflected in this document; inspect before modifying.

## 12. Release acceptance criteria

The MVP is accepted when a user can sign in, create an event, generate a schema-valid plan, save and reopen it, edit and complete a task, record an expense, see correct budget totals, and be blocked from reading another user's event. Tests must demonstrate these outcomes; screenshots or a successful homepage alone are insufficient.
