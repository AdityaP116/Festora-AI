# Festora AI — Engineering & Architecture Documentation

Welcome to the centralized engineering documentation for **Festora AI**. This directory indexes all architecture blueprints, specifications, testing frameworks, and historical quality audit reports.

---

## Documentation Index

### 1. Core Architecture & Specifications
Original specifications and architecture contracts are located in [`festora-ai-docs/`](../festora-ai-docs/):
- **[PRD.md](../festora-ai-docs/PRD.md)**: Product requirements, user personas, success metrics, and release scope.
- **[SRS.md](../festora-ai-docs/SRS.md)**: Software Requirements Specification detailing functional and non-functional requirements.
- **[ARCHITECTURE.md](../festora-ai-docs/ARCHITECTURE.md)**: System boundaries, component topology, and foundational design decisions.
- **[DATA_MODEL.md](../festora-ai-docs/DATA_MODEL.md)**: Firestore entity models, hierarchical schemas (`users/{userId}/events/{eventId}/...`), and invariants.
- **[AI_SPEC.md](../festora-ai-docs/AI_SPEC.md)**: GenAI behavior, structured output prompting, Zod schema validation, and plan revision preservation rules.
- **[API_CONTRACTS.md](../festora-ai-docs/API_CONTRACTS.md)**: HTTP API endpoint contracts, request/response structures, and error envelopes.
- **[UX_SPEC.md](../festora-ai-docs/UX_SPEC.md)**: Information architecture, routes, modal behaviors, and user interaction patterns.
- **[Design.md](../festora-ai-docs/Design.md)**: Comprehensive design system tokens, typography, glassmorphism styling, and palette guidelines.
- **[AGENT_GUIDE.md](../festora-ai-docs/AGENT_GUIDE.md)**: Working guidelines for AI coding agents and automated pair-programming tools.
- **[DECISIONS.md](../festora-ai-docs/DECISIONS.md)**: Architectural Decision Records (ADRs) and rationale for structural trade-offs.

---

### 2. Testing Framework & Strategy
Testing methodology, pyramids, and coverage goals are located in [`docs/testing/`](testing/):
- **[TEST_STRATEGY.md](testing/TEST_STRATEGY.md)**: The active test strategy guide covering the 5-layer test pyramid (Unit, Contract, Database/Persistence, Security, and Benchmark Performance).
- **[TEST_PLAN.md](../festora-ai-docs/TEST_PLAN.md)**: Baseline QA test matrix and E2E acceptance test cases.

---

### 3. Historical Quality & Audit Reports
Historical audit snapshots, gap matrices, and verification runs are archived in [`docs/reports/`](reports/):
- **[FINAL_RELEASE_VERIFICATION.md](reports/FINAL_RELEASE_VERIFICATION.md)**: Comprehensive 27-item deep application audit covering architecture, confirmed defects, resolved vulnerabilities, and readiness evaluation.
- **[ARCHITECTURE_AUDIT_REPORT.md](reports/ARCHITECTURE_AUDIT_REPORT.md)**: Architectural baseline audit covering Firestore synchronization, token handling, schema duplication, and performance.
- **[TESTING_AUDIT_REPORT.md](reports/TESTING_AUDIT_REPORT.md)**: Initial testing matrix and gap analysis leading up to the multi-suite test expansion.
- **[TEST_EXECUTION_REPORT.md](reports/TEST_EXECUTION_REPORT.md)**: Detailed execution log and code coverage metrics across all test suites.
- **[RELEASE_READINESS_REPORT.md](reports/RELEASE_READINESS_REPORT.md)**: Production release quality gate assessment and rollback protocols.

---

### 4. Root Operational Guides
Operational guides intended for repository root visibility:
- **[README.md](../README.md)**: Project overview, verified feature matrix, quickstart, technology stack, and testing.
- **[DEPLOYMENT.md](../DEPLOYMENT.md)**: Complete staging and production deployment guide across Firebase and Vercel/Netlify.
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Contribution guidelines, code of conduct, and development workflow.
- **[SECURITY.md](../SECURITY.md)**: Security policy and responsible vulnerability disclosure process.
