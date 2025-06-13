'use client';

import React from 'react';
import { Headphones, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer 
      className="w-full border-t bg-background py-6"
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          <span className="font-semibold">PodSum</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} PodSum. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
