import { geminiService, SummarizationOptions, SummarizationResult } from './geminiService';
import { Podcast } from '@/types';

export interface SummarizationProgress {
  stage: 'analyzing' | 'processing' | 'transcribing' | 'summarizing' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
  estimatedTimeMs?: number;
  estimatedTimeRemaining?: number; // seconds
}

export interface SummarizationResponse {
  success: boolean;
  result?: SummarizationResult;
  error?: string;
  canRetry?: boolean;
  fallbackUsed?: boolean;
}

class SummarizationService {
  /**
   * Main entry point for podcast summarization
   */
  async summarizePodcast(
    podcast: Podcast,
    options: SummarizationOptions,
    onProgress?: (progress: SummarizationProgress) => void
  ): Promise<SummarizationResponse> {
    try {
      // Stage 1: Analyze content quality
      onProgress?.({
        stage: 'analyzing',
        message: 'Analyzing content quality...',
        progress: 10
      });

      const contentAnalysis = geminiService.assessContentQuality(
        podcast.description,
        podcast.duration || undefined
      );
      
      console.log(`Content quality assessment for "${podcast.title}": Score ${contentAnalysis.score}, Reason: ${contentAnalysis.reason}`);
      
      // Stage 2: Choose processing strategy (more conservative approach)
      if (!contentAnalysis.shouldUseAudio && contentAnalysis.score >= 75) {
        // Only use description for very high-quality content
        // First check for URLs in high-quality descriptions
        const urls = podcast.description.match(/(https?:\/\/[^\s]+)/g) || [];
        const contentUrls = urls.filter(url => 
          !url.includes('patreon') && !url.includes('subscribe') && 
          !url.includes('donate') && !url.includes('spotify.com/podcast') &&
          !url.includes('apple.com/podcast')
        );
        
        if (contentUrls.length > 0) {
          try {
            onProgress?.({
              stage: 'processing',
              message: 'Fetching additional content from article URL...',
              progress: 20
            });

            const urlContent = await this.fetchUrlContent(contentUrls[0]!);
            if (urlContent) {
              const result = await geminiService.summarizeText(
                urlContent,
                options,
                podcast.title
              );

              onProgress?.({
                stage: 'complete',
                message: 'Summary generated from article content',
                progress: 100
              });

              return {
                success: true,
                result: { ...result, source: 'url' as const }
              };
            }
          } catch (error) {
            console.warn('Failed to fetch URL content, falling back to description:', error);
          }
        }
        
        // Use high-quality description
        return await this.summarizeFromDescription(podcast, options, onProgress);
      } else {
        // Use audio-first strategy for everything else
        return await this.summarizeWithAudioFallback(podcast, options, onProgress);
      }
    } catch (error) {
      console.error('Summarization service error:', error);
      
      onProgress?.({
        stage: 'error',
        message: 'Summarization failed',
        progress: 0
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        canRetry: true
      };
    }
  }

  /**
   * Fetch content from a URL with better parsing
   */
  private async fetchUrlContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PodSumBot/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        return null; // Skip non-text content
      }
      
      const text = await response.text();
      
