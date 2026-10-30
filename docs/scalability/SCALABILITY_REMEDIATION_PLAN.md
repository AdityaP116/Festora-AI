# Festora AI — Scalability & Load Testing Implementation Plan

## 1. Overview & Testing Strategy

To evaluate 10,000 concurrent user scalability without violating production safety rules or exhausting external quotas, Festora AI adopts a **Dual-Mode k6 Testing Architecture**:

- **Mode B (Backend Capacity Isolation — Default for high concurrency):**
  - Uses an isolated Gemini test double returning schema-compliant event proposals within realistic synthetic latency (1,500ms).
  - Tests authentication, Firestore transactions, Cloud Functions scaling, routing, and rate-limiting independently of third-party API availability.
- **Mode A (Full Integration — Controlled Staging Run):**
  - Connects to the real Gemini API on a dedicated staging project with explicit budget caps and controlled concurrency ($\le 250$ VUs) to measure real LLM generation latencies and token consumption.

---

## 2. Directory Structure

The load-testing suite is organized under `tests/load/`:
- `k6-config.js`: Global thresholds, stages, and environmental endpoints.
- `scenarios.js`: Workload orchestrator simulating the 7 user journey activities.
- `auth-flow.js`: Generates mock and valid bearer tokens for isolated test users.
- `event-management.js`: Tests event listing, creation, and detail retrieval.
- `ai-generation.js`: Handles AI generation in Mode A and Mode B.
- `README.md`: Execution instructions and safety protocols.

---

## 3. Staged Load Progression Table

| Stage | Virtual Users (VUs) | Target Duration | Acceptance Criteria |
|---|---|---|---|
| **Smoke Test** | 10 VUs | 2 minutes | 0% HTTP 5xx, p95 latency < 500ms |
| **Baseline Test** | 100 VUs | 5 minutes | 0% HTTP 5xx, p95 latency < 800ms |
| **Medium Load** | 500 VUs | 10 minutes | < 0.1% 5xx, p95 latency < 1,000ms |
| **High Load** | 1,000 VUs | 15 minutes | < 0.2% 5xx, p95 latency < 1,200ms |
| **Stress Test** | 2,500 VUs | 15 minutes | < 0.5% 5xx, p95 latency < 1,500ms |
| **Target Scale** | 10,000 VUs | 30 minutes | Mode B: < 0.5% 5xx, p95 latency < 2,000ms |

---

## 4. Safety & Compliance Rules
1. Never run k6 against `festora-ai.netlify.app` or production Firebase instances.
2. All test accounts must use the isolated prefix `loadtest_user_XXXXX@festora.test`.
3. In Mode A, set `MAX_AI_SPEND_USD=25` to prevent unintended credit consumption.
