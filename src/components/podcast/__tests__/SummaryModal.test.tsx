import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryModal } from '../SummaryModal';
import { Summary, Podcast } from '@/types';

// Define types for summary format and length
type SummaryFormat = 'paragraph' | 'bullet-points' | 'key-takeaways' | 'executive-summary';
type SummaryLength = 'short' | 'medium' | 'long';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span>✕</span>,
  Copy: () => <span>📋</span>,
  Share2: () => <span>📤</span>,
  Check: () => <span>✓</span>,
  User: () => <span>👤</span>,
  Clock: () => <span>⏰</span>,
  Calendar: () => <span>📅</span>,
  AlertCircle: () => <span>⚠️</span>,
  RefreshCw: () => <span>🔄</span>,
  List: () => <span>📝</span>,
  FileText: () => <span>📄</span>,
  Lightbulb: () => <span>💡</span>,
  Briefcase: () => <span>💼</span>,
}));

// Mock the summary store
const mockAddSummary = jest.fn();
const mockSetGenerating = jest.fn();
const mockSummaries = {};

jest.mock('@/store/summaryStore', () => ({
  useSummaryStore: () => ({
    addSummary: mockAddSummary,
    setGenerating: mockSetGenerating,
    summaries: mockSummaries,
  }),
}));

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the Dialog component
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockPodcast: Podcast = {
  id: '1',
  title: 'Test Podcast',
  description: 'Test Description',
  imageUrl: '/test-image.jpg',
  host: 'Test Host',
  duration: '30:00',
  date: '2024-03-20',
  category: 'Technology',
};

const mockSummary: Summary = {
  id: 'summary-1',
  podcastId: '1',
  length: 'medium' as SummaryLength,
  content: 'Test summary content',
  format: 'paragraph' as SummaryFormat,
  characterCount: 100,
  createdAt: '2024-03-20T00:00:00.000Z',
  podcast: mockPodcast,
};

describe('SummaryModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with podcast information', () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByText('2024-03-20')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders existing summary when provided', () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
        existingSummary={mockSummary}
      />
    );

    expect(screen.getByText('Test summary content')).toBeInTheDocument();
    expect(screen.getByText('paragraph')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    const closeButton = screen.getByTestId('close-modal');
    await act(async () => {
      fireEvent.click(closeButton);
    });
    // Wait for the onClose to be called (in case of animation/delay)
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows confirmation dialog when trying to close during generation', async () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    // Start generation
    const generateButton = screen.getByTestId('generate-summary-button');
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Try to close
    const closeButton = screen.getByTestId('close-modal');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Check if confirmation dialog appears
    expect(screen.getByText('Cancel Summarization?')).toBeInTheDocument();
  });

  it('allows format selection', async () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    const bulletPointsOption = screen.getByText('Bullet Points');
    await act(async () => {
      fireEvent.click(bulletPointsOption);
    });

    // Check if the option is selected by looking for the peer-checked class
    expect(bulletPointsOption.closest('label')).toHaveClass('peer-checked:border-primary');
  });

  it('allows length selection', async () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    const longOption = screen.getByText('Long');
    await act(async () => {
      fireEvent.click(longOption);
    });

    // Check for the actual class applied when selected
    expect(longOption.closest('label')).toHaveClass('border-primary');
    expect(longOption.closest('label')).toHaveClass('bg-primary/5');
    expect(longOption.closest('label')).toHaveClass('text-primary');
  });

  it('shows loading state during generation', async () => {
    // Mock fetch to never resolve so loading state persists
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
      />
    );

    const generateButton = screen.getByTestId('generate-summary-button');
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Wait for the loading state to be applied
    await waitFor(() => {
      // Check for the audio waveform loading indicator
      expect(screen.getByTestId('audio-waveform')).toBeInTheDocument();
    });
  });

  it('handles copy functionality', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
        existingSummary={mockSummary}
      />
    );

    const copyButton = screen.getByTestId('copy-button');
    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test summary content');
    });
  });

  it('handles share functionality when Web Share API is available', async () => {
    const mockShare = jest.fn().mockImplementation(() => Promise.resolve());
    Object.assign(navigator, {
      share: mockShare,
    });

    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
        existingSummary={mockSummary}
      />
    );

    const shareButton = screen.getByTestId('share-button');
    await act(async () => {
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Summary: Test Podcast',
        text: 'Test summary content',
        url: window.location.href,
      });
    });
  });

  it('shows regenerate form when regenerate button is clicked', async () => {
    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={mockPodcast}
        existingSummary={mockSummary}
      />
    );

    const regenerateButton = screen.getByTestId('regenerate-button');
    await act(async () => {
      fireEvent.click(regenerateButton);
    });

    expect(screen.getByTestId('generate-summary-button')).toBeInTheDocument();
  });

  it('shows audio processing warning when needed', () => {
    const podcastWithShortDescription = {
      ...mockPodcast,
      description: 'Short description',
    };

    render(
      <SummaryModal
        isOpen={true}
        onClose={mockOnClose}
        podcast={podcastWithShortDescription}
      />
    );

    expect(screen.getByText('Audio Processing Required')).toBeInTheDocument();
  });
});
