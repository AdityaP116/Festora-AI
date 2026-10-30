/**
 * Festora AI - k6 Event Management Scenario
 * Exercises event listing, creation, and detail retrieval.
 */

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './k6-config.js';
import { getAuthHeaders } from './auth-flow.js';

export function runEventBrowse(vuId) {
  const headers = getAuthHeaders(vuId);
  const res = http.get(`${BASE_URL}/events`, { headers });
  check(res, {
    'GET /events status is 200': (r) => r.status === 200,
  });
}

export function runEventCreateAndFetch(vuId) {
  const headers = getAuthHeaders(vuId);
  const payload = JSON.stringify({
    title: `Celebration by VU ${vuId}`,
    eventType: 'birthday',
    startDate: '2027-10-15',
    location: { label: 'Grand Banquet Hall' },
    guestCount: 50,
    budgetLimitMinor: 5000000,
    currency: 'INR',
  });

  const createRes = http.post(`${BASE_URL}/events`, payload, { headers });
  const success = check(createRes, {
    'POST /events status is 201': (r) => r.status === 201,
  });

  if (success && createRes.json('id')) {
    const eventId = createRes.json('id');
    const getRes = http.get(`${BASE_URL}/events?eventId=${encodeURIComponent(eventId)}`, { headers });
    check(getRes, {
      'GET /events?eventId status is 200': (r) => r.status === 200,
    });
  }
}
