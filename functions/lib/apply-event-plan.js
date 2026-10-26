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
exports.handleApplyEventPlan = handleApplyEventPlan;
const admin = __importStar(require("firebase-admin"));
const ai_schemas_1 = require("./schemas/ai-schemas");
const authorization_1 = require("./services/authorization");
async function handleApplyEventPlan(authHeader, body, firestore) {
    // 1. Authenticate caller
    const auth = await (0, authorization_1.verifyAuthHeader)(authHeader);
    // 2. Validate request
    const parsed = ai_schemas_1.ApplyEventPlanRequestSchema.safeParse(body);
    if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new authorization_1.AuthorizationError(`Invalid apply plan payload: ${msg}`, 'INVALID_ARGUMENT');
    }
    const { eventId, proposalId, plan, changeSummary } = parsed.data;
    // 3. Verify event ownership
    const eventSnap = await (0, authorization_1.verifyEventOwnership)(firestore, auth.uid, eventId);
    const eventData = eventSnap.data() || {};
    const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
    const tasksRef = eventRef.collection('tasks');
    const budgetRef = eventRef.collection('budgets');
    const planVersionsRef = eventRef.collection('planVersions');
    // 4. Retrieve existing tasks to protect user modifications per AI_SPEC.md Section 7
    const existingTasksSnap = await tasksRef.get();
    const existingTasksMap = new Map();
    for (const doc of existingTasksSnap.docs) {
        const d = doc.data();
        existingTasksMap.set(d.clientKey || d.title, d);
    }
    // 5. Determine next plan version number
    const existingVersionsSnap = await planVersionsRef.orderBy('version', 'desc').limit(1).get();
    const latestVersion = existingVersionsSnap.empty ? 1 : (existingVersionsSnap.docs[0].data().version || 1) + 1;
    const versionId = `ver_${latestVersion}_${Date.now()}`;
    let currentBatch = firestore.batch();
    let operationCount = 0;
    async function safeBatchCommit() {
        if (operationCount > 0) {
            await currentBatch.commit();
            currentBatch = firestore.batch();
            operationCount = 0;
        }
    }
    // 6. Record immutable plan version
    const newVersionDoc = planVersionsRef.doc(versionId);
    currentBatch.set(newVersionDoc, {
        version: latestVersion,
        schemaVersion: 1,
        proposalId,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        modelId: 'gemini-1.5-flash',
        inputsSnapshot: {
            title: eventData.title,
            budgetLimitMinor: eventData.budgetLimitMinor,
            guestCount: eventData.guestCount,
        },
        plan,
        changeSummary: changeSummary || 'Applied AI Plan Proposal',
        createdByUid: auth.uid,
        status: 'applied',
    });
    operationCount++;
    // 7. Update event theme preferences
    currentBatch.update(eventRef, {
        'preferences.theme': plan.theme.name,
        'preferences.themeDescription': plan.theme.description,
        'preferences.themePalette': plan.theme.palette,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    operationCount++;
    // 8. Upsert proposed tasks safely (preserving completed/user-edited records)
    let tasksImported = 0;
    for (const t of plan.tasks) {
        const existing = existingTasksMap.get(t.clientKey || t.title);
        // If existing task is already completed or custom user-created, preserve it!
        if (existing && (existing.status === 'completed' || existing.source === 'user')) {
            continue;
        }
        if (operationCount >= 450) {
            await safeBatchCommit();
        }
        const taskId = existing ? existing.id : `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const taskDoc = tasksRef.doc(taskId);
        currentBatch.set(taskDoc, {
            id: taskId,
            clientKey: t.clientKey,
            title: t.title,
            description: t.description || '',
            category: t.categoryKey,
            priority: t.priority,
            status: existing?.status || 'pending',
            dueAt: t.dueDate,
            isEventDayTask: t.isEventDayTask,
            source: 'ai',
            planVersionId: versionId,
            createdAt: existing?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        operationCount++;
        tasksImported++;
    }
    // 9. Upsert budget categories
    let budgetCategoriesUpdated = 0;
    for (const b of plan.budget) {
        if (operationCount >= 450) {
            await safeBatchCommit();
        }
        const catDoc = budgetRef.doc(b.categoryKey);
        currentBatch.set(catDoc, {
            id: b.categoryKey,
            categoryKey: b.categoryKey,
            name: b.label,
            estimatedAmountMinor: b.estimatedAmountMinor,
            rationale: b.rationale,
            confidence: b.confidence,
            source: 'ai_estimate',
            planVersionId: versionId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        operationCount++;
        budgetCategoriesUpdated++;
    }
    // Commit remaining atomic batch operations
    await safeBatchCommit();
    return {
        success: true,
        versionId,
        tasksImported,
        budgetCategoriesUpdated,
    };
}
//# sourceMappingURL=apply-event-plan.js.map