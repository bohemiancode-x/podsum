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
  isSearching: false,
  onSearch: jest.fn(),
};

describe('SearchAndFilter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and button', () => {
    render(<SearchAndFilter {...mockProps} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('calls onSearch when search button is clicked', () => {
    render(<SearchAndFilter {...mockProps} />);
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);
    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('calls onSearch when Enter is pressed in search input', () => {
    render(<SearchAndFilter {...mockProps} searchQuery="test" />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('updates search query when input changes', () => {
    render(<SearchAndFilter {...mockProps} />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(mockProps.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('shows loading state when isSearching is true', () => {
    render(<SearchAndFilter {...mockProps} isSearching={true} />);
    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeDisabled();
  });
});