      // Enhanced content extraction
      let content = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')       // Remove navigation
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '') // Remove headers
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footers
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')   // Remove sidebars
        .replace(/<[^>]*>/g, ' ')                         // Remove remaining HTML tags
        .replace(/\s+/g, ' ')                             // Normalize whitespace
        .trim();
      
      // Filter out common boilerplate text
      const boilerplatePatterns = [
        /subscribe\s+to\s+our\s+newsletter/gi,
        /follow\s+us\s+on/gi,
        /all\s+rights\s+reserved/gi,
        /copyright\s+\d{4}/gi,
        /privacy\s+policy/gi,
        /terms\s+of\s+service/gi,
        /cookie\s+policy/gi,
        /advertisement/gi,
      ];
      
      boilerplatePatterns.forEach(pattern => {
        content = content.replace(pattern, ' ');
      });
      
      content = content.replace(/\s+/g, ' ').trim();
      
      // Only return if content is substantial and meaningful
      const wordCount = content.split(/\s+/).filter(word => word.length > 2).length;
      return (content.length > 500 && wordCount > 50) ? content : null;
    } catch (error) {
      console.error('URL content fetch error:', error);
      return null;
    }
  }

  /**
   * Summarize content from a URL
   */
  private async summarizeFromUrlContent(
    urlContent: string,
    podcast: Podcast,
    options: SummarizationOptions,
    onProgress?: (progress: SummarizationProgress) => void
  ): Promise<SummarizationResponse> {
    try {
      onProgress?.({
        stage: 'processing',
        message: 'Processing content from URL...',
        progress: 40
      });

      const result = await geminiService.summarizeText(
        urlContent,
        options,
        podcast.title
      );

      onProgress?.({
        stage: 'complete',
        message: 'Summary generated from URL content',
        progress: 100
      });

      return {
        success: true,
        result: { ...result, source: 'url' as const }
      };
    } catch (error) {
      console.error('URL content summarization failed:', error);
      throw error;
    }
  }

  /**
   * Summarize using episode description (fast path)
   */
  private async summarizeFromDescription(
    podcast: Podcast,
    options: SummarizationOptions,
    onProgress?: (progress: SummarizationProgress) => void
  ): Promise<SummarizationResponse> {
    try {
      onProgress?.({
        stage: 'processing',
        message: 'Processing episode description...',
        progress: 50,
        estimatedTimeMs: 5000
      });

      // Add intermediate progress updates during the API call
      const progressInterval = setInterval(() => {
        onProgress?.({
          stage: 'summarizing',
          message: 'Generating summary from description...',
          progress: 50 + Math.random() * 30, // Progress between 50-80%
        });
      }, 800);

      try {
        const result = await geminiService.summarizeText(
          podcast.description,
          options,
          podcast.title,
          podcast.category,
          podcast.host,
          podcast.duration
        );

        clearInterval(progressInterval);

        onProgress?.({
          stage: 'complete',
          message: 'Summary generated successfully!',
          progress: 100
        });

        return {
          success: true,
          result: { ...result, source: 'description' as const }
        };
      } catch (apiError) {
        clearInterval(progressInterval);
        throw apiError;
      }
    } catch (error) {
      console.error('Description summarization error:', error);
      
      return {
        success: false,
        error: 'Failed to process episode description',
        canRetry: true
      };
    }
  }

  /**
   * Summarize with audio fallback strategy
   */
  private async summarizeWithAudioFallback(
    podcast: Podcast,
    options: SummarizationOptions,
    onProgress?: (progress: SummarizationProgress) => void
  ): Promise<SummarizationResponse> {
    try {
      // Check if we should prioritize audio processing
      const qualityAssessment = geminiService.assessContentQuality(
        podcast.description,
        podcast.duration
      );
      
      // Extract URLs from description for potential fallback
      const urls = podcast.description.match(/(https?:\/\/[^\s]+)/g) || [];
      
      if (qualityAssessment.shouldUseAudio && podcast.audioUrl) {
        // Skip description processing - go directly to audio for better quality
        onProgress?.({
          stage: 'transcribing',
          message: 'Processing audio content for better quality...',
          progress: 30,
          estimatedTimeMs: 35000
        });

        try {
          const audioResult = await geminiService.transcribeAndSummarize(
            podcast.audioUrl,
            options
          );

          onProgress?.({
            stage: 'complete',
            message: 'Summary generated from audio transcription',
            progress: 100
          });

          return {
            success: true,
            result: audioResult
          };
        } catch (error) {
          console.error('Audio processing failed:', error);
          // Audio processing failed, try URL content if available
          if (urls.length > 0) {
            try {
              onProgress?.({
                stage: 'processing',
                message: 'Audio processing failed. Trying URL content...',
                progress: 40
              });

              const urlContent = await this.fetchUrlContent(urls[0]!);
              if (urlContent) {
                return await this.summarizeFromUrlContent(urlContent, podcast, options, onProgress);
              }
            } catch (urlError) {
              console.error('URL content processing failed:', urlError);
              // Continue to description fallback below
            }
          }
        }
      }

      // Try description summarization (either as primary or fallback)
      onProgress?.({
        stage: 'processing',
        message: 'Processing available description...',
        progress: 60
      });

      // Add progress simulation for description processing
      const descProgressInterval = setInterval(() => {
        onProgress?.({
          stage: 'processing',
          message: 'Processing available description...',
          progress: 60 + Math.random() * 15, // Progress between 60-75%
        });
      }, 600);

      try {
        const descriptionResult = await geminiService.summarizeText(
          podcast.description,
          options,
          podcast.title
        );

        clearInterval(descProgressInterval);

        // If description result is decent, use it
        if (descriptionResult.confidence !== 'low') {
          onProgress?.({
            stage: 'complete',
            message: 'Summary generated from description',
            progress: 100
          });

          return {
            success: true,
            result: { ...descriptionResult, source: 'fallback' as const }
          };
        }
      } catch (error) {
        clearInterval(descProgressInterval);
        console.error('Description processing failed:', error);
      }

      // If we get here, both audio and description failed
      throw new Error('Failed to generate summary from both audio and description');
    } catch (error) {
      console.error('Summarization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
        canRetry: true
      };
    }
  }

  /**
   * Estimate processing time based on content analysis
   */
  estimateProcessingTime(podcast: Podcast): {
    estimatedMs: number;
    strategy: 'description' | 'audio' | 'fallback';
  } {
    const contentAnalysis = geminiService.assessContentQuality(
      podcast.description, 
      podcast.duration
    );
    
    if (!contentAnalysis.shouldUseAudio && contentAnalysis.score >= 75) {
      // High-quality description processing
      const urls = podcast.description.match(/(https?:\/\/[^\s]+)/g) || [];
      const hasContentUrls = urls.some(url => 
        !url.includes('patreon') && !url.includes('subscribe') && 
        !url.includes('donate') && !url.includes('spotify.com/podcast')
      );
      
      return {
        estimatedMs: hasContentUrls ? 8000 : 5000, // 8s for URL + description, 5s for description only
        strategy: 'description'
      };
    } else if (podcast.description.length > 200) {
      return {
        estimatedMs: 40000, // 40 seconds for audio + potential fallbacks
        strategy: 'fallback'
      };
    } else {
      return {
        estimatedMs: 50000, // 50 seconds for full audio processing with minimal description
        strategy: 'audio'
      };
    }
  }
}

export const summarizationService = new SummarizationService();
