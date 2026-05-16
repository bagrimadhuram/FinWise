import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function ChatAssistant({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/chat`),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => doc.data() as ChatMessage));
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, `users/${user.uid}/chat`), {
        role: 'user',
        content: userMessage,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // 2. Mock AI response locally
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        content: `I've analyzed your question about "${userMessage}". Based on your monthly income of ₹${profile?.monthlyIncome.toLocaleString()}, my advice would be to maintain a balanced budget while prioritizing your goals. Keep up the great work!`
      };

      // 3. Save AI response to Firestore
      await addDoc(collection(db, `users/${user.uid}/chat`), {
        role: 'model',
        content: mockResponse.content,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:items-end md:justify-end p-6 md:pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-md w-full h-[600px] bg-[#0d0d0d] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/10 md:pointer-events-auto"
      >
        {/* Header */}
        <div className="p-6 bg-[#141414] border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
              <Sparkles className="w-5 h-5 text-teal-400 fill-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight">Ask FinWise</h2>
              <p className="text-[10px] font-bold text-teal-400/70 tracking-widest uppercase">AI Copilot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#0a0a0a]">
          {messages.length === 0 && (
            <div className="text-center py-10 px-6">
              <div className="w-16 h-16 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-teal-400 border border-teal-500/20">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">How can I help you?</h3>
              <p className="text-sm text-slate-500">Ask about goals, affordability, budgeting, or general financial concepts.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["Can I afford a MacBook?", "Plan my emergency fund", "How to save ₹10k/mo?"].map(q => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                m.role === 'user' ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20" : "bg-[#141414] border border-white/10 text-teal-400"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-3xl text-sm font-medium leading-relaxed",
                m.role === 'user' ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20 rounded-tr-none" : "bg-[#141414] border border-white/10 rounded-tl-none text-slate-200"
              )}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-[#141414] border border-white/10 text-teal-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-[#141414] border border-white/10 rounded-3xl rounded-tl-none">
                <Loader2 className="w-5 h-5 animate-spin text-teal-500/50" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-[#141414] border-t border-white/5 shrink-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white placeholder:text-slate-600"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-500 text-black rounded-xl flex items-center justify-center shadow-lg hover:bg-teal-400 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
