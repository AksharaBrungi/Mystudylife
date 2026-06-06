import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Brain, Sparkles, User as UserIcon, Loader2, Clock, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function StudyBuddy({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: input
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Try again later!" }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold">StudyBuddy AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl">
          <Sparkles size={14} />
          <span className="text-xs font-bold">Powered by Gemini</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/30 flex items-center justify-center mb-6 border border-white/20 relative">
               <div className="absolute inset-0 bg-indigo-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
               <Brain className="text-white relative z-10" size={40} />
             </div>
             <h4 className="text-2xl font-black text-[#1B2559] dark:text-white">Hello, {user.displayName?.split(' ')[0]}!</h4>
             <p className="text-slate-500 font-medium max-w-sm mt-3">I'm your intelligent study companion. Pick a topic below or type anything to get started.</p>
             
             <div className="flex flex-wrap items-center justify-center gap-3 mt-10 w-full max-w-xl">
                {[
                  { text: "Study tips for exams", icon: <Sparkles size={14} /> },
                  { text: "Manage time better", icon: <Clock size={14} /> },
                  { text: "Explain photosynthesis", icon: <BookOpen size={14} /> },
                  { text: "Create study schedule", icon: <CalendarIcon size={14} /> }
                ].map(tip => (
                  <button 
                    key={tip.text}
                    onClick={() => setInput(tip.text)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    {tip.icon}
                    {tip.text}
                  </button>
                ))}
             </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
              m.role === 'user' ? "bg-blue-600" : "bg-indigo-600"
            )}>
              {m.role === 'user' ? <UserIcon className="text-white" size={16} /> : <Brain className="text-white" size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-3xl text-sm shadow-sm",
              m.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700"
            )}>
              <article className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900">
                <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
              </article>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex gap-4 mr-auto max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <Brain className="text-white" size={16} />
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm flex items-center gap-1">
              <div className="flex gap-1">
                <motion.span 
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
                />
                <motion.span 
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1], delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full" 
                />
                <motion.span 
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1], delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-indigo-600 rounded-full" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Ask StudyBuddy anything..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all group-hover:border-indigo-300 dark:group-hover:border-indigo-900"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">Always double check AI generated study tips.</p>
      </form>
    </div>
  );
}
