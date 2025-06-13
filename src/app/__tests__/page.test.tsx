import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';
import { usePodcastStore } from '@/store/podcastStore';
import { useSummaryStore } from '@/store/summaryStore';

// Mock the store hooks
const mockUsePodcastStore = {
  podcasts: [],
  isLoading: false,
  isSearching: false,
  error: null,
  searchPodcasts: jest.fn(),
  searchEpisodesForSummarization: jest.fn(),
  setSearchFilters: jest.fn(),
  clearError: jest.fn(),
};

const mockUseSummaryStore = {
  summaries: {},
  generatingSummaries: new Set<string>(),
};

jest.mock('@/store/podcastStore', () => ({
  usePodcastStore: jest.fn(),
}));

jest.mock('@/store/summaryStore', () => ({
  useSummaryStore: jest.fn(),
}));

const mockUsePodcastStoreFn = usePodcastStore as jest.MockedFunction<typeof usePodcastStore>;
const mockUseSummaryStoreFn = useSummaryStore as jest.MockedFunction<typeof useSummaryStore>;

// Mock the components
jest.mock('@/components/podcast/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/components/podcast/Hero', () => ({
  Hero: () => <section data-testid="hero">Hero Section</section>,
}));

jest.mock('@/components/podcast/PodcastList', () => ({
  PodcastList: ({ podcasts }: { podcasts: unknown[] }) => (
    <div data-testid="podcast-list">
      Podcast List - {podcasts.length} podcasts
    </div>
  ),
}));

jest.mock('@/components/podcast/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ErrorMessage: ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div data-testid="error-message">
      Error: {error}
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePodcastStoreFn.mockReturnValue(mockUsePodcastStore);
    mockUseSummaryStoreFn.mockReturnValue(mockUseSummaryStore);
  });

  it('renders all main components', () => {
    render(<Home />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-list')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('calls searchEpisodesForSummarization on mount', () => {
    render(<Home />);
    
    expect(mockUsePodcastStore.searchEpisodesForSummarization).toHaveBeenCalledWith('startups entrepreneurship');
  });

  it('renders error message when there is an error', () => {
    const mockStoreWithError = {
      ...mockUsePodcastStore,
      error: 'Test error message',
    };

    mockUsePodcastStoreFn.mockReturnValue(mockStoreWithError);

    render(<Home />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
    expect(screen.queryByTestId('podcast-list')).not.toBeInTheDocument();
  });

  it('renders podcast list when there is no error', () => {
    render(<Home />);
    
    expect(screen.getByTestId('podcast-list')).toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('has proper page structure', () => {
    render(<Home />);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-grow');
  });
});
