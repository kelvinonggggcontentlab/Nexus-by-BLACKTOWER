import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Compass,
  Home,
  MessageSquare,
  Mic,
  Settings,
} from 'lucide-react';
import {
  ChatMessage,
  DiscoveryItem,
  MemoryEntry,
  NavTab,
  NexusSettings,
  NexusState,
  ProactiveNotice,
} from './types/nexus';
import {
  INITIAL_DISCOVERIES,
  INITIAL_MEMORIES,
  INITIAL_MESSAGES,
  INITIAL_PROACTIVE_NOTICE,
  INITIAL_SETTINGS,
} from './data/initialNexusData';
import { HomeCoreScreen } from './components/HomeCoreScreen';
import { VoiceSessionScreen } from './components/VoiceSessionScreen';
import { ChatScreen } from './components/ChatScreen';
import { RadarDiscoverScreen } from './components/RadarDiscoverScreen';
import { SettingsSystemScreen } from './components/SettingsSystemScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.CORE);
  const [nexusState, setNexusState] = useState<NexusState>(NexusState.STANDBY);

  // Official orb.png Asset State (Source of Truth)
  const [orbSrc, setOrbSrc] = useState<string | null>('/orb.png');
  const [orbMissing, setOrbMissing] = useState<boolean>(false);

  // Conversation, Discoveries, Memory & Settings State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_messages_v2');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_discoveries_v2');
      return saved ? JSON.parse(saved) : INITIAL_DISCOVERIES;
    } catch {
      return INITIAL_DISCOVERIES;
    }
  });

  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_memories_v2');
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [settings, setSettings] = useState<NexusSettings>(() => {
    try {
      const saved = localStorage.getItem('nexus_settings_v2');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [proactiveNotice, setProactiveNotice] =
    useState<ProactiveNotice | null>(INITIAL_PROACTIVE_NOTICE);

  // Voice & Audio Reactivity State
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastSpokenReply, setLastSpokenReply] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] =
    useState<boolean>(false);

  // Refs for Web Audio, MediaRecorder & SpeechRecognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem('nexus_messages_v2', JSON.stringify(messages));
    } catch {
      // ignore storage quota errors
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_discoveries_v2', JSON.stringify(discoveries));
    } catch {
      // ignore
    }
  }, [discoveries]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_memories_v2', JSON.stringify(memories));
    } catch {
      // ignore
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_settings_v2', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Check if official /orb.png exists on server or in localStorage
  useEffect(() => {
    const cachedOrb = localStorage.getItem('nexus_official_orb_dataurl');
    if (cachedOrb) {
      setOrbSrc(cachedOrb);
      setOrbMissing(false);
    }
    fetch('/api/nexus/orb-status')
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) {
          setOrbSrc('/orb.png');
          setOrbMissing(false);
        } else if (!cachedOrb) {
          setOrbMissing(true);
        }
      })
      .catch(() => {
        if (!cachedOrb) setOrbMissing(true);
      });
  }, []);

  const handleUploadOrb = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) return;
      try {
        localStorage.setItem('nexus_official_orb_dataurl', dataUrl);
      } catch {
        // ignore quota
      }
      setOrbSrc(dataUrl);
      setOrbMissing(false);

      try {
        const res = await fetch('/api/nexus/orb-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        });
        if (res.ok) {
          setOrbSrc(`/orb.png?t=${Date.now()}`);
          setOrbMissing(false);
        }
      } catch {
        // local dataUrl already active
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const stopActivePlayback = useCallback(() => {
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    stopAudioMeter();
  }, [stopAudioMeter]);

  // Play WAV base64 from Gemini 3.8 TTS with reactive audio level meter
  const playWavBase64 = useCallback(
    async (base64Wav: string) => {
      stopActivePlayback();
      setNexusState(NexusState.SPEAKING);

      try {
        const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
        activeAudioElementRef.current = audio;

        const AudioCtx =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioCtx();
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          analyser.connect(ctx.destination);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateOutputMeter = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length / 255;
            setAudioLevel(Math.min(1, avg * 2.2));
            animFrameRef.current = requestAnimationFrame(updateOutputMeter);
          };
          animFrameRef.current = requestAnimationFrame(updateOutputMeter);
        }

        audio.onended = () => {
          stopAudioMeter();
          setNexusState(NexusState.STANDBY);
          activeAudioElementRef.current = null;
        };

        audio.onerror = () => {
          stopAudioMeter();
          setNexusState(NexusState.STANDBY);
          activeAudioElementRef.current = null;
        };

        await audio.play();
      } catch {
        stopAudioMeter();
        setNexusState(NexusState.STANDBY);
      }
    },
    [stopActivePlayback, stopAudioMeter]
  );

  const formatNowTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Process a completed voice turn (either recorded audio blob or spoken transcript)
  const submitVoiceTurn = useCallback(
    async (params: {
      audioBase64?: string;
      mimeType?: string;
      transcript?: string;
    }) => {
      setNexusState(NexusState.THINKING);
      setVoiceError(null);

      try {
        const res = await fetch('/api/nexus/voice-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...params,
            history: messages.slice(-6),
            memories,
            voiceName: settings.voiceName,
            languageMode: settings.languageMode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Voice turn failed');
        }

        const userMsg: ChatMessage = {
          id: `msg-${Date.now()}-u`,
          role: 'user',
          content: data.transcript,
          timestamp: formatNowTime(),
          isVoice: true,
        };

        const nexusMsg: ChatMessage = {
          id: `msg-${Date.now()}-n`,
          role: 'nexus',
          content: data.replyText,
          timestamp: formatNowTime(),
          isVoice: true,
        };

        setMessages((prev) => [...prev, userMsg, nexusMsg]);
        setLastSpokenReply(data.replyText);
        setLiveTranscript('');

        if (data.audioWavBase64 && settings.autoSpeakVoiceReplies) {
          await playWavBase64(data.audioWavBase64);
        } else {
          setNexusState(NexusState.STANDBY);
        }
      } catch (err: any) {
        setVoiceError(err?.message || 'Unable to process voice turn');
        setNexusState(NexusState.ERROR);
      }
    },
    [
      messages,
      memories,
      settings.voiceName,
      settings.languageMode,
      settings.autoSpeakVoiceReplies,
      playWavBase64,
    ]
  );

  // Start capturing real microphone voice input
  const startListening = useCallback(async () => {
    stopActivePlayback();
    setVoiceError(null);
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setNexusState(NexusState.LISTENING);

      // Web Audio API analyser for real-time voice level around NEXUS Core
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMicMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          setAudioLevel(Math.min(1, avg * 2.5));
          animFrameRef.current = requestAnimationFrame(updateMicMeter);
        };
        animFrameRef.current = requestAnimationFrame(updateMicMeter);
      }

      // Optional live browser SpeechRecognition for instant visual feedback
      const SpeechRec =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'zh-MY';
          recognition.onresult = (event: any) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript;
            }
            if (text.trim()) {
              liveTranscriptRef.current = text.trim();
              setLiveTranscript(text.trim());
            }
          };
          recognition.start();
          speechRecRef.current = recognition;
        } catch {
          // Fallback to pure Gemini 3.5 Transcribe via MediaRecorder
        }
      }

      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        stopAudioMeter();

        if (speechRecRef.current) {
          try {
            speechRecRef.current.stop();
          } catch {
            // ignore
          }
          speechRecRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl ? dataUrl.split(',')[1] : '';
          submitVoiceTurn({
            audioBase64: base64,
            mimeType: recorder.mimeType || 'audio/webm',
            transcript: liveTranscriptRef.current || undefined,
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
    } catch {
      // If microphone permission is blocked in iframe preview, run a realistic voice simulation turn or inform Kelvin cleanly
      setVoiceError(
        'Microphone access unavailable in this browser frame. Running simulated voice turn...'
      );
      submitVoiceTurn({
        transcript: 'Eh NEXUS, 帮我看看今天最重要的一件事是什么？直接讲重点。',
      });
    }
  }, [stopActivePlayback, stopAudioMeter, submitVoiceTurn]);

  const stopListeningAndProcess = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else {
      stopAudioMeter();
      setNexusState(NexusState.STANDBY);
    }
  }, [stopAudioMeter]);

  const handleToggleVoice = useCallback(() => {
    if (nexusState === NexusState.LISTENING) {
      stopListeningAndProcess();
    } else if (nexusState === NexusState.SPEAKING) {
      stopActivePlayback();
      startListening();
    } else {
      startListening();
    }
  }, [
    nexusState,
    startListening,
    stopListeningAndProcess,
    stopActivePlayback,
  ]);

  const handleSendMessage = useCallback(
    async (content: string, useLiveSearch = false) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content,
        timestamp: formatNowTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsSendingChat(true);
      setNexusState(NexusState.THINKING);

      try {
        const res = await fetch('/api/nexus/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.slice(-10),
            memories,
            languageMode: settings.languageMode,
            voiceStyle: settings.personalityProfile,
            useLiveSearch,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Chat request failed');
        }

        const nexusMsg: ChatMessage = {
          id: `msg-${Date.now()}-n`,
          role: 'nexus',
          content: data.reply,
          timestamp: formatNowTime(),
          analysisCard: data.analysisCard || null,
          sources: data.sources || [],
        };

        setMessages((prev) => [...prev, nexusMsg]);
        setLastSpokenReply(data.reply);

        if (
          data.extractedMemory &&
          typeof data.extractedMemory === 'string' &&
          data.extractedMemory.trim().length > 5
        ) {
          setMemories((prev) => [
            {
              id: `mem-${Date.now()}`,
              category: 'CONTEXT',
              content: data.extractedMemory.trim(),
              updatedAt: 'Just now',
            },
            ...prev,
          ]);
        }

        setNexusState(NexusState.STANDBY);
      } catch (err: any) {
        const errMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'nexus',
          content: `Boss，刚刚连接断了一下（${err?.message || 'Error'}）。再发一次给我。`,
          timestamp: formatNowTime(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setNexusState(NexusState.ERROR);
      } finally {
        setIsSendingChat(false);
      }
    },
    [messages, memories, settings.languageMode, settings.personalityProfile]
  );

  const handleSpeakText = useCallback(
    async (text: string) => {
      try {
        setNexusState(NexusState.PROCESSING);
        const res = await fetch('/api/nexus/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: settings.voiceName,
          }),
        });
        const data = await res.json();
        if (data.audioWavBase64) {
          await playWavBase64(data.audioWavBase64);
        } else {
          setNexusState(NexusState.STANDBY);
        }
      } catch {
        setNexusState(NexusState.STANDBY);
      }
    },
    [settings.voiceName, playWavBase64]
  );

  const handleTalkAboutTopic = useCallback(
    (prompt: string) => {
      setActiveTab(NavTab.CHAT);
      handleSendMessage(prompt, false);
    },
    [handleSendMessage]
  );

  const handleTalkAboutDiscovery = useCallback(
    (discovery: DiscoveryItem) => {
      setActiveTab(NavTab.CHAT);
      handleSendMessage(discovery.talkPrompt, false);
    },
    [handleSendMessage]
  );

  const handleToggleSaveDiscovery = useCallback((id: string) => {
    setDiscoveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, saved: !d.saved } : d))
    );
  }, []);

  const handleGenerateNewDiscovery = useCallback(
    async (category: 'For You' | 'AI' | 'Business' | 'Science') => {
      setIsGeneratingDiscovery(true);
      try {
        const res = await fetch('/api/nexus/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            memories,
            existingTitles: discoveries.map((d) => d.title),
          }),
        });
        const data = await res.json();
        if (res.ok && data.discovery) {
          const newItem: DiscoveryItem = {
            id: `disc-${Date.now()}`,
            filterGroup: category,
            categoryLabel: data.discovery.categoryLabel || 'INTELLIGENCE',
            timeAgo: 'Just now',
            title: data.discovery.title,
            shortInsight: data.discovery.shortInsight,
            nexusTake: data.discovery.nexusTake,
            imageUrl:
              category === 'Science'
                ? '/src/assets/images/discovery_neural_recovery_1792051692970.jpg'
                : '/src/assets/images/discovery_agentic_skyline_1792051692786.jpg',
            talkPrompt: data.discovery.talkPrompt,
          };
          setDiscoveries((prev) => [newItem, ...prev]);
        }
      } catch {
        // ignore transient discovery error
      } finally {
        setIsGeneratingDiscovery(false);
      }
    },
    [memories, discoveries]
  );

  const handleSelectStatePreview = useCallback(
    (targetState: NexusState) => {
      stopActivePlayback();
      setNexusState(targetState);
      if (
        targetState === NexusState.LISTENING ||
        targetState === NexusState.SPEAKING
      ) {
        setAudioLevel(0.45);
      } else {
        setAudioLevel(0);
      }
    },
    [stopActivePlayback]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col selection:bg-[#E11D2E]/30 selection:text-white">
      {/* TOP BAR CONTRACT: 1-Row, 3-Zone Header (Brand Wordmark — 5 Single-Line Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 h-14 px-5 sm:px-8 bg-[#050505]/85 backdrop-blur-md border-b border-white/7 flex items-center justify-between gap-8">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#core"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(NavTab.CORE);
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          NEXUS <span className="font-normal text-xs text-[#9A9AA6]">by BLACKTOWER™</span>
        </a>

        {/* Zone 2: Desktop Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#9A9AA6]">
          {(
            [
              { id: NavTab.CORE, label: 'Core' },
              { id: NavTab.VOICE, label: 'Voice' },
              { id: NavTab.CHAT, label: 'Chat' },
              { id: NavTab.RADAR, label: 'Radar' },
              { id: NavTab.SETTINGS, label: 'Settings' },
            ] as const
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => setActiveTab(nav.id)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === nav.id
                  ? 'text-white underline underline-offset-8 decoration-[#E11D2E] decoration-2'
                  : 'hover:text-white'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab(NavTab.VOICE);
              if (nexusState !== NexusState.LISTENING) {
                startListening();
              }
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#E11D2E] hover:bg-[#DC2626] text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Talk to NEXUS
          </button>
        </div>
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 w-full max-w-6xl mx-auto pb-16">
        {activeTab === NavTab.CORE && (
          <HomeCoreScreen
            state={nexusState}
            orbSrc={orbSrc}
            orbMissing={orbMissing}
            audioLevel={audioLevel}
            liveTranscript={liveTranscript}
            lastSpokenReply={lastSpokenReply}
            voiceError={voiceError}
            proactiveNotice={
              settings.smartProactiveAlerts ? proactiveNotice : null
            }
            onToggleVoice={handleToggleVoice}
            onEnterFullVoice={() => setActiveTab(NavTab.VOICE)}
            onSelectStatePreview={handleSelectStatePreview}
            onTalkAboutTopic={handleTalkAboutTopic}
            onDismissNotice={() =>
              setProactiveNotice((prev) =>
                prev ? { ...prev, dismissed: true } : null
              )
            }
            onUploadOrb={handleUploadOrb}
            onOrbError={() => setOrbMissing(true)}
            onOrbLoad={() => setOrbMissing(false)}
            onNavigate={setActiveTab}
            onSimulateVoicePrompt={(spokenText) =>
              submitVoiceTurn({ transcript: spokenText })
            }
          />
        )}

        {activeTab === NavTab.VOICE && (
          <VoiceSessionScreen
            state={nexusState}
            orbSrc={orbSrc}
            orbMissing={orbMissing}
            audioLevel={audioLevel}
            liveTranscript={liveTranscript}
            lastSpokenReply={lastSpokenReply}
            onToggleVoice={handleToggleVoice}
            onPauseResumeVoice={stopActivePlayback}
            onSelectState={handleSelectStatePreview}
            onExitVoiceMode={() => {
              stopActivePlayback();
              setNexusState(NexusState.STANDBY);
              setActiveTab(NavTab.CORE);
            }}
            onSimulateVoiceTurn={(spokenText) =>
              submitVoiceTurn({ transcript: spokenText })
            }
            onUploadOrb={handleUploadOrb}
            onOrbError={() => setOrbMissing(true)}
            onOrbLoad={() => setOrbMissing(false)}
          />
        )}

        {activeTab === NavTab.CHAT && (
          <ChatScreen
            messages={messages}
            state={nexusState}
            isSending={isSendingChat}
            onSendMessage={handleSendMessage}
            onStartVoiceFromChat={() => {
              setActiveTab(NavTab.VOICE);
              startListening();
            }}
            onSpeakMessage={handleSpeakText}
          />
        )}

        {activeTab === NavTab.RADAR && (
          <RadarDiscoverScreen
            discoveries={discoveries}
            isGenerating={isGeneratingDiscovery}
            onTalkAboutDiscovery={handleTalkAboutDiscovery}
            onToggleSaveDiscovery={handleToggleSaveDiscovery}
            onGenerateNewDiscovery={handleGenerateNewDiscovery}
            onSpeakDiscovery={handleSpeakText}
          />
        )}

        {activeTab === NavTab.SETTINGS && (
          <SettingsSystemScreen
            settings={settings}
            memories={memories}
            orbSrc={orbSrc}
            orbMissing={orbMissing}
            onUpdateSettings={(partial) =>
              setSettings((prev) => ({ ...prev, ...partial }))
            }
            onAddMemory={(category, content) =>
              setMemories((prev) => [
                {
                  id: `mem-${Date.now()}`,
                  category,
                  content,
                  updatedAt: 'Just now',
                },
                ...prev,
              ])
            }
            onRemoveMemory={(id) =>
              setMemories((prev) => prev.filter((m) => m.id !== id))
            }
            onUploadOrb={handleUploadOrb}
            onOrbError={() => setOrbMissing(true)}
            onOrbLoad={() => setOrbMissing(false)}
          />
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR (Mobile-first Ergonomic Thumb Zone: Core, Voice, Chat, Radar, Settings) */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#050505]/92 backdrop-blur-md border-t border-white/8 grid grid-cols-5 items-center max-w-6xl mx-auto px-2"
      >
        {(
          [
            { id: NavTab.CORE, label: 'Core', icon: Home },
            { id: NavTab.VOICE, label: 'Voice', icon: Mic },
            { id: NavTab.CHAT, label: 'Chat', icon: MessageSquare },
            { id: NavTab.RADAR, label: 'Radar', icon: Compass },
            { id: NavTab.SETTINGS, label: 'Settings', icon: Settings },
          ] as const
        ).map((item) => {
          const IconComponent = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                active ? 'text-[#E11D2E]' : 'text-[#9A9AA6] hover:text-white'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
