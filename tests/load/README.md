# Festora AI — k6 Load Testing Suite

## Overview
This directory contains k6 load-testing scripts for evaluating the scalability and reliability of Festora AI across progressive virtual user stages (10 to 10,000 VUs).

## Prerequisites
- Install k6: `winget install k6 --source winget` or download from [k6.io](https://k6.io).
- Dedicated staging environment or local emulator cluster.

## Safety Rules
1. **NEVER target production (`https://festora-ai.netlify.app` or live Firebase).**
2. **Mode B (Default):** Uses isolated mock tokens and test doubles to evaluate serverless infrastructure capacity without consuming Gemini quota.
3. **Mode A:** Only run against dedicated staging infrastructure with explicit spending limits enabled.

## Execution Commands

### 1. Smoke Test (10 VUs, 1 minute)
```bash
k6 run -e TARGET_VUS=10 -e TEST_DURATION=1m -e API_BASE_URL=http://127.0.0.1:5001 tests/load/scenarios.js
```

### 2. Baseline Test (100 VUs, 3 minutes)
```bash
k6 run -e TARGET_VUS=100 -e TEST_DURATION=3m -e API_BASE_URL=http://127.0.0.1:5001 tests/load/scenarios.js
```

### 3. Medium Load Test (500 VUs, 5 minutes)
```bash
k6 run -e TARGET_VUS=500 -e TEST_DURATION=5m -e API_BASE_URL=http://127.0.0.1:5001 tests/load/scenarios.js
```

### 4. High Load Test (1,000 VUs, 10 minutes)
```bash
k6 run -e TARGET_VUS=1000 -e TEST_DURATION=10m -e API_BASE_URL=http://127.0.0.1:5001 tests/load/scenarios.js
```

### 5. Target Scale (10,000 VUs — Distributed Staging Cluster)
```bash
k6 run -e TARGET_VUS=10000 -e TEST_DURATION=30m -e API_BASE_URL=https://staging-api.festora.ai tests/load/scenarios.js
```
