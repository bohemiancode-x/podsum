import { Podcast } from '@/types';
import { ListenNotesEpisode } from './listenNotes';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Transform ListenNotes episode to our Podcast interface
export function transformEpisodeToPodcast(episode: ListenNotesEpisode): Podcast {
  // Clean HTML from description
  const cleanDescription = (desc: string) => {
    return desc?.replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim() || '';
  };

  const description = cleanDescription(
    episode.description_original || 'No description available'
  );

  return {
    id: episode.id,
    title: episode.title_original || 'Untitled Episode',
    description,
    imageUrl: episode.image || episode.thumbnail || episode.podcast?.image || episode.podcast?.thumbnail || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
    audioUrl: episode.audio, // Include audio URL for transcription
    host: episode.podcast?.publisher_original || 'Unknown Host',
    date: new Date(episode.pub_date_ms).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    duration: formatDuration(episode.audio_length_sec || 0),
    category: 'Technology', // Default category, could be mapped from genre_ids
  };
}

// Transform BestPodcast to our Podcast interface
export function transformBestPodcastToPodcast(bestPodcast: BestPodcast): Podcast {
  return {
    id: bestPodcast.id,
    title: bestPodcast.title || 'Untitled Podcast',
    description: bestPodcast.description?.replace(/<[^>]*>/g, '') || 'No description available',
    imageUrl: bestPodcast.image || bestPodcast.thumbnail || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
    host: bestPodcast.publisher || 'Unknown Host',
    date: 'Recent', // Best podcasts don't have specific episode dates
    duration: `${bestPodcast.total_episodes} episodes`,
    category: 'Technology', // Default category, could be mapped from genre_ids
  };
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export interface BestPodcast {
  id: string;
  title: string;
  publisher: string;
  image: string;
  thumbnail: string;
  description: string;
  genre_ids: number[];
  total_episodes: number;
  explicit_content: boolean;
  country: string;
  language: string;
}

export interface BestPodcastsResponse {
  podcasts: BestPodcast[];
  total: number;
  has_next: boolean;
  has_previous: boolean;
  page_number: number;
}

class PodcastAPI {
  private baseURL = '/api/podcasts';

  async searchPodcasts(query: string = 'technology', options?: {
    offset?: number;
    genre?: string;
    language?: string;
    len_min?: number;
    len_max?: number;
    published_after?: number;
  }): Promise<FetchState<Podcast[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.genre) params.append('genre', options.genre);
      if (options?.language) params.append('language', options.language);
      if (options?.len_min) params.append('len_min', options.len_min.toString());
      if (options?.len_max) params.append('len_max', options.len_max.toString());
      if (options?.published_after) params.append('published_after', options.published_after.toString());

      const response = await fetch(`${this.baseURL}/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to search podcasts';
        
        if (errorData.error?.includes('API key')) {
          errorMessage = 'API configuration error. Please check your ListenNotes API key.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      // The API endpoint already returns transformed data
      const data = await response.json();
      
      // The results array already contains transformed Podcast objects
      const podcasts = data.results || [];

      return {
        data: podcasts,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.error('Search podcasts error:', error);
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while searching podcasts',
      };
    }
  }

  async getPodcastById(id: string): Promise<FetchState<Podcast>> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch podcast');
      }

      const episode: ListenNotesEpisode = await response.json();
      const podcast = transformEpisodeToPodcast(episode);

      return {
        data: podcast,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  async getBestPodcasts(options?: {
    genre_id?: number;
    page?: number;
    region?: string;
  }): Promise<FetchState<BestPodcastsResponse>> {
    try {
      const params = new URLSearchParams();
      if (options?.genre_id) params.append('genre_id', options.genre_id.toString());
      if (options?.page) params.append('page', options.page.toString());
      if (options?.region) params.append('region', options.region);

      const response = await fetch(`${this.baseURL}/best?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch best podcasts');
      }

      const data = await response.json();

      return {
        data,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  async getBestPodcastsAsPodcasts(options?: {
    genre_id?: number;
    page?: number;
    region?: string;
  }): Promise<FetchState<Podcast[]>> {
    try {
      const params = new URLSearchParams();
      if (options?.genre_id) params.append('genre_id', options.genre_id.toString());
      if (options?.page) params.append('page', options.page.toString());
      if (options?.region) params.append('region', options.region);

      const response = await fetch(`${this.baseURL}/best?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch best podcasts');
      }

      const data: BestPodcastsResponse = await response.json();
      const podcasts = data.podcasts.map(transformBestPodcastToPodcast);

      return {
        data: podcasts,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  // Specialized method to fetch episodes optimized for AI summarization
  async searchEpisodesForSummarization(query: string = 'technology'): Promise<FetchState<Podcast[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('offset', '0');
      
      const response = await fetch(`${this.baseURL}/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search episodes');
      }

      const data = await response.json();
      
      // Take the first 8 results since the search endpoint now returns transformed data
      const podcasts = (data.results || []).slice(0, 8);

      return {
        data: podcasts,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.error('Search episodes for summarization error:', error);
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch episodes for summarization',
      };
    }
  }
}

// Helper function to score episodes based on description quality
export function scoreEpisodeQuality(episode: ListenNotesEpisode): number {
  const descLength = (episode.description_original || '').length;
  const titleLength = (episode.title_original || '').length;
  const hasPublisher = Boolean(episode.podcast?.publisher_original);
  const audioLength = episode.audio_length_sec || 0;
  
  let score = 0;
  
  // Description length scoring (most important for summarization)
  if (descLength >= 2000) score += 50;      // Very rich content
  else if (descLength >= 1000) score += 35; // Rich content  
  else if (descLength >= 500) score += 20;  // Good content
  else if (descLength >= 300) score += 10;  // Minimal content
  
  // Title quality scoring
  if (titleLength >= 30) score += 10;       // Descriptive title
  else if (titleLength >= 15) score += 5;   // Decent title
  
  // Publisher info adds credibility
  if (hasPublisher) score += 10;
  
  // Audio length (prefer substantial content, but not too long)
  if (audioLength >= 1800 && audioLength <= 3600) score += 15; // 30-60 minutes
  else if (audioLength >= 900 && audioLength <= 1800) score += 10; // 15-30 minutes
  else if (audioLength >= 600) score += 5; // 10+ minutes
  
  return score;
}

export const podcastAPI = new PodcastAPI();
