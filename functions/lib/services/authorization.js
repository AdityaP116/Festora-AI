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
exports.AuthorizationError = void 0;
exports.verifyAuthHeader = verifyAuthHeader;
exports.verifyEventOwnership = verifyEventOwnership;
const admin = __importStar(require("firebase-admin"));
class AuthorizationError extends Error {
    constructor(message, code = 'PERMISSION_DENIED', meta) {
        super(message);
        this.name = 'AuthorizationError';
        this.code = code;
        if (meta) {
            this.retryAfterSeconds = meta.retryAfterSeconds;
            this.limit = meta.limit;
            this.remaining = meta.remaining;
        }
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Extracts and verifies the caller's Firebase Auth token from an Authorization header.
 * Never trusts a client-provided body parameter for identity.
 */
async function verifyAuthHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED');
    }
    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
        throw new AuthorizationError('Malformed authorization token.', 'UNAUTHENTICATED');
    }
    // Fail-closed security rule: Never allow mock tokens if NODE_ENV is production
    const isProduction = process.env.NODE_ENV === 'production';
    const isExplicitDevOrTest = !isProduction &&
        (process.env.NODE_ENV === 'test' ||
            (process.env.NODE_ENV === 'development' && process.env.FUNCTIONS_EMULATOR === 'true'));
    // Development/Test mock token bypass strictly restricted to isolated test/emulator environments
    if (isExplicitDevOrTest &&
        (idToken.startsWith('test_token_') || idToken.startsWith('dev_token_'))) {
        const testUid = idToken.replace(/^(test_token_|dev_token_)/, '');
        return { uid: testUid, email: `${testUid}@festora.test` };
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
    }
    catch {
        throw new AuthorizationError('Invalid or expired authentication token.', 'UNAUTHENTICATED');
    }
}
/**
 * Asserts that the authenticated user is the legitimate owner of the target event.
 * Follows DATA_MODEL.md: events are stored at users/{ownerUid}/events/{eventId}.
 */
async function verifyEventOwnership(firestore, ownerUid, eventId) {
    if (!ownerUid || !eventId) {
        throw new AuthorizationError('Missing required owner or event identifier.', 'INVALID_ARGUMENT');
    }
    const eventRef = firestore
        .collection('users')
        .doc(ownerUid)
        .collection('events')
        .doc(eventId);
    const snap = await eventRef.get();
    if (!snap.exists) {
        throw new AuthorizationError('Event not found or access denied.', 'NOT_FOUND');
    }
    const data = snap.data();
    if (data?.ownerUid && data.ownerUid !== ownerUid) {
        throw new AuthorizationError('You do not have permission to access or modify this event.', 'PERMISSION_DENIED');
    }
    return snap;
}
//# sourceMappingURL=authorization.js.map