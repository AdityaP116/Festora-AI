# Festora AI — Production Scalability & Architecture Audit

## 1. Executive Summary & Objective

This document audits the real, deployed architectural topology of Festora AI to evaluate its readiness for **10,000 concurrent virtual users (VUs)** executing a realistic mixed workload.

- **Frontend Host:** Netlify CDN (`https://festora-ai.netlify.app/`)
- **Backend API:** Google Cloud Functions v2 (HTTP onRequest) + Standalone Node.js Engine
- **Database:** Google Cloud Firestore (Native Multi-tenant Hierarchy)
- **Authentication:** Firebase Identity Platform (JWT Verification)
- **AI Planning Engine:** Google Gemini API (`@google/generative-ai`) with Deterministic Rule Fallback

---

## 2. Actual System Topology & Request Flow

```
[Browser Client SPA]
       │
       ├─── Static Assets (HTML/JS/CSS) ───► [Netlify CDN Edge (Global Anycast)]
       │
       ├─── Local-First Persistence ───────► [Browser localStorage (Workspace State)]
       │
       └─── API Requests (/generateEventPlan, /events, etc.)
                   │
                   ▼
       [Google Cloud Functions v2 (Node 20)]
             │
             ├─► [Firebase Auth Admin] ──► Token Signature Verification (Cached Public Keys)
             │
             ├─► [Firestore Distributed DB] ──► Rate Limits & Document CRUD (users/{uid}/...)
             │
             └─► [Google Gemini AI API] ──► Structured JSON Plan Generation
```

### Component Analysis

| Component | Technology | Responsibility | Known Constraints |
|---|---|---|---|
| **Client Frontend** | React 18, Vite 8.3.4 | SPA rendering, UI state, client-side budget calculations | Single-page bundle; initial download ~1.08 MB (gzipped ~350 KB). |
| **Edge CDN** | Netlify | Global caching of immutable hashed bundles (`/assets/*`) | `connect-src` CSP header must permit backend function domains. |
| **API Endpoints** | Cloud Functions v2 | Stateless request routing, token authentication, validation | Default 256MB memory, unconfigured max concurrency per instance. |
| **Data Layer** | Cloud Firestore | Event metadata, tasks, expenses, guests, audit trail | Document write limit: 1 write/sec per document; batch limit: 500 ops. |
| **AI Service** | Gemini API (`@google/generative-ai`) | Generates structured event plans and budgets | Upstream provider quotas (RPM/TPM) and generation latencies (2–6s). |

---

## 3. Critical Findings & Architectural Bottlenecks

### Finding 1: Configured Gemini Model Status & Silent Fallback Masking
- **Current Codebase Configuration:**
  - File: [`functions/src/services/gemini-client.ts` line 41](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/functions/src/services/gemini-client.ts#L41)
  - Configured Model: `gemini-1.5-flash`
  - In `src/services/storage.ts` line 587, the metadata snapshot references `gemini-1.5-pro-preview`.
- **Behavior Under Provider Failure:**
  Lines 82–85 of `gemini-client.ts`:
  ```typescript
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('Gemini API call unsuccessful or not configured, utilizing deterministic fallback engine:', errMsg);
  }
  const fallback = generateDeterministicPlan(input);
  return validated;
  ```
- **Architectural Risk:**
  When upstream Gemini quotas are exceeded or if an unsupported model identifier is called, the application **silently masks the failure** and outputs synthetic deterministic plans. Under a 10,000-user load test, a test suite might record 100% HTTP 200 success while 99% of requests actually fell back to local CPU math without invoking Gemini.

### Finding 2: Unconfigured Cloud Functions v2 Concurrency
- In [`functions/src/index.ts`](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/functions/src/index.ts), functions are registered as `onRequest({ cors: true }, ...)` without custom resource definitions:
  - `concurrency`: Defaults to 80 on Cloud Run / Cloud Functions v2, but can be limited to 1 if not declared.
  - `minInstances`: Defaults to 0 (inducing cold starts under burst traffic).
  - `maxInstances`: Subject to standard regional quotas (typically 100–1000).

### Finding 3: AI Workload Resource Contention
- AI operations (`/generateEventPlan` and `/proposePlanRevision`) take 2,000–6,000 ms to complete due to LLM generation.
- Non-AI operational endpoints (`/events`, checklist updates, guest CRUD) take 30–120 ms.
- If deployed to a shared unpartitioned pool, long-running AI requests saturate available connection sockets and function instances, denying service to simple CRUD tasks.

---

## 4. Workload Isolation Recommendation
To support high concurrent user volumes, AI endpoints must be decoupled from transactional event management endpoints via distinct infrastructure policies and independent rate-limiting budgets.
