// Mock the environment variable before importing
process.env.API_KEY_GEMINI = 'test-api-key';

import { geminiService } from '../geminiService';

describe('SummarizationService', () => {
  describe('Content Quality Assessment', () => {
    it('should detect low-quality promotional descriptions', () => {
      const description = `
        In this episode I go through a blog written by @PlanetScale.
        Subscribe to our podcast at spotify.com/podcast/backend-show.
        Follow us on twitter.com/backendshow for updates!
        Don't forget to like and subscribe!
        Here we discuss the various technical aspects of database protocols and their implementation details.
        The episode covers multiple approaches to solving backend communication challenges in modern applications.
      `;
      
      const result = geminiService.assessContentQuality(description, '30:00');
      
      expect(result.shouldUseAudio).toBe(true);
      expect(result.score).toBeLessThan(50);
      // The reason could be either low-quality indicators or timestamps - both are valid reasons to use audio
      expect(result.reason).toMatch(/low-quality indicators|timestamps/);
    });

    it('should detect timestamp-heavy descriptions', () => {
      const description = `
        The communication between backend applications and database systems.
        0:00 Intro
        7:45 MySQL Binary vs HTTP
        10:20 The Tests
        15:00 Connection Cost + Select 1
        22:00 Parallel Select
        26:00 The cost of H2 and H3
      `;
      
      const result = geminiService.assessContentQuality(description, '30:00');
      
      expect(result.shouldUseAudio).toBe(true);
      expect(result.reason).toContain('timestamps');
    });

    it('should approve high-quality conversational descriptions', () => {
      const description = `
        In this episode, we discuss the evolution of database communication protocols with our guest, 
        a senior engineer from PlanetScale. We talk about the practical differences between HTTP/3, 
        HTTP/2, and the traditional MySQL Binary protocol. Our guest shares personal experiences 
        from implementing these protocols in production environments and explains the real-world 
        performance implications. We dive into connection overhead, practical implementation 
        considerations, and lessons learned from extensive testing scenarios. The conversation 
        covers actionable tips for choosing the right protocol based on your workload characteristics. 
        Our guest walks through case studies demonstrating performance differences and shares 
        behind the scenes insights from their team's optimization work. We explore different 
        viewpoints on protocol selection and debate the trade-offs between connection management 
        strategies. This practical advice comes from years of experience with high-throughput 
        systems and real-world deployment challenges.
      `;
      
      const result = geminiService.assessContentQuality(description, '30:00');
      
      expect(result.shouldUseAudio).toBe(false);
      expect(result.score).toBeGreaterThan(70);
      expect(result.reason).toContain('high-quality indicators');
    });

    it('should detect short descriptions that need audio', () => {
      const description = 'Quick chat about databases.';
      
      const result = geminiService.assessContentQuality(description, '45:00');
      
      expect(result.shouldUseAudio).toBe(true);
      expect(result.score).toBeLessThan(30);
      expect(result.reason).toContain('short');
    });

    it('should handle audio-text length mismatch', () => {
      const description = 'Very short description for a long episode.';
      
      const result = geminiService.assessContentQuality(description, '1:30:00');
      
      expect(result.shouldUseAudio).toBe(true);
      // For very short descriptions, the primary reason will be that it's too short/sparse
      expect(result.reason).toMatch(/short|sparse/);
    });

    it('should identify promotional URLs vs content URLs', () => {
      const promotionalDescription = `
        Great episode about tech trends. This episode discusses various topics.
        Support us at patreon.com/ourshow and subscribe at spotify.com/podcast/ourshow.
        Don't forget to follow us on social media for more updates and content.
        We really appreciate your support and hope you enjoy this episode!
      `;
      
      const contentDescription = `
        Detailed analysis of the latest research findings in database performance optimization.
        Read the full research paper: https://journal.example.com/paper-123
        Additional resources: https://techblog.example.com/deep-dive
        This comprehensive study examines multiple approaches to database connection management
        and provides extensive benchmarking data across different system configurations.
      `;
      
      const promoResult = geminiService.assessContentQuality(promotionalDescription);
      const contentResult = geminiService.assessContentQuality(contentDescription);
      
      expect(promoResult.score).toBeLessThan(contentResult.score);
      // The promotional description will trigger low-quality indicators due to "support us", "subscribe", etc.
      expect(promoResult.reason).toContain('low-quality indicators');
    });
  });
});
