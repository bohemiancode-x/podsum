'use client';

import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching?: boolean;
  onSearch: (query: string) => void;
}

export const SearchAndFilter = ({
  searchQuery,
  setSearchQuery,
  isSearching = false,
  onSearch
}: SearchAndFilterProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2 flex-1 md:max-w-md">
        <div className="relative flex-1">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            type="text"
            placeholder="Search podcasts... (Press Enter or click Search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-9"
            disabled={isSearching}
            data-testid="search-input"
          />
        </div>
        <Button 
          onClick={handleSearchClick}
          disabled={isSearching}
          size="default"
          className="px-4"
          data-testid="search-button"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </div>
    </div>
  );
};
