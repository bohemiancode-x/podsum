import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Hero } from '../Hero';

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
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: () => <span>✨</span>,
  Headphones: () => <span>🎧</span>,
  Zap: () => <span>⚡</span>,
  BookOpen: () => <span>📖</span>,
}));

describe('Hero Component', () => {
  it('renders without crashing', () => {
    render(<Hero />);
    expect(screen.getByText(/Transform Podcasts into/i)).toBeInTheDocument();
  });

  it('displays main heading', () => {
    render(<Hero />);
    expect(screen.getByText(/Transform Podcasts into/i)).toBeInTheDocument();
    expect(screen.getByText(/Actionable Insights/i)).toBeInTheDocument();
  });

  it('displays AI-powered badge', () => {
    render(<Hero />);
    expect(screen.getByText(/AI-Powered Podcast Summaries/i)).toBeInTheDocument();
  });

  it('displays subtitle', () => {
    render(<Hero />);
    expect(screen.getByText(/Get AI-powered summaries/i)).toBeInTheDocument();
  });

  it('displays feature points', () => {
    render(<Hero />);
    expect(screen.getByText(/Any Podcast/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Summaries/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Takeaways/i)).toBeInTheDocument();
  });

  it('displays feature icons', () => {
    render(<Hero />);
    expect(screen.getByText('🎧')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('📖')).toBeInTheDocument();
  });

  it('displays get started button', () => {
    render(<Hero />);
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });

  it('displays hero image', () => {
    render(<Hero />);
    const heroImage = screen.getByAltText(/Person listening to podcast/i);
    expect(heroImage).toBeInTheDocument();
  });

  it('has proper responsive layout classes', () => {
    const { container } = render(<Hero />);
    const heroSection = container.querySelector('section');
    expect(heroSection).toHaveClass('relative', 'w-full', 'overflow-hidden');
  });
});
