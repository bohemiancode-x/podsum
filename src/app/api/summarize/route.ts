import { NextRequest, NextResponse } from 'next/server';
import { summarizationService } from '@/services/summarizationService';
import { SummaryFormat, SummaryLength } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { podcast, format, length } = body;

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast data is required' }, { status: 400 });
    }

    if (!format || !length) {
      return NextResponse.json({ error: 'Format and length are required' }, { status: 400 });
    }

    // Store progress updates for this request
    const progressUpdates: Array<{
      stage: string;
      message: string;
      progress: number;
      timestamp: string;
    }> = [];
    
    const result = await summarizationService.summarizePodcast(
      podcast,
      { format: format as SummaryFormat, length: length as SummaryLength },
      (progress) => {
        // In a real implementation, you might use Server-Sent Events or WebSockets
        // For now, we'll just log the progress
        progressUpdates.push({
          stage: progress.stage,
          message: progress.message,
          progress: progress.progress,
          timestamp: new Date().toISOString()
        });
      }
    );

    return NextResponse.json({
      success: result.success,
      result: result.result,
      error: result.error,
      canRetry: result.canRetry,
      fallbackUsed: result.fallbackUsed,
      progressLog: progressUpdates
    });

  } catch (error) {
    console.error('Summarization API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        canRetry: true 
      }, 
      { status: 500 }
    );
  }
}
