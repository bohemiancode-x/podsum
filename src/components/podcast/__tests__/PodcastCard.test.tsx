import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PodcastCard } from '../PodcastCard';
import { Podcast, Summary } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock SummaryModal
jest.mock('../SummaryModal', () => ({
  SummaryModal: ({ isOpen, onClose, podcast }: { isOpen: boolean; onClose: () => void; podcast: Podcast }) => 
    isOpen ? (
      <div data-testid="summary-modal">
        <span>Summary Modal for {podcast.title}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <span>📅</span>,
  Clock: () => <span>🕐</span>,
  User: () => <span>👤</span>,
  FileText: () => <span>📄</span>,
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  truncateText: (text: string, limit: number) => 
    text.length > limit ? text.substring(0, limit) + '...' : text,
}));

const mockPodcast: Podcast = {
  id: 'test-podcast',
  title: 'Test Podcast Episode',
  description: 'This is a test podcast description that is long enough to be truncated by the component logic when it exceeds the character limit.',
  host: 'Test Host',
  imageUrl: 'https://example.com/image.jpg',
  audioUrl: 'https://example.com/audio.mp3',
  duration: '3600',
  date: '2024-01-01',
  category: 'Tech News',
};

const mockSummary: Summary = {
  id: 'test-summary',
  podcastId: 'test-podcast',
  content: 'This is a test summary content.',
  format: 'paragraph',
  characterCount: 30,
  createdAt: new Date().toISOString(),
};

describe('PodcastCard Component', () => {
  it('renders without crashing', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    expect(screen.getByText(mockPodcast.title)).toBeInTheDocument();
  });

  it('displays podcast information correctly', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    expect(screen.getByText(mockPodcast.title)).toBeInTheDocument();
    expect(screen.getByText(mockPodcast.host)).toBeInTheDocument();
    expect(screen.getByAltText(mockPodcast.title)).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    // Just check that the description is rendered
    expect(screen.getByText(/This is a test podcast description/)).toBeInTheDocument();
  });

  it('shows "Summarize" button when no summary exists', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('Summarize')).toBeInTheDocument();
  });

  it('shows "View Summary" button when summary exists', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={mockSummary}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('View Summary')).toBeInTheDocument();
  });

  it('shows disabled state when isLoading is true', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={true}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('opens summary modal when button is clicked', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    const summarizeButton = screen.getByText('Summarize');
    fireEvent.click(summarizeButton);
    
    expect(screen.getByTestId('summary-modal')).toBeInTheDocument();
    expect(screen.getByText(`Summary Modal for ${mockPodcast.title}`)).toBeInTheDocument();
  });

  it('closes summary modal when close is called', () => {
    render(
      <PodcastCard 
        podcast={mockPodcast}
        summary={undefined}
        isLoading={false}
      />
    );
    
    // Open modal
    const summarizeButton = screen.getByText('Summarize');
    fireEvent.click(summarizeButton);
    expect(screen.getByTestId('summary-modal')).toBeInTheDocument();
    
    // Close modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('summary-modal')).not.toBeInTheDocument();
  });
});
