"use strict";
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
exports.events = exports.proposePlanRevision = exports.applyEventPlan = exports.generateEventPlan = exports.health = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const generate_event_plan_1 = require("./generate-event-plan");
const apply_event_plan_1 = require("./apply-event-plan");
const propose_plan_revision_1 = require("./propose-plan-revision");
const event_operations_1 = require("./event-operations");
const authorization_1 = require("./services/authorization");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
function isOriginAllowed(origin) {
    if (!origin)
        return false;
    try {
        const parsed = new URL(origin);
        if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
            (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
            ['5173', '5000', '3000', '4173'].includes(parsed.port || '80')) {
            return true;
        }
        if (parsed.protocol === 'https:') {
            if (parsed.hostname === 'festora.ai' || parsed.hostname.endsWith('.festora.ai')) {
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
function setCorsHeaders(res, req) {
    const origin = typeof req?.headers?.origin === 'string' ? req.headers.origin : undefined;
    if (origin && isOriginAllowed(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');
    }
    else {
        res.set('Access-Control-Allow-Origin', 'null');
    }
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id');
    res.set('Access-Control-Max-Age', '86400');
    res.set('Vary', 'Origin');
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
exports.health = (0, https_1.onRequest)({ cors: true }, (_req, res) => {
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
exports.generateEventPlan = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    setCorsHeaders(res, req);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const requestId = req.headers['x-request-id'] || undefined;
    try {
        const authHeader = req.headers.authorization;
        const result = await (0, generate_event_plan_1.handleGenerateEventPlan)(authHeader, req.body, db);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(res, err, requestId);
    }
});
/**
 * applyEventPlan HTTP/Callable Function (API_CONTRACTS.md Section 3)
 */
exports.applyEventPlan = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    setCorsHeaders(res, req);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const requestId = req.headers['x-request-id'] || undefined;
    try {
        const authHeader = req.headers.authorization;
        const result = await (0, apply_event_plan_1.handleApplyEventPlan)(authHeader, req.body, db);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(res, err, requestId);
    }
});
/**
 * proposePlanRevision HTTP/Callable Function (API_CONTRACTS.md Section 4)
 */
exports.proposePlanRevision = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    setCorsHeaders(res, req);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const requestId = req.headers['x-request-id'] || undefined;
    try {
        const authHeader = req.headers.authorization;
        const result = await (0, propose_plan_revision_1.handleProposePlanRevision)(authHeader, req.body, db);
        res.status(200).json(result);
    }
    catch (err) {
        handleError(res, err, requestId);
    }
});
/**
 * events router HTTP Function for event management
 */
exports.events = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    setCorsHeaders(res, req);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const requestId = req.headers['x-request-id'] || undefined;
    try {
        const authHeader = req.headers.authorization;
        if (req.method === 'GET') {
            const eventId = req.query.eventId;
            if (eventId) {
                const item = await (0, event_operations_1.handleGetEventById)(authHeader, eventId, db);
                res.status(200).json(item);
            }
            else {
                const list = await (0, event_operations_1.handleGetEvents)(authHeader, db);
                res.status(200).json({ events: list });
            }
        }
        else if (req.method === 'POST') {
            const created = await (0, event_operations_1.handleCreateEvent)(authHeader, req.body, db);
            res.status(201).json(created);
        }
        else if (req.method === 'DELETE') {
            const eventId = req.query.eventId;
            if (!eventId) {
                throw new authorization_1.AuthorizationError('Missing eventId query parameter', 'INVALID_ARGUMENT');
            }
            const deleted = await (0, event_operations_1.handleDeleteEvent)(authHeader, eventId, db);
            res.status(200).json(deleted);
        }
        else {
            res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not supported.' } });
        }
    }
    catch (err) {
        handleError(res, err, requestId);
    }
});
//# sourceMappingURL=index.js.map