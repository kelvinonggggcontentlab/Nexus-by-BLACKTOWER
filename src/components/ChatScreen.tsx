import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart2,
  ChevronRight,
  Globe,
  Mic,
  Plus,
  Send,
  Volume2,
  X,
} from 'lucide-react';
import { AnalysisCardData, ChatMessage, NexusState } from '../types/nexus';

interface ChatScreenProps {
  messages: ChatMessage[];
  state: NexusState;
  isSending: boolean;
  onSendMessage: (content: string, useLiveSearch: boolean) => void;
  onStartVoiceFromChat: () => void;
  onSpeakMessage: (text: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  state,
  isSending,
  onSendMessage,
  onStartVoiceFromChat,
  onSpeakMessage,
}) => {
  const [input, setInput] = useState('');
  const [useLiveSearch, setUseLiveSearch] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisCardData | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed, useLiveSearch);
    setInput('');
    setShowQuickPrompts(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto px-4 sm:px-6">
      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[76%] px-4 py-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#9E1B24] text-white rounded-br-xs'
                    : 'bg-[#121217] border border-white/8 text-[#F5F5F7] rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Metadata Footer */}
                <div
                  className={`mt-2 flex items-center justify-end gap-2.5 text-[11px] ${
                    isUser ? 'text-white/70' : 'text-[#9A9AA6]'
                  }`}
                >
                  {msg.isVoice && <span>Voice</span>}
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => onSpeakMessage(msg.content)}
                      className="inline-flex items-center gap-1 text-[#9A9AA6] hover:text-white transition-colors cursor-pointer"
                      title="Read aloud with NEXUS voice"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                  <span className="font-mono-tabular">{msg.timestamp}</span>
                </div>
              </div>

              {/* Optional Grounding Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9A9AA6] max-w-[85%]">
                  <span>Verified sources:</span>
                  {msg.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white underline underline-offset-2 truncate max-w-[200px]"
                    >
                      {src.title || src.uri}
                    </a>
                  ))}
                </div>
              )}

              {/* Optional Structured Executive Analysis Card */}
              {msg.analysisCard && (
                <button
                  type="button"
                  onClick={() => setActiveAnalysis(msg.analysisCard || null)}
                  className="mt-2.5 w-full max-w-[85%] sm:max-w-[76%] flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0B0B0E] border border-white/10 hover:border-[#E11D2E]/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E11D2E]/12 border border-[#E11D2E]/30 flex items-center justify-center shrink-0">
                      <BarChart2 className="w-5 h-5 text-[#E11D2E]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-white font-mono-tabular truncate">
                        {msg.analysisCard.title}
                      </div>
                      <div className="text-xs text-[#9A9AA6] mt-0.5">
                        {msg.analysisCard.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
                </button>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start">
            <div className="px-4 py-3 rounded-2xl bg-[#121217] border border-white/8 text-xs text-[#9A9AA6]">
              NEXUS 正在整理思路...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Analysis Drawer Modal */}
      {activeAnalysis && (
        <div className="mb-3 p-5 rounded-2xl bg-[#0B0B0E] border border-white/15">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/8">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono-tabular">
                {activeAnalysis.title}
              </h3>
              <p className="text-xs text-[#9A9AA6] mt-0.5">
                {activeAnalysis.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAnalysis(null)}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#9A9AA6] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5 space-y-2.5">
            {activeAnalysis.points.map((pt, i) => (
              <p key={i} className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {pt}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Optional Quick Strategic Prompts */}
      {showQuickPrompts && (
        <div className="mb-2.5 p-3 rounded-2xl bg-[#0B0B0E] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9A9AA6] px-1">
            <span>Executive Prompts</span>
            <button
              type="button"
              onClick={() => setUseLiveSearch((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                useLiveSearch
                  ? 'border-[#E11D2E]/50 bg-[#E11D2E]/15 text-white'
                  : 'border-white/10 text-[#9A9AA6] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{useLiveSearch ? 'Live Web Search: ON' : 'Live Web Search: OFF'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              '帮我拆解这个项目的 ROI 和最大风险',
              '这个 workflow 太 manual，怎样 automate？',
              '挑战一下我现在的决定，有什么盲点？',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSendMessage(q, useLiveSearch);
                  setShowQuickPrompts(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#121217] hover:bg-white/10 text-xs text-white/85 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Composer Bar */}
      <form
        onSubmit={handleSubmit}
        className="pt-2 pb-3 flex items-center gap-2.5"
      >
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0B0B0E] border border-white/10 focus-within:border-white/25 transition-colors">
          <button
            type="button"
            onClick={() => setShowQuickPrompts((prev) => !prev)}
            aria-label="Toggle quick actions and live search"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              showQuickPrompts || useLiveSearch
                ? 'bg-white/15 text-white'
                : 'text-[#9A9AA6] hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useLiveSearch
                ? 'Ask NEXUS (with live web verification)...'
                : 'Type a message...'
            }
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5E5E6A] focus:outline-none min-w-0"
          />

          {input.trim() && (
            <button
              type="submit"
              disabled={isSending}
              aria-label="Send message"
              className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Voice Trigger Button */}
        <button
          type="button"
          onClick={onStartVoiceFromChat}
          aria-label="Switch to voice conversation"
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            state === NexusState.LISTENING
              ? 'bg-[#E11D2E] text-white shadow-[0_0_24px_rgba(225,29,46,0.5)]'
              : 'bg-[#E11D2E] hover:bg-[#DC2626] text-white shadow-[0_0_16px_rgba(225,29,46,0.3)]'
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
