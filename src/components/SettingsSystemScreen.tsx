import React, { useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Database,
  Link2,
  Mic,
  Palette,
  Plus,
  Trash2,
  User,
  Info,
  X,
} from 'lucide-react';
import { MemoryEntry, NexusSettings, NexusState } from '../types/nexus';
import { NexusOrb } from './NexusOrb';

interface SettingsSystemScreenProps {
  settings: NexusSettings;
  memories: MemoryEntry[];
  orbSrc: string | null;
  orbMissing: boolean;
  onUpdateSettings: (partial: Partial<NexusSettings>) => void;
  onAddMemory: (category: MemoryEntry['category'], content: string) => void;
  onRemoveMemory: (id: string) => void;
  onUploadOrb: (file: File) => void;
  onOrbError: () => void;
  onOrbLoad: () => void;
}

export const SettingsSystemScreen: React.FC<SettingsSystemScreenProps> = ({
  settings,
  memories,
  orbSrc,
  orbMissing,
  onUpdateSettings,
  onAddMemory,
  onRemoveMemory,
  onUploadOrb,
  onOrbError,
  onOrbLoad,
}) => {
  const [activeSheet, setActiveSheet] = useState<
    null | 'voice' | 'personality' | 'memory' | 'tools' | 'orb'
  >(null);
  const [newMemContent, setNewMemContent] = useState('');
  const [newMemCategory, setNewMemCategory] =
    useState<MemoryEntry['category']>('PROJECT');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const languageSummary =
    settings.languageMode === 'jb-mix'
      ? '中文 (70%) · English · Malay'
      : settings.languageMode === 'zh-dominant'
      ? '中文为主 · English terms'
      : 'English · Manglish';

  const activeToolsList = Object.entries(settings.connectedTools)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(' · ');

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemContent.trim()) return;
    onAddMemory(newMemCategory, newMemContent.trim());
    setNewMemContent('');
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-2 pb-12 space-y-6">
      {/* Top NEXUS Core Identity Row */}
      <button
        type="button"
        onClick={() => setActiveSheet('orb')}
        className="w-full p-4 rounded-2xl bg-[#0B0B0E] border border-white/10 hover:border-white/20 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <NexusOrb
            state={NexusState.STANDBY}
            orbSrc={orbSrc}
            orbMissing={orbMissing}
            audioLevel={0}
            size="sm"
            onImageError={onOrbError}
            onImageLoad={onOrbLoad}
          />
          <div>
            <div className="text-base font-semibold text-white">NEXUS</div>
            <div className="text-xs text-[#9A9AA6] mt-0.5">
              Online · Gemini 3.8
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#9A9AA6]" />
      </button>

      {/* PERSONALIZATION */}
      <section>
        <h2 className="text-xs font-medium text-[#9A9AA6] mb-2.5 px-1">
          Personalization
        </h2>
        <div className="rounded-2xl bg-[#0B0B0E] border border-white/10 divide-y divide-white/7 overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveSheet('voice')}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/4 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Voice & Language
                </div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  {languageSummary} · Voice: {settings.voiceName}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSheet('personality')}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/4 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Personality
                </div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  {settings.personalityProfile}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSheet('memory')}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/4 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Memory & Context
                </div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  Your preferences and history ({memories.length} active)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
          </button>
        </div>
      </section>

      {/* SYSTEM */}
      <section>
        <h2 className="text-xs font-medium text-[#9A9AA6] mb-2.5 px-1">
          System
        </h2>
        <div className="rounded-2xl bg-[#0B0B0E] border border-white/10 divide-y divide-white/7 overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveSheet('tools')}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/4 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Connected Tools
                </div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  {activeToolsList || 'No tools connected'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9A9AA6] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                smartProactiveAlerts: !settings.smartProactiveAlerts,
              })
            }
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/4 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Notifications
                </div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  {settings.smartProactiveAlerts
                    ? 'Smart updates only'
                    : 'Paused'}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-white/80">
              {settings.smartProactiveAlerts ? 'On' : 'Off'}
            </span>
          </button>

          <div className="w-full px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Appearance</div>
                <div className="text-xs text-[#9A9AA6] mt-0.5">
                  Dark · BLACKTOWER
                </div>
              </div>
            </div>
            <span className="text-xs text-[#9A9AA6]">Locked</span>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section>
        <h2 className="text-xs font-medium text-[#9A9AA6] mb-2.5 px-1">
          About
        </h2>
        <div className="rounded-2xl bg-[#0B0B0E] border border-white/10 overflow-hidden">
          <div className="w-full px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Version</div>
                <div className="text-xs text-[#9A9AA6] font-mono-tabular mt-0.5">
                  NEXUS v2.0.0
                </div>
              </div>
            </div>
            <span className="text-xs text-[#9A9AA6]">BLACKTOWER™</span>
          </div>
        </div>
      </section>

      {/* ACTIVE CONFIGURATION SHEET / MODAL */}
      {activeSheet && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B0B0E] border border-white/15 p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h3 className="text-base font-semibold text-white">
                {activeSheet === 'voice' && 'Voice & Language Calibration'}
                {activeSheet === 'personality' && 'NEXUS Personality Directive'}
                {activeSheet === 'memory' && 'Kelvin’s Context & Memory Vault'}
                {activeSheet === 'tools' && 'Connected Executive Tools'}
                {activeSheet === 'orb' && 'Official NEXUS Core Asset (orb.png)'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#9A9AA6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SHEET: ORB ASSET */}
            {activeSheet === 'orb' && (
              <div className="mt-4 space-y-4">
                <p className="text-xs sm:text-sm text-[#9A9AA6] leading-relaxed">
                  The NEXUS Core is strictly represented by the official{' '}
                  <span className="font-mono-tabular text-white">orb.png</span>{' '}
                  source-of-truth artwork. It is never converted to SVG or
                  replaced with generated graphics.
                </p>

                <div className="p-4 rounded-2xl bg-[#121217] border border-white/8 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">
                      Asset Status
                    </div>
                    <div className="text-xs text-[#9A9AA6] mt-0.5 font-mono-tabular">
                      {orbMissing
                        ? 'NEXUS Orb asset missing: orb.png'
                        : 'Loaded: /orb.png (Official PNG)'}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadOrb(f);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#E11D2E] hover:bg-[#DC2626] text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    Upload orb.png
                  </button>
                </div>
              </div>
            )}

            {/* SHEET: VOICE & LANGUAGE */}
            {activeSheet === 'voice' && (
              <div className="mt-4 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#9A9AA6] mb-2">
                    Communication Ratio
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'jb-mix',
                        title: 'Johor Bahru Natural Mix (Default)',
                        desc: 'Chinese 70% · English 15% · Malay/Manglish 15%',
                      },
                      {
                        id: 'zh-dominant',
                        title: 'Malaysian Chinese Dominant',
                        desc: 'Chinese 85% · English Executive Terms 15%',
                      },
                      {
                        id: 'en-dominant',
                        title: 'Executive English + Manglish',
                        desc: 'English 80% · Local Cadence 20%',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            languageMode: opt.id as NexusSettings['languageMode'],
                          })
                        }
                        className={`w-full p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                          settings.languageMode === opt.id
                            ? 'bg-[#121217] border-[#E11D2E]/60 text-white'
                            : 'bg-[#121217]/50 border-white/8 text-[#9A9AA6]'
                        }`}
                      >
                        <div className="text-sm font-medium text-white">
                          {opt.title}
                        </div>
                        <div className="text-xs text-[#9A9AA6] mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9A9AA6] mb-2">
                    Gemini 3.8 Speech Voice
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['Kore', 'Zephyr', 'Fenrir', 'Charon', 'Puck'] as const).map(
                      (v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => onUpdateSettings({ voiceName: v })}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            settings.voiceName === v
                              ? 'bg-[#E11D2E] border-[#E11D2E] text-white'
                              : 'bg-[#121217] border-white/8 text-[#9A9AA6] hover:text-white'
                          }`}
                        >
                          {v}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SHEET: PERSONALITY */}
            {activeSheet === 'personality' && (
              <div className="mt-4 space-y-2.5">
                {[
                  {
                    label: 'Calm · Sharp · Proactive',
                    desc: 'Balanced executive companion. Calls out weak ideas directly and surfaces connections.',
                  },
                  {
                    label: 'Direct · Challenger · ROI-First',
                    desc: 'Aggressive filtering. Challenges assumptions immediately and cuts manual workflows.',
                  },
                  {
                    label: 'Observant · Strategic · Deep Thinker',
                    desc: 'Focuses on long-term positioning, architectural simplicity, and pattern recognition.',
                  },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ personalityProfile: p.label })
                    }
                    className={`w-full p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                      settings.personalityProfile === p.label
                        ? 'bg-[#121217] border-[#E11D2E]/60 text-white'
                        : 'bg-[#121217]/50 border-white/8 text-[#9A9AA6]'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">
                      {p.label}
                    </div>
                    <div className="text-xs text-[#9A9AA6] mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* SHEET: MEMORY & CONTEXT */}
            {activeSheet === 'memory' && (
              <div className="mt-4 space-y-4">
                <form onSubmit={handleAddMemorySubmit} className="space-y-2.5">
                  <div className="flex gap-2">
                    {(
                      ['PROJECT', 'PREFERENCE', 'WORKFLOW', 'CONTEXT'] as const
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewMemCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          newMemCategory === cat
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'border-white/8 text-[#9A9AA6]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMemContent}
                      onChange={(e) => setNewMemContent(e.target.value)}
                      placeholder="Add context for NEXUS to remember..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#121217] border border-white/10 text-xs sm:text-sm text-white placeholder-[#5E5E6A] focus:outline-none focus:border-white/25"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#E11D2E] text-white text-xs font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#121217] border border-white/8 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-[#9A9AA6]">
                          <span className="font-semibold text-white/85">
                            {m.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{m.updatedAt}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                          {m.content}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveMemory(m.id)}
                        aria-label="Delete memory"
                        className="text-[#9A9AA6] hover:text-[#E11D2E] transition-colors p-1 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHEET: CONNECTED TOOLS */}
            {activeSheet === 'tools' && (
              <div className="mt-4 space-y-2.5">
                {(
                  [
                    {
                      key: 'google',
                      label: 'Google Workspace',
                      desc: 'Calendar, Gmail & Drive context sync',
                    },
                    {
                      key: 'notion',
                      label: 'Notion',
                      desc: 'BLACKTOWER knowledge base & specs',
                    },
                    {
                      key: 'telegram',
                      label: 'Telegram',
                      desc: 'Direct executive voice & alert bridge',
                    },
                    {
                      key: 'neon',
                      label: 'Neon PostgreSQL',
                      desc: 'Structured memory & telemetry store',
                    },
                  ] as const
                ).map((tool) => {
                  const enabled = settings.connectedTools[tool.key];
                  return (
                    <button
                      key={tool.key}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          connectedTools: {
                            ...settings.connectedTools,
                            [tool.key]: !enabled,
                          },
                        })
                      }
                      className="w-full p-3.5 rounded-2xl bg-[#121217] border border-white/8 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {tool.label}
                        </div>
                        <div className="text-xs text-[#9A9AA6] mt-0.5">
                          {tool.desc}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          enabled ? 'text-[#E11D2E]' : 'text-[#9A9AA6]'
                        }`}
                      >
                        {enabled ? 'Connected' : 'Disconnected'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
