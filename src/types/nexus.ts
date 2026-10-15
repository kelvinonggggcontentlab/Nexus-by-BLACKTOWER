export enum NexusState {
  STANDBY = 'STANDBY',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  PROCESSING = 'PROCESSING',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

export enum NavTab {
  CORE = 'CORE',
  VOICE = 'VOICE',
  CHAT = 'CHAT',
  RADAR = 'RADAR',
  SETTINGS = 'SETTINGS',
}

export interface AnalysisCardData {
  title: string;
  subtitle: string;
  points: string[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'nexus';
  content: string;
  timestamp: string;
  isVoice?: boolean;
  analysisCard?: AnalysisCardData | null;
  sources?: GroundingSource[];
}

export interface DiscoveryItem {
  id: string;
  filterGroup: 'For You' | 'AI' | 'Business' | 'Science';
  categoryLabel: string;
  timeAgo: string;
  title: string;
  shortInsight: string;
  nexusTake: string;
  imageUrl: string;
  talkPrompt: string;
  saved?: boolean;
}

export interface MemoryEntry {
  id: string;
  category: 'PROJECT' | 'PREFERENCE' | 'WORKFLOW' | 'CONTEXT';
  content: string;
  updatedAt: string;
}

export interface ProactiveNotice {
  id: string;
  title: string;
  preview: string;
  timeAgo: string;
  talkPrompt: string;
  dismissed?: boolean;
}

export interface NexusSettings {
  languageMode: 'jb-mix' | 'zh-dominant' | 'en-dominant';
  voiceName: 'Kore' | 'Zephyr' | 'Fenrir' | 'Charon' | 'Puck';
  personalityProfile: string;
  autoSpeakVoiceReplies: boolean;
  smartProactiveAlerts: boolean;
  connectedTools: {
    google: boolean;
    notion: boolean;
    telegram: boolean;
    neon: boolean;
  };
}
