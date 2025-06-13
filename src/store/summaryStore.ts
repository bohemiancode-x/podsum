/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Summary, SummaryOptions } from '@/types';
import { SummaryModel, SummaryDocument } from '@/models/Summary';

export interface SummaryState {
  // Summary cache (local storage backup)
  summaries: Record<string, Summary>;
  
  // Loading states
  generatingSummaries: Set<string>;
  
  // Error states
  summaryErrors: Record<string, string>;
  
  // Actions
  addSummary: (summary: Summary) => Promise<void>;
  getSummary: (podcastId: string) => Promise<Summary | null>;
  removeSummary: (podcastId: string) => void;
  setSummaryError: (podcastId: string, error: string) => void;
  clearSummaryError: (podcastId: string) => void;
  setGenerating: (podcastId: string, isGenerating: boolean) => void;
  isGenerating: (podcastId: string) => boolean;
  
  // Future MongoDB integration methods
  syncWithDatabase: () => Promise<void>;
  loadSummaryFromDB: (podcastId: string) => Promise<Summary | null>;
  saveSummaryToDB: (summary: Summary) => Promise<void>;
  
  // Modal state
  openModalId: string | null;
  setOpenModalId: (id: string | null) => void;

  searchFilters: {
    query: string;
    category: string;
    offset: number;
  };

  getAllSummaries: () => Promise<Summary[]>;
  deleteSummary: (podcastId: string) => Promise<void>;
  setSearchFilters: (filters: { query?: string; category?: string; offset?: number }) => void;
}

// Create a stable reference to the Set
const initialGeneratingSummaries = new Set<string>();

export const useSummaryStore = create<SummaryState>()(
  devtools(
    (set, get) => ({
      summaries: {},
      generatingSummaries: initialGeneratingSummaries,
      summaryErrors: {},
      openModalId: null,
      setOpenModalId: (id) => set({ openModalId: id }),
      searchFilters: {
        query: '',
        category: '',
        offset: 0,
      },
      addSummary: async (summary: Summary) => {
        try {
          const response = await fetch('/api/summaries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(summary),
          });

          if (!response.ok) {
            throw new Error('Failed to save summary');
          }

          const savedSummary = await response.json();
          set((state) => ({
            summaries: {
              ...state.summaries,
              [summary.podcastId]: savedSummary,
            },
          }));
        } catch (error) {
          console.error('Error saving summary:', error);
          throw error;
        }
      },
      getSummary: async (podcastId: string) => {
        try {
          const response = await fetch(`/api/summaries/${podcastId}`);
          if (!response.ok) {
            if (response.status === 404) {
              return null;
            }
            throw new Error('Failed to fetch summary');
          }
          return response.json();
        } catch (error) {
          console.error('Error fetching summary:', error);
          return null;
        }
      },
      removeSummary: (podcastId) =>
        set((state) => {
          const { [podcastId]: removedSummary, ...restSummaries } = state.summaries;
          const { [podcastId]: removedError, ...restErrors } = state.summaryErrors;
          return { 
            summaries: restSummaries,
            summaryErrors: restErrors,
          };
        }),
      setSummaryError: (podcastId, error) =>
        set((state) => ({
          summaryErrors: { ...state.summaryErrors, [podcastId]: error },
        })),
      clearSummaryError: (podcastId) =>
        set((state) => {
          const { [podcastId]: removed, ...rest } = state.summaryErrors;
          return { summaryErrors: rest };
        }),
      setGenerating: (podcastId, isGenerating) =>
        set((state) => {
          const currentSet = state.generatingSummaries;
          const hasPodcast = currentSet.has(podcastId);
          
          // Only update if the state is actually changing
          if (isGenerating === hasPodcast) {
            return state;
          }
          
          const newSet = new Set(currentSet);
          if (isGenerating) {
            newSet.add(podcastId);
          } else {
            newSet.delete(podcastId);
          }
          
          return {
            generatingSummaries: newSet
          };
        }),
      isGenerating: (podcastId) => {
        const state = get();
        return state.generatingSummaries.has(podcastId);
      },
      // Future MongoDB integration
      syncWithDatabase: async () => {
        // TODO: Implement when MongoDB is integrated
      },
      loadSummaryFromDB: async (podcastId) => {
        // TODO: Implement MongoDB fetch
        return null;
      },
      saveSummaryToDB: async (summary) => {
        // TODO: Implement MongoDB save
      },
      getAllSummaries: async () => {
        try {
          const response = await fetch('/api/summaries');
          if (!response.ok) {
            throw new Error('Failed to fetch summaries');
          }
          const summaries = await response.json();
          // Update local state with fetched summaries
          set((state) => ({
            summaries: summaries.reduce((acc: Record<string, Summary>, summary: Summary) => {
              acc[summary.podcastId] = summary;
              return acc;
            }, {}),
          }));
          return summaries;
        } catch (error) {
          console.error('Error fetching summaries:', error);
          return [];
        }
      },
      deleteSummary: async (podcastId: string) => {
        try {
          const response = await fetch(`/api/summaries/${podcastId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete summary');
          }

          set((state) => {
            const { [podcastId]: _, ...remainingSummaries } = state.summaries;
            return { summaries: remainingSummaries };
          });
        } catch (error) {
          console.error('Error deleting summary:', error);
          throw error;
        }
      },
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: {
            ...state.searchFilters,
            ...filters,
          },
        }));
      },
    }),
    { name: 'summary-store' }
  )
);
