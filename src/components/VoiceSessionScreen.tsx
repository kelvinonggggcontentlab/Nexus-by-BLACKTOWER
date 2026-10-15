import React, { useEffect, useState } from 'react';
import { Mic, Pause, Play, Square, X, Minimize2 } from 'lucide-react';
import { NexusState } from '../types/nexus';
import { NexusOrb } from './NexusOrb';
import { VoiceWaveform } from './VoiceWaveform';

interface VoiceSessionScreenProps {
  state: NexusState;
  orbSrc: string | null;
  orbMissing: boolean;
  audioLevel: number;
  liveTranscript: string;
  lastSpokenReply: string;
  onToggleVoice: () => void;
  onPauseResumeVoice: () => void;
  onSelectState: (state: NexusState) => void;
  onExitVoiceMode: () => void;
  onSimulateVoiceTurn: (text: string) => void;
  onUploadOrb: (file: File) => void;
  onOrbError: () => void;
  onOrbLoad: () => void;
}

export const VoiceSessionScreen: React.FC<VoiceSessionScreenProps> = ({
  state,
  orbSrc,
  orbMissing,
  audioLevel,
  liveTranscript,
  lastSpokenReply,
  onToggleVoice,
  onPauseResumeVoice,
  onSelectState,
  onExitVoiceMode,
  onSimulateVoiceTurn,
  onUploadOrb,
  onOrbError,
  onOrbLoad,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || state === NexusState.OFFLINE) return;
    const timer = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPaused, state]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getStatusBanner = () => {
    switch (state) {
      case NexusState.LISTENING:
        return {
          title: 'Listening...',
          prompt: liveTranscript || 'I’m listening, Boss... Go ahead.',
        };
      case NexusState.THINKING:
      case NexusState.PROCESSING:
        return {
          title: 'Thinking...',
          prompt: liveTranscript
            ? `“${liveTranscript}”`
            : 'Give me a moment... connecting context.',
        };
      case NexusState.SPEAKING:
        return {
          title: 'NEXUS is speaking...',
          prompt: lastSpokenReply || 'Here’s what I found, Boss.',
        };
      case NexusState.ERROR:
        return {
          title: 'Channel interrupted',
          prompt: 'Tap the microphone below to resume.',
        };
      case NexusState.STANDBY:
      default:
        return {
          title: 'Ready when you are',
          prompt: lastSpokenReply || 'Go ahead, Boss. What’s on your mind?',
        };
    }
  };

  const banner = getStatusBanner();

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-8.5rem)] px-5 sm:px-8 py-4">
      {/* Top Status Indicator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExitVoiceMode}
          className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium text-[#9A9AA6] hover:text-white bg-[#0B0B0E] border border-white/8 transition-colors flex items-center gap-2"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Return to Core</span>
        </button>

        <div className="px-4 py-1.5 rounded-full bg-[#0B0B0E] border border-[#E11D2E]/30 text-xs font-medium text-white">
          {banner.title}
        </div>

        <div className="font-mono-tabular text-xs text-[#9A9AA6] min-w-[54px] text-right">
          {formatTimer(secondsElapsed)}
        </div>
      </div>

      {/* Center: NEXUS Core + Live Acoustic Energy */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
        <NexusOrb
          state={state}
          orbSrc={orbSrc}
          orbMissing={orbMissing}
          audioLevel={audioLevel}
          size="xl"
          onClick={onToggleVoice}
          onUploadOrb={onUploadOrb}
          onImageError={onOrbError}
          onImageLoad={onOrbLoad}
        />

        <div className="mt-6">
          <VoiceWaveform state={state} audioLevel={audioLevel} barsCount={24} />
        </div>

        <p className="mt-4 text-base sm:text-lg font-medium text-white max-w-md leading-relaxed text-balance">
          {banner.prompt}
        </p>

        {/* Quick Spoken Prompts for Instant Testing */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-lg">
          {[
            'Eh NEXUS, 我现在的 workflow 哪里太 manual？',
            'Boss，帮我分析一下今天最重要的 decision。',
            'Tell me something counter-intuitive you noticed.',
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSimulateVoiceTurn(sample)}
              className="px-3.5 py-2 rounded-xl bg-[#0B0B0E] border border-white/8 hover:border-white/25 text-xs text-[#9A9AA6] hover:text-white transition-colors"
            >
              “{sample}”
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Controls: Cancel (X), Primary Mic, Pause (||), plus State Strip */}
      <div className="space-y-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={onExitVoiceMode}
            aria-label="End voice session"
            className="w-13 h-13 rounded-full bg-[#0B0B0E] border border-white/12 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleVoice}
            aria-label={
              state === NexusState.LISTENING ? 'Finish speaking' : 'Start speaking'
            }
            className={`w-18 h-18 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              state === NexusState.LISTENING
                ? 'bg-[#E11D2E] text-white shadow-[0_0_36px_rgba(225,29,46,0.6)] scale-105'
                : 'bg-[#E11D2E]/90 hover:bg-[#E11D2E] text-white shadow-[0_0_24px_rgba(225,29,46,0.35)]'
            }`}
          >
            {state === NexusState.LISTENING ? (
              <Square className="w-6 h-6 fill-current" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPaused((p) => !p);
              onPauseResumeVoice();
            }}
            aria-label={isPaused ? 'Resume session' : 'Pause session'}
            className="w-13 h-13 rounded-full bg-[#0B0B0E] border border-white/12 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 4-State Visual Feedback Strip (Standby, Listening, Thinking, Speaking) */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/8">
          {(
            [
              {
                id: NexusState.STANDBY,
                label: 'Standby',
                desc: 'Ready when you are.',
              },
              {
                id: NexusState.LISTENING,
                label: 'Listening',
                desc: 'I’m listening...',
              },
              {
                id: NexusState.THINKING,
                label: 'Thinking',
                desc: 'Give me a moment...',
              },
              {
                id: NexusState.SPEAKING,
                label: 'Speaking',
                desc: 'Here’s what I found...',
              },
            ] as const
          ).map((s) => {
            const isActive = state === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectState(s.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#121217] border-[#E11D2E]/50 text-white'
                    : 'bg-[#0B0B0E]/60 border-white/6 text-[#9A9AA6] hover:text-white'
                }`}
              >
                <div className="text-xs font-medium">{s.label}</div>
                <div className="text-[10px] text-[#9A9AA6] truncate mt-0.5">
                  {s.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
