import { useState, useEffect } from 'react';
import { authAPI } from './lib/api';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Bell,
  Check,
  Zap,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Routes, Route, Link, Navigate } from 'react-router-dom';
import { cn } from './lib/utils';

// Components
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import Attendance from './components/Attendance';
import Timetable from './components/Timetable';
import Exams from './components/Exams';
import Notes from './components/Notes';
import StudyBuddy from './components/StudyBuddy';
import FocusMode from './components/FocusMode';
import Planner from './components/Planner';

type Tab = 'dashboard' | 'tasks' | 'attendance' | 'timetable' | 'exams' | 'notes' | 'ai' | 'planner' | 'focus';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const notifications = [
    { id: 1, title: 'Math Exam Tomorrow', description: 'Dont forget to review Calculus Unit 3.', time: '2h ago', icon: <BookOpen size={14} className="text-rose-500" /> },
    { id: 2, title: 'Assignment Completed', description: 'History essay has been marked.', time: '5h ago', icon: <Check size={14} className="text-emerald-500" /> },
    { id: 3, title: 'Study Session Streak', description: 'You have hit 5 days in a row! 🔥', time: 'Yesterday', icon: <Zap size={14} className="text-amber-500" /> },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authAPI.login({ identifier: email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authAPI.signup({ 
        username: username || email.split('@')[0], 
        email, 
        password, 
        displayName 
      });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex bg-[#F4F7FE] dark:bg-slate-950 font-sans">
        {/* Left Side: Illustration and Branding */}
        <div className="hidden lg:flex w-1/2 bg-indigo-600 p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-800 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">MyStudyLife</h1>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight max-w-md">
              Master your <span className="text-indigo-200">academic life</span> with precision.
            </h2>
            <p className="text-indigo-100 mt-6 text-lg max-w-sm font-medium">
              Join thousands of students organizing their tasks, exams, and notes in one powerful bento-style dashboard.
            </p>
          </motion.div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white" alt="avatar" />
                ))}
              </div>
              <p className="text-white text-sm font-bold">Trusted by 10k+ Students</p>
            </div>
            <p className="text-indigo-50 text-sm leading-relaxed">
              "This app completely changed how I prepare for my finals. The AI StudyBuddy is a lifesaver!"
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md w-full"
          >
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-[#1B2559] dark:text-white">MSL</h1>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-[#1B2559] dark:text-white mb-3">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 font-medium">
                {authMode === 'login' ? 'Enter your details to access your dashboard.' : 'Start your journey towards better productivity today.'}
              </p>
            </div>

            <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  authMode === 'login' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md" : "text-gray-400"
                )}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  authMode === 'signup' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md" : "text-gray-400"
                )}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="space-y-6">
              {authMode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1B2559] dark:text-slate-300 ml-1 uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alex_j" 
                      className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-gray-50 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none transition-all font-semibold shadow-sm text-[#1B2559] dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1B2559] dark:text-slate-300 ml-1 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Johnson" 
                      className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-gray-50 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none transition-all font-semibold shadow-sm text-[#1B2559] dark:text-white"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-black text-[#1B2559] dark:text-slate-300 ml-1 uppercase tracking-widest">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu" 
                  className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-gray-50 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none transition-all font-semibold shadow-sm text-[#1B2559] dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-[#1B2559] dark:text-slate-300 uppercase tracking-widest">Password</label>
                  {authMode === 'login' && <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</button>}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-gray-50 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none transition-all font-semibold shadow-sm text-[#1B2559] dark:text-white"
                  required
                />
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/30">
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <X size={12} className="text-white" />
                  </div>
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-bold leading-tight">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-[#1B2559] dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 mt-4"
              >
                {authMode === 'login' ? 'Sign In' : 'Get Started'}
              </button>

              <p className="text-center text-xs text-gray-400 font-medium">
                By continuing, you agree to our <span className="text-indigo-600 font-bold underline cursor-pointer">Terms</span> and <span className="text-indigo-600 font-bold underline cursor-pointer">Privacy Policy</span>.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'planner', label: 'Planner', icon: CalendarDays, path: '/planner' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'timetable', label: 'Timetable', icon: Calendar, path: '/timetable' },
    { id: 'exams', label: 'Exams', icon: BookOpen, path: '/exams' },
    { id: 'attendance', label: 'Attendance', icon: GraduationCap, path: '/attendance' },
    { id: 'notes', label: 'Notes', icon: Settings, path: '/notes' },
    { id: 'ai', label: 'StudyBuddy AI', icon: MessageSquare, path: '/ai' },
    { id: 'focus', label: 'Focus Timer', icon: Zap, path: '/focus' },
  ] as const;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    const item = menuItems.find(item => item.path === path);
    return (item?.id || 'dashboard') as Tab;
  };

  const activeTab = getActiveTab();

  const itemLabelMap: Record<Tab, string> = {
    dashboard: 'Dashboard',
    planner: 'Academic Planner',
    tasks: 'Task Management',
    timetable: 'Weekly Schedule',
    exams: 'Exam Planner',
    attendance: 'Attendance Tracker',
    notes: 'Study Notes',
    ai: 'StudyBuddy Assistant',
    focus: 'Focus Session',
  };

  return (
    <div className="min-h-screen flex bg-brand-bg dark:bg-slate-950 text-brand-blue dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 lg:static",
          isSidebarOpen ? "w-64" : "w-20",
          !isSidebarOpen && "lg:w-20"
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            {isSidebarOpen && <h1 className="text-xl font-bold tracking-tight text-indigo-900">MyStudyLife</h1>}
            {!isSidebarOpen && <div className="lg:hidden h-10" />}
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative font-semibold",
                  activeTab === item.id 
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <item.icon size={20} className={cn(activeTab === item.id ? "text-indigo-600 dark:text-indigo-400" : "group-hover:scale-110 transition-transform")} />
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            {isSidebarOpen && (
              <div className="bg-primary rounded-2xl p-4 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                <div className="relative z-10">
                  <p className="text-[10px] opacity-70 mb-1 font-black uppercase tracking-widest">PRO PLAN</p>
                  <h3 className="text-lg font-bold">Unleash AI Power</h3>
                  <p className="text-[10px] opacity-80 mt-2 font-medium">Upgrade to Pro for advanced AI features and unlimited nodes.</p>
                  <button className="mt-4 w-full py-2 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-white/10 hover:bg-opacity-90 transition-all">Upgrade Now</button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isSidebarOpen && <span className="font-semibold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={20} />
                {isSidebarOpen && <span className="font-semibold text-sm">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth bg-brand-bg dark:bg-slate-950 transition-colors duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 pt-4 px-4 sm:px-8 pointer-events-none">
          <div className="glass-card px-6 py-4 flex items-center justify-between rounded-3xl pointer-events-auto">
          <div className="flex items-center gap-4 lg:hidden">
             <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-black text-[#1B2559] dark:text-white tracking-tight">
              {activeTab === 'dashboard' ? `Welcome, ${user.displayName?.split(' ')[0]}!` : itemLabelMap[activeTab]}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                {activeTab === 'dashboard' ? "Academic Productivity Hub" : "University Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4">
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 glass-card p-4 rounded-[2rem] shadow-2xl z-50 border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-4 px-2">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#1B2559] dark:text-white">Notifications</h4>
                          <button className="text-[10px] items-center gap-1 font-bold text-primary hover:underline">Mark all read</button>
                        </div>
                        <div className="space-y-2">
                          {notifications.map(n => (
                            <div key={n.id} className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex gap-3 group cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                               <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                                 {n.icon}
                               </div>
                               <div className="flex-1">
                                  <p className="text-[11px] font-black text-[#1B2559] dark:text-white leading-tight">{n.title}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">{n.description}</p>
                                  <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">{n.time}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#1B2559] dark:text-white leading-none mb-1">{user.displayName || user.username}</p>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Standard User</p>
              </div>
              <div className="relative">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  className="w-11 h-11 rounded-2xl border-2 border-white dark:border-slate-700 shadow-xl shadow-primary/5 hover:scale-105 transition-transform cursor-pointer" 
                  alt="Avatar" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm shadow-emerald-500/20"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

        {/* Content Area */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/planner" element={<Planner user={user} />} />
                <Route path="/tasks" element={<TaskManager user={user} />} />
                <Route path="/attendance" element={<Attendance user={user} />} />
                <Route path="/timetable" element={<Timetable user={user} />} />
                <Route path="/exams" element={<Exams user={user} />} />
                <Route path="/notes" element={<Notes user={user} />} />
                <Route path="/ai" element={<StudyBuddy user={user} />} />
                <Route path="/focus" element={<FocusMode user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
