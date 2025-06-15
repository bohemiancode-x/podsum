'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, User, FileText, Trash2 } from 'lucide-react';
import { Podcast, Summary } from '@/types';
import { SummaryModal } from './SummaryModal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { truncateText } from '@/lib/utils';
import { useSummaryStore } from '@/store/summaryStore';
import { toast } from 'sonner';

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
  const { openModalId, setOpenModalId, deleteSummary } = useSummaryStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const showSummaryModal = openModalId === podcast.id;

  const DESCRIPTION_LIMIT = 150;
  const displayDescription = podcast.description ? truncateText(podcast.description, DESCRIPTION_LIMIT) : '';

  const handleSummarizeClick = () => {
    setOpenModalId(podcast.id);
  };

  const handleCloseModal = () => {
    setOpenModalId(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteSummary(podcast.id);
      setShowDeleteConfirm(false);
      toast.success('Summary deleted successfully');
    } catch (error) {
      console.error('Failed to delete summary:', error);
      toast.error('Failed to delete summary. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
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
              <>
                <Button 
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="inline-flex my-auto items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  data-testid="delete-summary-button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSummarizeClick}
                  variant="secondary"
                  className="inline-flex items-center gap-2"
                  data-testid="summarize-button"
                >
                  <FileText className="h-4 w-4" />
                  View Summary
                </Button>
              </>
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Summary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the summary for &ldquo;{podcast.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleDeleteCancel}
              variant="outline"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
