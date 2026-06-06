import { useState, useEffect } from 'react';
import { taskAPI, examAPI, attendanceAPI } from '../lib/api';
import { 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Bell,
  Clock,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Flame,
  Layout,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { getStudyStats, StudyStats } from '../lib/studyStats';

export default function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [studyStats, setStudyStats] = useState<StudyStats>(getStudyStats());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, examsRes, attRes] = await Promise.all([
          taskAPI.getAll(),
          examAPI.getAll(),
          attendanceAPI.getAll()
        ]);
        
        setTasks(tasksRes.data.filter((t: any) => t.status === 'To Do').slice(0, 3));
        setExams(examsRes.data.slice(0, 2));
        setAttendance(attRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    setStudyStats(getStudyStats());

    const quotes = [
      { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
      { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" }
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPossible = attendance.reduce((acc, curr) => acc + curr.total, 0);
  const totalPresent = attendance.reduce((acc, curr) => acc + curr.attended, 0);
  const overallPercentage = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  const activityData = [
    { name: 'Mon', hours: 4.2 },
    { name: 'Tue', hours: 7.1 },
    { name: 'Wed', hours: 5.5 },
    { name: 'Thu', hours: 8.4 },
    { name: 'Fri', hours: 6.2 },
    { name: 'Sat', hours: 4.8 },
    { name: 'Sun', hours: 3.5 },
  ];

  const attendanceData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalPossible - totalPresent }
  ];

  const COLORS = ['#6C63FF', '#E2E8F0'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
      
      {/* 1. Main Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} fill="currentColor" />
              Productivity Level: High
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#1B2559] dark:text-white leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#1B2559] dark:text-white mb-2 leading-tight">
            Level up your studies,<br/>{user.displayName?.split(' ')[0]}! 🚀
          </h1>
          <p className="text-slate-400 font-medium text-sm max-w-xs">
            You've completed 75% of your weekly goals. Complete 2 more tasks to hit your target!
          </p>
        </div>
        
        <div className="mt-6 flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate('/focus')}
            className="btn-primary flex items-center gap-2 group"
          >
            Start Study Session
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mb-20 blur-3xl"></div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 dark:opacity-5 hidden sm:block">
           <GraduationCap size={180} />
        </div>
      </motion.div>

      {/* 2. Attendance Stats Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-3xl flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Attendance</h3>
          <ArrowUpRight size={18} className="text-primary" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <div className="relative w-32 h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  innerRadius={38}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={6}
                >
                  {attendanceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#1B2559] dark:text-white leading-none">{overallPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Goal</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-black text-[#1B2559] dark:text-white text-lg leading-tight">Well Done!</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Above 75% threshold</p>
          </div>
        </div>
      </motion.div>

      {/* 3. Productivity Graph */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="col-span-1 md:col-span-2 lg:col-span-2 glass-card p-8 rounded-[2.5rem] flex flex-col min-h-[350px]"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 leading-none">Activity</h3>
            <p className="text-2xl font-black text-[#1B2559] dark:text-white mt-2">Study Flow</p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
               <span className="text-xl font-black text-[#1B2559] dark:text-white">{Math.floor(studyStats.totalMinutes / 60)}h {studyStats.totalMinutes % 60}m</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Focus Time</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl text-primary flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={[
                { name: 'Mon', hours: 0.8 },
                { name: 'Tue', hours: 1.5 },
                { name: 'Wed', hours: 2.2 },
                { name: 'Thu', hours: 1.8 },
                { name: 'Fri', hours: studyStats.totalMinutes / 60 },
              ]} 
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
                  fontSize: '12px', 
                  fontWeight: '900',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#6C63FF' }}
                cursor={{ stroke: '#6C63FF', strokeWidth: 2, strokeDasharray: '6 6' }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#6C63FF" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorHours)" 
                animationDuration={2500}
                strokeLinecap="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 4. Stats Sidebar */}
      <div className="col-span-1 space-y-6">
        <div className="glass-card p-8 rounded-[2.5rem] bg-[#1B2559] text-white relative overflow-hidden group border-none">
          <div className="relative z-10">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-8 flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              Daily Streak
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-black">{studyStats.streak}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mt-1">Days Strong</p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform">
                <Flame size={32} className="text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
           <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
             <Trophy size={16} className="text-primary" />
             Study Progress
           </h3>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-black text-[#1B2559] dark:text-white uppercase tracking-tighter">Focus Score</span>
                  <span className="text-xl font-black text-primary">{studyStats.focusScore}%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${studyStats.focusScore}%` }}
                    className="h-full bg-primary"
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                 <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <CheckCircle2 size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-[#1B2559] dark:text-white uppercase tracking-widest">Sessions Completed</p>
                    <p className="text-sm font-bold text-slate-500">{studyStats.sessionsCompleted} total</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Upcoming Exams */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-1 md:col-span-2 glass-card p-6 rounded-3xl flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-black text-[#1B2559] dark:text-white">Upcoming Exams</h3>
           <button className="text-xs font-bold text-primary hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
           {exams.map((exam, i) => (
             <div key={exam.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all">
               <div>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    i % 2 === 0 ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    <BookOpen size={16} />
                  </div>
                  <h4 className="text-sm font-black text-[#1B2559] dark:text-white mb-1">{exam.subject}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{exam.title}</p>
               </div>
               <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400">{exam.date}</span>
                  <div className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-[9px] font-black text-primary border border-gray-100 dark:border-slate-600 shadow-sm">
                     {Math.floor(Math.random() * 10) + 1}D
                  </div>
               </div>
             </div>
           ))}
           {exams.length === 0 && <p className="col-span-3 text-xs text-slate-400 italic text-center py-10 underline decoration-slate-200">No upcoming exam slots identified yet.</p>}
        </div>
      </motion.div>

      {/* 5. Right Sidebar Style Widgets */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col gap-6">
        {/* Today's Schedule Mini */}
        <div className="glass-card p-6 rounded-3xl flex-1 bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-sm uppercase tracking-[0.2em]">Live Today</h3>
              <Clock size={16} className="opacity-60" />
            </div>
            
            <div className="space-y-4 flex-1">
               {tasks.length > 0 ? tasks.map((task, i) => (
                 <div key={task.id} className="flex gap-3 h-12">
                   <div className="w-1 h-full bg-white/30 rounded-full"></div>
                   <div className="flex flex-col justify-center">
                     <p className="text-xs font-bold leading-none">{task.title}</p>
                     <p className="text-[10px] opacity-60 mt-1">{task.subject} • 1{i}:30 AM</p>
                   </div>
                 </div>
               )) : (
                 <p className="text-xs opacity-60 italic">Free schedule today!</p>
               )}
            </div>

            <Link 
              to="/planner"
              className="mt-8 w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
            >
               Open Full Planner
            </Link>
          </div>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Success Quote Widget */}
        <div className="glass-card p-6 rounded-3xl bg-slate-900 text-white border-none shadow-xl shadow-slate-950/20">
           <div className="flex items-center gap-3 mb-4">
              <Target size={18} className="text-secondary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daily Wisdom</h3>
           </div>
           <p className="text-sm font-medium italic leading-relaxed">
             "{quote.text}"
           </p>
           <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-4">— {quote.author}</p>
        </div>
      </div>

    </div>
  );
}

import { GraduationCap } from 'lucide-react';
