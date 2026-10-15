import React, { useRef } from 'react';
import { NexusState } from '../types/nexus';

interface NexusOrbProps {
  state: NexusState;
  orbSrc: string | null;
  orbMissing: boolean;
  audioLevel: number; // 0 to 1 real-time voice amplitude
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  onUploadOrb?: (file: File) => void;
  onImageError?: () => void;
  onImageLoad?: () => void;
}

export const NexusOrb: React.FC<NexusOrbProps> = ({
  state,
  orbSrc,
  orbMissing,
  audioLevel,
  size = 'lg',
  onClick,
  onUploadOrb,
  onImageError,
  onImageLoad,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dimensionMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-56 h-56 sm:w-64 sm:h-64',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  };

  // Presentation-only scale & opacity modulation around the official orb.png
  const dynamicScale =
    state === NexusState.LISTENING || state === NexusState.SPEAKING
      ? 1 + Math.min(audioLevel * 0.14, 0.14)
      : state === NexusState.THINKING || state === NexusState.PROCESSING
      ? 1.02
      : 1;

  const ambientGlowStyle = (): React.CSSProperties => {
    switch (state) {
      case NexusState.LISTENING:
        return {
          background:
            'radial-gradient(circle, rgba(225,29,46,0.34) 0%, rgba(225,29,46,0.08) 52%, rgba(0,0,0,0) 75%)',
          transform: `scale(${1.08 + audioLevel * 0.25})`,
          opacity: 0.95,
        };
      case NexusState.SPEAKING:
        return {
          background:
            'radial-gradient(circle, rgba(225,29,46,0.40) 0%, rgba(225,29,46,0.12) 55%, rgba(0,0,0,0) 78%)',
          transform: `scale(${1.12 + audioLevel * 0.3})`,
          opacity: 1,
        };
      case NexusState.THINKING:
      case NexusState.PROCESSING:
        return {
          background:
            'radial-gradient(circle, rgba(220,225,240,0.18) 0%, rgba(225,29,46,0.12) 48%, rgba(0,0,0,0) 74%)',
          transform: 'scale(1.08)',
          opacity: 0.85,
        };
      case NexusState.ERROR:
        return {
          background:
            'radial-gradient(circle, rgba(239,68,68,0.28) 0%, rgba(0,0,0,0) 70%)',
          transform: 'scale(1.02)',
          opacity: 0.8,
        };
      case NexusState.OFFLINE:
        return {
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 65%)',
          transform: 'scale(0.96)',
          opacity: 0.35,
        };
      case NexusState.STANDBY:
      default:
        return {
          background:
            'radial-gradient(circle, rgba(225,29,46,0.20) 0%, rgba(225,29,46,0.04) 55%, rgba(0,0,0,0) 74%)',
          transform: 'scale(1.04)',
          opacity: 0.78,
        };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadOrb) {
      onUploadOrb(file);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Surrounding Ambient Light Field (Presentation Only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 rounded-full transition-all duration-300 ease-out"
        style={ambientGlowStyle()}
      />

      {/* Subtle Outer Acoustic Ring for Listening / Speaking / Thinking */}
      {(state === NexusState.LISTENING ||
        state === NexusState.SPEAKING ||
        state === NexusState.THINKING ||
        state === NexusState.PROCESSING) && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-4 rounded-full border transition-all duration-200 ${
            state === NexusState.THINKING || state === NexusState.PROCESSING
              ? 'border-white/15 animate-nexus-thinking'
              : 'border-[#E11D2E]/30'
          }`}
          style={
            state === NexusState.LISTENING || state === NexusState.SPEAKING
              ? {
                  transform: `scale(${1.02 + audioLevel * 0.16})`,
                  opacity: 0.45 + audioLevel * 0.45,
                }
              : undefined
          }
        />
      )}

      {/* Official orb.png Asset OR Strict Missing Asset Placeholder */}
      {!orbMissing && orbSrc ? (
        <button
          type="button"
          onClick={onClick}
          aria-label="Interact with NEXUS Core"
          className={`relative z-10 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D2E]/60 transition-transform duration-200 ease-out cursor-pointer ${
            dimensionMap[size]
          } ${state === NexusState.STANDBY ? 'animate-nexus-breathe' : ''} ${
            state === NexusState.OFFLINE ? 'opacity-45 grayscale' : ''
          }`}
          style={{
            transform: `scale(${dynamicScale})`,
          }}
        >
          <img
            src={orbSrc}
            alt="NEXUS Core"
            referrerPolicy="no-referrer"
            onError={onImageError}
            onLoad={onImageLoad}
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </button>
      ) : (
        /* STRICT MISSING ORB ASSET RULE:
           Never generate a replacement, never create an SVG substitute, never use a generic AI orb.
           Use a clean placeholder and clearly report: "NEXUS Orb asset missing: orb.png" */
        <div
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick?.();
          }}
          className={`relative z-10 flex flex-col items-center justify-center text-center border border-white/12 bg-[#0B0B0E]/90 backdrop-blur-sm transition-colors hover:border-white/25 cursor-pointer ${
            size === 'sm'
              ? 'w-12 h-12 rounded-xl p-1'
              : size === 'md'
              ? 'w-28 h-28 rounded-2xl p-3'
              : 'w-60 h-60 sm:w-64 sm:h-64 rounded-3xl p-6'
          }`}
        >
          {size === 'sm' ? (
            <span className="text-[9px] font-mono-tabular text-white/60 leading-tight">
              orb.png
            </span>
          ) : (
            <>
              <p className="text-xs sm:text-sm font-medium text-white/90 tracking-tight">
                NEXUS Orb asset missing: orb.png
              </p>
              {size !== 'md' && (
                <p className="mt-2 text-[11px] text-[#9A9AA6] max-w-[200px] leading-relaxed">
                  Official <span className="font-mono-tabular text-white/80">orb.png</span> required. No substitute or SVG approximation is used.
                </p>
              )}
              {onUploadOrb && size !== 'md' && (
                <div
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 text-xs font-medium text-white/90 bg-white/8 hover:bg-white/14 border border-white/15 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Attach official orb.png
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
