import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  MoreVertical,
  BookOpen,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { taskAPI, examAPI, attendanceAPI } from '../lib/api';

interface PlannerProps {
  user: any;
}

export default function Planner({ user }: PlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Reuse some logic from other components for consistency
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskAPI.getAll();
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Padding for empty days at start
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border-b border-r border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/10"></div>);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
      days.push(
        <div key={day} className="h-24 sm:h-32 border-b border-r border-gray-100 dark:border-slate-800 p-2 sm:p-4 group hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <span className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold",
              isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-[#1B2559] dark:text-gray-400 group-hover:text-primary transition-colors"
            )}>
              {day}
            </span>
          </div>
          
          {/* Mock events for visual feedback */}
          <div className="mt-2 space-y-1">
            {day % 7 === 1 && (
              <div className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[8px] sm:text-[10px] font-black uppercase rounded truncate border border-rose-200/50">
                Math Exam
              </div>
            )}
            {day % 5 === 0 && (
              <div className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[10px] font-black uppercase rounded truncate border border-indigo-200/50">
                History Prep
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1B2559] dark:text-white">Academic Planner 🗓️</h2>
          <p className="text-slate-500 font-medium tracking-tight">Your unified command center for schedules, tasks, and exams.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-900 p-1 rounded-2xl border border-gray-200 dark:border-slate-800">
           <button
              className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white dark:bg-slate-800 text-primary shadow-sm"
           >
             Calendar View
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-[#1B2559] dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
              </div>
              <button className="hidden sm:flex items-center gap-2 btn-primary !py-2 !px-4 !text-[10px]">
                <Plus size={14} />
                Add Event
              </button>
            </div>
            {renderCalendar()}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Upcoming Priority</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm animate-pulse"></div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Crucial</span>
                </div>
                <h4 className="text-sm font-black text-[#1B2559] dark:text-white">Physics Final Report</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Due in 2 days</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm"></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Medium</span>
                </div>
                <h4 className="text-sm font-black text-[#1B2559] dark:text-white">History Quiz Preparation</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Due in 5 days</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl bg-[#1B2559] text-white">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6">Study Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-black">128</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Hours</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">+12%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">From last month</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Semester Goal</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
