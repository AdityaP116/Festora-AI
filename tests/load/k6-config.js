/**
 * Festora AI - k6 Central Load Test Configuration
 * Configures thresholds, target base URLs, and staged ramp-ups.
 */

export const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:5001';
export const TEST_MODE = __ENV.TEST_MODE || 'MODE_B'; // 'MODE_A' (Live Gemini) or 'MODE_B' (Test Double)

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // Global error rate < 1%
    http_req_duration: ['p(95)<1500', 'p(99)<3000'], // 95% of requests under 1.5s
  },
  scenarios: {
    mixed_workload: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: __ENV.TARGET_VUS ? parseInt(__ENV.TARGET_VUS, 10) : 10 }, // Ramp up
        { duration: __ENV.TEST_DURATION || '1m', target: __ENV.TARGET_VUS ? parseInt(__ENV.TARGET_VUS, 10) : 10 }, // Hold load
        { duration: '30s', target: 0 }, // Ramp down
      ],
      gracefulRampDown: '15s',
    },
  },
};
