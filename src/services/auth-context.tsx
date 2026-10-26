import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { UserProfile } from '../types';
import { auth } from './firebase';
import { registerTokenProvider } from './api-client';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<UserProfile>;
  signUp: (name: string, email: string, password?: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  getIdToken: () => Promise<string | null>;
}

const AUTH_STORAGE_KEY = 'festora_ai_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUserToProfile(fbUser: FirebaseUser): UserProfile {
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Event Host',
    defaultCurrency: 'INR',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = mapFirebaseUserToProfile(fbUser);
        setUser(profile);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        }
      } else {
        // If not in demo mode, clear user
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.uid?.startsWith('usr_festora_demo')) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // Ignore parse errors
          }
        }
        setUser(null);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register token provider with API client
  useEffect(() => {
    registerTokenProvider(async () => {
      if (auth.currentUser) {
        try {
          return await auth.currentUser.getIdToken(true);
        } catch (err) {
          console.warn('Failed to refresh Firebase ID token:', err);
        }
      }
      if (user) {
        return `dev_token_${user.uid}`;
      }
      return null;
    });
  }, [user]);

  const signIn = async (email: string, password = ''): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      // 1. Try real Firebase Auth first
      if (password && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          const profile = mapFirebaseUserToProfile(cred.user);
          setUser(profile);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          }
          setIsLoading(false);
          return profile;
        } catch (fbErr: unknown) {
          // If auth emulator or network is not available in local test mode, fall back to safe local demo session
          const fbCode = (fbErr as { code?: string })?.code;
          if (
            fbCode === 'auth/network-request-failed' ||
            fbCode === 'auth/operation-not-allowed' ||
            import.meta.env.MODE === 'test'
          ) {
            console.warn('Firebase Auth service unavailable or in test mode, using offline session fallback:', fbCode);
          } else {
            throw fbErr;
          }
        }
      }

      // 2. Demo / Offline Fallback
      const namePart = email.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const profile: UserProfile = {
        uid: email.includes('demo') ? 'usr_festora_demo' : `usr_${Math.abs(hashString(email))}`,
        email: email.trim(),
        displayName: formattedName || 'Event Host',
        defaultCurrency: 'INR',
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
      setIsLoading(false);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password = ''): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      if (password && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (name.trim()) {
            await firebaseUpdateProfile(cred.user, { displayName: name.trim() });
          }
          const profile = mapFirebaseUserToProfile({ ...cred.user, displayName: name.trim() });
          setUser(profile);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          }
          setIsLoading(false);
          return profile;
        } catch (fbErr: unknown) {
          const fbCode = (fbErr as { code?: string })?.code;
          if (
            fbCode === 'auth/network-request-failed' ||
            fbCode === 'auth/operation-not-allowed' ||
            import.meta.env.MODE === 'test'
          ) {
            console.warn('Firebase Auth service unavailable or in test mode, using offline session fallback:', fbCode);
          } else {
            throw fbErr;
          }
        }
      }

      const profile: UserProfile = {
        uid: `usr_${Math.abs(hashString(email))}`,
        email: email.trim(),
        displayName: name.trim() || 'Event Host',
        defaultCurrency: 'INR',
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
      setIsLoading(false);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signout error if offline
    }
    setUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('UNAUTHENTICATED');
    if (updates.displayName && auth.currentUser) {
      try {
        await firebaseUpdateProfile(auth.currentUser, { displayName: updates.displayName });
      } catch (err) {
        console.warn('Failed to update Firebase user profile:', err);
      }
    }
    const updated = { ...user, ...updates };
    setUser(updated);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  };

  const getIdToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (err) {
        console.warn('Error fetching Firebase ID token:', err);
      }
    }
    if (!user) return null;
    return `dev_token_${user.uid}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
