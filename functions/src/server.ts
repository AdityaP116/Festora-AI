/**
 * Festora AI - Local Backend Functions Development Server
 * Exposes Cloud Function HTTP endpoints locally on port 5001.
 * Allows running the backend locally without full Firebase emulator suite or cloud dependencies.
 */

import * as http from 'http';
import * as url from 'url';
import * as admin from 'firebase-admin';
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
import { SecurityLogger } from './services/security-logger';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
  const origin = req.headers.origin || 'http://localhost:5173';
  // Allow localhost origins or matching configured frontends
  if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173' || origin.endsWith('.festora.ai')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Hardened Security Headers (HTTPS/TLS enforcement and MIME sniffing protection)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new AuthorizationError('Payload too large', 'INVALID_ARGUMENT'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new AuthorizationError('Malformed JSON payload', 'INVALID_ARGUMENT'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function handleError(res: http.ServerResponse, error: unknown, requestId?: string) {
  const err = (error && typeof error === 'object' ? error : {}) as { code?: string; message?: string };
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

  if (code === 'UNAUTHENTICATED' || code === 'PERMISSION_DENIED') {
    SecurityLogger.log({
      eventType: code === 'UNAUTHENTICATED' ? 'AUTH_FAILURE' : 'PERMISSION_DENIED',
      severity: 'HIGH',
      requestId,
      details: { message, code, status },
    });
  } else if (code === 'RESOURCE_EXHAUSTED') {
    SecurityLogger.log({
      eventType: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      requestId,
      details: { message, code },
    });
  }

  sendJson(res, status, {
    error: {
      code,
      message,
      ...(requestId ? { requestId } : {}),
    },
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';
  const authHeader = req.headers.authorization;
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  try {
    // Health check endpoint
    if (pathname === '/health' && req.method === 'GET') {
      sendJson(res, 200, {
        status: 'healthy',
        service: 'festora-ai-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // generateEventPlan endpoint
    if ((pathname === '/generateEventPlan' || pathname.endsWith('/generateEventPlan')) && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await handleGenerateEventPlan(authHeader, body, db);
      sendJson(res, 200, result);
      return;
    }

    // applyEventPlan endpoint
    if ((pathname === '/applyEventPlan' || pathname.endsWith('/applyEventPlan')) && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await handleApplyEventPlan(authHeader, body, db);
      sendJson(res, 200, result);
      return;
    }

    // proposePlanRevision endpoint
    if ((pathname === '/proposePlanRevision' || pathname.endsWith('/proposePlanRevision')) && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await handleProposePlanRevision(authHeader, body, db);
      sendJson(res, 200, result);
      return;
    }

    // events router
    if (pathname === '/events' || pathname.endsWith('/events')) {
      if (req.method === 'GET') {
        const eventId = parsedUrl.query.eventId as string;
        if (eventId) {
          const item = await handleGetEventById(authHeader, eventId, db);
          sendJson(res, 200, item);
        } else {
          const list = await handleGetEvents(authHeader, db);
          sendJson(res, 200, { events: list });
        }
        return;
      }

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const created = await handleCreateEvent(authHeader, body, db);
        sendJson(res, 201, created);
        return;
      }

      if (req.method === 'DELETE') {
        const eventId = parsedUrl.query.eventId as string;
        if (!eventId) {
          throw new AuthorizationError('Missing eventId query parameter', 'INVALID_ARGUMENT');
        }
        const deleted = await handleDeleteEvent(authHeader, eventId, db);
        sendJson(res, 200, deleted);
        return;
      }
    }

    // Unmatched route
    sendJson(res, 404, {
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${pathname} not found on this server`,
      },
    });
  } catch (err: unknown) {
    handleError(res, err, requestId);
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Festora AI Local Functions Server running at http://127.0.0.1:${PORT}`);
  });
}

export { server };
