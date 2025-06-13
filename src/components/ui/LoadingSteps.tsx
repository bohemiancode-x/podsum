import React, { useState, useEffect } from 'react';

interface LoadingStep {
  id: string;
  label: string;
  description: string;
}

interface LoadingStepsProps {
  steps: LoadingStep[];
  className?: string;
}

export const LoadingSteps = ({ steps, className = "" }: LoadingStepsProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
        setIsTransitioning(false);
      }, 250); // Half of transition duration
    }, 3000); // Change step every 3 seconds

    return () => clearInterval(interval);
  }, [steps]);

  const currentStep = steps[currentStepIndex];

  return (
    <div 
      className={`relative h-20 overflow-hidden ${className}`}
      data-testid="loading-steps"
    >
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isTransitioning ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
          <div className="font-medium text-lg text-foreground">
            {currentStep?.label}
          </div>
          <div className="text-sm text-muted-foreground max-w-md">
            {currentStep?.description}
          </div>
        </div>
      </div>
    </div>
  );
};
