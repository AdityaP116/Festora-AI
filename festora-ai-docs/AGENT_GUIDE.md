# Coding Agent Operating Instructions
## Festora AI

Read this file before modifying code. Then read `PRD.md`, `SRS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `AI_SPEC.md`, `API_CONTRACTS.md`, `SECURITY.md`, `UX_SPEC.md` and `TEST_PLAN.md`.

## 1. First action: inspect, do not assume

Before coding:
1. Print the current working directory and inspect the repository tree.
2. Read `package.json`, lockfile, Vite config, TypeScript config, ESLint config, Firebase config, Firestore rules, functions config and existing README.
3. Inspect Git status and current diffs. Preserve uncommitted user changes.
4. Identify existing functionality, incomplete areas, dependency versions and actual scripts.
5. Check whether the repository already has a Firebase project configuration or Gemini integration; do not expose secret values in output.
6. Compare the code against the documents and report mismatches.

Do not claim to have inspected files that you did not read. Do not invent commands, versions, files, test results or provider capabilities.

## 2. Plan before implementation

Provide:
- Observed repository baseline.
- Requirements already satisfied.
- Missing or broken requirements.
- Security risks.
- Minimal implementation sequence.
- Files likely to change.
- Tests to run.

Do not rewrite the whole app to match a preferred template if the existing architecture can be repaired incrementally.

## 3. Implementation rules

- Work in small vertical slices.
- Use TypeScript and explicit types.
- Validate untrusted inputs at runtime.
- Keep domain logic separate from UI.
- Keep private API keys server-side.
- Use Firestore rules for client access and server-side authorization for privileged operations.
- Use deterministic code for money, dates, status transitions and access control.
- Treat AI output as untrusted.
- Preserve actual expenses, completed tasks, guest RSVP data and confirmed bookings during plan revisions.
- Use stable IDs and idempotent application logic where possible.
- Provide useful loading, empty and error states.
- Keep documentation and implementation synchronized.
- Prefer official documentation for changing SDK/provider behavior.

## 4. Do not

- Fabricate vendor data, availability, prices or bookings.
- Claim a test passed unless it was run.
- Suppress TypeScript/linter errors merely to get a build green.
- Commit secrets or print them in logs.
- Use permissive Firestore rules.
- Store every feature in a single giant component.
- Add unnecessary frameworks, agents, vector databases or microservices without a demonstrated requirement.
- Replace existing files or dependencies wholesale without explaining why.
- mark unfinished buttons as working.
- silently alter product requirements.

## 5. Required reporting after each phase

Report:
- What was implemented.
- Exact files created/changed.
- Commands actually run.
- Test/build results with failures.
- Known limitations.
- Security considerations.
- Next recommended phase.

If blocked, explain the specific blocker and ask only for the missing information required to proceed. Do not fabricate credentials, project IDs or configuration values.

## 6. Definition of done

A feature is done only when:
- Its behavior matches requirements.
- Input is validated.
- Authorization is enforced.
- Loading/error/empty states are implemented where relevant.
- Data persists where expected.
- Tests cover important behavior and failure cases.
- No unrelated regression is introduced.
- Documentation is updated.
