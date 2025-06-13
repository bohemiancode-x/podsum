import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type SummaryFormat = 'bullet-points' | 'paragraph' | 'key-takeaways' | 'executive-summary';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface SummarizationOptions {
  format: SummaryFormat;
  length: SummaryLength;
}

export interface SummarizationResult {
  summary: string;
  source: 'description' | 'audio' | 'fallback';
  processingTimeMs: number;
  confidence: 'high' | 'medium' | 'low';
}

const lengthPresets = {
  short: 200,   // Quick overview
  medium: 400,  // Balanced summary  
  long: 600     // Detailed analysis
};

const formatPrompts = {
  'bullet-points': 'as clear, concise bullet points',
  'paragraph': 'as a well-structured paragraph',
  'key-takeaways': 'focusing on the main key takeaways and actionable insights',
  'executive-summary': 'as an executive summary suitable for business professionals'
};

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.API_KEY_GEMINI;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * Summarize text content from episode description
   */
  async summarizeText(
    content: string, 
    options: SummarizationOptions,
    podcastTitle: string = 'Unknown Episode'
  ): Promise<SummarizationResult> {
    try {
      const targetLength = lengthPresets[options.length];
      const formatInstruction = formatPrompts[options.format];
      
      const prompt = `
You are an expert podcast content summarizer. Please analyze this podcast episode content and create a summary ${formatInstruction}.

Podcast Title: "${podcastTitle}"

Episode Content:
${content}

Requirements:
- Target length: approximately ${targetLength} characters
- Format: ${formatInstruction}
- Focus on the main topics, insights, and key information
- Make it engaging and informative for listeners
- If the content seems incomplete or promotional, work with what's available

Please provide only the summary without any meta-commentary.`;

      const result = await this.model.generateContent(prompt);
      const summary = result.response.text().trim();
      
      // Assess confidence based on content length and quality
      const confidence = this.assessTextConfidence(content, summary);
      
      return {
        summary,
        source: 'description',
        processingTimeMs: Date.now() - Date.now(), // Simplified timing
        confidence
      };
    } catch (error) {
      console.error('Gemini text summarization error:', error);
      throw new Error('Failed to generate summary from text content');
    }
  }

  /**
   * Transcribe and summarize audio content using Gemini's audio capabilities
   */
  async transcribeAndSummarize(
    audioUrl: string,
    options: SummarizationOptions
  ): Promise<SummarizationResult> {
    try {

      
      // Fetch audio data
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
      }
      
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioData = new Uint8Array(audioArrayBuffer);
      
      const targetLength = lengthPresets[options.length];
      const formatInstruction = formatPrompts[options.format];
      
      const prompt = `
You are an expert podcast content analyzer. Please transcribe and summarize this audio content ${formatInstruction}.

Requirements:
- Target length: approximately ${targetLength} characters
- Format: ${formatInstruction}
- Focus on the main topics, insights, and key information discussed
- Make it engaging and informative for listeners
- Extract the most valuable content and insights from the conversation

Please provide only the summary without any transcription or meta-commentary.`;

      // Use Gemini's multimodal capabilities to process audio
      const result = await this.model.generateContent([
        {
          inlineData: {
            data: Buffer.from(audioData).toString('base64'),
            mimeType: 'audio/mpeg' // Most podcast audio is MP3
          }
        },
        prompt
      ]);
      
      const summary = result.response.text().trim();
      
      return {
        summary,
        source: 'audio',
        processingTimeMs: Date.now() - Date.now(), // Simplified timing
        confidence: 'high' // Audio transcription typically provides high-quality content
      };
      
    } catch (error) {
      console.error('Gemini audio transcription error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch audio')) {
          throw new Error('Could not access audio file. The audio URL may be invalid or require authentication.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('SAFETY')) {
          throw new Error('Audio content flagged by safety filters.');
        }
      }
      
      throw new Error('Failed to transcribe and summarize audio content');
    }
  }

  /**
   * Assess content quality for determining processing strategy
   */
  assessContentQuality(description: string): {
    score: number;
    shouldUseAudio: boolean;
    reason: string;
  } {
    const length = description.length;
    const wordCount = description.split(/\s+/).length;
    
    // Check for generic/promotional content indicators
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
      description.toLowerCase().includes(indicator)
    );
    
    // Calculate quality score
    let score = 0;
    let reason = '';
    
    if (length >= 500) {
      score = 90;
      reason = 'Rich description content available';
    } else if (length >= 300 && !hasGenericContent && wordCount >= 40) {
      score = 75;
      reason = 'Good description quality';
    } else if (length >= 200 && !hasGenericContent) {
      score = 60;
      reason = 'Moderate description quality';
    } else if (length >= 200 && hasGenericContent) {
      score = 40;
      reason = 'Description contains promotional content';
    } else {
      score = 20;
      reason = 'Description too short or generic';
    }
    
    return {
      score,
      shouldUseAudio: score < 60, // Use audio for low-quality descriptions
      reason
    };
  }

  /**
   * Assess confidence level of generated summary
   */
  private assessTextConfidence(originalContent: string, summary: string): 'high' | 'medium' | 'low' {
    const contentLength = originalContent.length;
    const summaryLength = summary.length;
    
    if (contentLength >= 500 && summaryLength >= 100) {
      return 'high';
    } else if (contentLength >= 200 && summaryLength >= 50) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

export const geminiService = new GeminiService();