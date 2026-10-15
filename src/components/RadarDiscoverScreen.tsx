import React, { useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { DiscoveryItem } from '../types/nexus';

interface RadarDiscoverScreenProps {
  discoveries: DiscoveryItem[];
  isGenerating: boolean;
  onTalkAboutDiscovery: (discovery: DiscoveryItem) => void;
  onToggleSaveDiscovery: (id: string) => void;
  onGenerateNewDiscovery: (category: 'For You' | 'AI' | 'Business' | 'Science') => void;
  onSpeakDiscovery: (text: string) => void;
}

const FILTER_CATEGORIES: Array<'For You' | 'AI' | 'Business' | 'Science'> = [
  'For You',
  'AI',
  'Business',
  'Science',
];

export const RadarDiscoverScreen: React.FC<RadarDiscoverScreenProps> = ({
  discoveries,
  isGenerating,
  onTalkAboutDiscovery,
  onToggleSaveDiscovery,
  onGenerateNewDiscovery,
  onSpeakDiscovery,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<
    'For You' | 'AI' | 'Business' | 'Science'
  >('For You');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filteredList =
    selectedFilter === 'For You'
      ? discoveries
      : discoveries.filter((d) => d.filterGroup === selectedFilter);

  const safeList = filteredList.length > 0 ? filteredList : discoveries;
  const activeItem = safeList[currentIndex % safeList.length] || discoveries[0];

  const handleFilterChange = (cat: 'For You' | 'AI' | 'Business' | 'Science') => {
    setSelectedFilter(cat);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-2 pb-10">
      {/* Interactive Category Selector */}
      <div className="flex items-center justify-between gap-2 pb-5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CATEGORIES.map((category) => {
            const active = selectedFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleFilterChange(category)}
                className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#B91C1C] text-white'
                    : 'bg-[#0B0B0E] text-[#9A9AA6] border border-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={() => onGenerateNewDiscovery(selectedFilter)}
          className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-[#0B0B0E] border border-white/10 hover:border-white/25 text-xs font-medium text-white/85 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          title="Ask NEXUS to scan for a new discovery"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-[#E11D2E]' : ''}`}
          />
          <span>{isGenerating ? 'Scanning...' : 'Scan New'}</span>
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          <span className="text-[#E11D2E]">N</span>EXUS FOUND SOMETHING
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#9A9AA6]">
          Based on your interests and current projects
        </p>
      </div>

      {/* Single Curated Discovery Container (One Strong Focus at a Time) */}
      {activeItem && (
        <article className="rounded-3xl bg-[#0B0B0E] border border-white/10 overflow-hidden">
          {/* Editorial Media Header with Scrim & Resilient Fallback */}
          <div className="relative h-48 sm:h-56 w-full bg-[#121217] overflow-hidden">
            {!imgErrors[activeItem.id] ? (
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [activeItem.id]: true }))
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#16161D] via-[#0B0B0E] to-[#1F090D]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/40 to-transparent" />

            {/* Clean Unboxed Metadata at Bottom of Media */}
            <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs text-white/85">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wider text-white/95">
                  {activeItem.categoryLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9A9AA6]">{activeItem.timeAgo}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  onSpeakDiscovery(
                    `${activeItem.title}。${activeItem.shortInsight}。${activeItem.nexusTake}`
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#E11D2E]" />
                <span>Brief me</span>
              </button>
            </div>
          </div>

          {/* Editorial Content Body */}
          <div className="p-5 sm:p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug text-balance">
              {activeItem.title}
            </h2>

            <p className="text-sm text-[#B4B4C0] leading-relaxed">
              {activeItem.shortInsight}
            </p>

            {/* Why NEXUS Thinks It Matters to Kelvin */}
            <div className="p-4 rounded-2xl bg-[#121217] border border-white/8">
              <div className="text-xs font-semibold text-white/90 mb-1.5">
                NEXUS:
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                “{activeItem.nexusTake}”
              </p>
            </div>

            {/* Primary Conversational Action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onTalkAboutDiscovery(activeItem)}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[#160B0D] hover:bg-[#E11D2E] border border-[#E11D2E]/50 text-sm font-medium text-white flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Talk about this</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSaveDiscovery(activeItem.id)}
                aria-label="Save discovery to memory"
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                  activeItem.saved
                    ? 'bg-[#E11D2E]/15 border-[#E11D2E]/50 text-[#E11D2E]'
                    : 'bg-[#121217] border-white/10 text-[#9A9AA6] hover:text-white'
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${activeItem.saved ? 'fill-current' : ''}`}
                />
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Curated Carousel Controls (One discovery at a time, zero feed clutter) */}
      {safeList.length > 1 && (
        <div className="mt-5 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() =>
              setCurrentIndex(
                (i) => (i - 1 + safeList.length) % safeList.length
              )
            }
            className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-[#9A9AA6] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {safeList.map((item, idx) => {
              const isCurrent = idx === currentIndex % safeList.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View discovery ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    isCurrent ? 'w-5 bg-[#E11D2E]' : 'w-1.5 bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((i) => (i + 1) % safeList.length)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-[#9A9AA6] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
