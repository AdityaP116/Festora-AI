import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { handleGenerateEventPlan } from './generate-event-plan';
import { handleApplyEventPlan } from './apply-event-plan';
import { handleProposePlanRevision } from './propose-plan-revision';
import {
  handleGetEvents,
  handleGetEventById,
  handleCreateEvent,
  handleDeleteEvent,
} from './event-operations';
import { AuthorizationError } from './services/authorization';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface HeaderResponse {
  set(header: string, value: string): void;
}

interface JsonResponse {
  status(code: number): { json(body: unknown): void };
}

interface KnownError {
  code?: string;
  message?: string;
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      ['5173', '5000', '3000', '4173'].includes(parsed.port || '80')
    ) {
      return true;
    }
    if (parsed.protocol === 'https:') {
      if (parsed.hostname === 'festora.ai' || parsed.hostname.endsWith('.festora.ai')) {
        const parts = parsed.hostname.split('.');
        const isFestoraDomain = parts.slice(-2).join('.') === 'festora.ai';
        if (isFestoraDomain) return true;
      }
      if (parsed.hostname === 'festora-ai.netlify.app') {
        return true;
      }
    }
    if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function setCorsHeaders(res: HeaderResponse, req?: { headers: Record<string, string | string[] | undefined> }) {
  const origin = typeof req?.headers?.origin === 'string' ? req.headers.origin : undefined;

  if (origin && isOriginAllowed(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
  } else {
    res.set('Access-Control-Allow-Origin', 'null');
  }

  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id');
  res.set('Access-Control-Max-Age', '86400');
  res.set('Vary', 'Origin');
}

function handleError(res: HeaderResponse & JsonResponse, error: unknown, requestId?: string) {
  const err = (error && typeof error === 'object' ? error : {}) as KnownError & {
    retryAfterSeconds?: number;
    limit?: number;
    remaining?: number;
  };
  const code = err.code || 'INTERNAL';
  const message = err.message || 'An unexpected internal error occurred.';
  const statusMap: Record<string, number> = {
    UNAUTHENTICATED: 401,
    PERMISSION_DENIED: 403,
    NOT_FOUND: 404,
    INVALID_ARGUMENT: 400,
    RESOURCE_EXHAUSTED: 429,
    AI_PROVIDER_UNAVAILABLE: 503,
    AI_OUTPUT_INVALID: 502,
    CONFLICT: 409,
    INTERNAL: 500,
  };

  const status = statusMap[code] || 500;

  if (code === 'RESOURCE_EXHAUSTED') {
    const retryAfter = err.retryAfterSeconds || 60;
    res.set('Retry-After', String(retryAfter));
    res.set('RateLimit-Limit', String(err.limit || 5));
    res.set('RateLimit-Remaining', String(err.remaining ?? 0));
    res.set('RateLimit-Reset', String(retryAfter));
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(requestId ? { requestId } : {}),
      ...(code === 'RESOURCE_EXHAUSTED' && typeof err.retryAfterSeconds === 'number'
        ? { retryAfterSeconds: err.retryAfterSeconds }
        : {}),
    },
  });
}

/**
 * Health check endpoint
 */
export const health = onRequest({ cors: true }, (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'festora-ai-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * generateEventPlan HTTP/Callable Function (API_CONTRACTS.md Section 2)
 */
export const generateEventPlan = onRequest({ cors: true }, async (req, res) => {
  setCorsHeaders(res, req);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;
  try {
    const authHeader = req.headers.authorization;
    const result = await handleGenerateEventPlan(authHeader, req.body, db);
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err, requestId);
  }
});

/**
 * applyEventPlan HTTP/Callable Function (API_CONTRACTS.md Section 3)
 */
export const applyEventPlan = onRequest({ cors: true }, async (req, res) => {
  setCorsHeaders(res, req);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;
  try {
    const authHeader = req.headers.authorization;
    const result = await handleApplyEventPlan(authHeader, req.body, db);
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err, requestId);
  }
});

/**
 * proposePlanRevision HTTP/Callable Function (API_CONTRACTS.md Section 4)
 */
export const proposePlanRevision = onRequest({ cors: true }, async (req, res) => {
  setCorsHeaders(res, req);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;
  try {
    const authHeader = req.headers.authorization;
    const result = await handleProposePlanRevision(authHeader, req.body, db);
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err, requestId);
  }
});

/**
 * events router HTTP Function for event management
 */
export const events = onRequest({ cors: true }, async (req, res) => {
  setCorsHeaders(res, req);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;
  try {
    const authHeader = req.headers.authorization;
    if (req.method === 'GET') {
      const eventId = req.query.eventId as string;
      if (eventId) {
        const item = await handleGetEventById(authHeader, eventId, db);
        res.status(200).json(item);
      } else {
        const list = await handleGetEvents(authHeader, db);
        res.status(200).json({ events: list });
      }
    } else if (req.method === 'POST') {
      const created = await handleCreateEvent(authHeader, req.body, db);
      res.status(201).json(created);
    } else if (req.method === 'DELETE') {
      const eventId = req.query.eventId as string;
      if (!eventId) {
        throw new AuthorizationError('Missing eventId query parameter', 'INVALID_ARGUMENT');
      }
      const deleted = await handleDeleteEvent(authHeader, eventId, db);
      res.status(200).json(deleted);
    } else {
      res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported.' } });
    }
  } catch (err) {
    handleError(res, err, requestId);
  }
});
