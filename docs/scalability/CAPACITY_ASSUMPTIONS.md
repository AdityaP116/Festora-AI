# Festora AI — Workload Modeling & Capacity Assumptions

## 1. 10,000 Concurrent User Mathematical Workload Model

A common mistake in capacity planning is assuming that "10,000 concurrent users" means 10,000 requests arriving at the exact same millisecond. In real-world web applications, concurrent virtual users navigate with realistic human think times, reading content, filling forms, and reviewing results.

### User Journey Distribution & Think Time Parameters

| Activity Type | Population Share | Actions Per Session | User Think Time | Primary Endpoints Invoked |
|---|---|---|---|---|
| **A. Browsing & Dashboard** | 30% (3,000 users) | 1 load every 45s | 30–60s | `GET /events`, static assets |
| **B. Event Timeline & Details** | 20% (2,000 users) | 1 view every 30s | 20–40s | `GET /events?eventId=...` |
| **C. Tasks & Checklists** | 15% (1,500 users) | 1 update every 20s | 15–30s | Local state + `POST /events` |
| **D. Guest Management & RSVP** | 10% (1,000 users) | 1 update every 25s | 15–35s | Local state + `POST /events` |
| **E. Expense Tracking** | 10% (1,000 users) | 1 entry every 30s | 20–40s | Local state + `POST /events` |
| **F. AI Plan Generation** | 10% (1,000 users) | 1 generation every 5 min | 120–300s | `POST /generateEventPlan` |
| **G. AI Plan Revision** | 5% (500 users) | 1 revision every 6 min | 120–360s | `POST /proposePlanRevision` |

---

## 2. Derived Throughput (Requests Per Second)

### Non-AI Transactional Traffic
- **Browsing:** $3,000 / 45\text{s} \approx 66.7 \text{ req/s}$
- **Event Timeline Reads:** $2,000 / 30\text{s} \approx 66.7 \text{ req/s}$
- **Task & Guest Operations:** $2,500 / 25\text{s} \approx 100 \text{ req/s}$
- **Expense Entries:** $1,000 / 30\text{s} \approx 33.3 \text{ req/s}$
- **Total Non-AI Backend Throughput:** **~267 requests/sec**

### AI-Specific Traffic
- **AI Plan Generation:** $1,000 \text{ users} / 300\text{s} \approx 3.33 \text{ req/s}$ (**~200 Requests Per Minute**)
- **AI Plan Revisions:** $500 \text{ users} / 360\text{s} \approx 1.39 \text{ req/s}$ (**~83 Requests Per Minute**)
- **Total AI Generation Throughput:** **~4.72 requests/sec** (**~283 Requests Per Minute**)

---

## 3. Gemini Token Consumption & Quota Model

| Metric | Measured / Estimated Value | Reference / Evidence |
|---|---|---|
| **Average Prompt Tokens** | ~850 tokens | Structured event parameters + system prompt + contextual schema |
| **Average Completion Tokens** | ~1,650 tokens | Full 10-section JSON plan proposal (budget, tasks, milestones, schedule) |
| **Total Tokens Per Call** | ~2,500 tokens | Input + Output |
| **AI Request Frequency** | ~283 RPM | Derived from realistic 10K user model |
| **Required Token Throughput** | **~707,500 Tokens Per Minute (TPM)** | $283 \text{ RPM} \times 2,500 \text{ tokens}$ |

### Quota Verification & Feasibility Analysis
- **Google AI Studio Pay-As-You-Go Tier 1 Limit:** 2,000 RPM and 4,000,000 TPM.
- **Feasibility:** Under the realistic think-time model (283 RPM, ~708K TPM), the workload **fits within standard Tier 1 limits**.
- **Crucial Caution:** If users do not have realistic think times (e.g. naive script blasting requests without pause), 1,500 users generating simultaneously would demand >3,750,000 TPM and instantly trigger 429 quota exhaustion.

---

## 4. Firestore Capacity Model

- **Read Operations:**
  - 10,000 users reading events: ~133 reads/sec.
  - Document sizing: Event documents are typically 2 KB to 8 KB.
  - Total read bandwidth: ~1 MB/s (well within Firestore multi-megabyte/sec limits).
- **Write Operations:**
  - Rate-limit updates: 283 writes/sec across separate user documents.
  - Event CRUD saves: ~133 writes/sec.
  - Total writes: ~416 writes/sec.
  - **Firestore Limit:** 10,000 writes/sec for the database; 1 write/sec per individual document.
  - Since writes are partitioned across distinct `users/{uid}/...` documents, Firestore will not encounter database-wide write throttling under this distribution.
