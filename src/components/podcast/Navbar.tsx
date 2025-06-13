'use client';

import React from 'react';
import { Headphones } from 'lucide-react';

export const Navbar = () => {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold">
          <Headphones className="h-6 w-6" />
          <span className="text-xl">PodSum</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a href="#" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </a>
          <a href="#" className="text-sm hidden font-medium text-muted-foreground transition-colors hover:text-primary">
            Library
          </a>
          <a href="#" className="text-sm hidden font-medium text-muted-foreground transition-colors hover:text-primary">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};
