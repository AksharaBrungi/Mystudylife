import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Coffee, 
  Target, 
  ChevronLeft, 
  Check,
  Award,
  Flame,
  Brain,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getStudyStats, recordSession, StudyStats } from '../lib/studyStats';

interface FocusModeProps {
  user: any;
}

export default function FocusMode({ user }: FocusModeProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [stats, setStats] = useState<StudyStats>(getStudyStats());
  const [showCompletion, setShowCompletion] = useState(false);

  const handleSessionComplete = useCallback(() => {
    if (mode === 'work') {
      const newStats = recordSession(25);
      setStats(newStats);
      setShowCompletion(true);
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = timeLeft / totalTime;

  const quotes = {
    work: [
      "Focus on being productive instead of busy.",
      "Your limitation—it's only your imagination.",
      "Don't stop when you're tired. Stop when you're done.",
      "Success doesn't just find you. You have to go out and get it."
    ],
    break: [
      "Rest is not idleness, it increases your productivity.",
      "Take a breath. You are doing great.",
      "A short break recharges your brain."
    ]
  };

  const currentQuote = quotes[mode][stats.sessionsCompleted % quotes[mode].length];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all group font-black uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-100 dark:border-amber-900/50">
               <Flame size={12} className="text-amber-500 fill-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">{stats.streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full animate-pulse", isActive ? "bg-emerald-500" : "bg-slate-300")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isActive ? 'Live Session Active' : 'Session Paused'}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-12 rounded-[3.5rem] text-center relative overflow-hidden bg-white/50 dark:bg-slate-900/50">
            {/* Animated Glow */}
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] transition-colors duration-1000",
                    mode === 'work' ? "bg-primary" : "bg-emerald-500"
                  )} 
                />
              )}
            </AnimatePresence>
            
            <div className="relative z-10 flex flex-col items-center">
               <div className="flex justify-center gap-4 mb-10 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
                <button 
                  onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
                  className={cn(
                    "px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'work' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Target size={14} />
                    Focus
                  </div>
                </button>
                <button 
                  onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                  className={cn(
                    "px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'break' ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Coffee size={14} />
                    Break
                  </div>
                </button>
              </div>

              <div className="relative inline-block mb-12 group cursor-pointer" onClick={toggleTimer}>
                <svg className="w-80 h-80 transform -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="879.64"
                    strokeDashoffset={879.64 * (1 - progress)}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-1000",
                      isActive ? (mode === 'work' ? "text-primary transition-colors" : "text-emerald-500 transition-colors") : "text-slate-300 dark:text-slate-700"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <motion.h2 
                    key={timeLeft}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-[#1B2559] dark:text-white tabular-nums tracking-tighter"
                   >
                     {formatTime(timeLeft)}
                   </motion.h2>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">
                     {mode === 'work' ? 'Deep Work' : 'Time to Rest'}
                   </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95 group border border-slate-100 dark:border-slate-700"
                  title="Reset Timer"
                >
                  <RotateCcw size={24} className="group-hover:rotate-[-90deg] transition-transform" />
                </button>
                
                <button 
                  onClick={toggleTimer}
                  className={cn(
                    "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all active:scale-95 group",
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                      : (mode === 'work' ? "bg-primary shadow-primary/30" : "bg-emerald-500 shadow-emerald-500/30")
                  )}
                >
                  {isActive ? <Pause size={40} className="fill-current" /> : <Play size={40} className="ml-2 fill-current" />}
                </button>

                <button 
                  onClick={() => navigate('/')}
                  className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-95 border border-slate-100 dark:border-slate-700"
                  title="Finish and Exit"
                >
                  <Check size={28} />
                </button>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-[2.5rem] border-dashed border-gray-200 dark:border-slate-800 flex items-center gap-6"
          >
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
               <Zap size={28} />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1B2559] dark:text-white uppercase tracking-widest">Motivational Push</h4>
              <p className="text-sm text-slate-500 mt-1 font-medium italic leading-relaxed">"{currentQuote}"</p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem]">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
               <Brain size={14} className="text-primary" />
               Real-time Stats
             </h3>
             <div className="space-y-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Focus Score</p>
                   <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-[#1B2559] dark:text-white">{stats.focusScore}</span>
                      <div className="flex flex-col mb-1">
                        <span className="text-[10px] font-black text-emerald-500 uppercase">Productive</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn(
                              "w-1 h-3 rounded-full",
                              i * 20 < stats.focusScore ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                            )}></div>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Today's Progress</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Sessions</span>
                        <span className="text-sm font-black text-[#1B2559] dark:text-white">{stats.sessionsCompleted % 8} / 8</span>
                      </div>
                      <div className="flex gap-2">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className={cn(
                            "flex-1 h-2 rounded-full transition-all duration-700",
                            i < (stats.sessionsCompleted % 8) ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                          )}></div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m Total
                        </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-[#1B2559] text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6 flex items-center gap-2">
                 <Trophy size={14} className="text-amber-400" />
                 Achievements
              </h3>
              <div className="space-y-5">
                <div className={cn("flex items-center gap-4 transition-opacity", stats.streak > 0 ? "opacity-100" : "opacity-30")}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame size={24} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{stats.streak} Day Streak</h4>
                    <p className="text-[9px] opacity-60 font-black uppercase tracking-widest">Consistency unlocked</p>
                  </div>
                </div>
                
                <div className={cn("flex items-center gap-4 transition-opacity", stats.sessionsCompleted >= 5 ? "opacity-100" : "opacity-30")}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap size={24} className="text-blue-400 fill-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">Power Study</h4>
                    <p className="text-[9px] opacity-60 font-black uppercase tracking-widest">5+ Sessions goal</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <Trophy size={48} />
              </div>
              <h3 className="text-3xl font-black text-[#1B2559] dark:text-white mb-2">Session Completed!</h3>
              <p className="text-slate-500 font-medium mb-8">You've successfully completed a 25-minute deep work session. Great job!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Time</p>
                    <p className="text-lg font-black text-[#1B2559] dark:text-white">25m</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Focus</p>
                    <p className="text-lg font-black text-primary">+{Math.round(stats.focusScore / 10 + 1)}</p>
                 </div>
              </div>

              <button 
                onClick={() => setShowCompletion(false)}
                className="w-full btn-primary !rounded-3xl"
              >
                Amazing, let's break!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
