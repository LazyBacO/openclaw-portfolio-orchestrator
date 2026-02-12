
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Volume2, Mic, Bot, User, Loader2, PlayCircle } from 'lucide-react';
import { Message } from '../types';
import { chatWithGemini, generateSpeech, decode, decodeAudioData } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to OpenClaw Intelligence. I'm your strategic advisor. How can I help you optimize your portfolio today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMessage: Message = { role: 'user', text: inputValue, image: selectedImage || undefined };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatWithGemini(userMessage.text, chatHistory, userMessage.image);
      
      const botMessage: Message = { role: 'model', text: response || "I'm sorry, I couldn't process that request." };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to Gemini. Please check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const playTTS = async (text: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const bytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[700px] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gemini Intelligence</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ready to analyze</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-300'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-xs rounded-lg mb-3 border border-indigo-400/30" />
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => playTTS(msg.text)}
                    className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-bold ml-1"
                  >
                    <Volume2 size={12} />
                    Listen to advice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center animate-pulse">
                <Bot size={16} className="text-slate-400" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 className="animate-spin text-indigo-400" size={16} />
                <span className="text-sm text-slate-400">Processing portfolio data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900 border-t border-slate-800">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-indigo-600 shadow-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-inner">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-indigo-400"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about market trends or upload a chart..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-500"
          />
          <button 
            disabled={isLoading || (!inputValue.trim() && !selectedImage)}
            onClick={handleSendMessage}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-50 p-3 rounded-xl transition-all text-white shadow-lg shadow-indigo-500/20"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-3 font-medium">
          Powered by Gemini 3 Pro & OpenClaw Real-time Feeds
        </p>
      </div>
    </div>
  );
};

const X: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default AIAssistant;
