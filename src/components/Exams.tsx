import { useState, useEffect } from 'react';
import { examAPI } from '../lib/api';
import { Plus, Trash2, BookOpen, Clock, AlertTriangle, Calendar as CalendarIcon, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns';

export default function Exams({ user }: { user: any }) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: '',
    topic: '',
    date: '',
    time: '10:00'
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examAPI.getAll();
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const addExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await examAPI.create({
        title: newExam.topic,
        subject: newExam.subject,
        date: newExam.date,
        time: newExam.time
      });
      setShowAddModal(false);
      setNewExam({ subject: '', topic: '', date: '', time: '10:00' });
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExam = async (id: number) => {
    await examAPI.delete(id);
    fetchExams();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1B2559] dark:text-white">Exam Planner 🎯</h2>
          <p className="text-slate-500 font-medium tracking-tight">Stay ahead of your academic assessments and stay prepared.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Plan New Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {exams.map((exam, i) => {
            const examDate = parseISO(exam.date);
            const isUpcoming = isAfter(examDate, new Date());
            const daysRemaining = isUpcoming ? formatDistanceToNow(examDate) : 'Exam Finished';

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-6 rounded-[2rem] group relative transition-all",
                  !isUpcoming && "opacity-60 grayscale-[0.5]"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{exam.subject}</span>
                    <h3 className="text-xl font-black text-[#1B2559] dark:text-white leading-tight">{exam.title}</h3>
                  </div>
                  <button 
                    onClick={() => deleteExam(exam.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <CalendarIcon size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Date</span>
                    </div>
                    <p className="text-sm font-black text-[#1B2559] dark:text-white">{exam.date}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Clock size={14} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Time</span>
                    </div>
                    <p className="text-sm font-black text-[#1B2559] dark:text-white">{exam.time}</p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-4 p-5 rounded-[1.5rem] relative overflow-hidden",
                  isUpcoming 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10">
                     {isUpcoming ? <Target size={24} className="animate-pulse" /> : <BookOpen size={24} />}
                  </div>
                  <div className="flex-1 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-0.5">{isUpcoming ? 'Countdown' : 'Status'}</p>
                    <p className="text-base font-black truncate">{isUpcoming ? `Ends in ${daysRemaining}` : 'Assessment Completed'}</p>
                  </div>
                  {isUpcoming && <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-[-20deg] translate-x-16"></div>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {exams.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <Target size={48} className="mx-auto text-slate-300 mb-4" />
             <h3 className="font-bold text-xl">No Exams Planned</h3>
             <p className="text-slate-500">Plan your revision cycle early for better results.</p>
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#1B2559]/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold mb-6">Plan New Exam 📝</h3>
              <form onSubmit={addExam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Operating Systems" 
                    value={newExam.subject}
                    onChange={e => setNewExam({...newExam, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Topic/Unit</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Memory Management" 
                    value={newExam.topic}
                    onChange={e => setNewExam({...newExam, topic: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
                    <input 
                      required
                      type="date" 
                      value={newExam.date}
                      onChange={e => setNewExam({...newExam, date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time</label>
                    <input 
                      required
                      type="time" 
                      value={newExam.time}
                      onChange={e => setNewExam({...newExam, time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Schedule Exam</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
