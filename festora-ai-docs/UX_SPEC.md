# UX and Interaction Specification
## Festora AI

## 1. Visual direction

A polished, warm, modern productivity application. Use a restrained plum/indigo accent, warm neutral backgrounds, readable typography, clear cards and subtle motion. The visual identity should support weddings, birthdays, college events and community gatherings without making the whole product wedding-specific.

Do not prioritize decorative animation over accessibility, loading performance or task clarity.

## 2. Routes

- `/` — landing page
- `/login` — sign in
- `/register` — registration
- `/dashboard` — event overview
- `/events/new` — event creation wizard
- `/events/:eventId` — event overview/workspace
- `/events/:eventId/budget` — budget and expenses
- `/events/:eventId/tasks` — task list/board
- `/events/:eventId/timeline` — milestones and schedule
- `/events/:eventId/vendors` — vendor records (P1)
- `/events/:eventId/guests` — guest and RSVP list (P1)
- `/events/:eventId/assistant` — AI plan and revisions
- `/settings` — account preferences

Routes are proposed. If the existing repository uses a different routing structure, adapt without unnecessary rewrites.

## 3. Event wizard

Suggested steps:
1. Event type and title.
2. Date, timezone, location and duration.
3. Guest count and budget/currency.
4. Theme, priorities and relevant constraints.
5. Review and generate.

Requirements:
- Show progress and allow returning to previous steps.
- Preserve entered values when moving between steps.
- Validate each step and the final payload.
- Avoid requiring optional data that is not needed.
- Show a confirmation of the inputs before consuming an AI generation request.
- Explain that AI outputs are proposals and costs are estimates.

## 4. Dashboard

Show:
- Upcoming events.
- Create-event action.
- Tasks due soon and overdue tasks.
- Actual spend versus budget.
- Projected spend when calculation data is available.
- Progress derived from eligible task statuses.
- Empty state for new users.

Do not show fabricated analytics or example data as if it belonged to the signed-in user.

## 5. Event workspace

Tabs/sections:
- Overview
- Plan
- Budget
- Tasks
- Timeline
- Vendors
- Guests
- AI assistant

Keep event title, date and high-level budget visible. Use responsive navigation on small screens.

## 6. AI assistant interaction

- Display generation progress and a cancel/leave-safe behavior.
- Clearly distinguish proposed changes from saved data.
- Show assumptions and warnings.
- Offer focused actions such as reduce budget, change theme or add contingency.
- Require confirmation before applying a revision that changes persisted plan content.
- Never imply that a generated vendor suggestion has been contacted or booked.

## 7. Status and feedback

Every asynchronous interaction needs:
- Loading state.
- Success confirmation after the operation actually succeeds.
- Recoverable error message.
- Retry where safe.
- Empty state when there is no data.
- Permission-denied state for unauthorized resources.

Avoid fake buttons, dead links and success messages triggered before persistence completes.

## 8. Accessibility

- Use semantic HTML and associated labels.
- Ensure keyboard access and visible focus.
- Provide accessible names for icon-only buttons.
- Use sufficient contrast.
- Do not convey state by color alone.
- Respect `prefers-reduced-motion`.
- Keep dialogs focus-managed and escapable.
- Use accessible status announcements for save/generation results.

## 9. Responsive behavior

Support narrow mobile layouts and desktop dashboards. Tables should become scrollable or use a card layout on small screens. Forms must not require horizontal scrolling. Test real breakpoints instead of relying on desktop-only screenshots.
