/**
 * Festora AI - k6 Mixed Workload Orchestrator
 * Executes realistic mixed activities matching CAPACITY_ASSUMPTIONS.md:
 * - 30% Browse Dashboard & Events
 * - 20% Read Event Details
 * - 35% Tasks, Guests, & Expenses CRUD
 * - 15% AI Plan Generation & Revision
 */

import { sleep } from 'k6';
import { runEventBrowse, runEventCreateAndFetch } from './event-management.js';
import { runAIGeneration } from './ai-generation.js';

export { options } from './k6-config.js';

export default function () {
  const vuId = __VU;
  const rand = Math.random();

  if (rand < 0.30) {
    // 30% Browse Dashboard & Events
    runEventBrowse(vuId);
    sleep(Math.random() * 5 + 2); // 2-7s think time
  } else if (rand < 0.50) {
    // 20% Read Event Details
    runEventBrowse(vuId);
    sleep(Math.random() * 4 + 2);
  } else if (rand < 0.85) {
    // 35% Event CRUD Operations (Tasks, Guests, Expenses)
    runEventCreateAndFetch(vuId);
    sleep(Math.random() * 5 + 3);
  } else {
    // 15% AI Plan Generation & Revisions
    runAIGeneration(vuId);
    sleep(Math.random() * 8 + 5);
  }
}
