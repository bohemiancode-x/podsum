'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Headphones, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Hero = () => {
  return (
    <section 
      className="relative w-full overflow-hidden py-12 md:py-24 lg:py-32"
      data-testid="hero"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      
      <div className="max-w-7xl mx-auto relative px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-lg bg-muted/50 px-3 py-1 text-sm">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span className="bg-gradient-to-r from-primary/60 to-primary bg-clip-text text-transparent">
                  AI-Powered Podcast Summaries
                </span>
              </div>
              <h1 className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tighter text-transparent sm:text-4xl md:text-5xl lg:text-6xl">
                Transform Podcasts into
                <span className="block text-primary">Actionable Insights</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Get AI-powered summaries of your favorite podcast episodes in
                seconds. Save time and extract key insights.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Get Started
              </Button>
              <Button variant="outline" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                Learn More
              </Button>
            </div>
            
            {/* Feature Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                {
                  icon: Headphones,
                  title: 'Any Podcast',
                  desc: 'Works with any episode'
                },
                {
                  icon: Zap,
                  title: 'Instant Summaries',
                  desc: 'Get insights in seconds'
                },
                {
                  icon: BookOpen,
                  title: 'Key Takeaways',
                  desc: 'Extract core concepts'
                },
                {
                  icon: Sparkles,
                  title: 'AI Enhanced',
                  desc: 'Smart summarization'
                }
              ].map((feature, i) => (
                <div key={i} className="rounded-lg border bg-background/50 p-4 backdrop-blur-sm">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center justify-center">
            <div className="relative h-[450px] w-full overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                alt="Person listening to podcast with headphones"
                width={500}
                height={450}
                className="h-full w-full object-cover"
              />
              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 hidden opacity-50 items-center justify-center p-6">
                <div className="relative flex flex-col items-center space-y-4 text-center">
                  <div className="animate-pulse absolute -top-32 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <Sparkles className="relative h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="relative space-y-2">
                      <h3 className="text-xl font-bold">AI-Powered Summaries</h3>
                      <p className="max-w-[250px] text-sm text-primary">
                        Our advanced AI analyzes podcast content to extract the
                        most important information
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
