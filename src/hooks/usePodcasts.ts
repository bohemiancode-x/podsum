'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Podcast } from '@/types';
import { podcastAPI, FetchState } from '@/services/podcastAPI';

export function usePodcastSearch(initialQuery: string = 'technology') {
  const [state, setState] = useState<FetchState<Podcast[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [query, setQuery] = useState(initialQuery);

  const searchPodcasts = useCallback(async (searchQuery: string, options?: {
    offset?: number;
    genre?: string;
    language?: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Show loading toast for search
    const toastId = `search-${Date.now()}`;
    toast.loading('Searching podcasts...', { id: toastId });
    
    const result = await podcastAPI.searchPodcasts(searchQuery, options);
    
    if (result.error) {
      toast.error('Search failed', { 
        id: toastId,
        description: result.error 
      });
    } else {
      toast.success('Podcasts loaded successfully!', { 
        id: toastId,
        description: `Found ${result.data?.length || 0} episodes`
      });
    }
    
    setState(result);
  }, []);

  useEffect(() => {
    searchPodcasts(query);
  }, [query, searchPodcasts]);

  const refetch = useCallback(() => {
    searchPodcasts(query);
  }, [query, searchPodcasts]);

  return {
    podcasts: state.data || [],
    loading: state.loading,
    error: state.error,
    query,
    setQuery,
    searchPodcasts,
    refetch,
  };
}

export function usePodcast(id: string | null) {
  const [state, setState] = useState<FetchState<Podcast>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchPodcast = useCallback(async (podcastId: string) => {
    setState({ data: null, loading: true, error: null });
    
    const result = await podcastAPI.getPodcastById(podcastId);
    setState(result);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPodcast(id);
    }
  }, [id, fetchPodcast]);

  return {
    podcast: state.data,
    loading: state.loading,
    error: state.error,
    refetch: id ? () => fetchPodcast(id) : () => {},
  };
}

import { BestPodcastsResponse } from '@/services/podcastAPI';

export function useBestPodcasts(options?: {
  genre_id?: number;
  page?: number;
  region?: string;
}) {
  const [state, setState] = useState<FetchState<BestPodcastsResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchBestPodcasts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await podcastAPI.getBestPodcasts(options);
    setState(result);
  }, [options]);

  useEffect(() => {
    fetchBestPodcasts();
  }, [fetchBestPodcasts]);

  return {
    podcasts: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchBestPodcasts,
  };
}
