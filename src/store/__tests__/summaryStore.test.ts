import { renderHook, act } from '@testing-library/react';
import { useSummaryStore } from '../summaryStore';
import { Summary, Podcast } from '@/types';

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

describe('Summary Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSummaryStore());
    act(() => {
      // Reset the store by removing all summaries
      Object.keys(result.current.summaries).forEach(podcastId => {
        result.current.removeSummary(podcastId);
      });
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useSummaryStore());
    expect(result.current.summaries).toEqual({});
    expect(result.current.generatingSummaries.size).toBe(0);
    expect(result.current.searchFilters).toEqual({
      query: '',
      category: '',
      offset: 0,
    });
  });

  it('should add a summary', async () => {
    const { result } = renderHook(() => useSummaryStore());
    const summary: Summary = {
      id: 'test-id',
      length: 'short',
      podcastId: 'test-podcast',
      content: 'Test summary',
      format: 'bullet-points',
      characterCount: 100,
      createdAt: new Date().toISOString(),
      podcast: mockPodcast,
    };

    // Mock fetch to return the summary
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(summary),
    })) as jest.Mock;

    await act(async () => {
      await result.current.addSummary(summary);
    });

    expect(result.current.summaries['test-podcast']).toEqual(summary);
  });

  it('should get a summary', async () => {
    const { result } = renderHook(() => useSummaryStore());
    const summary: Summary = {
      id: 'test-id',
      length: 'short',
      podcastId: 'test-podcast',
      content: 'Test summary',
      format: 'bullet-points',
      characterCount: 100,
      createdAt: new Date().toISOString(),
      podcast: mockPodcast,
    };

    // Mock fetch to return the summary
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(summary),
    })) as jest.Mock;

    await act(async () => {
      await result.current.addSummary(summary);
    });

    const retrievedSummary = await result.current.getSummary('test-podcast');
    expect(retrievedSummary).toEqual(summary);
  });

  it('should delete a summary', async () => {
    const { result } = renderHook(() => useSummaryStore());
    const summary: Summary = {
      id: 'test-id',
      length: 'short',
      podcastId: 'test-podcast',
      content: 'Test summary',
      format: 'bullet-points',
      characterCount: 100,
      createdAt: new Date().toISOString(),
      podcast: mockPodcast,
    };

    await act(async () => {
      await result.current.addSummary(summary);
    });

    expect(result.current.summaries['test-podcast']).toBeDefined();

    await act(async () => {
      await result.current.deleteSummary('test-podcast');
    });

    expect(result.current.summaries['test-podcast']).toBeUndefined();
  });

  it('should set generating state', () => {
    const { result } = renderHook(() => useSummaryStore());

    act(() => {
      result.current.setGenerating('test-podcast', true);
    });

    expect(result.current.isGenerating('test-podcast')).toBe(true);
    
    act(() => {
      result.current.setGenerating('test-podcast', false);
    });
    
    expect(result.current.isGenerating('test-podcast')).toBe(false);
  });

  it('should update search filters', () => {
    const { result } = renderHook(() => useSummaryStore());
    
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
});
