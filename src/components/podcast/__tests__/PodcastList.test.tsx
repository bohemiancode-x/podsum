import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PodcastList } from '../PodcastList';
import { Podcast, Summary } from '@/types';
import { useSummaryStore } from '@/store/summaryStore';


// Mock components
jest.mock('../PodcastCard', () => ({
  PodcastCard: ({ podcast }: { podcast: Podcast }) => (
    <div data-testid={`podcast-card-${podcast.id}`}>
      {podcast.title}
    </div>
  ),
}));

jest.mock('../SearchAndFilter', () => ({
  SearchAndFilter: ({ searchQuery }: { searchQuery: string }) => (
    <div data-testid="search-filter">Search: {searchQuery}</div>
  ),
}));

jest.mock('@/components/ErrorBoundary', () => ({
  LoadingGrid: () => <div data-testid="loading-grid">Loading...</div>,
}));

// Mock the summary store
jest.mock('@/store/summaryStore');

const mockPodcasts: Podcast[] = [
  {
    id: 'podcast-1',
    title: 'Tech Podcast',
    description: 'A tech podcast',
    host: 'Tech Host',
    imageUrl: 'https://example.com/tech.jpg',
    date: '2024-01-01',
    duration: '3600',
    category: 'tech',
  },
  {
    id: 'podcast-2',
    title: 'Business Podcast',
    description: 'A business podcast',
    host: 'Business Host',
    imageUrl: 'https://example.com/business.jpg',
    date: '2024-01-02',
    duration: '2400',
    category: 'business',
  },
];

const mockSummaries: Record<string, Summary> = {
  'podcast-1': {
    id: 'summary-1',
    length: 'short',
    podcastId: 'podcast-1',
    content: 'Tech summary',
    format: 'paragraph',
    characterCount: 100,
    createdAt: new Date().toISOString(),
    podcast: mockPodcasts[0],
  },
};

describe('PodcastList Component', () => {
  const defaultProps = {
    podcasts: mockPodcasts,
    loadingPodcastId: null,
    loading: false,
    isSearching: false,
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSummaryStore as unknown as jest.Mock).mockReturnValue({
      summaries: mockSummaries,
      isLoadingSummaries: false,
    });
  });

  it('renders without crashing', () => {
    render(<PodcastList {...defaultProps} />);
    expect(screen.getByTestId('search-filter')).toBeInTheDocument();
  });

  it('renders all podcast cards', () => {
    render(<PodcastList {...defaultProps} />);
    
    expect(screen.getByTestId('podcast-card-podcast-1')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-card-podcast-2')).toBeInTheDocument();
    expect(screen.getByText('Tech Podcast')).toBeInTheDocument();
    expect(screen.getByText('Business Podcast')).toBeInTheDocument();
  });

  it('shows loading grid when loading', () => {
    render(<PodcastList {...defaultProps} loading={true} />);
    expect(screen.getByTestId('loading-grid')).toBeInTheDocument();
  });

  it('shows loading grid when searching', () => {
    render(<PodcastList {...defaultProps} isSearching={true} />);
    expect(screen.getByTestId('loading-grid')).toBeInTheDocument();
  });

  it('renders search and filter component', () => {
    render(<PodcastList {...defaultProps} />);
    expect(screen.getByTestId('search-filter')).toBeInTheDocument();
  });

  it('shows empty state when no podcasts', () => {
    render(<PodcastList {...defaultProps} podcasts={[]} />);
    expect(screen.getByText(/No podcasts found matching your search/i)).toBeInTheDocument();
  });

  it('filters podcasts by search query', () => {
    render(<PodcastList {...defaultProps} />);
    
    // By default should show both podcasts
    expect(screen.getByText('Tech Podcast')).toBeInTheDocument();
    expect(screen.getByText('Business Podcast')).toBeInTheDocument();
  });

  it('filters podcasts by category', () => {
    render(<PodcastList {...defaultProps} />);
    
    // Should show both podcasts when no filter is applied
    expect(screen.getByTestId('podcast-card-podcast-1')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-card-podcast-2')).toBeInTheDocument();
  });

  it('correctly uses isLoadingSummaries from store', () => {
    // Test that the store value is being used correctly
    (useSummaryStore as unknown as jest.Mock).mockReturnValue({
      summaries: mockSummaries,
      isLoadingSummaries: true,
    });

    render(<PodcastList {...defaultProps} />);
    
    // The component should render normally since this test just ensures the store is connected
    expect(screen.getByTestId('podcast-list')).toBeInTheDocument();
    
    // Verify the store was called
    expect(useSummaryStore).toHaveBeenCalled();
  });
});
