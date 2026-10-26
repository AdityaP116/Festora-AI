# Design.md --- Festora AI

**Product:** Festora AI --- Celebration & Event Planner\
**Document type:** Frontend visual design, UI/UX, and implementation
specification\
**Reference:** https://plantoday.in/\
**Status:** Project-specific design baseline; verify visual details
against live screenshots before claiming pixel-perfect parity.\
**Last updated:** 2026-10-22

> This document is tailored to Festora AI, not a vendor marketplace
> clone. Use PlanToday as a visual and experience reference where
> helpful, but prioritize the product requirements and UX flows in this
> repository. Create original Festora AI branding, copy, illustrations,
> and permitted imagery. Do not copy proprietary branding or restricted
> assets.

------------------------------------------------------------------------

## 1. Product identity and design goal

Festora AI helps people plan weddings, birthdays, anniversaries, college
events, family celebrations, and community gatherings in one persistent
workspace. It combines AI-generated planning proposals with reliable,
editable tools for budgets, tasks, milestones, schedules, and expenses.

The interface should feel like a **polished event-planning workspace**:
warm and celebratory, but structured and dependable enough for users to
manage real tasks and money. Avoid turning the entire application into a
wedding-vendor directory or a generic AI chat interface.

### Core product principles

1.  **Planning workspace first:** events, tasks, timelines, and budgets
    are the central product.
2.  **AI proposes; users decide:** AI-generated content must be
    reviewable and editable before it changes saved plans.
3.  **Trustworthy numbers:** totals, remaining budget, progress, and
    spending are calculated by application code.
4.  **Persistent work:** saved events and edits should remain available
    after refresh and future sign-in.
5.  **Clear data status:** distinguish AI suggestions, user-entered
    estimates, vendor quotes, actual expenses, and confirmed
    information.
6.  **Privacy by default:** private event information is shown only to
    its authorized owner unless sharing is explicitly implemented.
7.  **Responsive by design:** the experience must work on desktop,
    tablet, and mobile.
8.  **Progressive disclosure:** keep first-time event creation
    approachable; reveal advanced planning detail when needed.

### Primary users

-   Individuals and families planning personal celebrations.
-   Couples planning multi-function weddings or engagements.
-   Students, clubs, and community organizers planning gatherings.
-   Small event organizers who need a first draft and an organized place
    to manage it.

### Explicit MVP boundaries

The initial product is not a live vendor-booking marketplace. Do not
make vendor search, vendor reviews, payments, automatic bookings, live
prices, guest invitations, collaboration, or vendor availability core UI
promises unless the corresponding feature is actually implemented.
Vendor records and quote comparison can be future enhancements described
in the PRD.

------------------------------------------------------------------------

## 2. Documentation precedence and reference usage

Use the project's documentation in this order when making decisions:

1.  `PRD.md` --- product scope and priorities.
2.  `UX_SPEC.md` --- routes, user flows, interactions, and
    accessibility.
3.  `SRS.md` --- functional and non-functional requirements.
4.  `ARCHITECTURE.md`, `DATA_MODEL.md`, `AI_SPEC.md`,
    `API_CONTRACTS.md`, and `SECURITY.md` --- implementation
    constraints.
5.  This `Design.md` --- visual design, page composition, responsive
    behavior, and UI component guidance.
6.  Existing repository code and actual screenshots --- determine
    current implementation and exact changes required.

If this file conflicts with the PRD or the implemented architecture,
report the conflict and prefer the product/architecture requirements
unless the project owner approves a change.

### How to use PlanToday

PlanToday can inform visual quality and event-oriented presentation:
strong hero imagery, clear navigation, approachable occasion choices,
editorial card layouts, helpful search patterns, and a coherent content
hierarchy. Its marketplace-specific page structure should not replace
Festora AI's event dashboard, budget, checklist, timeline, and AI
revision workflows.

Do not claim exact color values, fonts, dimensions, or hidden behavior
from the reference without inspecting the live rendered page. Treat
proposed tokens below as starting values to tune through screenshot
comparison.

------------------------------------------------------------------------

## 3. Visual direction

### Personality

