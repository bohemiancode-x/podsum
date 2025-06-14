import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type SummaryFormat = 'bullet-points' | 'paragraph' | 'key-takeaways' | 'executive-summary';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface SummarizationOptions {
  format: SummaryFormat;
  length: SummaryLength;
}

export interface SummarizationResult {
  summary: string;
  source: 'description' | 'audio' | 'fallback' | 'url';
  processingTimeMs: number;
  confidence: 'high' | 'medium' | 'low';
}

const lengthPresets = {
  short: 300,   // Quick overview with key points
  medium: 600,  // Comprehensive summary with examples
  long: 1000    // Detailed analysis with insights
};

const systemPrompts = {
  'bullet-points': `You are an expert podcast content analyst specializing in creating structured, hierarchical bullet-point summaries. Your task is to:
1. Identify main themes and categorize information
2. Extract key points and supporting details
3. Maintain logical flow and hierarchy
4. Include specific examples and quotes when relevant
5. Focus on actionable insights and practical applications

Follow this chain of thought:
1. First, identify the main themes and topics
2. Then, extract key points for each theme
3. Add supporting details and examples
4. Finally, organize into a clear hierarchy

Example format:
• Main Theme 1
  - Key Point 1
    * Supporting detail or example
  - Key Point 2
    * Supporting detail or example
• Main Theme 2
  ...`,

  'paragraph': `You are an expert podcast content writer specializing in creating engaging, well-structured narrative summaries. Your task is to:
1. Create a compelling opening that captures the essence
2. Develop a logical flow of ideas
3. Include specific examples and quotes
4. Maintain a professional yet engaging tone
5. End with key takeaways or implications

Follow this chain of thought:
1. First, identify the core message and main themes
2. Then, structure the narrative flow
3. Add supporting details and examples
4. Finally, craft a cohesive paragraph

Example format:
[Engaging opening that captures the essence] [Main themes and topics] [Supporting details and examples] [Key takeaways and implications]`,

  'key-takeaways': `You are an expert podcast content analyst specializing in extracting actionable insights and key learnings. Your task is to:
1. Identify core insights and lessons
2. Extract practical applications
3. Highlight unique perspectives
4. Include specific examples
5. Focus on actionable takeaways

Follow this chain of thought:
1. First, identify the main insights
2. Then, analyze their practical applications
3. Add supporting examples and context
4. Finally, organize by impact and relevance

Example format:
Key Insight 1: [Main learning]
• Practical Application: [How to apply]
• Example: [Specific instance]
• Impact: [Potential results]

Key Insight 2: [Main learning]
...`,

  'executive-summary': `You are an expert business analyst specializing in creating executive-level podcast summaries. Your task is to:
1. Focus on business impact and ROI
2. Highlight strategic implications
3. Include market context
4. Extract actionable recommendations
5. Consider implementation challenges

Follow this chain of thought:
1. First, identify business implications
2. Then, analyze strategic value
3. Add market context and examples
4. Finally, provide actionable recommendations

Example format:
Business Context: [Market situation]
Strategic Implications: [Key impacts]
Implementation Considerations: [Practical aspects]
Recommendations: [Action items]
ROI Potential: [Expected outcomes]`
};

const formatPrompts = {
  'bullet-points': 'as a hierarchical bullet-point summary with main themes, key points, and supporting details',
  'paragraph': 'as a well-structured narrative paragraph with clear flow and supporting examples',
  'key-takeaways': 'as actionable insights with practical applications and specific examples',
  'executive-summary': 'as a business-focused summary with strategic implications and ROI considerations'
};

class GeminiService {
  private genAI: GoogleGenerativeAI | undefined;
  private model: GenerativeModel | undefined;

  constructor() {
    const apiKey = process.env.API_KEY_GEMINI;
    
    // Only throw error in production or when API is actually being used
    if (!apiKey) {
      console.warn('Gemini API key not found in environment variables');
      return; // Exit gracefully without initializing
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
    }
  }

