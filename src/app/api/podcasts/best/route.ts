import { NextRequest, NextResponse } from 'next/server';
import { listenNotesService } from '@/services/listenNotes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      genre_id: searchParams.get('genre_id') ? parseInt(searchParams.get('genre_id')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      region: searchParams.get('region') || 'us',
    };

    const response = await listenNotesService.getBestPodcasts(params);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