-   Warm, welcoming, calm, organized, celebratory.
-   Modern productivity UI with subtle event-specific character.
-   Premium but approachable; avoid excessive luxury styling.
-   Clear typography and predictable component behavior.
-   Minimal, purposeful motion rather than decorative animation
    everywhere.

### Color system

The UX spec calls for warm neutrals with a restrained plum/indigo
accent. Use this as the initial direction and refine it against actual
screenshots and contrast checks.

  -------------------------------------------------------------------------
  Token                     Initial value           Usage
  ------------------------- ----------------------- -----------------------
  `--color-primary`         `#6543A5`               Main actions, selected
                                                    tabs, key links

  `--color-primary-hover`   `#503386`               Hover/pressed primary
                                                    controls

  `--color-primary-soft`    `#F0EAF9`               Selected navigation and
                                                    subtle highlights

  `--color-accent`          `#B58A58`               Small celebratory
                                                    highlights, sparingly

  `--color-background`      `#FAF8F5`               App/page background

  `--color-surface`         `#FFFFFF`               Cards, dialogs,
                                                    sidebars

  `--color-surface-muted`   `#F4F0EB`               Secondary panels and
                                                    grouped areas

  `--color-text`            `#29252F`               Main text

  `--color-text-muted`      `#706A75`               Supporting text and
                                                    metadata

  `--color-border`          `#E7E1E9`               Dividers, card borders,
                                                    form outlines

  `--color-success`         `#237A52`               Completed/success
                                                    states

  `--color-warning`         `#9A5B13`               Due soon, budget
                                                    warning

  `--color-danger`          `#B42318`               Errors and destructive
                                                    actions

  `--color-info`            `#2864A5`               Informational messages
  -------------------------------------------------------------------------

Rules: - Keep the primary accent consistent across the app. - Use
success/warning/danger for status, not decoration. - Never rely on color
alone to communicate task status or warnings. - Check WCAG contrast for
text, controls, focus indicators, and badges. - Do not use large
saturated gradient backgrounds on every section.

### Typography

Use one highly readable UI family, preferably **Inter** or **Manrope**,
unless the existing repository already uses a consistent, suitable font.
Load fonts efficiently and provide system fallbacks.

  Role                     Suggested size
  ------------------------ --------------------------------------
  Landing hero heading     `clamp(2.25rem, 4.5vw, 4rem)`
  Dashboard page heading   `clamp(1.75rem, 3vw, 2.5rem)`
  Section heading          `1.25rem–1.75rem`
  Card title               `1rem–1.125rem`
  Body text                `0.9375rem–1rem`
  Helper/metadata text     `0.8125rem–0.875rem`
  Metric value             `1.75rem–2.5rem`, based on hierarchy

-   Body line-height: `1.5–1.7`.
-   Heading line-height: `1.1–1.25`.
-   Use a small, consistent set of font weights.
-   Do not make secondary labels so small or faint that they become
    difficult to read.
-   Avoid all-caps for long labels and headings.

### Spacing and layout

Use a 4px-based scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

-   Desktop content width: approximately `1200–1280px`, adjusted per
    screen.
-   Desktop page padding: `32–40px`.
-   Tablet page padding: `24px`.
-   Mobile page padding: `16–20px`.
-   Typical card padding: `16–24px`.
-   Section gaps: `32–56px` in app workspaces; `56–88px` on the
    marketing landing page.
-   Use a consistent grid and align section headings with their content.
-   Do not repair layout with arbitrary one-off margins; fix the layout
    primitives and shared tokens.

### Borders, radii, and shadows

-   Inputs and small controls: `8–10px` radius.
-   Standard cards: `12–16px` radius.
-   Dialogs and prominent panels: `16–20px` radius.
-   Use thin neutral borders for most cards.
-   Use subtle shadows only where they clarify layering, such as
    dropdowns, menus, and dialogs.
-   Avoid giving every card a strong shadow or using inconsistent corner
    radii.

### Icons and imagery

-   Use the repository's existing icon library if one is already
    installed; otherwise Lucide is a suitable option.
-   Use consistent icon size and stroke weight.
-   Use icons alongside text for important navigation and statuses;
    avoid unexplained icon-only actions.
-   Use permitted, high-quality celebration imagery on the marketing
    landing page and optional event-cover images.
