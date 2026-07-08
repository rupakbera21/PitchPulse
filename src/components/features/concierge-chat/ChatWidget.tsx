"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConciergeChat } from '@/hooks/useConciergeChat';
import { Canvas } from '@react-three/fiber';
import { TriondaBall3D } from './TriondaBall3D';
import { MessageSquare, X, Send, Loader2, Sparkles, Bot } from 'lucide-react';

/**
 * AI Concierge Chat Widget
 * Allows fans to interact with the LLM. It relies on useConciergeChat for context injection and API polling.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, setInput, isLoading, sendMessage } = useConciergeChat();

  const scrollToBottom = () => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openChat', handleOpen);
    return () => window.removeEventListener('openChat', handleOpen);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    sendMessage(userMsg);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Persistent FAB Button - Absolute to prevent layout shifts */}
      <div 
        className={`absolute bottom-0 right-0 group hover:scale-105 transition-all duration-300 cursor-pointer origin-center z-10 ${
          isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100 delay-300'
        }`}
      >
        <button 
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-br from-team-home via-[color-mix(in_srgb,var(--team-home)_50%,var(--team-away)_50%)] to-team-away text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-white/20 flex items-center justify-center overflow-hidden w-16 h-16"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
          
          {/* Chat Icon */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <Bot size={28} className="text-white drop-shadow-lg" />
          </div>
        </button>
      </div>

      {/* Chat Window - Always mounted to prevent Canvas context loss, animated via Framer */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          y: isOpen ? 0 : 150, 
          scale: isOpen ? 1 : 0.7,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="w-[350px] sm:w-[400px] h-[550px] origin-bottom-right bg-secondary/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden relative z-20"
      >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none -z-10"></div>
            
            <div className="p-5 bg-gradient-to-r from-background/80 to-secondary/80 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-team-home via-[color-mix(in_srgb,var(--team-home)_50%,var(--team-away)_50%)] to-team-away flex items-center justify-center shadow-lg border border-white/20 overflow-hidden relative">
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                    <Bot size={24} className="text-white drop-shadow-md" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    Triona
                    <Sparkles size={14} className="text-team-home" />
                  </h3>
                  <p className="text-[10px] text-[#00ff00] font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse shadow-[0_0_5px_#00ff00]"></span>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 text-sm shadow-xl ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-br from-team-home to-team-away text-white rounded-2xl rounded-tr-sm font-medium' 
                      : 'bg-background/90 border border-white/10 text-white rounded-2xl rounded-tl-sm backdrop-blur-md'
                  }`}>
                    {m.content.replace(/\*\*/g, '')}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-background/90 border border-white/10 rounded-2xl rounded-tl-sm p-4 backdrop-blur-md flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background/50 backdrop-blur-md border-t border-white/10 relative z-10">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center disabled:opacity-50 disabled:scale-90 hover:scale-110 hover:bg-white hover:text-primary transition-all shadow-lg"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
    </div>
  );
}
