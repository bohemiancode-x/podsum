import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../Footer';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Headphones: () => <span>🎧</span>,
  Github: () => <span>GitHub</span>,
  Twitter: () => <span>Twitter</span>,
  Linkedin: () => <span>LinkedIn</span>,
}));

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByText('PodSum')).toBeInTheDocument();
  });

  it('displays logo and brand name', () => {
    render(<Footer />);
    expect(screen.getByText('🎧')).toBeInTheDocument();
    expect(screen.getByText('PodSum')).toBeInTheDocument();
  });

  it('displays copyright notice with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} PodSum`))).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Footer />);
    const links = screen.getAllByText('GitHub');
    expect(links.length).toBeGreaterThan(0);
  });

  it('social media links have proper attributes', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '#');
    });
  });

  it('has proper footer structure', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('w-full', 'border-t', 'bg-background');
  });

  it('includes screen reader text for social icons', () => {
    render(<Footer />);
    expect(screen.getByText('GitHub', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByText('Twitter', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByText('LinkedIn', { selector: '.sr-only' })).toBeInTheDocument();
  });
});
