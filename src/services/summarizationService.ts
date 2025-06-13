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

      const contentAnalysis = geminiService.assessContentQuality(podcast.description);
      
      // Stage 2: Choose processing strategy
      if (!contentAnalysis.shouldUseAudio) {
        // High-quality description - direct summarization
        return await this.summarizeFromDescription(podcast, options, onProgress);
      } else {
        // Low-quality description - try audio transcription with fallback
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
          podcast.title
        );

        clearInterval(progressInterval);

        onProgress?.({
          stage: 'complete',
          message: 'Summary generated successfully!',
          progress: 100
        });

        return {
          success: true,
          result
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
      const qualityAssessment = geminiService.assessContentQuality(podcast.description);
      
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
        } catch {
          // Audio processing failed, falling back to description...
          // Continue to description fallback below
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
      } catch {
        clearInterval(descProgressInterval);
        // Description processing failed, trying audio...
      }

      // Description failed or low confidence - try audio transcription
      onProgress?.({
        stage: 'transcribing',
        message: 'Transcribing audio content...',
        progress: 40,
        estimatedTimeMs: 35000
      });

      try {
        // Attempt audio transcription
        const audioUrl = podcast.audioUrl;
        if (!audioUrl) {
          throw new Error('No audio URL available for transcription');
        }

        const audioResult = await geminiService.transcribeAndSummarize(
          audioUrl,
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
      } catch (audioError) {
        console.error('Audio transcription failed:', audioError);

        // Both methods failed - return description fallback with warning
        onProgress?.({
          stage: 'processing',
          message: 'Using available description as fallback...',
          progress: 80
        });

        // Add progress simulation for final fallback
        const fallbackProgressInterval = setInterval(() => {
          onProgress?.({
            stage: 'processing',
            message: 'Using available description as fallback...',
            progress: 80 + Math.random() * 15, // Progress between 80-95%
          });
        }, 500);

        try {
          const fallbackResult = await geminiService.summarizeText(
            podcast.description.length > 50 
              ? podcast.description 
              : `Episode: ${podcast.title} by ${podcast.host}. Duration: ${podcast.duration}. Limited description available.`,
            options,
            podcast.title
          );

          clearInterval(fallbackProgressInterval);

          onProgress?.({
            stage: 'complete',
            message: 'Summary generated using available information',
            progress: 100
          });

          return {
            success: true,
            result: { ...fallbackResult, source: 'fallback' as const },
            fallbackUsed: true
          };
        } catch (fallbackError) {
          clearInterval(fallbackProgressInterval);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Audio fallback strategy failed:', error);
      
      return {
        success: false,
        error: 'All summarization methods failed',
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
    const contentAnalysis = geminiService.assessContentQuality(podcast.description);
    
    if (!contentAnalysis.shouldUseAudio) {
      return {
        estimatedMs: 5000, // 5 seconds for description processing
        strategy: 'description'
      };
    } else if (podcast.description.length > 100) {
      return {
        estimatedMs: 35000, // 35 seconds for audio + fallback
        strategy: 'fallback'
      };
    } else {
      return {
        estimatedMs: 45000, // 45 seconds for full audio processing
        strategy: 'audio'
      };
    }
  }
}

export const summarizationService = new SummarizationService();
