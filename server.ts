import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, 'public');
const ORB_FILE_PATH = path.join(PUBLIC_DIR, 'orb.png');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function getGenAI() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const NEXUS_MASTER_INSTRUCTION = `
NEXUS by BLACKTOWER™ — MASTER SYSTEM INSTRUCTION VERSION 2.0

IDENTITY:
You are NEXUS by BLACKTOWER™.
You are Kelvin's personal AI companion, executive intelligence layer, voice-first conversation partner, proactive knowledge system and personal intelligence interface.
You are NOT a generic chatbot, customer service, generic virtual assistant, productivity dashboard, or AI demo.
Your purpose is to help Kelvin think better, discover useful information, identify patterns, move faster, communicate better, make better decisions, connect ideas, and execute practical solutions.

CORE PERSONALITY:
Sharp. Calm. Curious. Observant. Strategic. Direct. Witty. Natural. Confident. Personal.
You do not blindly agree with Kelvin.
If an idea is weak, say so ("这个不够强。").
If a workflow is inefficient, call it out ("这个 workflow 太 manual，迟早爆。Auto it.").
If something is unnecessarily complicated, simplify it ("这个做太复杂了，tak payah.").
If Kelvin is wrong, correct him respectfully.
If something is genuinely strong, explain why ("This one can scale.").
Do not praise Kelvin simply to make the conversation pleasant. Use judgment.

LANGUAGE & SPEECH:
Primary language: Malaysian Chinese.
Use natural Malaysian Chinese communication patterns (approx 70% Chinese, 15% English, 15% Malay/Manglish as a natural guideline).
Sound like a real, sharp Malaysian Chinese executive companion from Johor Bahru.
Natural expressions may include (do not overuse): 啦, 咯, 咧, 嘛, 咩, eh, leh, lor, mah, boss, steady, cincai, tak payah, can, cannot, wait ah.
Avoid Taiwan-style expressions and phrasing. Do NOT sound like textbook Mandarin.

DO NOT SOUND LIKE AI:
Never use corporate or robotic language ("How may I assist you today?", "Certainly!", "Absolutely!", "作为人工智能", "根据我的分析", "我很乐意帮助您").
Do not repeatedly confirm instructions or repeat Kelvin's entire question. Get straight to the point.

THINKING FRAMEWORK:
1. Understand what Kelvin actually wants.
2. Identify the real problem and separate symptoms from root causes.
3. Remove unnecessary complexity.
4. Recommend the strongest practical option first (optimize for Simplicity, Speed, Scalability, Automation, ROI).
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.static(PUBLIC_DIR));

  // Check if official orb.png exists in /public/orb.png
  app.get('/api/nexus/orb-status', (_req, res) => {
    const exists = fs.existsSync(ORB_FILE_PATH);
    res.json({ exists, path: exists ? '/orb.png' : null });
  });

  // Save uploaded official orb.png to /public/orb.png without altering a single pixel
  app.post('/api/nexus/orb-upload', (req, res) => {
    try {
      const { dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Missing dataUrl payload' });
        return;
      }
      const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
      const base64Data = match ? match[1] : dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(ORB_FILE_PATH, buffer);
      res.json({ success: true, path: '/orb.png' });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save orb.png' });
    }
  });

  // Conversational & Executive Analysis endpoint
  app.post('/api/nexus/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        memories = [],
        languageMode = 'jb-mix',
        voiceStyle = 'Calm · Sharp · Proactive',
        useLiveSearch = false,
      } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ai = getGenAI();

      const memoryContext =
        Array.isArray(memories) && memories.length > 0
          ? `\nKNOWN CONTEXT & MEMORY ABOUT KELVIN:\n${memories
              .map((m: any) => `- [${m.category}] ${m.content}`)
              .join('\n')}\n`
          : '';

      const languageGuidance =
        languageMode === 'en-dominant'
          ? '\nLanguage preference for this turn: Primarily sharp Malaysian English with light Manglish/Chinese terms where natural.'
          : languageMode === 'zh-dominant'
          ? '\nLanguage preference for this turn: Primarily natural Malaysian Chinese (80%) mixed with English technical/business terms.'
          : '\nLanguage preference for this turn: Natural JB Malaysian Chinese (70%), English (15%), Malay/Manglish (15%).';

      const conversationHistoryText = Array.isArray(history)
        ? history
            .slice(-10)
            .map((h: any) => `${h.role === 'user' ? 'Kelvin' : 'NEXUS'}: ${h.content}`)
            .join('\n')
        : '';

      const prompt = `${
        conversationHistoryText ? `RECENT CONVERSATION:\n${conversationHistoryText}\n\n` : ''
      }Kelvin: ${message}`;

      if (useLiveSearch) {
        // Live grounded response with Google Search
        const searchResp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `${NEXUS_MASTER_INSTRUCTION}\nPersonality Calibration: ${voiceStyle}${languageGuidance}${memoryContext}\nKeep your answer sharp, direct, and grounded in facts.`,
            tools: [{ googleSearch: {} }],
          },
        });

        const groundingChunks =
          searchResp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
          .map((c: any) => c.web)
          .filter(Boolean)
          .slice(0, 3);

        res.json({
          reply: searchResp.text || 'Boss，刚刚 check 不到 live source，再试一次。',
          sources,
          analysisCard: null,
          extractedMemory: null,
        });
        return;
      }

      // Structured executive response so NEXUS can optionally attach a concise strategic breakdown or remember new context
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `${NEXUS_MASTER_INSTRUCTION}\nPersonality Calibration: ${voiceStyle}${languageGuidance}${memoryContext}
Return JSON with:
- "reply": Your natural response to Kelvin as NEXUS. Be direct, observant, and concise. Use line breaks or numbered points only when structuring a project breakdown.
- "analysisCard": Optional object (include ONLY when Kelvin asks to analyze a project, strategy, workflow, or architecture; otherwise set to null). Contains "title" (e.g. "NEXUS_PROJECT_ANALYSIS"), "subtitle" (e.g. "4 key insights"), and "points" (array of 3-4 concise strategic takeaways).
- "extractedMemory": Optional string (include ONLY if Kelvin shared a new personal preference, active project, or business rule worth remembering long-term; otherwise empty string).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Natural NEXUS response to Kelvin.',
              },
              analysisCard: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
              extractedMemory: {
                type: Type.STRING,
                nullable: true,
              },
            },
            required: ['reply'],
          },
        },
      });

      const rawText = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawText);

      res.json({
        reply: parsed.reply || 'Got it, Boss.',
        analysisCard: parsed.analysisCard || null,
        extractedMemory: parsed.extractedMemory || null,
        sources: [],
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({
        error: err?.message || 'NEXUS communication error',
      });
    }
  });

  // Voice-First Turn Endpoint (Audio Transcription -> NEXUS Intelligence -> Speech Synthesis)
  app.post('/api/nexus/voice-turn', async (req, res) => {
    try {
      const {
        audioBase64,
        mimeType = 'audio/webm',
        transcript: clientTranscript,
        history = [],
        memories = [],
        voiceName = 'Kore',
        languageMode = 'jb-mix',
      } = req.body;

      const ai = getGenAI();
      let userText = (clientTranscript || '').trim();

      // Step 1: If audio was recorded and no transcript yet, transcribe via gemini-3.5-transcribe
      if (!userText && audioBase64) {
        const transcribeResp = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64,
                },
              },
              {
                text: 'Transcribe this spoken audio accurately. Support Chinese, English, and Malay/Manglish words naturally. Output ONLY the exact spoken words, nothing else.',
              },
            ],
          },
        });
        userText = (transcribeResp.text || '').trim();
      }

      if (!userText) {
        res.status(400).json({
          error: 'Could not catch any voice input. Try speaking closer to the mic, Boss.',
        });
        return;
      }

      const memoryContext =
        Array.isArray(memories) && memories.length > 0
          ? `\nKNOWN CONTEXT ABOUT KELVIN:\n${memories
              .map((m: any) => `- ${m.content}`)
              .join('\n')}\n`
          : '';

      const languageGuidance =
        languageMode === 'en-dominant'
          ? 'Speak primarily in natural Malaysian English with subtle Manglish/Chinese expressions.'
          : languageMode === 'zh-dominant'
          ? 'Speak primarily in natural Malaysian Chinese mixed with English terms.'
          : 'Speak in natural Johor Bahru Malaysian Chinese (70%) mixed with English (15%) and Malay/Manglish (15%).';

      const recentHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: any) => `${h.role === 'user' ? 'Kelvin' : 'NEXUS'}: ${h.content}`)
            .join('\n')
        : '';

      // Step 2: Generate concise, spoken-first NEXUS response
      const replyResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${recentHistory ? `${recentHistory}\n` : ''}Kelvin (via Voice): ${userText}`,
        config: {
          systemInstruction: `${NEXUS_MASTER_INSTRUCTION}\n${languageGuidance}${memoryContext}
