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
exports.handleGenerateEventPlan = handleGenerateEventPlan;
const admin = __importStar(require("firebase-admin"));
const ai_schemas_1 = require("./schemas/ai-schemas");
const authorization_1 = require("./services/authorization");
const rate_limits_1 = require("./services/rate-limits");
const gemini_client_1 = require("./services/gemini-client");
const security_logger_1 = require("./services/security-logger");
/**
 * Handles generateEventPlan operation per API_CONTRACTS.md Section 2.
 */
async function handleGenerateEventPlan(authHeader, body, firestore) {
    // 1. Authenticate user
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    // 2. Distributed rate limiting check backed by Firestore
    const rateLimit = await (0, rate_limits_1.checkDistributedRateLimit)(firestore, auth.uid, 5, 60);
    if (!rateLimit.allowed) {
        security_logger_1.SecurityLogger.log({
            eventType: 'RATE_LIMIT_EXCEEDED',
            severity: 'MEDIUM',
            uid: auth.uid,
            endpoint: '/generateEventPlan',
            details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
        });
        throw new authorization_1.AuthorizationError(`Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds}s before generating another plan.`, 'RESOURCE_EXHAUSTED', { retryAfterSeconds: rateLimit.retryAfterSeconds, limit: 5, remaining: 0 });
    }
    // 3. Validate input schema
    const parsedInput = ai_schemas_1.ValidatedEventInputSchema.safeParse(body.eventInput);
    if (!parsedInput.success) {
        const errorDetails = parsedInput.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        security_logger_1.SecurityLogger.log({
            eventType: 'UNTRUSTED_INPUT_DETECTED',
            severity: 'LOW',
            uid: auth.uid,
            endpoint: '/generateEventPlan',
            details: { issues: parsedInput.error.issues },
        });
        throw new authorization_1.AuthorizationError(`[INVALID_ARGUMENT] Invalid event input: ${errorDetails}`, 'INVALID_ARGUMENT');
    }
    // 4. Generate AI Plan (with invariant verification)
    const plan = await (0, gemini_client_1.callGeminiForPlan)(parsedInput.data);
    // 5. Generate proposal ID and persist proposal draft in planVersions or cache
    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    // Optional: Record proposal draft in Firestore if eventId is provided or for audit
    try {
        const proposalsRef = firestore.collection('system_proposals').doc(proposalId);
        await proposalsRef.set({
            proposalId,
            createdByUid: auth.uid,
            requestId: body.requestId || null,
            plan,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'proposed',
        });
    }
    catch {
        // Non-blocking log if proposal audit collection fails
    }
    return {
        proposalId,
        schemaVersion: 1,
        plan,
        warnings: [
            'Estimates are indicative planning allocations and not binding vendor quotes.',
            'Review dietary, seasonal availability, and contract terms prior to bookings.',
        ],
    };
}
//# sourceMappingURL=generate-event-plan.js.map