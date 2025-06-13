'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { X, Copy, Share2, Check, User, Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Podcast, Summary } from '@/types';
import { Button } from '@/components/ui/button';
import { AudioWaveform } from '@/components/ui/AudioWaveform';
import { LoadingSteps } from '@/components/ui/LoadingSteps';
import { truncateText } from '@/lib/utils';
import { useSummaryStore } from '@/store/summaryStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SummaryFormat = 'bullet-points' | 'paragraph' | 'key-takeaways' | 'executive-summary';
export type SummaryLength = 'short' | 'medium' | 'long';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast;
  existingSummary?: Summary;
}

export const SummaryModal = ({
  isOpen,
  onClose,
  podcast,
  existingSummary
}: SummaryModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<Summary | undefined>(existingSummary);
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>(
    existingSummary?.format || 'paragraph'
  );
  const [selectedLength, setSelectedLength] = useState<SummaryLength>('medium');
  const [copied, setCopied] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Get summary store functions
  const { addSummary, setGenerating } = useSummaryStore();

  const DESCRIPTION_LIMIT = 200;
  const displayDescription = truncateText(podcast.description, DESCRIPTION_LIMIT);

  // Update local summary state when existingSummary changes
  useEffect(() => {
    if (existingSummary) {
      setSummary(existingSummary);
    }
  }, [existingSummary]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle closing animation
  const handleClose = () => {
    if (isGenerating) {
      setShowConfirmDialog(true);
    } else {
      setIsClosing(true);
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300); // Match this with the animation duration
    }
  };

  const handleConfirmClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerating(podcast.id, false);
    setShowConfirmDialog(false);
    onClose();
  };

  // Check if audio processing will likely be needed (same logic as geminiService)
  const willUseAudioProcessing = () => {
    const length = podcast.description.length;
    const wordCount = podcast.description.split(/\s+/).length;
    
    const genericIndicators = [
      'listen to full episode',
      'show notes available at',
      'subscribe to our podcast',
      'visit our website',
      'follow us on',
      'want to be a guest',
      'want to be a sponsor',
      'support this podcast',
      'patreon.com',
      'donate to',
      'buy us a coffee',
    ];
    
    const hasGenericContent = genericIndicators.some(indicator => 
      podcast.description.toLowerCase().includes(indicator)
    );
    
    let score = 0;
    if (length >= 500) {
      score = 90;
    } else if (length >= 300 && !hasGenericContent && wordCount >= 40) {
      score = 75;
    } else if (length >= 200 && !hasGenericContent) {
      score = 60;
    } else if (length >= 200 && hasGenericContent) {
      score = 40;
    } else {
      score = 20;
    }
    
    const shouldUseAudio = score < 60;
    
    return shouldUseAudio;
  };

  const needsAudioProcessing = willUseAudioProcessing();

  // Define loading steps based on processing type
  const getLoadingSteps = () => {
    if (needsAudioProcessing) {
      return [
        {
          id: 'analyze',
          label: 'PodSum will analyze the content',
          description: 'Evaluating the podcast description to determine the best approach for summarization'
        },
        {
          id: 'prepare',
          label: 'PodSum will prepare the audio',
          description: 'Accessing and preparing the podcast audio file for transcription'
        },
        {
          id: 'transcribe',
          label: 'PodSum will transcribe the audio',
          description: 'Converting spoken words to text using advanced AI speech recognition'
        },
        {
          id: 'understand',
          label: 'PodSum will understand the context',
          description: 'Analyzing the transcript to identify key topics, themes, and insights'
        },
        {
          id: 'extract',
          label: 'PodSum will extract key insights',
          description: 'Finding the most important points, takeaways, and actionable information'
        },
        {
          id: 'summarize',
          label: 'PodSum will generate your summary',
          description: 'Creating a personalized summary in your preferred format and length'
        }
      ];
    } else {
      return [
        {
          id: 'analyze',
          label: 'PodSum will analyze the content',
          description: 'Reading and evaluating the podcast episode description'
        },
        {
          id: 'understand',
          label: 'PodSum will understand the context',
          description: 'Identifying key topics, themes, and the main discussion points'
        },
        {
          id: 'extract',
          label: 'PodSum will extract insights',
          description: 'Finding the most valuable information and actionable takeaways'
        },
        {
          id: 'structure',
          label: 'PodSum will structure the content',
          description: 'Organizing the information according to your preferred format'
        },
        {
          id: 'summarize',
          label: 'PodSum will craft your summary',
          description: 'Generating a personalized summary tailored to your specifications'
        }
      ];
    }
  };

  const loadingSteps = getLoadingSteps();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowRegenerateForm(false);
      setError(null);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setGenerating(podcast.id, true); // Set loading state in store
    setError(null);
    setFallbackUsed(false);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          podcast,
          format: selectedFormat,
          length: selectedLength
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      if (data.success && data.result) {
        const newSummary: Summary = {
          id: `summary-${podcast.id}`,
          podcastId: podcast.id,
          content: data.result.summary,
          format: selectedFormat,
          characterCount: data.result.summary.length,
          createdAt: new Date().toISOString(),
          podcast: podcast,
        };
        
        // Save to local state
        setSummary(newSummary);
        // Save to store for persistence
        addSummary(newSummary);
        
        setFallbackUsed(data.fallbackUsed || false);
        setShowRegenerateForm(false);
        
        toast.success('Summary generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      // Don't show error if the request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerating(podcast.id, false); // Clear loading state in store
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerateSummary();
  };

  const handleCopy = async () => {
    if (summary) {
      try {
        await navigator.clipboard.writeText(summary.content);
        setCopied(true);
        toast.success('Summary copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
        console.error('Copy failed:', err);
      }
    }
  };

  const handleShare = async () => {
    if (summary && navigator.share) {
      try {
        await navigator.share({
          title: `Summary: ${podcast.title}`,
          text: summary.content,
          url: window.location.href,
        });
        toast.success('Summary shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share summary');
        }
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={modalRef}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        data-testid="summary-modal"
      >
        <div 
          ref={contentRef}
          className={`w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-lg bg-background p-0 overflow-auto transform transition-all duration-300 ease-in-out ${isClosing ? 'translate-x-[-100%]' : 'translate-x-0'} md:translate-x-0 md:translate-y-0 opacity-100`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Podcast Info Header */}
          <div className="relative h-32 md:h-48 w-full overflow-hidden md:rounded-t-lg transition-all duration-300">
            <Image 
              src={podcast.imageUrl} 
              alt={podcast.title}
              width={600}
              height={200}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent transition-opacity duration-300" />
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 hover:scale-110"
              data-testid="close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 md:p-6 transition-all duration-300">
            {/* Podcast Details */}
            <div className="mb-4 md:mb-6 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold transition-all duration-300">{podcast.title}</h2>
                  <div className="mt-1 text-sm text-muted-foreground transition-all duration-300">
                    <p className="leading-relaxed">{displayDescription}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground transition-all duration-300">
                <div className="flex items-center gap-1 hover:text-primary transition-colors duration-200">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{podcast.host}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-primary transition-colors duration-200">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{podcast.duration}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-primary transition-colors duration-200">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{podcast.date}</span>
                </div>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors duration-200 hover:border-primary hover:text-primary">
                  {podcast.category}
                </span>
              </div>
            </div>

            {/* Summary Display or Generation Interface */}
            {summary && !isGenerating && !showRegenerateForm ? (
              <div className="space-y-4 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-semibold transition-all duration-300">Summary</h3>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 transition-all duration-200 hover:bg-green-200">
                      {summary.format} • {summary.characterCount} chars
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowRegenerateForm(true)}
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-1 text-xs md:text-sm transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 transition-all duration-200 hover:scale-110"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      onClick={handleShare}
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 transition-all duration-200 hover:scale-110"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Fallback notification */}
                {fallbackUsed && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2 md:p-3 text-xs md:text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 transition-all duration-300">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span>
                      Audio transcription was not available, so this summary was generated from the episode description.
                    </span>
                  </div>
                )}
                
                <div 
                  className="rounded-lg border bg-muted/30 p-3 md:p-4 transition-all duration-300 hover:bg-muted/40"
                  data-testid="summary-content"
                >
                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{summary.content}</p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 text-xs text-muted-foreground transition-all duration-300">
                  <span>Format: {summary.format}</span>
                  <span>Characters: {summary.content.length}</span>
                  <span>Created: {new Date(summary.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : showRegenerateForm ? (
              <div className="space-y-4 md:space-y-6 transition-all duration-300">
                {/* Show loading state with steps and waveform when generating */}
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-16 space-y-6 md:space-y-10 transition-all duration-300">
                    {/* Waveform Animation */}
                    <AudioWaveform />
                    
                    {/* Processing Steps */}
                    <div className="w-full max-w-lg transition-all duration-300">
                      <LoadingSteps steps={loadingSteps} />
                    </div>
                    
                    {/* Warning about closing modal */}
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2 md:p-3 text-xs md:text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 transition-all duration-300">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span>
                        Closing this modal will cancel the ongoing summarization. Please wait for it to complete.
                      </span>
                    </div>
                    
                    {/* Estimated time */}
                    <div className="text-center text-xs text-muted-foreground transition-all duration-300">
                      {needsAudioProcessing 
                        ? "Audio processing typically takes 30-45 seconds"
                        : "Text processing usually takes a few seconds"
                      }
                    </div>
                  </div>
                ) : (
                  /* Show regeneration form when not generating */
                  <>
                    {/* Regeneration Header */}
                    <div className="flex items-center justify-between transition-all duration-300">
                      <div>
                        <h3 className="mb-1 md:mb-2 text-base md:text-lg font-semibold transition-all duration-300">Generate New Summary</h3>
                        <p className="text-xs md:text-sm text-muted-foreground transition-all duration-300">
                          Create a new summary with different format or length options. This will replace the current summary.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowRegenerateForm(false)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2 md:space-y-3 transition-all duration-300">
                      <label className="text-xs md:text-sm font-medium transition-all duration-300">Summary Format</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                        {[
                          { value: 'paragraph', label: 'Paragraph', desc: 'Flowing narrative format' },
                          { value: 'bullet-points', label: 'Bullet Points', desc: 'Key points in list format' },
                          { value: 'key-takeaways', label: 'Key Takeaways', desc: 'Main insights and lessons' },
                          { value: 'executive-summary', label: 'Executive Summary', desc: 'Business-focused overview' }
                        ].map((format) => (
                          <label
                            key={format.value}
                            className={`cursor-pointer rounded-lg border p-2 text-xs md:text-sm transition-all duration-200 hover:scale-105 hover:bg-muted/50 ${
                              selectedFormat === format.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-input'
                            }`}
                          >
                            <input
                              type="radio"
                              name="format"
                              value={format.value}
                              checked={selectedFormat === format.value}
                              onChange={(e) => setSelectedFormat(e.target.value as SummaryFormat)}
                              className="sr-only"
                            />
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-muted-foreground">{format.desc}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Length Selection */}
                    <div className="space-y-2 md:space-y-3 transition-all duration-300">
                      <label className="text-xs md:text-sm font-medium transition-all duration-300">Summary Length</label>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {[
                          { value: 'short', label: 'Short', desc: '~200 chars' },
                          { value: 'medium', label: 'Medium', desc: '~400 chars' },
                          { value: 'long', label: 'Long', desc: '~600 chars' }
                        ].map((length) => (
                          <label
                            key={length.value}
                            className={`cursor-pointer flex items-center justify-center rounded-lg border p-1 text-xs md:text-sm transition-all duration-200 hover:scale-105 hover:bg-muted/50 ${
                              selectedLength === length.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-input'
                            }`}
                          >
                            <input
                              type="radio"
                              name="length"
                              value={length.value}
                              checked={selectedLength === length.value}
                              onChange={(e) => setSelectedLength(e.target.value as SummaryLength)}
                              className="sr-only"
                            />
                            <div className="font-medium">{length.label}</div>
                            <div className="text-xs mx-1 md:mx-2 text-muted-foreground">{length.desc}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Audio Processing Warning for Regeneration */}
                    {needsAudioProcessing && (
                      <div className="flex items-start gap-2 md:gap-3 rounded-lg bg-blue-50 border border-blue-200 p-2 md:p-4 text-xs md:text-sm text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 transition-all duration-300">
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-medium">Audio Processing Required</div>
                          <div className="text-xs">
                            This episode has limited description content, so we&apos;ll transcribe the audio to create a comprehensive summary. 
                            This process typically takes 30-45 seconds and provides higher quality results.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={isGenerating}
                      className="w-full transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate New Summary
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {/* Show loading state with steps and waveform when generating */}
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-16 space-y-6 md:space-y-10">
                    {/* Waveform Animation */}
                    <AudioWaveform />
                    
                    {/* Processing Steps */}
                    <div className="w-full max-w-lg">
                      <LoadingSteps steps={loadingSteps} />
                    </div>
                    
                    {/* Warning about closing modal */}
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2 md:p-3 text-xs md:text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                      <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span>
                        Closing this modal will cancel the ongoing summarization. Please wait for it to complete.
                      </span>
                    </div>
                    
                    {/* Estimated time */}
                    <div className="text-center text-xs text-muted-foreground">
                      {needsAudioProcessing 
                        ? "Audio processing typically takes 30-45 seconds"
                        : "Text processing usually takes a few seconds"
                      }
                    </div>
                  </div>
                ) : (
                  /* Show form when not generating */
                  <>
                    {/* Header */}
                    <div>
                      <h3 className="mb-1 md:mb-2 text-base md:text-lg font-semibold">Generate Summary</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Choose your preferred format and length for the AI-generated summary.
                      </p>
                    </div>

                    {/* Format Selection for new summaries */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-medium">Summary Format</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                        {[
                          { value: 'paragraph', label: 'Paragraph', desc: 'Flowing narrative format' },
                          { value: 'bullet-points', label: 'Bullet Points', desc: 'Key points in list format' },
                          { value: 'key-takeaways', label: 'Key Takeaways', desc: 'Main insights and lessons' },
                          { value: 'executive-summary', label: 'Executive Summary', desc: 'Business-focused overview' }
                        ].map((format) => (
                          <div key={format.value} className="relative">
                            <input
                              type="radio"
                              id={format.value}
                              name="format"
                              value={format.value}
                              checked={selectedFormat === format.value}
                              onChange={(e) => setSelectedFormat(e.target.value as SummaryFormat)}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={format.value}
                              className="flex cursor-pointer flex-col rounded-lg border p-2 text-xs md:text-sm hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5"
                            >
                              <span className="font-medium">{format.label}</span>
                              <span className="text-xs text-muted-foreground">{format.desc}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Length Selection */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-medium">Summary Length</label>
                      <div className="flex gap-2 md:gap-3">
                        {[
                          { value: 'short', label: 'Short', desc: '~200 chars' },
                          { value: 'medium', label: 'Medium', desc: '~400 chars' },
                          { value: 'long', label: 'Long', desc: '~600 chars' }
                        ].map((length) => (
                          <div key={length.value} className="flex-1">
                            <input
                              type="radio"
                              id={length.value}
                              name="length"
                              value={length.value}
                              checked={selectedLength === length.value}
                              onChange={(e) => setSelectedLength(e.target.value as SummaryLength)}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={length.value}
                              className="flex cursor-pointer items-center justify-center rounded-lg border p-1 text-center text-xs md:text-sm hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5"
                            >
                              <span className="font-medium">{length.label}</span>
                              <span className="text-xs mx-1 md:mx-2 text-muted-foreground">{length.desc}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2 md:p-3 text-xs md:text-sm text-destructive">
                          <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="flex-1">{error}</span>
                        </div>
                        <div className="flex justify-center">
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Audio Processing Warning */}
                    {needsAudioProcessing && (
                      <div className="flex items-start gap-2 md:gap-3 rounded-lg bg-blue-50 border border-blue-200 p-2 md:p-4 text-xs md:text-sm text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-medium">Audio Processing Required</div>
                          <div className="text-xs">
                            This episode has limited transcription content, so we&apos;ll transcribe the audio to create a comprehensive summary. 
                            This process typically takes 30-45 seconds and provides higher quality results.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <div className="w-full flex justify-end">
                      <Button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="gap-2"
                      >
                        Generate Summary
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add a style block for the slide animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          [data-testid="summary-modal"] > div {
            animation: slideIn 0.3s ease-out forwards;
          }
        }
      `}</style>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md transition-all duration-300">
          <DialogHeader>
            <DialogTitle className="transition-all duration-300">Cancel Summarization?</DialogTitle>
            <DialogDescription className="transition-all duration-300">
              Closing this modal will cancel the ongoing summarization. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
            >
              Continue Summarizing
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmClose}
              className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
            >
              Cancel Summarization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
