
import { GoogleGenAI, Modality } from "@google/genai";

// Audio helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Fix: Use process.env.API_KEY directly as per guidelines
export const analyzePortfolioWithGemini = async (portfolioData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this stock portfolio and provide optimization advice: ${JSON.stringify(portfolioData)}`,
    config: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    }
  });
  return response.text;
};

// Fix: Use process.env.API_KEY directly as per guidelines
export const chatWithGemini = async (message: string, history: { role: string; text: string }[], imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: any[] = [];
  
  // Add history for context
  history.forEach(h => {
    contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
  });

  const currentParts: any[] = [{ text: message }];
  if (imageBase64) {
    currentParts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64.split(',')[1],
      }
    });
  }

  contents.push({ role: 'user', parts: currentParts });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: "You are the OpenClaw Strategic Advisor. You help users manage their stock portfolios and orchestrate agents. Be professional, data-driven, and concise."
    }
  });

  return response.text;
};

// Fix: Use process.env.API_KEY directly as per guidelines
export const generateSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a professional and helpful tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
