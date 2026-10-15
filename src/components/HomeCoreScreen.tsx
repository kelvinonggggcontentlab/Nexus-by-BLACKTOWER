import React, { useState } from 'react';
import {
  Mic,
  Square,
  ChevronRight,
  FileText,
  MessageSquare,
  Maximize2,
  Clock,
  X,
  Volume2,
} from 'lucide-react';
import {
  NavTab,
  NexusState,
  ProactiveNotice,
} from '../types/nexus';
import { NexusOrb } from './NexusOrb';
import { VoiceWaveform } from './VoiceWaveform';

interface HomeCoreScreenProps {
  state: NexusState;
  orbSrc: string | null;
  orbMissing: boolean;
  audioLevel: number;
  liveTranscript: string;
  lastSpokenReply: string;
  voiceError: string | null;
  proactiveNotice: ProactiveNotice | null;
  onToggleVoice: () => void;
  onEnterFullVoice: () => void;
  onSelectStatePreview: (state: NexusState) => void;
  onTalkAboutTopic: (prompt: string) => void;
  onDismissNotice: () => void;
  onUploadOrb: (file: File) => void;
  onOrbError: () => void;
  onOrbLoad: () => void;
  onNavigate: (tab: NavTab) => void;
  onSimulateVoicePrompt: (spokenText: string) => void;
}

const CONTEXT_PROMPTS = [
  '“Got something on your mind? I’m here, Boss.”',
  '“Eh Kelvin, 今天那个架构要不要先过一遍？”',
  '“What’s on your mind? 随时直接讲。”',
  '“Wait ah, I found a connection in your workflow today.”',
];

