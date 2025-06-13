'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { PodcastCard } from './PodcastCard';
import { SearchAndFilter } from './SearchAndFilter';
import { LoadingGrid } from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Podcast } from '@/types';
import { useSummaryStore } from '@/store/summaryStore';

interface PodcastListProps {
  podcasts: Podcast[];
  loadingPodcastId: string | null;
  loading?: boolean;
  isSearching?: boolean;
  onSearch?: (query: string) => void;
}

export const PodcastList = ({
  podcasts,
  loadingPodcastId,
  loading = false,
  isSearching = false,
  onSearch
}: PodcastListProps) => {
  // Convert podcasts to an array if it's an object, and type as Podcast[]
  const podcastArray: Podcast[] = Array.isArray(podcasts)
    ? podcasts
    : (Object.values(podcasts || {}) as Podcast[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { summaries: savedSummaries } = useSummaryStore();

  // Memoize the podcast cards to prevent unnecessary re-renders
  const renderPodcastCard = useCallback((podcast: Podcast) => (
    <PodcastCard
      key={podcast.id}
      podcast={podcast}
      summary={savedSummaries[podcast.id]}
      isLoading={loadingPodcastId === podcast.id}
      data-testid={`podcast-card-${podcast.id}`}
    />
  ), [savedSummaries, loadingPodcastId]);

  // Handle manual search trigger
  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    if (!Array.isArray(podcastArray)) {
      return [];
    }
    
    return Array.from(new Set(
      podcastArray
        .filter(podcast => podcast && podcast.category) // Filter out invalid podcasts
        .map(podcast => podcast.category)
    )).sort();
  }, [podcastArray]);

  // Get all podcasts with summaries
  const podcastsWithSummaries = useMemo(() => {
    const withSummaries: Podcast[] = [];
    const processedIds = new Set<string>();
    
    // Add podcasts from current search results that have summaries
    podcastArray.forEach(podcast => {
      if (!podcast) return; // Skip if podcast is undefined
      const hasSummary = Object.values(savedSummaries).some(summary => summary.podcastId === podcast.id);
      if (hasSummary && !processedIds.has(podcast.id)) {
        withSummaries.push(podcast);
        processedIds.add(podcast.id);
      }
    });
    
    return withSummaries;
  }, [podcastArray, savedSummaries]);

  // Filter podcasts based on search and category (local filtering only)
  const filteredPodcasts = useMemo(() => {
    // Safety check: ensure podcastArray is an array
    if (!Array.isArray(podcastArray)) {
      return [];
    }
    
    return podcastArray.filter(podcast => {
      // Safety check: ensure podcast object exists
      if (!podcast) return false;
      
      // Category filtering
      const category = podcast.category || '';
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      
      return matchesCategory;
    });
  }, [podcastArray, selectedCategory]);

  const renderPodcastGrid = useCallback((podcastList: Podcast[], showEmpty: boolean = true) => {
    if (loading || isSearching) {
      return <LoadingGrid count={6} className="mt-8" data-testid="loading-grid" />;
    }

    if (podcastList.length === 0 && showEmpty) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">
            {Object.keys(savedSummaries).length === 0 
              ? "No saved summaries yet. Search for podcasts and generate summaries to see them here!"
              : "No podcasts found matching your search."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {podcastList.map(renderPodcastCard)}
      </div>
    );
  }, [loading, isSearching, savedSummaries, renderPodcastCard]);

  return (
    <section className="max-w-7xl mx-auto py-12 px-4 md:px-6" data-testid="podcast-list">
      <div className="space-y-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="all" className="text-sm">
              All Podcasts ({podcastArray.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-sm">
              Saved Summaries ({Object.keys(savedSummaries).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-8">
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Featured Podcasts</h2>
                <p className="text-muted-foreground">
                  Select an episode to summarize or view existing summaries
                </p>
              </div>

              <SearchAndFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                isSearching={isSearching}
                onSearch={handleSearch}
              />
              
              {renderPodcastGrid(filteredPodcasts)}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">Saved Summaries</h2>
                <p className="text-muted-foreground mt-2">
                  Your previously generated podcast summaries
                </p>
              </div>
              {renderPodcastGrid(podcastsWithSummaries)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
