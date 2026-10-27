# Festora AI — Production Deployment & Operations Guide

## 1. Verified Architecture Overview

Festora AI is architected for high reliability, zero arithmetic hallucination, and multi-tenant security:

- **Frontend:** React 19 + TypeScript + Vite Single-Page Application (SPA) deployed to **Vercel** with custom security headers and client-side route fallback in [`vercel.json`](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/vercel.json).
- **Backend & Cloud Functions:** Node.js 20 runtime on **Firebase Cloud Functions v2** (`functions/src/index.ts`) handling AI plan proposals, deterministic budget validation, and rate limiting.
- **Data & Security Tier:** **Google Cloud Firestore** enforcing multi-tenant isolation rules in [`firestore.rules`](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/firestore.rules) and indexes in [`firestore.indexes.json`](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/firestore.indexes.json).
- **CI/CD Orchestration:** GitHub Actions pipelines under [`.github/workflows/`](file:///c:/Users/Admin/Desktop/festora_AI/Festora-AI/.github/workflows):
  - `ci.yml`: Mandatory linting, type checks, unit/contract/security tests, and production artifact compilation on every pull request and push.
  - `production-deploy.yml`: Protected release gate triggered via version tags (`v*.*.*`) or manual dispatch under the `production` GitHub Environment.

---

## 2. Environment Variables & Secret Configuration

### A. Frontend Environment Variables (Build-Time in Vercel)
Configure these in **Vercel Dashboard > Project Settings > Environment Variables**:

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `VITE_FIREBASE_API_KEY` | Yes | Public Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain (e.g. `festora-ai.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Google Cloud / Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase cloud messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web application identifier |
| `VITE_API_BASE_URL` | Optional | Backend Functions endpoint (defaults to Firebase Functions live URL) |

> [!CAUTION]
> Never expose Gemini API keys, service accounts, or private database credentials in `VITE_*` variables. Client bundles are publicly accessible.

### B. Backend Secrets (Server-Side in Firebase Functions)
Store the Gemini API credential using Google Cloud Secret Manager via the Firebase CLI:

```bash
# Securely configure Gemini API key on the backend
firebase functions:secrets:set GEMINI_API_KEY
```

---

## 3. GitHub Secrets for Automated CI/CD

To enable automated production deployments via `.github/workflows/production-deploy.yml`, configure these repository secrets in **GitHub > Settings > Secrets and variables > Actions**:

- **Firebase Deployment:**
  - `FIREBASE_TOKEN`: Generated via `firebase login:ci` **OR**
  - `FIREBASE_SERVICE_ACCOUNT`: Service account JSON with `Firebase Admin` and `Cloud Functions Admin` roles.
- **Vercel Deployment (Optional if Vercel GitHub App is installed):**
  - `VERCEL_TOKEN`: Vercel Personal Access Token.
  - `VERCEL_ORG_ID`: Vercel Organization ID.
  - `VERCEL_PROJECT_ID`: Vercel Project ID.

---

## 4. Local Development, Testing & Verification Commands

```bash
# 1. Clean Install
npm ci
npm --prefix functions ci

# 2. Static Analysis & Linting
npm run lint

# 3. TypeScript Type-Checking
npx tsc -b
npm --prefix functions run build

# 4. Automated Test Suite (70 tests across 12 files)
npm test

# 5. Production Bundle Build
npm run build
```

---

## 5. Rollback & Release Safety Procedures

1. **Frontend Rollback (Vercel):**
   - In the Vercel dashboard, navigate to **Deployments**.
   - Locate the previous successful deployment and click **Promote to Production**. Instant, zero-downtime traffic switch.
2. **Backend & Cloud Functions Rollback (Firebase):**
   - Check out the known-good Git release tag (e.g., `git checkout v1.0.0`).
   - Run `npm --prefix functions run build`.
   - Deploy the specific functions: `firebase deploy --only functions`.
3. **Firestore Security Rules:**
   - Previous rule versions are versioned in Cloud Firestore history in the Firebase Console.
   - Rules can be reverted instantly from the console or by deploying the desired Git tag: `firebase deploy --only firestore:rules`.