-   The dashboard should prioritize readable information and task
    completion over decorative photography.
-   Keep image aspect ratios consistent, use `object-fit: cover`, and
    provide fallbacks.
-   Do not copy PlanToday's logo, proprietary images, or content without
    permission.

------------------------------------------------------------------------

## 4. Application shell and navigation

### Public landing shell

The public landing page should have a simple header: - Original Festora
AI logo/wordmark. - Product value/navigation links such as How it works
and Features. - Sign in link. - Primary CTA: "Plan an event" or "Get
started". - Accessible mobile menu.

Use the live reference for broad layout inspiration, but do not add
vendor-marketplace navigation such as "List your business" unless that
feature is approved and implemented.

### Authenticated application shell

Use a consistent workspace layout after sign-in: - **Desktop:** sidebar
navigation and a compact top bar. - **Tablet:** collapsible sidebar or
compact navigation. - **Mobile:** top bar with a menu/drawer or a clear
compact navigation pattern. - Main content area with consistent page
title, supporting text, primary action, and content container.

Suggested sidebar destinations: - Overview - My events - Create event -
Settings

Within an event, use event-specific navigation: - Overview - Plan -
Budget - Tasks - Timeline - AI assistant - Vendors and Guests only when
those features are available

Keep the active navigation state visually clear. Ensure the event name
and date are visible within the event workspace without consuming too
much vertical space.

### Header behavior

Whether the public header is sticky must be decided from screenshot
inspection and usability testing. Avoid assuming sticky behavior. Menus
must work with mouse, touch, and keyboard and close appropriately after
navigation.

### Footer

The public footer can include: - Short product description. -
Features/how it works. - About/contact if available. - Privacy and
terms. - Copyright.

Do not show fake social profiles or links that do not work.

------------------------------------------------------------------------

## 5. Route and screen inventory

Follow `UX_SPEC.md` and preserve existing routes if already implemented.
The following screens form the intended product experience.

  ------------------------------------------------------------------------------
  Route                          Screen                  Purpose
  ------------------------------ ----------------------- -----------------------
  `/`                            Landing page            Explain the product and
                                                         start event planning

  `/login`                       Sign in                 Authenticate existing
                                                         users

  `/register`                    Create account          Register new users

  `/dashboard`                   Event overview          Show events, upcoming
                                                         tasks, spend, and
                                                         progress

  `/events/new`                  Event wizard            Collect event details
                                                         and generate a plan
                                                         proposal

  `/events/:eventId`             Event workspace         Show event summary,
                                 overview                progress, next tasks,
                                                         and budget status

  `/events/:eventId/budget`      Budget                  Manage categories,
                                                         estimates, and actual
                                                         expenses

  `/events/:eventId/tasks`       Task list/board         Manage planning tasks
                                                         and due dates

  `/events/:eventId/timeline`    Timeline                Show milestones and
                                                         event-day schedule

  `/events/:eventId/vendors`     Vendor records (P1)     Store vendor options
                                                         and quotes if
                                                         implemented

  `/events/:eventId/guests`      Guests (P1)             Manage guest list and
                                                         RSVP status if
                                                         implemented

  `/events/:eventId/assistant`   AI assistant            Generate or revise
                                                         proposals with
                                                         review-before-apply

  `/settings`                    Account settings        Manage account
                                                         preferences
  ------------------------------------------------------------------------------

Do not expose links to unfinished screens as if they are complete. Hide
them, mark them clearly as coming soon, or implement a useful disabled
state consistent with the product plan.

------------------------------------------------------------------------

## 6. Landing page (`/`)

The landing page is the public marketing entry point. It should feel
welcoming and demonstrate the product's actual value: a plan, budget,
checklist, and timeline in one place.

### 6.1 Header

-   Original brand and concise navigation.
-   Sign in and prominent get-started action.
-   Clear mobile behavior.
-   Keep the header height and spacing balanced with the hero.

### 6.2 Hero section

-   Strong headline about planning celebrations with less stress.
-   One short paragraph explaining that the app creates an editable
    plan, budget, tasks, and timeline.
-   Primary CTA: **Start planning**.
-   Secondary CTA: **See how it works** or a working demo/preview if
    available.
