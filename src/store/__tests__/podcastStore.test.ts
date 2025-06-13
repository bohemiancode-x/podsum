import { renderHook, act } from '@testing-library/react';
import { usePodcastStore } from '../podcastStore';
import { Podcast, Summary, SummaryOptions } from '@/types';
import { podcastAPI } from '@/services/podcastAPI';

// Mock the services
jest.mock('@/services/podcastAPI');

const mockPodcast: Podcast = {
  id: 'test-podcast',
  title: 'Test Podcast',
  description: 'A test podcast',
  imageUrl: 'https://example.com/image.jpg',
  host: 'Test Host',
  date: '2024-01-01',
  duration: '3600',
  category: 'Technology',
};

describe('Podcast Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePodcastStore());
    act(() => {
      // Reset the store by removing all podcasts
      Object.keys(result.current.podcasts).forEach(podcastId => {
        result.current.deletePodcast(podcastId);
      });
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => usePodcastStore());
    expect(result.current.podcasts).toEqual({});
    expect(result.current.searchFilters).toEqual({
      query: '',
      category: 'all',
      offset: 0,
    });
  });

  it('should add a podcast', () => {
    const { result } = renderHook(() => usePodcastStore());

    act(() => {
      result.current.addPodcast(mockPodcast);
    });

    expect(result.current.podcasts['test-podcast']).toEqual(mockPodcast);
  });

  it('should get a podcast', () => {
    const { result } = renderHook(() => usePodcastStore());

    act(() => {
      result.current.addPodcast(mockPodcast);
    });

    const retrievedPodcast = result.current.getPodcast('test-podcast');
    expect(retrievedPodcast).toEqual(mockPodcast);
  });

  it('should get all podcasts', () => {
    const { result } = renderHook(() => usePodcastStore());

    act(() => {
      result.current.addPodcast(mockPodcast);
    });

    const allPodcasts = result.current.getAllPodcasts();
    expect(allPodcasts).toEqual([mockPodcast]);
  });

  it('should delete a podcast', () => {
    const { result } = renderHook(() => usePodcastStore());

    act(() => {
      result.current.addPodcast(mockPodcast);
    });

    expect(result.current.podcasts['test-podcast']).toBeDefined();

    act(() => {
      result.current.deletePodcast('test-podcast');
    });

    expect(result.current.podcasts['test-podcast']).toBeUndefined();
  });

  it('should update search filters', () => {
    const { result } = renderHook(() => usePodcastStore());

    act(() => {
      result.current.setSearchFilters({
        query: 'test',
        category: 'technology',
        offset: 10,
      });
    });

    expect(result.current.searchFilters).toEqual({
      query: 'test',
      category: 'technology',
      offset: 10,
    });
  });

  describe('state management', () => {
    it('should set podcasts', () => {
      act(() => {
        usePodcastStore.getState().setPodcasts([mockPodcast]);
      });
      expect(usePodcastStore.getState().podcasts).toEqual({
        'test-podcast': mockPodcast,
      });
    });

    it('should set search filters', () => {
      const newFilters = { query: 'test', category: 'tech' };
      act(() => {
        usePodcastStore.getState().setSearchFilters(newFilters);
      });
      expect(usePodcastStore.getState().searchFilters).toEqual(
        expect.objectContaining(newFilters)
      );
    });

    it('should set loading state', () => {
      act(() => {
        usePodcastStore.getState().setLoading(true);
      });
      expect(usePodcastStore.getState().isLoading).toBe(true);
    });

    it('should set searching state', () => {
      act(() => {
        usePodcastStore.getState().setSearching(true);
      });
      expect(usePodcastStore.getState().isSearching).toBe(true);
    });

    it('should set error state', () => {
      const errorMessage = 'Test error';
      act(() => {
        usePodcastStore.getState().setError(errorMessage);
      });
      expect(usePodcastStore.getState().error).toBe(errorMessage);
    });
  });

  describe('summary management', () => {
    it('should add summary', () => {
      const testSummary: Summary = {
        id: 'summary-1',
        podcastId: 'test-podcast',
        content: 'Test summary content',
        format: 'paragraph',
        characterCount: 100,
        createdAt: new Date().toISOString(),
        podcast: mockPodcast,
      };

      act(() => {
        usePodcastStore.getState().addSummary('test-podcast', testSummary);
      });

      expect(usePodcastStore.getState().summaries['test-podcast']).toEqual(testSummary);
    });

    it('should get summary', () => {
      const testSummary: Summary = {
        id: 'summary-1',
        podcastId: 'test-podcast',
        content: 'Test summary content',
        format: 'paragraph',
        characterCount: 100,
        createdAt: new Date().toISOString(),
        podcast: mockPodcast,
      };

      act(() => {
        usePodcastStore.getState().addSummary('test-podcast', testSummary);
      });

      const result = usePodcastStore.getState().getSummary('test-podcast');
      expect(result).toEqual(testSummary);
    });

    it('should remove summary', () => {
      const testSummary: Summary = {
        id: 'summary-1',
        podcastId: 'test-podcast',
        content: 'Test summary content',
        format: 'paragraph',
        characterCount: 100,
        createdAt: new Date().toISOString(),
        podcast: mockPodcast,
      };

      act(() => {
        usePodcastStore.getState().addSummary('test-podcast', testSummary);
        usePodcastStore.getState().removeSummary('test-podcast');
      });

      expect(usePodcastStore.getState().summaries['test-podcast']).toBeUndefined();
    });
  });

  describe('async actions', () => {
    it('searchPodcasts should call API and update state on success', async () => {
      const mockApiResponse = {
        data: [mockPodcast],
        total: 1,
      };

      (podcastAPI.searchPodcasts as jest.Mock).mockResolvedValue(mockApiResponse);

      await act(async () => {
        await usePodcastStore.getState().searchPodcasts('test');
      });

      expect(podcastAPI.searchPodcasts).toHaveBeenCalledWith('test', {});
      expect(usePodcastStore.getState().podcasts).toEqual({
        'test-podcast': mockPodcast,
      });
      expect(usePodcastStore.getState().isSearching).toBe(false);
      expect(usePodcastStore.getState().error).toBeNull();
    });

    it('searchPodcasts should set error state on API failure', async () => {
      const errorMessage = 'Search failed';
      (podcastAPI.searchPodcasts as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await usePodcastStore.getState().searchPodcasts('test');
      });

      expect(usePodcastStore.getState().error).toBe(errorMessage);
      expect(usePodcastStore.getState().isSearching).toBe(false);
      expect(usePodcastStore.getState().podcasts).toEqual({});
    });

    it('generateSummary should generate summary and add to store on success', async () => {
      const summaryOptions: SummaryOptions = { format: 'paragraph', characterLimit: 100 };
      
      // First set the podcast so it can be found
      act(() => {
        usePodcastStore.getState().setPodcasts([mockPodcast]);
      });

      let result: Summary | null = null;
      await act(async () => {
        result = await usePodcastStore.getState().generateSummary('test-podcast', summaryOptions);
      });

      expect(result).toBeTruthy();
      expect(result!.podcastId).toBe('test-podcast');
      expect(result!.format).toBe('paragraph');
      expect(usePodcastStore.getState().summaries['test-podcast']).toBeTruthy();
      expect(usePodcastStore.getState().loadingPodcastId).toBeNull();
    });

    it('generateSummary should set error state when podcast not found', async () => {
      const summaryOptions: SummaryOptions = { format: 'bullet-points', characterLimit: 100 };

      await act(async () => {
        await usePodcastStore.getState().generateSummary('nonexistent-podcast', summaryOptions);
      });

      expect(usePodcastStore.getState().error).toBe('Podcast not found');
      expect(usePodcastStore.getState().loadingPodcastId).toBeNull();
    });
  });
});