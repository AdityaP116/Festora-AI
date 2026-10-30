import * as admin from 'firebase-admin';
import { verifyAuthHeader, verifyEventOwnership, AuthorizationError } from './services/authorization';

export async function handleGetEvents(
  authHeader: string | undefined,
  firestore: admin.firestore.Firestore
): Promise<admin.firestore.DocumentData[]> {
  const auth = await verifyAuthHeader(authHeader);
  const snap = await firestore
    .collection('users')
    .doc(auth.uid)
    .collection('events')
    .where('status', '!=', 'archived')
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function handleGetEventById(
  authHeader: string | undefined,
  eventId: string,
  firestore: admin.firestore.Firestore
): Promise<admin.firestore.DocumentData> {
  const auth = await verifyAuthHeader(authHeader);
  const eventSnap = await verifyEventOwnership(firestore, auth.uid, eventId);
  return { id: eventSnap.id, ...eventSnap.data() };
}

export async function handleCreateEvent(
  authHeader: string | undefined,
  body: Record<string, unknown>,
  firestore: admin.firestore.Firestore
): Promise<admin.firestore.DocumentData> {
  const auth = await verifyAuthHeader(authHeader);

  if (!body.title || typeof body.title !== 'string') {
    throw new AuthorizationError('Title is required and must be a string.', 'INVALID_ARGUMENT');
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
export async function handleDeleteEvent(
  authHeader: string | undefined,
  eventId: string,
  firestore: admin.firestore.Firestore
): Promise<{ success: boolean; deletedEventId: string }> {
  const auth = await verifyAuthHeader(authHeader);
  await verifyEventOwnership(firestore, auth.uid, eventId);

  const eventRef = firestore.collection('users').doc(auth.uid).collection('events').doc(eventId);
  const subcollections = ['tasks', 'expenses', 'budgets', 'vendors', 'guests', 'planVersions'];

  // Delete all docs in each subcollection with bounded batch chunking (max 400 per commit)
  for (const sub of subcollections) {
    let hasMore = true;
    while (hasMore) {
      const subSnap = await eventRef.collection(sub).limit(400).get();
      if (subSnap.empty) {
        hasMore = false;
        break;
      }
      const batch = firestore.batch();
      for (const doc of subSnap.docs) {
        batch.delete(doc.ref);
      }
      await batch.commit();
      if (subSnap.size < 400) {
        hasMore = false;
      }
    }
  }

  // Delete parent document
  await eventRef.delete();

  return { success: true, deletedEventId: eventId };
}