-   Visual preview of the actual Festora AI workspace, or a permitted
    celebration image paired with a real product mockup.
-   Use responsive composition: text and product visual side-by-side on
    wide screens, stacked on narrow screens.
-   Avoid an oversized hero that pushes all meaningful content too far
    below the fold.

Suggested copy direction (edit to match final branding): - Heading:
"Every celebration, thoughtfully planned." - Supporting text: "Turn your
event details into an editable plan, budget, checklist, and
timeline---all in one place." - CTA: "Plan your event"

Do not present generated budgets or vendor suggestions as guaranteed
facts.

### 6.3 How it works

Show a short three-step sequence: 1. Tell Festora AI about your event.
2. Review and personalize your suggested plan. 3. Track tasks, budget,
and progress in one workspace.

Use concise copy and a clear visual progression. Keep the steps usable
on mobile.

### 6.4 Feature overview

Show the core features: - AI-generated plan proposal. - Budget and
expense tracking. - Task checklist and deadlines. - Event timeline and
milestones. - Editable saved workspace. - Focused AI revisions with user
approval.

Each feature card should use a consistent icon treatment, heading, and
brief description.

### 6.5 Workspace preview

Use a screenshot or an accurately rendered mockup of the actual
application, not a fabricated dashboard full of fake user metrics. It
may show a clearly labeled demo event if no user data exists.

### 6.6 Event types

Show a restrained grid of use cases such as weddings, birthdays,
anniversaries, college events, family celebrations, and community
gatherings. These are planning categories, not vendor-marketplace search
pages unless those are separately implemented.

### 6.7 Trust and AI transparency

Explain that: - AI suggestions are editable proposals. - Budgets are
calculated in the application. - Estimates are not confirmed vendor
quotes. - Users review plan changes before applying them.

Only make security/privacy claims supported by the implementation and
documentation.

### 6.8 FAQ and footer

Use an accessible accordion. Answer questions about getting started,
saved plans, AI suggestions, budgets, and data handling based on actual
product behavior.

------------------------------------------------------------------------

## 7. Authentication screens

### Sign in (`/login`)

-   Compact, focused form with email and password.
-   Clear link to registration.
-   Show/hide password control with accessible label.
-   Field-level validation and a form-level error message.
-   Loading state during authentication.
-   Redirect only after authentication succeeds.
-   Avoid adding social sign-in buttons unless configured and tested.

### Registration (`/register`)

-   Name, email, password, and any required confirmation fields.
-   Clear password guidance.
-   Validation and duplicate-account error handling.
-   Link to sign in.
-   Do not ask for unnecessary personal information.

### Visual rules

-   Use the same typography, field height, border, and focus treatment
    throughout the app.
-   Forms should have a readable maximum width and a clear heading.
-   Keep decorative artwork secondary to form usability.
-   Never expose API keys or trust a client-provided user role.

------------------------------------------------------------------------

## 8. Main dashboard (`/dashboard`)

The dashboard should help the user understand what needs attention and
continue planning quickly.

### Page header

-   Greeting or neutral welcome.
-   Concise subtitle.
-   Primary "Create event" action.

### First-time/empty state

-   Explain that no events have been created yet.
-   Provide a clear create-event action.
-   Optionally show a small illustration or preview.
-   Do not show fabricated upcoming events, progress, tasks, or spending
    as if they belong to the user.

### Returning-user state

Show only data derived from saved records: - Upcoming events. - Tasks
due soon and overdue. - Actual spending versus budget. - Projected spend
only if the relevant calculation exists. - Event progress derived from
eligible task statuses. - Recent activity only if it is genuinely
recorded.

### Layout

-   Use a responsive grid of summary cards and event cards.
-   Give the primary next action a clear visual position.
-   Avoid excessive metric cards or charts that add no actionable value.
-   Use skeletons while loading; show an error/retry state if data
    cannot be loaded.

------------------------------------------------------------------------

## 9. Event creation wizard (`/events/new`)

Use a guided multi-step form. Show progress and preserve values when
moving backward and forward.

### Step 1 --- Event basics

-   Event type.
-   Event title/name.
-   Optional short description.

### Step 2 --- Date and place

-   Event date or date range.
-   Timezone.
-   Location/city or an explicit "not decided yet" option.
-   Duration or event-day structure if relevant.

