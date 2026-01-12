'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, ParsedUsageData, PlanResult } from '@/types';

const STORAGE_KEY = 'iec-plan-optimizer-data';

// Serializable version of ParsedUsageData (dates as ISO strings)
interface SerializedUsageData {
  customerName: string;
  address: string;
  meterCode: string;
  meterNumber: string;
  contractNumber: string;
  records: {
    date: string; // ISO string
    time: string;
    kwhUsage: number;
  }[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalKwh: number;
}

// Convert ParsedUsageData to serializable format
function serializeUsageData(data: ParsedUsageData): SerializedUsageData {
  return {
    ...data,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    records: data.records.map((r) => ({
      ...r,
      date: r.date.toISOString(),
    })),
  };
}

// Convert serialized data back to ParsedUsageData
function deserializeUsageData(data: SerializedUsageData): ParsedUsageData {
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    records: data.records.map((r) => ({
      ...r,
      date: new Date(r.date),
    })),
  };
}

interface AppStore {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Usage data
  usageData: ParsedUsageData | null;
  setUsageData: (data: ParsedUsageData | null) => void;

  // Results
  results: PlanResult[] | null;
  setResults: (results: PlanResult[] | null) => void;

  // UI state
  isCalculating: boolean;
  setIsCalculating: (isCalculating: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Stored data info
  hasStoredData: boolean;
  storedDataDate: string | null;

  // Clear stored data
  clearStoredData: () => void;

  // Reset (but keep stored data)
  reset: () => void;

  // Full reset (clear everything including stored data)
  fullReset: () => void;
}

interface PersistedState {
  language: Language;
  serializedUsageData: SerializedUsageData | null;
  storedDataDate: string | null;
  results: PlanResult[] | null;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Language - default to Hebrew
      language: 'he',
      setLanguage: (lang) => set({ language: lang }),

      // Usage data
      usageData: null,
      setUsageData: (data) => {
        if (data) {
          set({
            usageData: data,
            hasStoredData: true,
            storedDataDate: new Date().toISOString(),
          });
        } else {
          set({ usageData: null });
        }
      },

      // Results
      results: null,
      setResults: (results) => set({ results: results }),

      // UI state
      isCalculating: false,
      setIsCalculating: (isCalculating) => set({ isCalculating }),

      error: null,
      setError: (error) => set({ error }),

      // Stored data info
      hasStoredData: false,
      storedDataDate: null,

      // Clear stored data
      clearStoredData: () => {
        set({
          usageData: null,
          results: null,
          hasStoredData: false,
          storedDataDate: null,
          error: null,
        });
      },

      // Reset (navigate away from results, but keep stored data available)
      reset: () =>
        set({
          results: null,
          isCalculating: false,
          error: null,
        }),

      // Full reset (clear everything)
      fullReset: () =>
        set({
          usageData: null,
          results: null,
          isCalculating: false,
          error: null,
          hasStoredData: false,
          storedDataDate: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      // Custom storage to handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const parsed = JSON.parse(str) as { state: PersistedState };
            const { serializedUsageData, storedDataDate, language, results } = parsed.state;

            return {
              state: {
                language,
                usageData: serializedUsageData
                  ? deserializeUsageData(serializedUsageData)
                  : null,
                hasStoredData: !!serializedUsageData,
                storedDataDate,
                results: results || null,
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const { usageData, storedDataDate, language, results } = value.state as AppStore;

          const toStore: { state: PersistedState } = {
            state: {
              language,
              serializedUsageData: usageData
                ? serializeUsageData(usageData)
                : null,
              storedDataDate,
              results: results || null,
            },
          };

          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // Only persist these fields
      partialize: (state) => ({
        language: state.language,
        usageData: state.usageData,
        storedDataDate: state.storedDataDate,
        hasStoredData: state.hasStoredData,
        results: state.results,
      }),
    }
  )
);
