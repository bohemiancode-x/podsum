import { create } from 'zustand';
import { Podcast, Summary, SummaryOptions } from '@/types';
import { podcastAPI } from '@/services/podcastAPI';

export interface SearchFilters {
  query: string;
  category: string;
  offset: number;
}

interface PodcastState {
  podcasts: Record<string, Podcast>;
  addPodcast: (podcast: Podcast) => void;
  getPodcast: (id: string) => Podcast | undefined;
  getAllPodcasts: () => Podcast[];
  deletePodcast: (id: string) => void;
  
  // Search and filters
  searchFilters: SearchFilters;
  categories: string[];
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  loadingPodcastId: string | null;
  
  // Error states
  error: string | null;
  
  // Summaries (will integrate with MongoDB later)
  summaries: Record<string, Summary>;
  
  // Actions
  setPodcasts: (podcasts: Podcast[]) => void;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setSearchFilters: (filters: { query?: string; category?: string; offset?: number }) => void;
  setLoading: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
  setLoadingPodcastId: (id: string | null) => void;
  setError: (error: string | null) => void;
  
  // Summary actions
  addSummary: (podcastId: string, summary: Summary) => void;
  getSummary: (podcastId: string) => Summary | null;
  removeSummary: (podcastId: string) => void;
  
  // Async actions
  searchPodcasts: (query?: string, options?: { 
    offset?: number; 
    genre?: string;
    len_min?: number;
    len_max?: number;
    published_after?: number;
    language?: string;
  }) => Promise<void>;
  searchEpisodesForSummarization: (query?: string) => Promise<void>;
  fetchBestPodcasts: (options?: { genre_id?: number; page?: number; region?: string }) => Promise<void>;
  generateSummary: (podcastId: string, options: SummaryOptions) => Promise<Summary | null>;
  
  // Utility actions
  clearError: () => void;
  resetSearch: () => void;
}

const usePodcastStore = create<PodcastState>()((set, get) => ({
  podcasts: {},

  addPodcast: (podcast: Podcast) => {
    set((state) => ({
      podcasts: {
        ...state.podcasts,
        [podcast.id]: podcast,
      },
    }));
  },

  getPodcast: (id: string) => {
    return get().podcasts[id];
  },

  getAllPodcasts: () => {
    return Object.values(get().podcasts);
  },

  deletePodcast: (id: string) => {
    set((state) => {
      const { [id]: _removed, ...remainingPodcasts } = state.podcasts;
      return { podcasts: remainingPodcasts };
    });
  },

  // Search and filters
  searchFilters: {
    query: '',
    category: 'all',
    offset: 0,
  },
  categories: [],
  
  // Loading states
  isLoading: false,
  isSearching: false,
  loadingPodcastId: null,
  
  // Error states
  error: null,
  
  // Summaries (will integrate with MongoDB later)
  summaries: {},
  
  // Actions
  setPodcasts: (podcasts: Podcast[]) => {
    const podcastMap = podcasts.reduce((acc, podcast) => {
      acc[podcast.id] = podcast;
      return acc;
    }, {} as Record<string, Podcast>);
    set({ podcasts: podcastMap });
  },
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setSearchFilters: (filters) => 
    set((state) => ({ 
      searchFilters: { ...state.searchFilters, ...filters } 
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearching: (searching) => set({ isSearching: searching }),
  setLoadingPodcastId: (id) => set({ loadingPodcastId: id }),
  setError: (error) => set({ error }),
  
  // Summary actions
  addSummary: (podcastId, summary) =>
    set((state) => ({
      summaries: { ...state.summaries, [podcastId]: summary },
    })),
  
  getSummary: (podcastId) => {
    const state = get();
    return state.summaries[podcastId] || null;
  },
  
  removeSummary: (podcastId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [podcastId]: _, ...rest } = state.summaries;
      return { summaries: rest };
    }),

  // Async actions
  searchPodcasts: async (query = 'technology', options = {}) => {
    const { setSearching, setError, setPodcasts, setSearchFilters } = get();
    
    setSearching(true);
    setError(null);
    
    try {
      const result = await podcastAPI.searchPodcasts(query, options);
      
      if (result.error) {
        setError(result.error);
        setPodcasts([]);
      } else {
        setPodcasts(result.data || []);
        setSearchFilters({ 
          query, 
          offset: options.offset || 0 
        });
        
        // Update categories from results
        const uniqueCategories = Array.from(
          new Set((result.data || []).map((podcast: Podcast) => podcast.category))
        ).sort() as string[];
        set({ categories: uniqueCategories });
      }
    } catch (error) {
      let errorMessage = 'Search failed';
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Search rate limit exceeded. Please wait a moment before searching again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setPodcasts([]);
    } finally {
      setSearching(false);
    }
  },

  searchEpisodesForSummarization: async (query = '') => {
    const { setSearching, setError, setPodcasts } = get();
    
    setSearching(true);
    setError(null);
    
    try {
      const result = await podcastAPI.searchEpisodesForSummarization(query);
      
      if (result.error) {
        setError(result.error);
        setPodcasts([]);
      } else {
        setPodcasts(result.data || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      setPodcasts([]);
    } finally {
      setSearching(false);
    }
  },

  fetchBestPodcasts: async (options = {}) => {
    const { setLoading, setError, setPodcasts } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await podcastAPI.getBestPodcastsAsPodcasts(options);
      
      if (result.error) {
        setError(result.error);
        setPodcasts([]);
      } else {
        setPodcasts(result.data || []);
        
        // Update categories from results
        const uniqueCategories = Array.from(
          new Set((result.data || []).map((podcast: Podcast) => podcast.category))
        ).sort() as string[];
        set({ categories: uniqueCategories });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch best podcasts';
      setError(errorMessage);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  },

  generateSummary: async (podcastId, options) => {
    const { 
      setLoadingPodcastId, 
      addSummary, 
      podcasts, 
      setError 
    } = get();
    
    setLoadingPodcastId(podcastId);
    setError(null);
    
    try {
      // Find the podcast
      const podcast = Object.values(podcasts).find((p: Podcast) => p.id === podcastId);
      if (!podcast) {
        throw new Error('Podcast not found');
      }

      // TODO: Replace this with actual AI summary generation API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock summary (replace with real API call later)
      const summary: Summary = {
        id: `summary-${podcastId}`,
        podcastId,
        content: `This is an AI-generated summary of "${podcast.title}" by ${podcast.host}. The episode discusses ${podcast.description}. Key takeaways include valuable insights about the main topic, practical advice from the host, and actionable information for listeners.`,
        format: options.format,
        characterCount: options.characterLimit,
        createdAt: new Date().toISOString(),
        podcast,
      };
      
      // Store the summary
      addSummary(podcastId, summary);
      
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setError(errorMessage);
      return null;
    } finally {
      setLoadingPodcastId(null);
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  resetSearch: () => set({
    podcasts: {},
    searchFilters: { query: '', category: 'all', offset: 0 },
    error: null,
  }),
}));

export { usePodcastStore };
