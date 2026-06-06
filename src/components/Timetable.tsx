import { useState, useEffect } from 'react';
import { timetableAPI } from '../lib/api';
import { Plus, Trash2, Clock, MapPin, User as UserIcon, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500'
];

export default function Timetable({ user }: { user: any }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newEntry, setNewEntry] = useState({
    subject: '',
    room: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    color: COLORS[0]
  });

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableAPI.getAll();
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await timetableAPI.create(newEntry);
      setShowAddModal(false);
      setNewEntry({ ...newEntry, subject: '', room: '' });
      fetchTimetable();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEntry = async (id: number) => {
    await timetableAPI.delete(id);
    fetchTimetable();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('MyStudyLife - Weekly Timetable', 20, 20);
    doc.setFontSize(12);
    
    let y = 40;
    DAYS.forEach(day => {
      const dayEntries = entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (dayEntries.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text(day, 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        dayEntries.forEach(e => {
          doc.text(`${e.startTime} - ${e.endTime}: ${e.subject} (${e.room})`, 30, y);
          y += 8;
        });
        y += 5;
      }
    });

    doc.save('timetable.pdf');
  };

  const dailyEntries = entries
    .filter(e => e.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1B2559] dark:text-white">Class Schedule 📅</h2>
          <p className="text-slate-500 font-medium tracking-tight">Plan your week efficiently and never miss a lecture.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportPDF}
            className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 shadow-sm"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Slot
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 p-2 rounded-[1.5rem] border border-white/20 overflow-x-auto no-scrollbar shadow-sm backdrop-blur-sm">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap",
              selectedDay === day 
                ? "bg-primary text-white shadow-xl shadow-primary/20" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {dailyEntries.length > 0 ? dailyEntries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="group flex flex-col md:flex-row md:items-center gap-6 glass-card p-6 rounded-[2rem] relative"
            >
              <div className="flex flex-col items-center justify-center md:border-r border-white/10 pr-8 min-w-[120px]">
                <span className="text-2xl font-black text-[#1B2559] dark:text-white leading-none">{entry.startTime}</span>
                <div className="h-4 w-0.5 bg-primary/20 my-2 rounded-full" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{entry.endTime}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                   <div className={cn("w-3 h-3 rounded-full ring-4 ring-offset-4 dark:ring-offset-slate-900 ring-opacity-20 transition-all", entry.color, entry.color.replace('bg-', 'ring-'))} />
                   <h3 className="text-xl font-black text-[#1B2559] dark:text-white">{entry.subject}</h3>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-primary transition-colors">
                    <MapPin size={14} className="text-rose-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Hall {entry.room}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => deleteEntry(entry.id)}
                className="md:opacity-0 group-hover:opacity-100 p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-white/30 dark:bg-slate-900/10 rounded-[2.5rem] border-2 border-dashed border-white/20">
               <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                 <Calendar size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-[#1B2559] dark:text-white mb-2">No Classes Found</h3>
               <p className="text-slate-500 font-medium mb-8">Try adjusting your search query or selected day.</p>
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="btn-primary"
               >
                 Add First Class
               </button>
            </div>
          )}
        </AnimatePresence>
      </div>

       {/* Add Entry Modal */}
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
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold mb-6">Schedule New Class ⏰</h3>
              <form onSubmit={addEntry} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Algorithms" 
                    value={newEntry.subject}
                    onChange={e => setNewEntry({...newEntry, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Room No.</label>
                  <input 
                    required
                    type="text" 
                    placeholder="302A" 
                    value={newEntry.room}
                    onChange={e => setNewEntry({...newEntry, room: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                  <input 
                    required
                    type="time" 
                    value={newEntry.startTime}
                    onChange={e => setNewEntry({...newEntry, startTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                  <input 
                    required
                    type="time" 
                    value={newEntry.endTime}
                    onChange={e => setNewEntry({...newEntry, endTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Label Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewEntry({...newEntry, color: c})}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all border-2",
                          c,
                          newEntry.color === c ? "border-slate-900 dark:border-white scale-110 shadow-lg" : "border-transparent opacity-80"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 mt-4">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Save Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
