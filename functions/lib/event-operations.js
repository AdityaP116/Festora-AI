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
exports.handleGetEvents = handleGetEvents;
exports.handleGetEventById = handleGetEventById;
exports.handleCreateEvent = handleCreateEvent;
exports.handleDeleteEvent = handleDeleteEvent;
const admin = __importStar(require("firebase-admin"));
const authorization_1 = require("./services/authorization");
async function handleGetEvents(authHeader, firestore) {
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    const snap = await firestore
        .collection('users')
        .doc(auth.uid)
        .collection('events')
        .where('status', '!=', 'archived')
        .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function handleGetEventById(authHeader, eventId, firestore) {
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    const eventSnap = await (0, authorization_1.verifyEventOwnership)(firestore, auth.uid, eventId);
    return { id: eventSnap.id, ...eventSnap.data() };
}
async function handleCreateEvent(authHeader, body, firestore) {
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    if (!body.title || typeof body.title !== 'string') {
        throw new authorization_1.AuthorizationError('Title is required and must be a string.', 'INVALID_ARGUMENT');
    }
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
    const eventData = {
        ...body,
        id: eventId,
        ownerUid: auth.uid,
        schemaVersion: 1,
        status: body.status || 'planning',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await eventRef.set(eventData);
    return eventData;
}
/**
 * Permanently deletes an event along with all its subcollections per SECURITY.md Section 7.
 */
async function handleDeleteEvent(authHeader, eventId, firestore) {
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    await (0, authorization_1.verifyEventOwnership)(firestore, auth.uid, eventId);
    const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
    const subcollections = ['tasks', 'expenses', 'budgets', 'vendors', 'guests', 'planVersions'];
    // Delete all docs in each subcollection
    for (const sub of subcollections) {
        const subSnap = await eventRef.collection(sub).get();
        const batch = firestore.batch();
        for (const doc of subSnap.docs) {
            batch.delete(doc.ref);
        }
        if (!subSnap.empty) {
            await batch.commit();
        }
    }
    // Delete parent document
    await eventRef.delete();
    return { success: true, deletedEventId: eventId };
}
//# sourceMappingURL=event-operations.js.map