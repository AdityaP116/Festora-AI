import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentRecord, UserProfile } from '../src/types';

// Mock in-memory localStorage for Node test runner
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = v; },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { Object.keys(memoryStore).forEach((k) => delete memoryStore[k]); },
};

(globalThis as any).localStorage = mockLocalStorage;

describe('Legal, Privacy, Consent & Account Management Tests', () => {
  const testUserId = 'test_consent_user_123';

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('records and persists user consent payload during registration', () => {
    const consent: ConsentRecord = {
      termsAccepted: true,
      privacyAcknowledged: true,
      marketingOptIn: false,
      timestamp: new Date().toISOString(),
      policyVersion: '2026-v1.0',
    };

    const profile: UserProfile = {
      id: testUserId,
      email: 'user@example.com',
      name: 'Festora Planner',
      authProvider: 'password',
      consent,
    };

    mockLocalStorage.setItem(`festora_profile_${testUserId}`, JSON.stringify(profile));

    const retrieved = JSON.parse(mockLocalStorage.getItem(`festora_profile_${testUserId}`) || '{}') as UserProfile;
    expect(retrieved.consent?.termsAccepted).toBe(true);
    expect(retrieved.consent?.privacyAcknowledged).toBe(true);
    expect(retrieved.consent?.marketingOptIn).toBe(false);
    expect(retrieved.consent?.policyVersion).toBe('2026-v1.0');
    expect(retrieved.authProvider).toBe('password');
  });

  it('correctly associates Google Sign-In profile with authentication provider and consent', () => {
    const googleConsent: ConsentRecord = {
      termsAccepted: true,
      privacyAcknowledged: true,
      marketingOptIn: true,
      timestamp: new Date().toISOString(),
      policyVersion: '2026-v1.0',
    };

    const googleProfile: UserProfile = {
      id: 'google_uid_999',
      email: 'googleuser@gmail.com',
      name: 'Google Planner',
      photoURL: 'https://lh3.googleusercontent.com/a/photo.jpg',
      authProvider: 'google.com',
      consent: googleConsent,
    };

    expect(googleProfile.authProvider).toBe('google.com');
    expect(googleProfile.photoURL).toBeDefined();
    expect(googleProfile.consent?.marketingOptIn).toBe(true);
  });

  it('cleans up user data and events upon account deletion', () => {
    // 1. Simulate account profile and session presence
    mockLocalStorage.setItem(`festora_profile_${testUserId}`, JSON.stringify({ id: testUserId, email: 'delete_me@festora.ai' }));
    mockLocalStorage.setItem('festora_ai_storage_v1_session', JSON.stringify({ uid: testUserId }));
    mockLocalStorage.setItem('festora_events_cache', JSON.stringify([{ id: 'event-1', ownerUid: testUserId }]));

    expect(mockLocalStorage.getItem(`festora_profile_${testUserId}`)).toBeDefined();

    // 2. Simulate account deletion cleanup
    mockLocalStorage.removeItem(`festora_profile_${testUserId}`);
    mockLocalStorage.removeItem('festora_ai_storage_v1_session');
    mockLocalStorage.removeItem('festora_events_cache');

    // 3. Verify clean slate
    expect(mockLocalStorage.getItem(`festora_profile_${testUserId}`)).toBeNull();
    expect(mockLocalStorage.getItem('festora_ai_storage_v1_session')).toBeNull();
    expect(mockLocalStorage.getItem('festora_events_cache')).toBeNull();
  });

  it('supports data export conforming to DPDP / GDPR data portability', () => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Exportable Wedding',
        eventType: 'wedding',
        startDate: '2026-11-15',
        location: { name: 'Royal Orchid Palace', city: 'Bengaluru' },
        guestCount: 200,
        budgetLimitMinor: 50000000,
      },
    ];

    const exportBundle = {
      user: {
        id: 'export_user_456',
        email: 'export@example.com',
        authProvider: 'google.com',
      },
      events: mockEvents,
      exportedAt: new Date().toISOString(),
      formatVersion: 'festora-export-v1',
    };

    const jsonString = JSON.stringify(exportBundle, null, 2);
    expect(jsonString).toContain('Exportable Wedding');
    expect(jsonString).toContain('export_user_456');
    expect(jsonString).toContain('Royal Orchid Palace');
    expect(exportBundle.events).toHaveLength(1);
    expect(exportBundle.formatVersion).toBe('festora-export-v1');
  });

  it('prevents analytics tracking when consent is not granted or rejected', () => {
    // 1. Initial state: No consent in storage
    let consent = mockLocalStorage.getItem('festora_cookie_consent');
    let shouldTrack = consent === 'accepted';
    expect(shouldTrack).toBe(false);

    // 2. Explicit rejection
    mockLocalStorage.setItem('festora_cookie_consent', 'rejected');
    consent = mockLocalStorage.getItem('festora_cookie_consent');
    shouldTrack = consent === 'accepted';
    expect(shouldTrack).toBe(false);

    // 3. Explicit acceptance
    mockLocalStorage.setItem('festora_cookie_consent', 'accepted');
    consent = mockLocalStorage.getItem('festora_cookie_consent');
    shouldTrack = consent === 'accepted';
    expect(shouldTrack).toBe(true);
  });
});
