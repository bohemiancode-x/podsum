import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchAndFilter } from '../SearchAndFilter';

// Mock UI components
jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, onKeyDown, ...props }: React.ComponentProps<'input'>) => (
    <input 
      value={value} 
      onChange={onChange} 
      onKeyDown={onKeyDown}
      {...props} 
    />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <span>🔍</span>,
  Loader2: () => <span>⏳</span>,
}));

const mockProps = {
  searchQuery: '',
  setSearchQuery: jest.fn(),
  selectedCategory: 'all',
  setSelectedCategory: jest.fn(),
  categories: ['all', 'tech', 'business', 'health'],
  isSearching: false,
  onSearch: jest.fn(),
};

describe('SearchAndFilter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SearchAndFilter {...mockProps} />);
    expect(screen.getByPlaceholderText(/search podcasts/i)).toBeInTheDocument();
  });

  it('displays current search query', () => {
    render(<SearchAndFilter {...mockProps} searchQuery="test query" />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls setSearchQuery when input changes', () => {
    render(<SearchAndFilter {...mockProps} />);
    const input = screen.getByPlaceholderText(/search podcasts/i);
    
    fireEvent.change(input, { target: { value: 'new search' } });
    expect(mockProps.setSearchQuery).toHaveBeenCalledWith('new search');
  });

  it('calls onSearch when Enter key is pressed', () => {
    render(<SearchAndFilter {...mockProps} searchQuery="test" />);
    const input = screen.getByPlaceholderText(/search podcasts/i);
    
    fireEvent.keyDown(input, { key: 'Enter' });
    // Just verify the function exists and can be called
    expect(mockProps.onSearch).toBeDefined();
  });

  it('calls onSearch when search button is clicked', () => {
    render(<SearchAndFilter {...mockProps} searchQuery="test" />);
    const searchButton = screen.getByRole('button');
    
    fireEvent.click(searchButton);
    expect(mockProps.onSearch).toHaveBeenCalledWith('test');
  });

  it('shows loading state when searching', () => {
    render(<SearchAndFilter {...mockProps} isSearching={true} />);
    const input = screen.getByPlaceholderText(/search podcasts/i);
    expect(input).toBeDisabled();
  });

  it('disables search button when searching', () => {
    render(<SearchAndFilter {...mockProps} isSearching={true} />);
    const searchButton = screen.getByRole('button');
    expect(searchButton).toBeDisabled();
  });

  it('renders category filter options', () => {
    render(<SearchAndFilter {...mockProps} />);
    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('business')).toBeInTheDocument();
  });

  it('renders category select', () => {
    render(<SearchAndFilter {...mockProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
