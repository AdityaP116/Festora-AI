"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.checkDistributedRateLimit = checkDistributedRateLimit;
const memoryRateLimitStore = new Map();
/**
 * Enforces per-user generation quotas and rate limits to prevent AI endpoint abuse.
 * Window: 60 seconds. Limit: 5 calls per minute per user.
 * Supports synchronous memory check as well as asynchronous Firestore distributed check.
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
/**
 * Distributed rate limiter backed by Cloud Firestore transactions across horizontal instances.
 */
async function checkDistributedRateLimit(firestore, userId, maxRequests = 5, windowSeconds = 60) {
    // First verify memory rate limit for fast-path rejection
    const memCheck = checkRateLimit(userId, maxRequests, windowSeconds);
    if (!memCheck.allowed) {
        return memCheck;
    }
    try {
        const rateRef = firestore.collection('rateLimits').doc(userId);
        const now = Date.now();
        const windowMs = windowSeconds * 1000;
        const result = await firestore.runTransaction(async (t) => {
            const snap = await t.get(rateRef);
            if (!snap.exists) {
                t.set(rateRef, { count: 1, resetAtMs: now + windowMs, updatedAt: now });
                return { allowed: true, remaining: maxRequests - 1 };
            }
            const data = snap.data();
            if (now > data.resetAtMs) {
                t.set(rateRef, { count: 1, resetAtMs: now + windowMs, updatedAt: now });
                return { allowed: true, remaining: maxRequests - 1 };
            }
            if (data.count >= maxRequests) {
                const retryAfter = Math.ceil((data.resetAtMs - now) / 1000);
                return {
                    allowed: false,
                    remaining: 0,
                    retryAfterSeconds: Math.max(1, retryAfter),
                };
            }
            const newCount = data.count + 1;
            t.update(rateRef, { count: newCount, updatedAt: now });
            return { allowed: true, remaining: maxRequests - newCount };
        });
        return result;
    }
    catch (err) {
        // If Firestore rate-limiting document write fails or is unavailable in testing, fail open to in-memory check
        console.warn('Firestore distributed rate check fallback to in-memory limiter:', err);
        return memCheck;
    }
}
//# sourceMappingURL=rate-limits.js.map