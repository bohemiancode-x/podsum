'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { Podcast, Summary } from '@/types';
import { SummaryModal } from './SummaryModal';
import { Button } from '@/components/ui/button';
import { truncateText } from '@/lib/utils';
import { useSummaryStore } from '@/store/summaryStore';

interface PodcastCardProps {
  podcast: Podcast;
  summary: Summary | undefined;
  isLoading: boolean;
}

export const PodcastCard = ({
  podcast,
  summary,
  isLoading
}: PodcastCardProps) => {
  const { openModalId, setOpenModalId } = useSummaryStore();
  const showSummaryModal = openModalId === podcast.id;

  const DESCRIPTION_LIMIT = 150;
  const displayDescription = truncateText(podcast.description, DESCRIPTION_LIMIT);

  const handleSummarizeClick = () => {
    setOpenModalId(podcast.id);
  };

  const handleCloseModal = () => {
    setOpenModalId(null);
  };

  return (
    <>
      <div 
        className="group relative h-full overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md flex flex-col"
        data-testid={`podcast-card-${podcast.id}`}
      >
        {/* Image container - sticks to top */}
        <div className="aspect-video w-full overflow-hidden rounded-t-lg flex-shrink-0 m-0 p-0">
          <Image 
            src={podcast.imageUrl} 
            alt={podcast.title}
            width={400}
            height={200}
            className="h-full w-full object-cover transition-all group-hover:scale-105 block" 
          />
        </div>
        {/* Content container - fills remaining space */}
        <div className="p-6 flex flex-col flex-grow min-h-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
              {podcast.category}
            </span>
            {displayDescription.length > 1000 && (
              <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 border-green-200 px-2.5 py-0.5 text-xs font-semibold">
                Rich Content
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {podcast.duration}
            </span>
          </div>
          <h3 
            className="mt-3 text-xl font-bold leading-tight tracking-tight"
            data-testid="podcast-title"
          >
            {podcast.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{podcast.host}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{podcast.date}</span>
          </div>
          <div 
            className="mt-3 text-sm text-muted-foreground flex-grow"
            data-testid="podcast-description"
          >
            <p className="leading-relaxed">{displayDescription}</p>
          </div>
          <div className="mt-4 flex justify-end gap-2 pt-2">
            {summary ? (
              <Button 
                onClick={handleSummarizeClick}
                variant="secondary"
                className="inline-flex items-center gap-2"
                data-testid="summarize-button"
              >
                <FileText className="h-4 w-4" />
                View Summary
              </Button>
            ) : (
              <Button 
                onClick={handleSummarizeClick}
                disabled={isLoading}
                className="inline-flex items-center gap-2"
                data-testid="summarize-button"
              >
                <FileText className="h-4 w-4" />
                Summarize
              </Button>
            )}
          </div>
        </div>
      </div>
      {showSummaryModal && (
        <SummaryModal
          isOpen={showSummaryModal}
          onClose={handleCloseModal}
          podcast={podcast}
          existingSummary={summary}
        />
      )}
    </>
  );
};
