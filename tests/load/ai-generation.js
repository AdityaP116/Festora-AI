/**
 * Festora AI - k6 AI Generation & Plan Revision Scenario
 * Supports Mode A (Live Gemini in Staging) and Mode B (Isolated Test Double).
 */

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, TEST_MODE } from './k6-config.js';
import { getAuthHeaders } from './auth-flow.js';

export function runAIGeneration(vuId) {
  const headers = getAuthHeaders(vuId);
  const payload = JSON.stringify({
    eventInput: {
      title: `Corporate Gala VU ${vuId}`,
      eventType: 'community_event',
      startDate: '2027-11-20',
      location: { label: 'Hyatt Regency' },
      guestCount: 150,
      budgetLimitMinor: 15000000,
      currency: 'INR',
      preferences: {
        theme: 'Modern Festive Elegance',
        notes: `Simulated load test execution for VU ${vuId}`,
      },
    },
  });

  const res = http.post(`${BASE_URL}/generateEventPlan`, payload, {
    headers,
    timeout: '35s',
  });

  check(res, {
    'POST /generateEventPlan status is 200 or 429 (rate-limited)': (r) =>
      r.status === 200 || r.status === 429,
  });
}
