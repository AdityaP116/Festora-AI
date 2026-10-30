"use strict";
/**
 * Festora AI - Local Backend Functions Development Server
 * Exposes Cloud Function HTTP endpoints locally on port 5001.
 * Allows running the backend locally without full Firebase emulator suite or cloud dependencies.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const admin = __importStar(require("firebase-admin"));
const generate_event_plan_1 = require("./generate-event-plan");
const apply_event_plan_1 = require("./apply-event-plan");
const propose_plan_revision_1 = require("./propose-plan-revision");
const event_operations_1 = require("./event-operations");
const authorization_1 = require("./services/authorization");
const security_logger_1 = require("./services/security-logger");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
function isOriginAllowed(origin) {
    if (!origin)
        return false;
    try {
        const parsed = new URL(origin);
        // Allow local development servers on approved ports
        if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
            (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
            ['5173', '5000', '3000', '4173'].includes(parsed.port || '80')) {
            return true;
        }
        // Allow production and staging domains under festora.ai or configured origin
        if (parsed.protocol === 'https:') {
            if (parsed.hostname === 'festora.ai' || parsed.hostname.endsWith('.festora.ai')) {
                // Prevent lookalike hostnames (must be festora.ai or a direct subdomain *.festora.ai)
                const parts = parsed.hostname.split('.');
                const isFestoraDomain = parts.slice(-2).join('.') === 'festora.ai';
                if (isFestoraDomain)
                    return true;
            }
            if (parsed.hostname === 'festora-ai.netlify.app') {
                return true;
            }
        }
        if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
function setCorsHeaders(req, res) {
    const origin = req.headers.origin;
    const isAllowed = origin && isOriginAllowed(origin);
    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    else {
        // Fail closed: do not reflect untrusted origins or allow credentials
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    // Hardened Security Headers (HTTPS/TLS enforcement and MIME sniffing protection)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 2 * 1024 * 1024) {
                reject(new authorization_1.AuthorizationError('Payload too large', 'INVALID_ARGUMENT'));
            }
        });
        req.on('end', () => {
            if (!body.trim()) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(body));
            }
            catch {
                reject(new authorization_1.AuthorizationError('Malformed JSON payload', 'INVALID_ARGUMENT'));
            }
        });
        req.on('error', (err) => reject(err));
    });
}
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}
function handleError(res, error, requestId) {
    const err = (error && typeof error === 'object' ? error : {});
    const code = err.code || 'INTERNAL';
    const message = err.message || 'An unexpected internal error occurred.';
    const statusMap = {
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
        security_logger_1.SecurityLogger.log({
            eventType: code === 'UNAUTHENTICATED' ? 'AUTH_FAILURE' : 'PERMISSION_DENIED',
            severity: 'HIGH',
            requestId,
            details: { message, code, status },
        });
    }
    else if (code === 'RESOURCE_EXHAUSTED') {
        const authErr = error;
        const retryAfter = authErr.retryAfterSeconds || 60;
        res.setHeader('Retry-After', String(retryAfter));
        res.setHeader('RateLimit-Limit', String(authErr.limit || 5));
        res.setHeader('RateLimit-Remaining', String(authErr.remaining ?? 0));
        res.setHeader('RateLimit-Reset', String(retryAfter));
        security_logger_1.SecurityLogger.log({
            eventType: 'RATE_LIMIT_EXCEEDED',
            severity: 'MEDIUM',
            requestId,
            details: { message, code, retryAfterSeconds: retryAfter },
        });
    }
    sendJson(res, status, {
        error: {
            code,
            message,
            ...(requestId ? { requestId } : {}),
            ...(code === 'RESOURCE_EXHAUSTED' && typeof error?.retryAfterSeconds === 'number'
                ? { retryAfterSeconds: error.retryAfterSeconds }
                : {}),
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
    const requestId = req.headers['x-request-id'] || undefined;
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
            const result = await (0, generate_event_plan_1.handleGenerateEventPlan)(authHeader, body, db);
            sendJson(res, 200, result);
            return;
        }
        // applyEventPlan endpoint
        if ((pathname === '/applyEventPlan' || pathname.endsWith('/applyEventPlan')) && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const result = await (0, apply_event_plan_1.handleApplyEventPlan)(authHeader, body, db);
            sendJson(res, 200, result);
            return;
        }
        // proposePlanRevision endpoint
        if ((pathname === '/proposePlanRevision' || pathname.endsWith('/proposePlanRevision')) && req.method === 'POST') {
            const body = await parseJsonBody(req);
            const result = await (0, propose_plan_revision_1.handleProposePlanRevision)(authHeader, body, db);
            sendJson(res, 200, result);
            return;
        }
        // events router
        if (pathname === '/events' || pathname.endsWith('/events')) {
            if (req.method === 'GET') {
                const eventId = parsedUrl.query.eventId;
                if (eventId) {
                    const item = await (0, event_operations_1.handleGetEventById)(authHeader, eventId, db);
                    sendJson(res, 200, item);
                }
                else {
                    const list = await (0, event_operations_1.handleGetEvents)(authHeader, db);
                    sendJson(res, 200, { events: list });
                }
                return;
            }
            if (req.method === 'POST') {
                const body = await parseJsonBody(req);
                const created = await (0, event_operations_1.handleCreateEvent)(authHeader, body, db);
                sendJson(res, 201, created);
                return;
            }
            if (req.method === 'DELETE') {
                const eventId = parsedUrl.query.eventId;
                if (!eventId) {
                    throw new authorization_1.AuthorizationError('Missing eventId query parameter', 'INVALID_ARGUMENT');
                }
                const deleted = await (0, event_operations_1.handleDeleteEvent)(authHeader, eventId, db);
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
    }
    catch (err) {
        handleError(res, err, requestId);
    }
});
exports.server = server;
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Festora AI Local Functions Server running at http://127.0.0.1:${PORT}`);
    });
}
//# sourceMappingURL=server.js.map