### Step 3 --- Guests and budget

-   Expected guest count.
-   Budget amount.
-   Currency, defaulting to INR but stored per event.
-   Optional contingency preference if supported.

### Step 4 --- Style and preferences

-   Theme/style.
-   Priorities.
-   Constraints, preferences, and relevant notes.
-   Make optional fields clearly optional.

### Step 5 --- Review and generate

-   Summarize all inputs.
-   Let users edit an earlier step.
-   Explain that AI output is a proposal and cost figures are estimates.
-   Confirm before starting a potentially costly AI generation request.

### Interaction requirements

-   Validate each step and the final request.
-   Preserve entered data on navigation.
-   Show generation progress and a recoverable error state.
-   Prevent accidental duplicate submissions.
-   Do not show success until the server operation succeeds.
-   If generation fails, preserve the event inputs and allow a safe
    retry.

------------------------------------------------------------------------

## 10. Event workspace overview (`/events/:eventId`)

This is the core working screen after event creation.

### Event header

Show: - Event title. - Event type and date. - Location if supplied. -
High-level budget. - Edit-event action. - Clear event-specific
navigation.

### Overview content

Prioritize actionable information: - Planning progress. - Next tasks and
deadlines. - Budget summary. - Milestones/upcoming schedule. - Quick
links to tasks, budget, timeline, and AI assistant. - A short saved plan
summary.

### Data rules

-   Progress must be derived from saved task states.
-   Budget totals must be calculated from saved financial records.
-   Date/time display must respect the event timezone.
-   Distinguish "not set" from zero.
-   Do not show fake charts or invented recent activity.
-   Handle deleted, inaccessible, or nonexistent event IDs with
    appropriate feedback.

------------------------------------------------------------------------

## 11. Budget and expense screen (`/events/:eventId/budget`)

### Primary goals

Help the user understand planned allocation, estimated costs, actual
spending, and remaining funds.

### Layout

-   Page title and event context.
-   Total event budget.
-   Planned/estimated amount.
-   Actual spend.
-   Remaining budget.
-   Category breakdown.
-   Expense list.
-   Add/edit expense action.
-   Clear warning if the budget is exceeded.

### Budget categories

Examples can include venue, food, decoration, photography, outfits,
entertainment, transport, gifts, and miscellaneous. Categories must be
editable or configured in a maintainable way.

### Data semantics

Clearly distinguish: - **Budget:** the user's spending limit. -
**Estimate:** an approximate planning amount. - **Quote:** a value
explicitly entered from a vendor quote. - **Actual expense:** an amount
the user records as spent. - **Payment:** a separate concept if payment
tracking is implemented.

Never mix estimates and actual expenses into one unexplained number. Do
not present an AI-generated estimate as a verified market price.

### Interactions

-   Add, edit, and delete expenses with validation and confirmation
    where appropriate.
-   Format values using the event's selected currency.
-   Calculate totals in deterministic application code.
-   Prevent negative amounts and invalid numeric input.
-   Persist changes and update totals only after a successful operation.
-   Show empty, loading, save-success, and error states.

Charts should be used only when they improve understanding; provide
labels and accessible summaries.

------------------------------------------------------------------------

## 12. Task list (`/events/:eventId/tasks`)

### Task fields

Support fields required by the data model, such as: - Task title and
description. - Category. - Status. - Priority. - Due date. - Optional
notes.

### Layout and behavior

-   Clear page title and "Add task" action.
-   Tabs or filters for all, upcoming, completed, and overdue tasks
    where useful.
-   Sorting by due date, priority, or status.
-   A compact list on mobile and a readable list/board on larger
    screens.
-   Completion controls with clear visual status.
-   Task editing that does not lose changes.
-   Confirmation before destructive removal if needed.

### UX rules

-   Completed tasks should remain discoverable.
-   Overdue tasks should be identifiable without relying on red alone.
-   Keep task controls reachable on mobile.
-   Persist every task mutation.
-   Show errors when a save fails and preserve the user's input.
-   Use stable IDs rather than array indexes as record identity.

------------------------------------------------------------------------

## 13. Timeline (`/events/:eventId/timeline`)

