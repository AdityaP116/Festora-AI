# Festora AI — Project Documentation

This directory contains the baseline product and engineering specifications for **Festora AI**, a GenAI-powered celebration and event planning application.

## Documents

| File | Purpose |
|---|---|
| `PRD.md` | Product vision, users, scope, requirements, success metrics and release plan |
| `SRS.md` | Functional and non-functional software requirements |
| `ARCHITECTURE.md` | System boundaries, component design and key technical decisions |
| `DATA_MODEL.md` | Firestore collections, entities, relationships and invariants |
| `AI_SPEC.md` | AI behavior, structured output, prompting, validation and revision rules |
| `API_CONTRACTS.md` | Cloud Function contracts, request validation and error handling |
| `SECURITY.md` | Authentication, authorization, secrets, privacy and abuse controls |
| `UX_SPEC.md` | Routes, screens, interaction patterns and accessibility |
| `TEST_PLAN.md` | Unit, integration, security, end-to-end and acceptance tests |
| `IMPLEMENTATION_PLAN.md` | Phased delivery plan and definition of done |
| `AGENT_GUIDE.md` | Instructions for coding agents to inspect, implement and verify without inventing facts |
| `DECISIONS.md` | Assumptions and architecture decisions that must be revisited if requirements change |
| `.env.example` | Safe placeholder environment variable template |

## Current baseline

- Product name: **Festora AI**
- Initial client: React + Vite + TypeScript
- Styling: Tailwind CSS
- Linter: ESLint
- Backend: Firebase Authentication, Cloud Firestore, Firebase Cloud Functions
- GenAI provider: Gemini API called only from trusted server-side code
- Initial currency default: INR, configurable per event
- Initial language: English; multilingual support is a later enhancement unless explicitly approved
- Initial release: single-owner events; collaboration is a later phase
- Initial scope excludes real vendor marketplace integrations, online payments, automated bookings and guaranteed live pricing

These are proposed baselines, not claims about the current repository. The coding agent must inspect the repository and installed package versions before changing anything.

## How to use

1. Copy these files into the repository root.
2. Tell the coding agent to read `AGENT_GUIDE.md` first, then `PRD.md`, `SRS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `AI_SPEC.md`, `SECURITY.md`, and `TEST_PLAN.md`.
3. Require a repository audit and implementation plan before code edits.
4. Implement one vertical slice at a time.
5. Update these documents when a decision changes. Do not silently contradict them.
