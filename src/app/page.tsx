'use client';

import React, { useEffect, useMemo } from 'react';
import { Navbar } from '@/components/podcast/Navbar';
import { Hero } from '@/components/podcast/Hero';
import { PodcastList } from '@/components/podcast/PodcastList';
import { Footer } from '@/components/podcast/Footer';
import { ErrorBoundary, ErrorMessage } from '@/components/ErrorBoundary';
import { usePodcastStore } from '@/store/podcastStore';
import { useSummaryStore } from '@/store/summaryStore';

export default function Home() {
  const {
    podcasts,
    isLoading,
    isSearching,
    error,
    searchPodcasts,
    searchEpisodesForSummarization,
    setSearchFilters,
    clearError,
  } = usePodcastStore();

  const {
    generatingSummaries,
    getAllSummaries,
  } = useSummaryStore();

  // Memoize the loadingPodcastId to prevent unnecessary re-renders
  const loadingPodcastId = useMemo(() => {
    return generatingSummaries.size > 0 ? Array.from(generatingSummaries)[0] : null;
  }, [generatingSummaries]);

  // Load initial podcasts and summaries on mount
  useEffect(() => {
    // Get recent episodes from popular topics optimized for summarization
    searchEpisodesForSummarization('startups entrepreneurship');
    // Load saved summaries from the database
    getAllSummaries();
  }, [searchEpisodesForSummarization, getAllSummaries]);

  const handleSearch = (searchQuery: string) => {
    // Clear any previous errors when starting a new search
    clearError();
    setSearchFilters({ query: searchQuery, offset: 0 });
    
    // If search query is empty, reload the initial episodes
    if (!searchQuery.trim()) {
      searchEpisodesForSummarization('startups entrepreneurship');
    } else {
      searchPodcasts(searchQuery);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          {error ? (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
              <ErrorMessage 
                error={error} 
                onRetry={() => {
                  clearError();
                  searchPodcasts('technology');
                }}
                className="max-w-md mx-auto"
              />
            </div>
          ) : (
            <PodcastList 
              podcasts={Object.values(podcasts)}
              loadingPodcastId={loadingPodcastId}
              loading={isLoading}
              isSearching={isSearching}
              onSearch={handleSearch}
            />
          )}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
