import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from '../Navbar';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Headphones: () => <span>🎧</span>,
}));

describe('Navbar Component', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(screen.getByText('PodSum')).toBeInTheDocument();
  });

  it('displays logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('🎧')).toBeInTheDocument();
    expect(screen.getByText('PodSum')).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('has proper header structure', () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('navigation links have proper attributes', () => {
    render(<Navbar />);
    const homeLink = screen.getByText('Home').closest('a');
    const libraryLink = screen.getByText('Library').closest('a');
    const aboutLink = screen.getByText('About').closest('a');

    expect(homeLink).toHaveAttribute('href', '#');
    expect(libraryLink).toHaveAttribute('href', '#');
    expect(aboutLink).toHaveAttribute('href', '#');
  });
});
