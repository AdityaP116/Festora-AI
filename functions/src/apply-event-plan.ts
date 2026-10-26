import * as admin from 'firebase-admin';
import { ApplyEventPlanRequestSchema } from './schemas/ai-schemas';
import { verifyAuthHeader, verifyEventOwnership, AuthorizationError } from './services/authorization';

export async function handleApplyEventPlan(
  authHeader: string | undefined,
  body: unknown,
  firestore: admin.firestore.Firestore
): Promise<{ success: boolean; versionId: string; tasksImported: number; budgetCategoriesUpdated: number }> {
  // 1. Authenticate caller
  const auth = await verifyAuthHeader(authHeader);

  // 2. Validate request
  const parsed = ApplyEventPlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new AuthorizationError(`Invalid apply plan payload: ${msg}`, 'INVALID_ARGUMENT');
  }

  const { eventId, proposalId, plan, changeSummary } = parsed.data;

  // 3. Verify event ownership
  const eventSnap = await verifyEventOwnership(firestore, auth.uid, eventId);
  const eventData = eventSnap.data() || {};

  const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
  const tasksRef = eventRef.collection('tasks');
  const budgetRef = eventRef.collection('budgets');
  const planVersionsRef = eventRef.collection('planVersions');

  // 4. Retrieve existing tasks to protect user modifications per AI_SPEC.md Section 7
  const existingTasksSnap = await tasksRef.get();
  const existingTasksMap = new Map<string, admin.firestore.DocumentData>();
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

    currentBatch.set(
      taskDoc,
      {
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
      },
      { merge: true }
    );
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
