import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, MessageCircle, X, Send, Bot, User, Check, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const AIShoppingAssistant: React.FC = () => {
  const { language } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text:
        language === 'ne'
          ? 'नमस्ते! म सजिलो साथी हुँ। म तपाईंलाई स्वदेशी उत्पादन, डेलिभरी र भुक्तानी सम्बन्धी सहयोग गर्न सक्छु। के खोज्दै हुनुहुन्छ?'
          : 'Namaste! I am Sajilo Sathi, your personal shopping advisor. How can I help you find authentic Nepali products, electronics, or check delivery today?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      const replyText = data.reply || 'Namaste! How can I assist you with Sajilo Bazar today?';

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text:
            'Namaste! We deliver genuine products across all 7 provinces with Cash on Delivery and eSewa. Feel free to browse our categories or search for specific items.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Pure cashmere pashmina shawl price?',
    'How does Cash on Delivery work in Pokhara?',
    'What organic tea do you have from Ilam?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Action Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 group font-semibold text-xs border border-red-500"
          title="Open AI Shopping Assistant"
        >
          <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
          <span>Sajilo Sathi (AI)</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-neutral-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs">Sajilo Sathi AI Advisor</h3>
                <p className="text-[10px] text-neutral-400">Powered by Gemini 3.8 Flash</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1 text-neutral-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    SB
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-xs'
                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-neutral-500 text-xs py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                <span>Checking store catalog...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                }}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full whitespace-nowrap shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, delivery or payment..."
              className="flex-1 px-3 py-2 text-xs bg-neutral-100 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-200 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
