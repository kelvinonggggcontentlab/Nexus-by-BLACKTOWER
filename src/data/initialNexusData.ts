import {
  ChatMessage,
  DiscoveryItem,
  MemoryEntry,
  NexusSettings,
  ProactiveNotice,
} from '../types/nexus';

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'nexus',
    content: 'Boss, 今天有什么想聊的吗？可以随便聊，工作、生活、想法都可以。',
    timestamp: '3:31 PM',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: '帮我分析这个项目的方向',
    timestamp: '3:32 PM',
  },
  {
    id: 'msg-3',
    role: 'nexus',
    content:
      '好的，我来分析一下这个项目。\n\n我会从以下几个方面给你看：\n1. 现状与目标\n2. 机会与风险\n3. 可行方案\n4. 下一步建议\n\n稍等，我整理一下重点给你看。',
    timestamp: '3:32 PM',
    analysisCard: {
      title: 'NEXUS_PROJECT_ANALYSIS',
      subtitle: '4 key insights',
      points: [
        '1. 现状与目标：目前的 prototype 功能都在，可是 UI 太像 SaaS dashboard，分散了 Voice-First 的核心定位。',
        '2. 机会与风险：如果继续堆 card 和按钮，迟早变成 maintenance nightmare。把界面减掉 70%，专注在 NEXUS Core 和自然对话，这东西 directly 升级成真正的个人智能终端。',
        '3. 可行方案：保留 Core、Voice、Chat、Radar、Settings 五个核心入口。用语音作为第一交互，Radar 只给精选的高价值情报，不要做成普通 news feed。',
        '4. 下一步建议：先把 Voice loop 跟 Memory 跑通，任何不帮 Kelvin 更快做决定的 UI 直接砍掉，tak payah 留。',
      ],
    },
  },
];

export const INITIAL_DISCOVERIES: DiscoveryItem[] = [
  {
    id: 'disc-1',
    filterGroup: 'For You',
    categoryLabel: 'TECHNOLOGY',
    timeAgo: '2h ago',
    title: 'AI 代理正在改变个人生产力的游戏规则',
    shortInsight:
      '最新研究显示，2026 年 AI 代理将从工具升级为真正的“数字同事”，能够主动规划、执行和优化跨系统任务。',
    nexusTake:
      '这个趋势和你现在的 NEXUS 项目高度相关，值得深入研究。我可以帮你整理关键点，并分析如何应用到你的系统中。',
    imageUrl: '/src/assets/images/discovery_agentic_skyline_1792051692786.jpg',
    talkPrompt:
      'NEXUS，帮我拆解一下 2026 AI 代理从“工具”升级到“数字同事”的关键架构，看看怎样直接落地到我们的系统。',
  },
  {
    id: 'disc-2',
    filterGroup: 'Science',
    categoryLabel: 'NEUROSCIENCE',
    timeAgo: '4h ago',
    title: "Your brain may literally 'wash' itself during deep sleep.",
    shortInsight:
      'Synchronized slow-wave neural oscillations drive cerebrospinal fluid pulses that clear metabolic waste products accumulated during high-focus decision making.',
    nexusTake:
      'Kelvin, this one is interesting because it connects sleep, cognitive recovery and long-term executive performance. 你最近常熬夜跑架构，这个节奏要注意。',
    imageUrl: '/src/assets/images/discovery_neural_recovery_1792051692970.jpg',
    talkPrompt:
      'Eh NEXUS, 跟我聊聊 deep sleep glymphatic clearance 怎样影响高强度做 decision，有什么 practical 的调整？',
  },
  {
    id: 'disc-3',
    filterGroup: 'AI',
    categoryLabel: 'AI ARCHITECTURE',
    timeAgo: '5h ago',
    title: 'Voice-First 个人终端正在取代传统多层级菜单 UI',
    shortInsight:
      '新一代高频执行系统开始采用“Ambient Core + 按需展开”模式，把 80% 的操作压缩成自然语音指令和上下文记忆。',
    nexusTake:
      'Boss, this one got a direct connection with our "Less interface, more intelligence" rule. 用户不需要十几个按钮，只需要一个听得懂上下文的 Core。',
    imageUrl: '/src/assets/images/discovery_agentic_skyline_1792051692786.jpg',
    talkPrompt:
      '来，我们聊聊怎样把 NEXUS 的语音指令跟 Memory 结合得更 tight，减少手动操作。',
  },
  {
    id: 'disc-4',
    filterGroup: 'Business',
    categoryLabel: 'BUSINESS STRATEGY',
    timeAgo: '8h ago',
    title: 'One-Person Unbundled Executive Stack 的 ROI 拐点',
    shortInsight:
      '顶尖创始人和操盘手正在用定制化的私有 AI Intelligence Layer 替代传统外包分析团队，决策响应周期缩短 68%。',
    nexusTake:
      'This one can scale. 以前要三个人花两天整理的 market research，现在直接进 NEXUS Radar 过滤掉噪音，只留能执行的 signal。',
    imageUrl: '/src/assets/images/discovery_neural_recovery_1792051692970.jpg',
    talkPrompt:
      '帮我看看我现在手上的 workflow，有哪些还是太 manual、可以直接 auto 掉的？',
  },
];

export const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: 'mem-1',
    category: 'PROJECT',
    content:
      'Building NEXUS by BLACKTOWER™ — a voice-first personal AI companion and executive intelligence layer designed around "Less interface. More intelligence."',
    updatedAt: 'Today',
  },
  {
    id: 'mem-2',
    category: 'PREFERENCE',
    content:
      'Prefers natural Johor Bahru Malaysian Chinese (70%), English (15%), and Malay/Manglish (15%). Dislikes robotic AI pleasantries and over-engineered dashboards.',
    updatedAt: 'Today',
  },
  {
    id: 'mem-3',
    category: 'WORKFLOW',
    content:
      'Prioritizes simplicity, speed, scalability, automation, and ROI. Expects NEXUS to push back directly when an idea or workflow is weak or too manual.',
    updatedAt: 'Yesterday',
  },
  {
    id: 'mem-4',
    category: 'CONTEXT',
    content:
      'Tracks Maybank credit card updates, cross-border MY/SG executive tools, agentic AI workflows, and high-performance cognitive recovery.',
    updatedAt: '2d ago',
  },
];

export const INITIAL_PROACTIVE_NOTICE: ProactiveNotice = {
  id: 'notice-maybank',
  title: 'Boss, 我发现这个可能对你有帮助',
  preview: '关于 Maybank 的最新信用卡优惠与积分兑换调整，有几个值得关注的更新。',
  timeAgo: '2m ago',
  talkPrompt:
    'Eh NEXUS, 跟我讲一下 Maybank 最新信用卡优惠和积分调整有什么重点，会影响我现在的卡吗？',
};

export const INITIAL_SETTINGS: NexusSettings = {
  languageMode: 'jb-mix',
  voiceName: 'Kore',
  personalityProfile: 'Calm · Sharp · Proactive',
  autoSpeakVoiceReplies: true,
  smartProactiveAlerts: true,
  connectedTools: {
    google: true,
    notion: true,
    telegram: true,
    neon: true,
  },
};
