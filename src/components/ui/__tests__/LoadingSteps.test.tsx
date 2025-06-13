import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSteps } from '../LoadingSteps'; // Corrected import

// Mock timers for controlling useEffect behavior
jest.useFakeTimers();

describe('LoadingSteps Component', () => {
  const mockSteps = [
    { id: '1', label: 'Step 1 Label', description: 'Step 1 Description' },
    { id: '2', label: 'Step 2 Label', description: 'Step 2 Description' },
    { id: '3', label: 'Step 3 Label', description: 'Step 3 Description' },
  ];

  it('renders the initial step correctly', () => {
    render(<LoadingSteps steps={mockSteps} />);
    expect(screen.getByText('Step 1 Label')).toBeInTheDocument();
    expect(screen.getByText('Step 1 Description')).toBeInTheDocument();
  });

  it('cycles through steps over time', () => {
    render(<LoadingSteps steps={mockSteps} />);

    // Initial step
    expect(screen.getByText('Step 1 Label')).toBeInTheDocument();
    expect(screen.getByText('Step 1 Description')).toBeInTheDocument();

    // Advance timers to trigger the first step change (3000ms interval + 250ms transition)
    act(() => {
      jest.advanceTimersByTime(3250);
    });

    expect(screen.getByText('Step 2 Label')).toBeInTheDocument();
    expect(screen.getByText('Step 2 Description')).toBeInTheDocument();

    // Advance timers to trigger the second step change
    act(() => {
      jest.advanceTimersByTime(3250);
    });

    expect(screen.getByText('Step 3 Label')).toBeInTheDocument();
    expect(screen.getByText('Step 3 Description')).toBeInTheDocument();

    // Advance timers to loop back to the first step
    act(() => {
      jest.advanceTimersByTime(3250);
    });

    expect(screen.getByText('Step 1 Label')).toBeInTheDocument();
    expect(screen.getByText('Step 1 Description')).toBeInTheDocument();
  });

  it('handles an empty array of steps gracefully', () => {
    // Suppress console.error for this test as the component might log an error
    // when steps array is empty and it tries to access steps[0]
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<LoadingSteps steps={[]} />);
    // Depending on how it handles empty steps, it might render nothing or a default state.
    // For this component, it will likely try to access `steps[0]` which will be undefined.
    // We expect it not to crash and perhaps render nothing or an empty div.
    // This assertion depends on the actual rendered output for empty steps.
    // If it renders an empty div with the base classes:
    const containerDiv = document.querySelector('.relative.h-20.overflow-hidden');
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv?.textContent).toBe('');
    consoleErrorSpy.mockRestore();
  });

  it('handles a single step correctly and loops back to it', () => {
    render(<LoadingSteps steps={[{ id: '1', label: 'Single Step Label', description: 'Single Step Description' }]} />);
    expect(screen.getByText('Single Step Label')).toBeInTheDocument();
    expect(screen.getByText('Single Step Description')).toBeInTheDocument();

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(3250);
    });

    // Should still show the single step
    expect(screen.getByText('Single Step Label')).toBeInTheDocument();
    expect(screen.getByText('Single Step Description')).toBeInTheDocument();
  });

  it('applies the provided className to the main container', () => {
    const customClass = "my-custom-loading-class";
    render(<LoadingSteps steps={mockSteps} className={customClass} />);
    const containerDiv = document.querySelector('.relative.h-20.overflow-hidden');
    expect(containerDiv).toHaveClass(customClass);
  });

  // Clean up timers after all tests in this describe block
  afterAll(() => {
    jest.useRealTimers();
  });
});
