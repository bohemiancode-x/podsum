import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AudioWaveform } from '../AudioWaveform';

describe('AudioWaveform Component', () => {
  it('renders without crashing', () => {
    render(<AudioWaveform />);
    expect(screen.getByTestId('audio-waveform')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<AudioWaveform className={customClass} />);
    const waveform = screen.getByTestId('audio-waveform');
    expect(waveform).toHaveClass(customClass);
  });

  it('renders 30 wave bars', () => {
    const { container } = render(<AudioWaveform />);
    const waveBars = container.querySelectorAll('.w-1');
    expect(waveBars).toHaveLength(30);
  });

  it('applies animation styles to wave bars', () => {
    const { container } = render(<AudioWaveform />);
    const firstWaveBar = container.querySelector('.w-1');
    expect(firstWaveBar).toHaveClass('animate-[waveform_1s_ease-in-out_infinite]');
  });
});