Present milestones and event-day schedule in chronological order.

-   Show date/time and milestone/task title.
-   Group by date or planning phase when appropriate.
-   Make overdue/upcoming/completed states clear.
-   Allow adding or editing milestones only if supported by the data
    model.
-   Handle events without a confirmed date.
-   Use the event timezone for displayed times.
-   On mobile, use a vertical timeline or compact chronological list
    rather than a wide, clipped diagram.

Do not imply that a suggested time is a confirmed booking or vendor
commitment.

------------------------------------------------------------------------

## 14. AI assistant (`/events/:eventId/assistant`)

This screen is for structured event planning and safe revision, not an
unrestricted chat UI.

### Initial generation

Display the generated plan as structured sections: - Theme and overall
concept. - Budget allocation proposal. - Task checklist. -
Milestones/timeline. - Relevant suggestions and assumptions.

The exact fields must follow `AI_SPEC.md` and the validated response
schema.

### Revision workflow

-   Offer focused revision actions such as "reduce the budget", "change
    the theme", or "add more time for preparation" where supported.
-   Display a proposed change before applying it.
-   Clearly show assumptions, additions, removals, and fields that would
    change.
-   Require user confirmation before applying changes to saved plan
    content.
-   Preserve completed tasks, actual expenses, confirmed bookings, RSVP
    records, and other protected user data.
-   Never silently replace saved data with raw AI output.

### States

-   Initial/empty state with a clear generate-plan action.
-   Loading/progress state.
-   Successful proposal view.
-   Invalid-output or generation-error state with safe retry.
-   Review-before-apply state.
-   Success only after persistence succeeds.

### AI transparency

Label AI-generated material as suggestions. Show estimates and
assumptions clearly. Do not claim that an AI-generated vendor suggestion
has been contacted, booked, verified, or confirmed.

------------------------------------------------------------------------

## 15. Future features: vendors and guests

These screens are lower priority and must not displace the core MVP.

### Vendor records (`/events/:eventId/vendors`, P1)

If implemented, allow the user to store their own vendor options,
contact details, notes, quoted amount, and booking status. Clearly
identify user-entered records. Do not suggest that this is a verified
live vendor marketplace unless an actual integration exists.

### Guest list (`/events/:eventId/guests`, P1)

If implemented, support guest names, contact information only when
needed, and RSVP status. Treat guest data as private and avoid exposing
it in public views.

### Collaboration

Multi-user collaboration is out of initial scope unless explicitly
approved. Do not show invite/share controls that imply working
collaboration before authorization, invitations, and permissions are
implemented.

------------------------------------------------------------------------

## 16. Settings (`/settings`)

-   Basic account/profile preferences.
-   Default currency if supported; event-specific currency remains
    authoritative for event calculations.
-   Sign-out action.
-   Account deletion or sensitive actions only if their complete backend
    workflow exists.
-   Clear save states and error handling.
-   Avoid displaying sensitive authentication details or internal
    identifiers unnecessarily.

------------------------------------------------------------------------

## 17. Reusable component system

Build and reuse components instead of styling each page independently.

### Layout

-   `PublicLayout`
-   `AppLayout`
-   `AppSidebar`
-   `TopBar`
-   `MobileNavigation`
-   `PageHeader`
-   `PageContainer`
-   `Breadcrumbs` where useful
-   `EventNavigation`

### UI primitives

-   `Button` variants: primary, secondary, outline, ghost, destructive.
-   `IconButton` with accessible label.
-   `TextField`, `TextArea`, `Select`, `DatePicker`, `NumberField`.
-   `Card`, `Badge`, `Tooltip`, `DropdownMenu`.
-   `Dialog`, `Drawer`, `Accordion`, `Tabs`.
-   `ProgressBar`, `StatusBadge`, `MetricCard`.
-   `Skeleton`, `EmptyState`, `ErrorState`, `InlineAlert`, `Toast`.
-   `ConfirmDialog` for destructive actions.

### Product components

-   `EventCard`
-   `EventTypeSelector`
-   `EventWizardStepper`
-   `BudgetSummary`
-   `BudgetCategoryRow`
-   `ExpenseList`
-   `TaskListItem`
-   `TaskFilters`
-   `TimelineList`
-   `AIProposalSection`
-   `RevisionDiff`
-   `PlanAssumptionNotice`

