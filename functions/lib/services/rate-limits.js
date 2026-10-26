"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
const memoryRateLimitStore = new Map();
/**
 * Enforces per-user generation quotas and rate limits to prevent AI endpoint abuse.
 * Window: 60 seconds. Limit: 5 calls per minute per user.
 */
function checkRateLimit(userId, maxRequests = 5, windowSeconds = 60) {
    const now = Date.now();
    const record = memoryRateLimitStore.get(userId);
    if (!record || now > record.resetAtMs) {
        memoryRateLimitStore.set(userId, {
            count: 1,
            resetAtMs: now + windowSeconds * 1000,
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }
    if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetAtMs - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, retryAfter),
        };
    }
    record.count += 1;
    return {
        allowed: true,
        remaining: maxRequests - record.count,
    };
}
//# sourceMappingURL=rate-limits.js.map