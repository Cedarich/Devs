import { create } from "zustand";

interface StoreState {
  // From store.js
  installPrompt: any;
  isInstalled: boolean;
  showLocationCheckIn: boolean;
  loading: boolean;
  user: any;

  // From store.ts
  submitProgress: number;
  showGuide: boolean;

  // New notification state
  lastNotificationDate: string | null;
  notificationsEnabled: boolean;

  // Action functions
  setInstallPrompt: (prompt: any) => void;
  setIsInstalled: (installed: boolean) => void;
  setShowLocationCheckIn: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: any) => void;
  setSubmitProgress: (progress: number) => void;
  setShowGuide: (show: boolean) => void;
  setLastNotificationDate: (date: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state from both stores
  installPrompt: null,
  isInstalled: false,
  showLocationCheckIn: false,
  loading: false,
  user: null,
  submitProgress: 0,
  showGuide: true,
  lastNotificationDate: null,
  notificationsEnabled: false,
  // Action implementations
  setInstallPrompt: (prompt) => set({ installPrompt: prompt }),
  setIsInstalled: (installed) => set({ isInstalled: installed }),
  setShowLocationCheckIn: (show) => set({ showLocationCheckIn: show }),
  setLoading: (loading) => set({ loading }),
  setUser: (user) => set({ user }),
  setSubmitProgress: (submitProgress) => set({ submitProgress }),
  setShowGuide: (showGuide) => set({ showGuide }),
  setLastNotificationDate: (lastNotificationDate) =>
    set({ lastNotificationDate }),
  setNotificationsEnabled: (notificationsEnabled) =>
    set({ notificationsEnabled }),
}));
