"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface PendingChange {
  path: string; // e.g., 'home.hero.title', 'about.description'
  value: string;
  locale: 'th' | 'en';
  serviceId?: string; // For service inline editing
  field?: string; // For service inline editing
  index?: number; // For array items in services
}

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  pendingChanges: Map<string, PendingChange>;
  addChange: (change: PendingChange) => void;
  removeChange: (path: string) => void;
  hasChanges: boolean;
  saveChanges: () => Promise<boolean>;
  cancelChanges: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

const EDIT_MODE_STORAGE_KEY = 'logicton-edit-mode';

// Safe localStorage access
const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  }
};

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());

  const isAdmin = session?.user?.email === 'admin@logicton.com' || session?.user?.email === 'admin';

  // Initialize edit mode from localStorage (always run, don't wait for isAdmin)
  useEffect(() => {
    const stored = getStorageItem(EDIT_MODE_STORAGE_KEY);
    if (stored === 'true') {
      setIsEditMode(true);
    }
  }, []);

  // Save edit mode to localStorage whenever it changes
  useEffect(() => {
    setStorageItem(EDIT_MODE_STORAGE_KEY, isEditMode ? 'true' : 'false');
  }, [isEditMode]);

  const setEditMode = useCallback((enabled: boolean) => {
    if (isAdmin) {
      setIsEditMode(enabled);
      if (!enabled) {
        // Clear pending changes when exiting edit mode
        setPendingChanges(new Map());
      }
    }
  }, [isAdmin]);

  const addChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(change.path, change);
      return newMap;
    });
  }, []);

  const removeChange = useCallback((path: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(path);
      return newMap;
    });
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) return true;

    try {
      const changesArray = Array.from(pendingChanges.values());

      // Check if any change is a service change
      const hasServiceChanges = changesArray.some((change: any) => change.serviceId);

      // Choose the correct API endpoint
      const apiUrl = hasServiceChanges ? '/api/content/services/inline-edit' : '/api/content/inline-edit';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changesArray }),
      });

      const data = await response.json();

      if (data.success) {
        setPendingChanges(new Map());
        // Don't turn off edit mode here - let EditModeBar handle page reload
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save changes:', error);
      return false;
    }
  }, [pendingChanges]);

  const cancelChanges = useCallback(() => {
    setPendingChanges(new Map());
    setIsEditMode(false);
  }, []);

  const hasChanges = pendingChanges.size > 0;

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        setEditMode,
        pendingChanges,
        addChange,
        removeChange,
        hasChanges,
        saveChanges,
        cancelChanges,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}
