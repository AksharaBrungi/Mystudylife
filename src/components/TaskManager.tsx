import { useState, useEffect } from 'react';
import { taskAPI } from '../lib/api';
import { Plus, Trash2, CheckCircle, Search, Filter, Clock, MoreVertical, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function TaskManager({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority: 'Medium',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskAPI.create(newTask);
      setShowAddModal(false);
      setNewTask({ title: '', subject: '', deadline: '', priority: 'Medium' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    try {
      await taskAPI.update(taskId, {
        status: currentStatus === 'To Do' ? 'Completed' : 'To Do'
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await taskAPI.delete(taskId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-6 rounded-[2rem]">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-[#1B2559] dark:text-white mb-2">Goal Pursuit 🚀</h2>
          <p className="text-slate-500 font-medium text-sm">You have <span className="text-primary font-bold">{tasks.filter(t => t.status === 'To Do').length} pending</span> tasks for this week.</p>
          <div className="mt-6 max-w-sm">
            <div className="flex justify-between mb-2 items-baseline">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Overall Progress</span>
              <span className="text-xl font-black text-[#1B2559] dark:text-white">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="bg-primary h-full rounded-full" 
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-center"
        >
          <Plus size={20} />
          Add New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks or subjects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full sm:w-auto">
          {['All', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all",
                filterPriority === p ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-2xl border transition-all",
                task.status === 'Completed' 
                  ? "bg-slate-50/50 dark:bg-slate-900/50 border-transparent opacity-60" 
                  : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50"
              )}
            >
              <button 
                onClick={() => toggleTaskStatus(task.id, task.status)}
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  task.status === 'Completed' ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-700 hover:border-blue-500"
                )}
              >
                {task.status === 'Completed' && <CheckCircle size={14} className="text-white" />}
              </button>
              
              <div className="flex-1">
                <h4 className={cn("text-base font-black text-[#1B2559] dark:text-white mb-1", task.status === 'Completed' && "line-through text-slate-400 opacity-60")}>{task.title}</h4>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{task.subject}</span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} className="opacity-60" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{task.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
                  task.priority === 'High' ? "bg-rose-50 text-rose-600 border border-rose-100 ring-4 ring-rose-50/50" : 
                  task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                  "bg-blue-50 text-blue-600 border border-blue-100"
                )}>
                  {task.priority}
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          )) : !loading && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare size={32} className="text-slate-400" />
               </div>
               <h3 className="text-slate-900 dark:text-white font-bold text-lg">No tasks found</h3>
               <p className="text-slate-500 text-sm">Enjoy your free time or add a new task to get started!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">New Mission 🎯</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Task Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Physics Assignment" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Math" 
                      value={newTask.subject}
                      onChange={e => setNewTask({...newTask, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Deadline</label>
                    <input 
                      required
                      type="date" 
                      value={newTask.deadline}
                      onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({...newTask, priority: p})}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border-2",
                          newTask.priority === p 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
