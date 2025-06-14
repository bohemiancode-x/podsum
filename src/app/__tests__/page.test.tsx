import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';
import { usePodcastStore } from '@/store/podcastStore';
import { useSummaryStore } from '@/store/summaryStore';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock the stores
jest.mock('@/store/podcastStore');
jest.mock('@/store/summaryStore');

describe('Home Page', () => {
  const mockSearchEpisodesForSummarization = jest.fn();
  const mockGetAllSummaries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePodcastStore as unknown as jest.Mock).mockReturnValue({
      searchEpisodesForSummarization: mockSearchEpisodesForSummarization,
      podcasts: [],
      loading: false,
      error: null,
    });
    (useSummaryStore as unknown as jest.Mock).mockReturnValue({
      getAllSummaries: mockGetAllSummaries,
      summaries: {},
      loading: false,
      error: null,
      generatingSummaries: new Set(),
    });
  });

  it('renders all main components', async () => {
    render(<Home />);
    
    await waitFor(() => {
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-list')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('calls searchEpisodesForSummarization on mount', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(mockSearchEpisodesForSummarization).toHaveBeenCalledWith('startups entrepreneurship');
      expect(mockGetAllSummaries).toHaveBeenCalled();
    });
  });

  it('renders error message when there is an error', async () => {
    (usePodcastStore as unknown as jest.Mock).mockReturnValue({
      searchEpisodesForSummarization: mockSearchEpisodesForSummarization,
      podcasts: [],
      loading: false,
      error: 'Test error',
    });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('renders podcast list when there is no error', async () => {
    const mockPodcasts = [
      { id: '1', title: 'Test Podcast 1', imageUrl: '/test-image-1.jpg' },
      { id: '2', title: 'Test Podcast 2', imageUrl: '/test-image-2.jpg' },
    ];

    (usePodcastStore as unknown as jest.Mock).mockReturnValue({
      searchEpisodesForSummarization: mockSearchEpisodesForSummarization,
      podcasts: mockPodcasts,
      loading: false,
      error: null,
    });

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Podcast 1')).toBeInTheDocument();
      expect(screen.getByText('Test Podcast 2')).toBeInTheDocument();
    });
  });

  it('has proper page structure', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });
});
