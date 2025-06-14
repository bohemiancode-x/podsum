'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { PodcastCard } from './PodcastCard';
import { SearchAndFilter } from './SearchAndFilter';
import { LoadingGrid } from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const podcastArray: Podcast[] = useMemo(() => {
    const array = Array.isArray(podcasts)
      ? podcasts
      : (Object.values(podcasts || {}) as Podcast[]);
    
    return array;
  }, [podcasts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [allPodcastsPage, setAllPodcastsPage] = useState(1);
  const [savedPodcastsPage, setSavedPodcastsPage] = useState(1);
  const { summaries: savedSummaries, isLoadingSummaries } = useSummaryStore();

  const PODCASTS_PER_PAGE = 9;

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

  // Get all podcasts with summaries (sorted newest first)
  const podcastsWithSummaries = useMemo(() => {
    const withSummaries: Array<{ podcast: Podcast; createdAt: string }> = [];
    const processedIds = new Set<string>();
    
    // Get all unique podcasts with summaries from the savedSummaries
    Object.values(savedSummaries).forEach(summary => {
      if (summary.podcast && !processedIds.has(summary.podcast.id)) {
        withSummaries.push({
          podcast: summary.podcast,
          createdAt: summary.createdAt
        });
        processedIds.add(summary.podcast.id);
      }
    });
    
    // Sort by creation date (newest first)
    withSummaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Return just the podcasts array
    return withSummaries.map(item => item.podcast);
  }, [savedSummaries]);

  // Get unique podcast count with summaries
  const uniquePodcastsWithSummaries = useMemo(() => {
    const uniqueIds = new Set<string>();
    Object.values(savedSummaries).forEach(summary => {
      if (summary.podcast) {
        uniqueIds.add(summary.podcast.id);
      }
    });
    return uniqueIds.size;
  }, [savedSummaries]);

  // Pagination logic for all podcasts
  const paginatedAllPodcasts = useMemo(() => {
    const startIndex = (allPodcastsPage - 1) * PODCASTS_PER_PAGE;
    const endIndex = startIndex + PODCASTS_PER_PAGE;
    return podcastArray.slice(startIndex, endIndex);
  }, [podcastArray, allPodcastsPage, PODCASTS_PER_PAGE]);

  // Pagination logic for saved podcasts
  const paginatedSavedPodcasts = useMemo(() => {
    const startIndex = (savedPodcastsPage - 1) * PODCASTS_PER_PAGE;
    const endIndex = startIndex + PODCASTS_PER_PAGE;
    return podcastsWithSummaries.slice(startIndex, endIndex);
  }, [podcastsWithSummaries, savedPodcastsPage, PODCASTS_PER_PAGE]);

  // Calculate total pages
  const totalAllPages = Math.ceil(podcastArray.length / PODCASTS_PER_PAGE);
  const totalSavedPages = Math.ceil(podcastsWithSummaries.length / PODCASTS_PER_PAGE);

  // Reset pagination when switching tabs or when search results change
  const handleTabChange = useCallback((value: string) => {
    if (value === 'all') {
      setAllPodcastsPage(1);
    } else if (value === 'saved') {
      setSavedPodcastsPage(1);
    }
  }, []);

  // Pagination controls component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; 
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderPodcastGrid = useCallback((podcastList: Podcast[], showEmpty: boolean = true, isLoadingData: boolean = false) => {
    if (loading || isSearching || isLoadingData) {
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
        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="all" className="text-sm">
              All Podcasts ({podcastArray.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-sm">
              Saved Summaries ({uniquePodcastsWithSummaries})
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
                isSearching={isSearching}
                onSearch={handleSearch}
              />
              
              {renderPodcastGrid(paginatedAllPodcasts, true, false)}
              
              <PaginationControls
                currentPage={allPodcastsPage}
                totalPages={totalAllPages}
                onPageChange={setAllPodcastsPage}
              />
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
              {renderPodcastGrid(paginatedSavedPodcasts, true, isLoadingSummaries)}
              
              <PaginationControls
                currentPage={savedPodcastsPage}
                totalPages={totalSavedPages}
                onPageChange={setSavedPodcastsPage}
              />
            </div>
          </TabsContent>
        </Tabs>
        </div>
    </section>
  );
};