Define shared tokens for colors, spacing, radii, typography, borders,
and shadows. Keep component variants limited and purposeful.

------------------------------------------------------------------------

## 18. Frontend architecture and project constraints

The uploaded project documentation describes this baseline: - React +
Vite + TypeScript. - Tailwind CSS. - Firebase Authentication. - Cloud
Firestore. - Firebase Cloud Functions. - Gemini API invoked only by
trusted server-side code.

Inspect the actual repository and installed package versions before
making changes. This document does not authorize migrating the project
to MERN or adding a second backend.

Suggested feature-oriented organization, adapted to the actual
repository:

``` text
src/
  app/
    App.tsx
    routes.tsx
    providers/
  components/
    layout/
    ui/
    feedback/
  features/
    auth/
    dashboard/
    events/
    event-wizard/
    budget/
    tasks/
    timeline/
    ai-assistant/
    settings/
  services/
    firebase/
    events/
    budget/
    tasks/
    ai/
  hooks/
  types/
  utils/
  styles/
    tokens.css
    globals.css
```

If the existing structure differs, adapt it incrementally. Do not move
or rename large sets of files simply to match this example.

### Data and state rules

-   Firestore is the persistence layer defined by the project baseline.
-   Use Firebase Authentication state as the source for signed-in
    identity.
-   Enforce Firestore security rules and trusted server-side
    authorization.
-   Keep Gemini credentials and privileged operations in Cloud
    Functions.
-   Validate AI output against the approved schema before saving.
-   Avoid duplicating server-owned records into unrelated local state.
-   Use local state for transient UI state; do not treat local storage
    as the primary database.
-   Keep budget arithmetic and status transitions deterministic.

------------------------------------------------------------------------

## 19. Responsive behavior

Test at `1440px`, `1024px`, `768px`, `390px`, and `360px`. Use actual
component breakpoints and check intermediate widths.

### Desktop

-   Sidebar and top bar for the authenticated workspace.
-   Multi-column dashboard cards when space permits.
-   Budget categories and task details arranged for scanning.
-   Landing hero may use a two-column composition.

### Tablet

-   Condense or collapse the sidebar.
-   Reduce grid columns and page padding.
-   Keep dashboard metrics and forms readable.
-   Prevent filters or navigation from crowding the content.

### Mobile

-   Compact header and accessible navigation drawer.
-   Single-column main content where appropriate.
-   Stack wizard fields and full-width primary actions when useful.
-   Use compact event cards and task rows.
-   Make budget lists readable without page-wide horizontal scrolling.
-   Convert wide tables into cards or contained horizontal scrolling
    where necessary.
-   Keep dialogs within the viewport and support keyboard/screen-reader
    use.
-   Avoid fixed widths and clipped text.
-   Respect safe spacing around touch targets.

Responsive behavior is not complete until each core flow can be
performed on a narrow screen.

------------------------------------------------------------------------

## 20. Accessibility and interaction standards

-   Use semantic HTML and correct heading hierarchy.
-   Associate every form field with a visible label.
-   Provide keyboard navigation and visible focus states.
-   Give icon-only buttons accessible names.
-   Manage focus in dialogs and drawers; allow Escape to close where
    appropriate.
-   Announce async success/error states accessibly.
-   Do not communicate status by color alone.
-   Respect `prefers-reduced-motion`.
-   Maintain adequate text and control contrast.
-   Ensure validation messages explain how to fix the error.
-   Do not make hover the only way to reveal essential controls.
-   Confirm destructive actions and communicate the result.
-   Avoid fake buttons, dead links, and success messages before
    persistence completes.

------------------------------------------------------------------------

## 21. Loading, empty, error, and success states

Every asynchronous data interaction needs a defined state.

### Loading

Use skeletons or concise progress indicators that preserve layout and
prevent unnecessary shifts. AI generation should clearly communicate
that work is in progress.

### Empty

Explain why the section is empty and provide one useful next action.
Examples: create an event, add a task, or record the first expense.

### Error

Use plain language, preserve user-entered data, and offer retry when
safe. Do not expose stack traces, internal identifiers, or sensitive
provider details.

