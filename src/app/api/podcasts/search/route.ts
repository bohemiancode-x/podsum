import { NextRequest, NextResponse } from 'next/server';
import { listenNotesService } from '@/services/listenNotes';
import { transformEpisodeToPodcast } from '@/services/podcastAPI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      q: searchParams.get('q') || 'technology',
      offset: parseInt(searchParams.get('offset') || '0'),
      len_min: parseInt(searchParams.get('len_min') || '10'),
      len_max: parseInt(searchParams.get('len_max') || '60'),
      genre_ids: searchParams.get('genre_ids') || '',
      published_after: searchParams.get('published_after') ? parseInt(searchParams.get('published_after')!) : undefined,
      published_before: searchParams.get('published_before') ? parseInt(searchParams.get('published_before')!) : undefined,
      language: searchParams.get('language') || 'English',
      safe_mode: 1,
    };

    const response = await listenNotesService.searchEpisodes(params);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    // Transform ListenNotes episodes to Podcast objects
    const transformedData = {
      ...response.data,
      results: response.data?.results.map(transformEpisodeToPodcast) || []
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
