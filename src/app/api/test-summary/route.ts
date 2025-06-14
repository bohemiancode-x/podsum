import { NextRequest, NextResponse } from 'next/server';
import { geminiService, SummaryFormat, SummaryLength } from '@/services/geminiService';
import { summarizationService } from '@/services/summarizationService';

const testPodcast = {
  id: 'test-123',
  title: 'The Future of AI in Business',
  description: `In this episode, we dive deep into how artificial intelligence is transforming the business landscape. Our guest, Dr. Sarah Chen, a leading AI researcher from Stanford, discusses the practical applications of machine learning in various industries. We explore topics including predictive analytics, automation of routine tasks, ethical considerations in AI deployment, and the skills workers need to develop to thrive in an AI-driven economy. The conversation covers real-world case studies from companies like Tesla, Google, and smaller startups that are leveraging AI to gain competitive advantages. We also address common misconceptions about AI replacing human workers and instead focus on how AI can augment human capabilities. This is a comprehensive discussion that will help business leaders understand both the opportunities and challenges that come with AI adoption.`,
  imageUrl: 'https://example.com/podcast.jpg',
  host: 'Tech Talk Podcast',
  date: '2024-01-15',
  duration: '45 min',
  category: 'Technology'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test') || 'quality';
  const format = searchParams.get('format') as SummaryFormat || 'paragraph';
  const length = searchParams.get('length') as SummaryLength || 'medium';

  try {
    if (test === 'quality') {
      // Test content quality assessment
      const qualityAssessment = geminiService.assessContentQuality(testPodcast.description);
      
      return NextResponse.json({
        success: true,
        test: 'Content Quality Assessment',
        result: qualityAssessment,
        podcastTitle: testPodcast.title,
        descriptionLength: testPodcast.description.length
      });
    }
    
    if (test === 'summary') {
      // Test text summarization with specified format and length
      const result = await geminiService.summarizeText(
        testPodcast.description,
        { format, length },
        testPodcast.title,
        testPodcast.category,
        testPodcast.host,
        testPodcast.duration
      );
      
      return NextResponse.json({
        success: true,
        test: 'Text Summarization',
        result: {
          summary: result.summary,
          source: result.source,
          processingTimeMs: result.processingTimeMs,
          confidence: result.confidence,
          summaryLength: result.summary.length,
          format,
          length
        },
        podcastTitle: testPodcast.title,
        podcastCategory: testPodcast.category,
        podcastHost: testPodcast.host,
        podcastDuration: testPodcast.duration
      });
    }

    if (test === 'full') {
      // Test full summarization service with progress tracking
      const progressLog: Array<{
        stage: string;
        message: string;
        progress: number;
        timestamp: string;
      }> = [];
      
      const result = await summarizationService.summarizePodcast(
        testPodcast,
        { format, length },
        (progress) => {
          progressLog.push({
            stage: progress.stage,
            message: progress.message,
            progress: progress.progress,
            timestamp: new Date().toISOString()
          });
        }
      );
      
      return NextResponse.json({
        success: true,
        test: 'Full Summarization Service',
        result,
        progressLog,
        podcastTitle: testPodcast.title,
        format,
        length
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test parameter. Use: quality, summary, or full'
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