export const HomeCoreScreen: React.FC<HomeCoreScreenProps> = ({
  state,
  orbSrc,
  orbMissing,
  audioLevel,
  liveTranscript,
  lastSpokenReply,
  voiceError,
  proactiveNotice,
  onToggleVoice,
  onEnterFullVoice,
  onSelectStatePreview,
  onTalkAboutTopic,
  onDismissNotice,
  onUploadOrb,
  onOrbError,
  onOrbLoad,
  onSimulateVoicePrompt,
}) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const isVoiceActive =
    state === NexusState.LISTENING ||
    state === NexusState.THINKING ||
    state === NexusState.PROCESSING ||
    state === NexusState.SPEAKING;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,\nKelvin.';
    if (hour < 18) return 'Good afternoon,\nKelvin.';
    return 'Good evening,\nKelvin.';
  };

  const getStateDescriptor = () => {
    switch (state) {
      case NexusState.LISTENING:
        return {
          headline: 'Listening...',
          subline: liveTranscript || 'I’m listening, Boss... Go ahead.',
        };
      case NexusState.THINKING:
      case NexusState.PROCESSING:
        return {
          headline: 'Thinking...',
          subline: liveTranscript
            ? `“${liveTranscript}”`
            : 'Give me a moment, connecting the pieces...',
        };
      case NexusState.SPEAKING:
        return {
          headline: 'NEXUS is speaking',
          subline: lastSpokenReply || 'Here’s what I found, Boss.',
        };
      case NexusState.OFFLINE:
        return {
          headline: 'Offline',
          subline: 'Connection paused. Tap Core to reconnect.',
        };
      case NexusState.ERROR:
        return {
          headline: 'Attention Needed',
          subline: voiceError || 'Voice channel interrupted. Tap to retry.',
        };
      case NexusState.STANDBY:
      default:
        return {
          headline: 'Standby',
          subline: lastSpokenReply || CONTEXT_PROMPTS[promptIndex],
        };
    }
  };

  const descriptor = getStateDescriptor();

  return (
    <div className="relative flex flex-col justify-between min-h-[calc(100vh-8.5rem)] px-5 sm:px-8 pt-2 pb-6">
      {/* Subtle Top Greeting & Proactive Intelligence Notice (fades back during active voice) */}
      <div
        className={`transition-all duration-300 ${
          isVoiceActive ? 'opacity-25 scale-[0.99]' : 'opacity-100'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white whitespace-pre-line leading-[1.15] text-balance">
              {getGreeting()}
            </h1>
            <p className="mt-2 text-sm text-[#9A9AA6]">
              Let’s make today more interesting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowQuickActions((prev) => !prev)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-white/8 bg-[#0B0B0E] hover:border-white/20 text-xs font-medium text-[#9A9AA6] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {showQuickActions ? 'Close Tools' : 'Quick Actions'}
          </button>
        </div>

        {/* Optional Quick Actions Drawer (Clean, non-intrusive) */}
        {showQuickActions && (
          <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowQuickActions(false);
                onTalkAboutTopic('Boss，帮我快速记个 Note，整理成可执行重点：');
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-[#0B0B0E] border border-white/8 hover:border-white/20 transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-white/80 mb-2" />
              <span className="text-xs font-medium text-white">New Note</span>
              <span className="text-[11px] text-[#9A9AA6] mt-0.5">Quick capture</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickActions(false);
                onSimulateVoicePrompt('Eh NEXUS, 帮我挑战一下我现在的业务假设，哪里有漏洞？');
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-[#0B0B0E] border border-white/8 hover:border-white/20 transition-colors text-left"
            >
              <MessageSquare className="w-4 h-4 text-[#E11D2E] mb-2" />
              <span className="text-xs font-medium text-white">Ask NEXUS</span>
              <span className="text-[11px] text-[#9A9AA6] mt-0.5">Voice challenge</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickActions(false);
                onTalkAboutTopic('帮我分析一下今天手上的任务优先级，砍掉不必要的步骤。');
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-[#0B0B0E] border border-white/8 hover:border-white/20 transition-colors text-left"
            >
              <Maximize2 className="w-4 h-4 text-white/80 mb-2" />
              <span className="text-xs font-medium text-white">Audit Workflow</span>
              <span className="text-[11px] text-[#9A9AA6] mt-0.5">Simplify & automate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickActions(false);
                onTalkAboutTopic('提醒我今晚 9 点复盘 NEXUS 语音交互跟 Memory 的连接。');
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-[#0B0B0E] border border-white/8 hover:border-white/20 transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-white/80 mb-2" />
              <span className="text-xs font-medium text-white">Remind Me</span>
              <span className="text-[11px] text-[#9A9AA6] mt-0.5">Set context trigger</span>
            </button>
          </div>
        )}
      </div>

      {/* CENTER: Dominant NEXUS CORE with Generous Negative Space */}
      <div className="my-auto py-8 flex flex-col items-center justify-center">
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

        {/* Contextual State & Acoustic Waveform */}
        <div className="mt-8 flex flex-col items-center text-center max-w-md mx-auto">
          {isVoiceActive && (
            <div className="mb-2">
              <VoiceWaveform state={state} audioLevel={audioLevel} />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#9A9AA6]">
            <span>{descriptor.headline}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onEnterFullVoice}
              className="text-white/80 hover:text-white underline underline-offset-4 transition-colors"
            >
              Immersive Voice
            </button>
          </div>

          {/* Primary Voice Action Trigger */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`min-h-[48px] px-6 py-3 rounded-full flex items-center gap-2.5 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                state === NexusState.LISTENING
                  ? 'bg-[#E11D2E] text-white shadow-[0_0_30px_rgba(225,29,46,0.45)]'
                  : state === NexusState.SPEAKING
                  ? 'bg-white/12 text-white border border-white/20 hover:bg-white/18'
                  : 'bg-[#121217] text-white border border-white/12 hover:border-[#E11D2E]/60'
              }`}
            >
              {state === NexusState.LISTENING ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Done speaking</span>
                </>
              ) : state === NexusState.SPEAKING ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#E11D2E]" />
                  <span>Interrupt & talk</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#E11D2E]" />
                  <span>Tap to talk</span>
                </>
              )}
            </button>
          </div>

          {/* Contextual Dialogue / Prompt Line */}
          <div className="mt-5 px-5 py-3.5 rounded-2xl bg-[#0B0B0E]/90 border border-white/7 max-w-sm w-full">
            <p className="text-sm text-white/90 leading-relaxed">
              {descriptor.subline}
            </p>
            {state === NexusState.STANDBY && !lastSpokenReply && (
              <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-[#9A9AA6]">
                <button
                  type="button"
                  onClick={() =>
                    setPromptIndex((i) => (i + 1) % CONTEXT_PROMPTS.length)
                  }
                  className="hover:text-white transition-colors"
                >
                  Next prompt
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() =>
                    onSimulateVoicePrompt(
                      'Eh NEXUS, 帮我看看今天最重要的一件事是什么？不要废话。'
                    )
                  }
                  className="text-white/75 hover:text-white transition-colors"
                >
                  Test voice turn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: Quiet State Bar & Proactive Intelligence Notification */}
      <div className="space-y-3 max-w-xl mx-auto w-full">
        {/* Proactive Notification (NEXUS initiates useful conversation) */}
        {proactiveNotice && !proactiveNotice.dismissed && !isVoiceActive && (
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-[#0B0B0E] border border-white/8 hover:border-white/18 transition-colors">
            <button
              type="button"
              onClick={() => onTalkAboutTopic(proactiveNotice.talkPrompt)}
              className="flex-1 flex items-center justify-between gap-3 text-left min-w-0 cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-[#9A9AA6]">
                  <span className="font-medium text-white">NEXUS</span>
                  <span aria-hidden="true">·</span>
                  <span>{proactiveNotice.timeAgo}</span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-white truncate">
                  {proactiveNotice.title}
                </p>
                <p className="text-xs text-[#9A9AA6] truncate mt-0.5">
                  {proactiveNotice.preview}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
            </button>
            <button
              type="button"
              onClick={onDismissNotice}
              aria-label="Dismiss notification"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#9A9AA6] hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quiet Interactive Voice State Selector (Allows inspecting Standby, Listening, Thinking, Speaking) */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/6">
          {(
            [
              { state: NexusState.STANDBY, label: 'Standby', hint: 'Ready' },
              { state: NexusState.LISTENING, label: 'Listening', hint: 'Voice in' },
              { state: NexusState.THINKING, label: 'Thinking', hint: 'Reasoning' },
              { state: NexusState.SPEAKING, label: 'Speaking', hint: 'Voice out' },
            ] as const
          ).map((item) => {
            const active = state === item.state;
            return (
              <button
                key={item.state}
                type="button"
                onClick={() => onSelectStatePreview(item.state)}
                className={`flex-1 min-h-[44px] py-2 px-2 rounded-xl text-center transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-[#9A9AA6] hover:text-white hover:bg-white/4'
                }`}
              >
                <div className="text-xs font-medium whitespace-nowrap">
                  {item.label}
                </div>
                <div className="text-[10px] text-[#9A9AA6] truncate">
                  {item.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