  /**
   * Summarize text content from episode description
   */
  async summarizeText(
    content: string, 
    options: SummarizationOptions,
    podcastTitle: string = 'Unknown Episode',
    podcastCategory: string = 'General',
    podcastHost: string = 'Unknown Host',
    podcastDuration: string = 'Unknown Duration'
  ): Promise<SummarizationResult> {
    try {
      if (!this.model) {
        throw new Error('Gemini service not properly initialized - API key may be missing');
      }
      
      const targetLength = lengthPresets[options.length];
      const formatInstruction = formatPrompts[options.format];
      const systemPrompt = systemPrompts[options.format];
      
      const prompt = `
${systemPrompt}

Podcast Details:
- Title: "${podcastTitle}"
- Category: ${podcastCategory}
- Host: ${podcastHost}
- Duration: ${podcastDuration}

Episode Content:
${content}

Requirements:
- Target length: approximately ${targetLength} characters
- Format: ${formatInstruction}
- Focus on the main topics, insights, and key information
- Make it engaging and informative for listeners
- Include specific examples and quotes when relevant
- If the content seems incomplete or promotional, work with what's available
- Consider the podcast category (${podcastCategory}) for context-appropriate analysis

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
      if (!this.model) {
        throw new Error('Gemini service not properly initialized - API key may be missing');
      }

      
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
  assessContentQuality(description: string, audioDuration?: string | undefined): {
    score: number;
    shouldUseAudio: boolean;
    reason: string;
  } {
    const length = description.length;
    const wordCount = description.split(/\s+/).filter(word => word.length > 0).length;
    
    // Enhanced low-quality content indicators
    const lowQualityIndicators = [
      'in this episode i go through',
      'in this video, i talk about',
      'in this video, i explore',
      'in this podcast, i discuss',
      'read the full article here:',
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
      'don\'t forget to subscribe',
      'like and subscribe',
      'hit the bell',
      'episode #',
      'ep. ',
      'episode ',
      '@',
      'twitter.com',
      'instagram.com',
      'facebook.com',
      'linkedin.com',
      'youtube.com',
      'spotify.com/podcast',
      'apple.com/podcast',
      'powered by',
      'brought to you by',
      'this episode is sponsored',
      'our sponsor',
      'ad-free',
      'premium subscribers',
      '© copyright',
      'all rights reserved',
      'transcript available',
      'full transcript',
    ];
    
    // Enhanced high-quality content indicators (actual podcast conversation patterns)
    const highQualityIndicators = [
      'we discuss',
      'we talk about',
      'we explore',
      'i spoke with',
      'conversation with',
      'interview with',
      'guest explains',
      'guest shares',
      'we dive into',
      'breaking down',
      'walking through',
      'shared insights',
      'personal experience',
      'behind the scenes',
      'lessons learned',
      'what i learned',
      'key takeaway',
      'main point',
      'interesting perspective',
      'fascinating story',
      'real-world example',
      'case study',
      'practical advice',
      'actionable tips',
      'step by step',
      'how to approach',
      'challenge faced',
      'solution discussed',
      'debate about',
      'different viewpoints',
      'expert opinion',
      'industry insights',
      'personal story',
      'anecdote about',
      'experience with',
    ];

    // Check for timestamp patterns (e.g., "0:00 Intro", "10:20 The Tests")
    const timestampPattern = /\d+:\d+\s+[A-Za-z\s]+/g;
    const timestampMatches = description.match(timestampPattern) || [];
    const hasTimestamps = timestampMatches.length > 0;
    
    // Extract URLs from the description
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = description.match(urlRegex) || [];
    const hasUrls = urls.length > 0;
    
    // Check for low and high quality indicators
    const lowQualityMatches = lowQualityIndicators.filter(indicator => 
      description.toLowerCase().includes(indicator)
    );
    const highQualityMatches = highQualityIndicators.filter(indicator => 
      description.toLowerCase().includes(indicator)
    );
    
    const hasLowQualityContent = lowQualityMatches.length > 0;
    const hasHighQualityContent = highQualityMatches.length > 0;
    
    // Calculate quality score with more conservative thresholds
    let score = 0;
    let reason = '';
    const reasons: string[] = [];
    
    // Base score on length and word count (more conservative)
    if (length >= 800 && wordCount >= 100) {
      score = 85;
      reasons.push('Very rich description content');
    } else if (length >= 500 && wordCount >= 60) {
      score = 70;
      reasons.push('Rich description content');
    } else if (length >= 300 && wordCount >= 40) {
      score = 55;
      reasons.push('Moderate description quality');
    } else if (length >= 200 && wordCount >= 25) {
      score = 40;
      reasons.push('Limited description content');
    } else {
      score = 15;
      reasons.push('Description too short or sparse');
    }
    
    // Adjust score based on content quality indicators (more aggressive penalties)
    if (hasLowQualityContent) {
      const penalty = Math.min(50, lowQualityMatches.length * 15);
      score -= penalty;
      reasons.push(`Description contains ${lowQualityMatches.length} low-quality indicators`);
    }
    
    if (hasHighQualityContent) {
      const bonus = Math.min(25, highQualityMatches.length * 8);
      score += bonus;
      reasons.push(`Description contains ${highQualityMatches.length} high-quality indicators`);
    }
    
    // Heavy penalty for timestamps (likely table of contents)
    if (hasTimestamps) {
      const timestampPenalty = Math.min(60, timestampMatches.length * 20);
      score -= timestampPenalty;
      reasons.push(`Description contains ${timestampMatches.length} timestamps, likely table of contents`);
    }
    
    if (hasUrls) {
      // Small bonus for URLs but check if they're promotional
      const promotionalUrls = urls.filter(url => 
        url.includes('patreon') || url.includes('subscribe') || 
        url.includes('donate') || url.includes('sponsor')
      );
      if (promotionalUrls.length > 0) {
        score -= 15;
        reasons.push('Description contains promotional URLs');
      } else {
        score += 8;
        reasons.push('Description contains content URLs');
      }
    }
    
    // Compare audio length with text length if audio duration is provided
    if (audioDuration) {
      // Parse duration more robustly
      const durationParts = audioDuration.split(':').map(Number);
      let audioSeconds = 0;
      
      if (durationParts.length === 3) {
        // HH:MM:SS format
        audioSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
      } else if (durationParts.length === 2) {
        // MM:SS format
        audioSeconds = durationParts[0] * 60 + durationParts[1];
      } else if (durationParts.length === 1) {
        // Just seconds
        audioSeconds = durationParts[0];
      }
      
      if (audioSeconds > 0) {
        // More realistic expectation: 1.5-3 chars per second for good descriptions
        // Podcasts typically have 150-180 words per minute, ~750-900 chars per minute
        const expectedMinTextLength = audioSeconds * 1.2; // Conservative estimate
        const expectedMaxTextLength = audioSeconds * 4.0; // Liberal estimate
        const textLengthRatio = length / expectedMinTextLength;
        
        if (textLengthRatio < 0.5) {
          // Text is significantly shorter than expected
          score -= 60;
          reasons.push(`Text length (${length} chars) much shorter than expected for ${audioDuration} audio`);
        } else if (textLengthRatio < 0.8) {
          // Text is somewhat shorter than expected
          score -= 30;
          reasons.push(`Text length somewhat short for ${audioDuration} audio`);
        } else if (length > expectedMaxTextLength) {
          // Text might be too verbose (could be full transcript)
          score += 10;
          reasons.push(`Very detailed description for ${audioDuration} audio`);
        }
      }
    }
    
    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));
    
    // Determine the primary reason (prioritize the most important factors)
    if (hasTimestamps && timestampMatches.length > 2) {
      reason = reasons.find(r => r.includes('timestamps')) || reasons[0] || 'Quality assessment complete';
    } else if (hasLowQualityContent) {
      reason = reasons.find(r => r.includes('low-quality indicators')) || reasons[0] || 'Quality assessment complete';
    } else if (hasHighQualityContent && score >= 70) {
      reason = reasons.find(r => r.includes('high-quality indicators')) || reasons[0] || 'Quality assessment complete';
    } else if (hasUrls) {
      reason = reasons.find(r => r.includes('promotional URLs') || r.includes('content URLs')) || reasons[0] || 'Quality assessment complete';
    } else {
      reason = reasons[0] || 'Quality assessment complete';
    }
    
    return {
      score,
      shouldUseAudio: score < 70, // More conservative threshold - use audio for more cases
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