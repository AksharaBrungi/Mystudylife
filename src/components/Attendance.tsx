import { useState, useEffect } from 'react';
import { attendanceAPI } from '../lib/api';
import { Plus, Trash2, AlertCircle, Info, BookOpen, CheckCircle, X, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Attendance({ user }: { user: any }) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', present: 0, total: 0 });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll();
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceAPI.create({
        subject: newSubject.name,
        attended: Number(newSubject.present),
        total: Number(newSubject.total),
      });
      setShowAddModal(false);
      setNewSubject({ name: '', present: 0, total: 0 });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAttendance = async (id: number, presentChange: number, totalChange: number) => {
    try {
      const sub = subjects.find(s => s.id === id);
      const newAttended = Math.max(0, sub.attended + presentChange);
      const newTotal = Math.max(newAttended, sub.total + totalChange);
      
      await attendanceAPI.update(id, {
        attended: newAttended,
        total: newTotal
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSubject = async (id: number) => {
    if (confirm('Are you sure you want to remove this subject?')) {
      await attendanceAPI.delete(id);
      fetchAttendance();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1B2559] dark:text-white">Class Presence 🎓</h2>
          <p className="text-slate-500 font-medium tracking-tight">Maintain at least <span className="text-primary font-bold">75%</span> attendance for academic eligibility.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {subjects.map((sub, i) => {
            const percentage = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
            const isWarning = percentage < 75 && sub.total > 0;
            
            const classesNeeded = isWarning ? Math.max(0, 3 * sub.total - 4 * sub.attended) : 0;
            const classesCanMiss = !isWarning && sub.total > 0 ? Math.floor((sub.attended / 0.75) - sub.total) : 0;

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-6 rounded-[2rem] relative overflow-hidden transition-all group",
                  isWarning ? "border-rose-200/50 shadow-rose-500/5 ring-1 ring-rose-500/10" : ""
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isWarning ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <BookOpen size={24} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => deleteSubject(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-[#1B2559] dark:text-white mb-1 truncate">{sub.subject}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Class Performance</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className={cn(
                      "text-3xl font-black",
                      isWarning ? "text-rose-600" : "text-[#1B2559] dark:text-white"
                    )}>{percentage}%</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{sub.attended}/{sub.total} Classes</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={cn(
                        "h-full rounded-full transition-colors", 
                        isWarning ? "bg-rose-500" : "bg-indigo-600"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => updateAttendance(sub.id, 1, 1)}
                    className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors font-bold text-xs"
                  >
                    <CheckCircle size={16} />
                    PRESENT
                  </button>
                  <button 
                    onClick={() => updateAttendance(sub.id, 0, 1)}
                    className="flex items-center justify-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors font-bold text-xs"
                  >
                    <X size={16} />
                    ABSENT
                  </button>
                </div>

                <div className={cn(
                  "mt-6 flex gap-3 p-4 rounded-2xl items-center border",
                  isWarning ? "bg-rose-50/50 border-rose-100/50" : "bg-indigo-50/50 border-indigo-100/50"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                    isWarning ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
                  )}>
                    {isWarning ? <AlertTriangle size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">Threshold Tracker</p>
                    <p className={cn(
                      "text-xs font-black leading-tight",
                      isWarning ? "text-rose-700" : "text-indigo-700"
                    )}>
                      {isWarning 
                        ? `Attend ${classesNeeded} classes to hit 75%`
                        : sub.total > 0 
                          ? classesCanMiss > 0 
                            ? `You can miss ${classesCanMiss} class${classesCanMiss > 1 ? 'es' : ''} safely` 
                            : "On thin ice! Don't miss next class."
                          : "Start tracking to see status"}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {subjects.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
             <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
             <h3 className="font-bold text-xl">No Subjects Added</h3>
             <p className="text-slate-500">Track your attendance effectively by adding your subjects.</p>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
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
              <h3 className="text-xl font-bold mb-6">Add New Subject 📚</h3>
              <form onSubmit={addSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Deep Learning" 
                    value={newSubject.name}
                    onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Classes Attended</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newSubject.present}
                      onChange={e => setNewSubject({...newSubject, present: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Classes</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newSubject.total}
                      onChange={e => setNewSubject({...newSubject, total: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20">Add Subject</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