### Success

Show confirmation only after the operation succeeds. Update the visible
data to reflect the saved result.

### Permission denied / missing record

Do not leak whether another user's private event exists. Show a safe,
clear message and provide navigation back to the user's own workspace.

------------------------------------------------------------------------

## 22. Motion and micro-interactions

-   Use short, subtle transitions for menus, dialogs, tab changes, and
    state changes.
-   Avoid long entrance animations that delay interaction.
-   Do not animate every card on scroll.
-   Respect reduced-motion preferences.
-   Ensure motion does not cause layout shifts or hide important
    content.
-   Prefer clear state changes over decorative effects.

------------------------------------------------------------------------

## 23. Performance and quality

-   Lazy-load non-critical imagery and routes where beneficial.
-   Avoid large background images when a smaller responsive asset is
    sufficient.
-   Avoid adding dependencies without a demonstrated need.
-   Keep components small enough to maintain and test.
-   Prevent unnecessary re-renders in large lists.
-   Use stable keys for mapped records.
-   Ensure no horizontal overflow at target widths.
-   Provide page titles and useful metadata for public pages.
-   Keep private event pages from being treated as public marketing
    content.
-   Check console errors, failed network requests, and React warnings
    during QA.

------------------------------------------------------------------------

## 24. Screenshot-based visual validation

A design prompt alone cannot guarantee a pixel-perfect result. Use this
process:

1.  Capture the reference homepage at a fixed desktop viewport and save
    a full-page screenshot.
2.  Capture the same viewport for the Festora AI landing page.
3.  Compare hero height, text wrapping, container widths, section order,
    image crop, card sizes, and whitespace.
4.  Capture dashboard, wizard, budget, task, timeline, and AI assistant
    screens.
5.  Compare internal pages against this design specification and the UX
    spec, not against PlanToday's marketplace dashboard.
6.  Repeat at tablet and mobile widths.
7.  Fix large layout differences before fine details.
8.  Re-run tests after visual changes.

Only claim that a specific page matches the reference if the relevant
screenshot comparison was actually performed. The goal is a coherent
Festora AI design inspired by the reference, not a misleading claim of
exact duplication.

------------------------------------------------------------------------

## 25. Definition of done

The frontend is ready for review when: - The landing page communicates
Festora AI's real purpose. - Authentication, event creation, dashboard,
event workspace, budget, tasks, timeline, and AI assistant follow a
consistent visual system. - Core user journeys are functional rather
than decorative. - Every visible control has a working behavior or is
clearly marked as unavailable. - The app uses actual saved data where
required and does not present fabricated user metrics. - Budget totals
and task progress are derived correctly. - AI output is visibly a
proposal and is validated before persistence. - Loading, empty, error,
success, and permission states are handled. - Responsive behavior has
been checked at desktop, tablet, and mobile sizes. - Keyboard navigation
and form accessibility have been reviewed. - Existing architecture and
security rules have been preserved. - Lint, type checks, tests, and
production build have been run; results are reported accurately. - Known
visual differences, unfinished features, and assumptions are documented.

------------------------------------------------------------------------

## 26. Implementation order

1.  Inspect the actual repository, current routes, installed packages,
    and existing UI.
2.  Read `AGENT_GUIDE.md`, `PRD.md`, `UX_SPEC.md`, and the
    technical/security documents.
3.  Capture and analyze PlanToday screenshots for inspiration; document
    observed details versus assumptions.
4.  Establish design tokens, typography, global layout, buttons, fields,
    cards, feedback states, and navigation.
5.  Implement and refine the Festora AI landing page.
6.  Implement authentication and the event creation wizard.
7.  Implement dashboard and event workspace.
8.  Implement budget, task list, and timeline with real persistence.
9.  Implement the AI proposal/revision experience with validation and
    review-before-apply.
10. Add P1 features only after the core MVP works.
11. Compare screenshots at desktop, tablet, and mobile sizes.
12. Run checks and report changed files, tests, limitations, and next
    steps.

**First instruction to the coding agent:** inspect the existing
repository and documentation, compare the current UI with this
specification, and report the minimal implementation plan before
changing code. Preserve working code and user changes; do not rewrite
the application wholesale.
