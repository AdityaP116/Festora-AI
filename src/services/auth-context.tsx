import React, { createContext, useContext, useState } from 'react';
import type { UserProfile } from '../types';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Default demo session for immediate exploration
      const defaultUser: UserProfile = {
        uid: 'usr_festora_demo',
        email: 'aditya@festora.ai',
        displayName: 'Aditya Planner',
        defaultCurrency: 'INR',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch (err) {
      console.error('Error restoring session:', err);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Derive clean display name from email or use existing
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    const profile: UserProfile = {
      uid: `usr_${Math.abs(hashString(email))}`,
      email,
      displayName: formattedName || 'Event Host',
      defaultCurrency: 'INR',
      createdAt: new Date().toISOString(),
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsLoading(false);
    return profile;
  };

  const signUp = async (name: string, email: string): Promise<UserProfile> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const profile: UserProfile = {
      uid: `usr_${Math.abs(hashString(email))}`,
      email,
      displayName: name.trim() || 'Event Host',
      defaultCurrency: 'INR',
      createdAt: new Date().toISOString(),
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsLoading(false);
    return profile;
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('UNAUTHENTICATED');
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return `dev_token_${user.uid}`;
  };

  React.useEffect(() => {
    registerTokenProvider(async () => {
      if (!user) return null;
      return `dev_token_${user.uid}`;
    });
  }, [user]);

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
