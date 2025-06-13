export interface ListenNotesEpisode {
  id: string;
  title_original: string;
  description_original: string;
  thumbnail: string;
  image: string;
  pub_date_ms: number;
  audio_length_sec: number;
  audio: string; // Direct audio URL
  podcast?: {
    id: string;
    title_original: string;
    publisher_original: string | null;
    image: string;
    thumbnail: string;
  };
  genre_ids: number[];
}

export interface ListenNotesSearchResponse {
  count: number;
  total: number;
  results: ListenNotesEpisode[];
  next_offset: number;
}

export interface PodcastSearchParams {
  q?: string;
  type?: 'episode' | 'podcast';
  offset?: number;
  len_min?: number;
  len_max?: number;
  genre_ids?: string;
  published_before?: number;
  published_after?: number;
  only_in?: string;
  language?: string;
  safe_mode?: number;
}

export interface BestPodcastsResponse {
  podcasts: Array<{
    id: string;
    title: string;
    publisher: string;
    image: string;
    thumbnail: string;
    total_episodes: number;
    explicit_content: boolean;
  }>;
  has_next: boolean;
  has_previous: boolean;
  page_number: number;
  total: number;
}

export interface GenresResponse {
  genres: Array<{
    id: number;
    name: string;
    parent_id?: number;
  }>;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

class ListenNotesService {
  private baseURL = process.env.LISTENNOTES_API_URL || 'https://listen-api.listennotes.com/api/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LISTENNOTES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ListenNotes API key not found. Please set LISTENNOTES_API_KEY in your environment.');
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<APIResponse<T>> {
    try {
      if (!this.apiKey) {
        throw new Error('ListenNotes API key is not configured');
      }

      const url = new URL(`${this.baseURL}${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'X-ListenAPI-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your ListenNotes API key.');
        } else if (response.status === 404) {
          throw new Error('Resource not found.');
        } else {
          throw new Error(`API request failed with status: ${response.status}`);
        }
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('ListenNotes API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  async searchEpisodes(params: PodcastSearchParams): Promise<APIResponse<ListenNotesSearchResponse>> {
    return this.makeRequest<ListenNotesSearchResponse>('/search', {
      type: 'episode',
      ...params,
    });
  }

  async getEpisodeById(id: string): Promise<APIResponse<ListenNotesEpisode>> {
    return this.makeRequest<ListenNotesEpisode>(`/episodes/${id}`);
  }

  async getBestPodcasts(params?: { genre_id?: number; page?: number; region?: string }): Promise<APIResponse<BestPodcastsResponse>> {
    return this.makeRequest<BestPodcastsResponse>('/best_podcasts', params);
  }

  async getGenres(): Promise<APIResponse<GenresResponse>> {
    return this.makeRequest<GenresResponse>('/genres');
  }
}

export const listenNotesService = new ListenNotesService();
