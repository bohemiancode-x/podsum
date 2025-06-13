import React from 'react';

interface AudioWaveformProps {
  className?: string;
}

export const AudioWaveform = ({ className = "" }: AudioWaveformProps) => {
  return (
    <div 
      data-testid="audio-waveform"
      className={`flex h-16 w-full items-center justify-center space-x-2 ${className}`}
    >
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="w-1 border animate-[waveform_1s_ease-in-out_infinite] rounded-full bg-primary"
          style={{
            animationDelay: `${i * 0.05}s`,
            height: `${30 + Math.sin((i / 20) * Math.PI * 2) * 50}%`,
          }}
        />
      ))}
    </div>
  );
};
