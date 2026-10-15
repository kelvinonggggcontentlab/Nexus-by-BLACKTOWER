import React from 'react';
import { NexusState } from '../types/nexus';

interface VoiceWaveformProps {
  state: NexusState;
  audioLevel: number;
  barsCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  state,
  audioLevel,
  barsCount = 24,
}) => {
  const isActive =
    state === NexusState.LISTENING ||
    state === NexusState.SPEAKING ||
    state === NexusState.THINKING ||
    state === NexusState.PROCESSING;

  const baseHeights = [
    0.18, 0.25, 0.34, 0.48, 0.3, 0.62, 0.78, 0.55, 0.88, 0.96, 0.72, 1.0, 0.92,
    0.75, 0.94, 0.82, 0.58, 0.74, 0.44, 0.52, 0.36, 0.28, 0.22, 0.16,
  ];

  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-[3px] h-9 px-2 select-none"
    >
      {baseHeights.slice(0, barsCount).map((weight, idx) => {
        const dynamicBoost = isActive ? Math.max(0.16, audioLevel * weight * 1.45) : 0.12;
        const heightPercent =
          state === NexusState.THINKING || state === NexusState.PROCESSING
            ? 20 + ((idx % 4) * 10)
            : Math.min(100, Math.round((weight * 0.25 + dynamicBoost) * 100));

        return (
          <span
            key={idx}
            className={`w-[2px] rounded-full transition-all duration-150 ${
              state === NexusState.LISTENING || state === NexusState.SPEAKING
                ? 'bg-[#E11D2E]'
                : state === NexusState.THINKING || state === NexusState.PROCESSING
                ? 'bg-white/60'
                : 'bg-white/20'
            }`}
            style={{
              height: `${Math.max(4, (heightPercent / 100) * 34)}px`,
              opacity: isActive ? 0.55 + weight * 0.45 : 0.28,
            }}
          />
        );
      })}
    </div>
  );
};