VOICE-FIRST MODE RULES:
- This response will be spoken aloud directly to Kelvin.
- Keep it concise, conversational, direct, and natural to listen to (2 to 4 sentences maximum unless Kelvin explicitly asks for a deep breakdown).
- Do NOT use markdown formatting, bullet symbols, or asterisks. Write pure spoken dialogue.`,
        },
      });

      const replyText = (replyResp.text || 'Boss，我听到了。我们直接看重点。').trim();

      // Step 3: Synthesize speech with gemini-3.8-flash-lite-tts
      let audioWavBase64: string | null = null;
      try {
        const ttsResp = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: replyText,
                  speechMetadata: {
                    style: 'Calm, sharp, confident executive companion',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
                    ? voiceName
                    : 'Kore',
                },
              },
            },
          },
        });
        audioWavBase64 =
          ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (ttsErr) {
        console.warn('TTS synthesis fallback notice:', ttsErr);
      }

      res.json({
        transcript: userText,
        replyText,
        audioWavBase64,
      });
    } catch (err: any) {
      console.error('Voice turn error:', err);
      res.status(500).json({
        error: err?.message || 'Voice processing failed',
      });
    }
  });

  // Standalone TTS endpoint for speaking any message or discovery aloud
  app.post('/api/nexus/tts', async (req, res) => {
    try {
      const { text, voiceName = 'Kore' } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text is required for TTS' });
        return;
      }

      const ai = getGenAI();
      const ttsResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: 'Calm, sharp, confident executive companion',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
                  ? voiceName
                  : 'Kore',
              },
            },
          },
        },
      });

      const audioWavBase64 =
        ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      res.json({ audioWavBase64 });
    } catch (err: any) {
      console.error('TTS error:', err);
      res.status(500).json({ error: err?.message || 'Speech synthesis failed' });
    }
  });

  // Proactive Discovery Generator (NEXUS FOUND SOMETHING)
  app.post('/api/nexus/discover', async (req, res) => {
    try {
      const { category = 'For You', memories = [], existingTitles = [] } = req.body;
      const ai = getGenAI();

      const memorySummary =
        Array.isArray(memories) && memories.length > 0
          ? memories.map((m: any) => m.content).join('; ')
          : 'Building NEXUS by BLACKTOWER™, AI agent automation, high-leverage executive workflows, Malaysia/Singapore cross-border strategy, cognitive performance';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Surface 1 genuinely high-signal discovery for Kelvin in category: "${category}".
Avoid repeating these titles: ${JSON.stringify(existingTitles)}.
Kelvin's context & priorities: ${memorySummary}`,
        config: {
          systemInstruction: `${NEXUS_MASTER_INSTRUCTION}
You are generating a single curated discovery for NEXUS RADAR ("NEXUS FOUND SOMETHING").
Every discovery must answer:
1. WHAT DID NEXUS FIND? (title + shortInsight)
2. WHY DOES IT MATTER & WHY SHOULD KELVIN CARE? (nexusTake — written in NEXUS's personal voice to Kelvin, connecting it to his projects or performance)
Use natural Malaysian Chinese mixed with English terms where appropriate.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categoryLabel: {
                type: Type.STRING,
                description: 'Upper-case category tag such as TECHNOLOGY, AI ARCHITECTURE, BUSINESS, or NEUROSCIENCE',
              },
              title: {
                type: Type.STRING,
                description: 'Compelling, specific headline in Chinese or English',
              },
              shortInsight: {
                type: Type.STRING,
                description: '2-sentence factual summary of what was discovered',
              },
              nexusTake: {
                type: Type.STRING,
                description: 'Personal observation from NEXUS to Kelvin explaining why this connects to his work and what he can do with it',
              },
              talkPrompt: {
                type: Type.STRING,
                description: 'Natural opening question or prompt when Kelvin clicks [Talk about this]',
              },
            },
            required: ['categoryLabel', 'title', 'shortInsight', 'nexusTake', 'talkPrompt'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      res.json({ discovery: parsed });
    } catch (err: any) {
      console.error('Discovery generation error:', err);
      res.status(500).json({ error: err?.message || 'Failed to surface new discovery' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS by BLACKTOWER™ server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
