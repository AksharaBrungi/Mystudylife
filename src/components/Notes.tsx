import { useState, useEffect } from 'react';
import { notesAPI } from '../lib/api';
import { Plus, Trash2, Search, Edit3, Save, X, BookOpen, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function Notes({ user }: { user: any }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll();
      const data = res.data;
      setNotes(data);
      if (data.length > 0 && !activeNote) setActiveNote(data[0]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    const freshNoteData = {
      title: 'Untitled Note',
      content: '# New Note\nStart typing here...',
      subject: 'General'
    };
    try {
      const res = await notesAPI.create(freshNoteData);
      await fetchNotes();
      setActiveNote(res.data);
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  const saveNote = async () => {
    if (!activeNote) return;
    try {
      await notesAPI.update(activeNote.id, {
        title: activeNote.title,
        content: activeNote.content,
        subject: activeNote.subject || 'General'
      });
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id: number) => {
    if (confirm('Delete this note permanent?')) {
      await notesAPI.delete(id);
      if (activeNote?.id === id) setActiveNote(null);
      fetchNotes();
    }
  };

  const downloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title}.md`;
    a.click();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar - Note List */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs shadow-sm"
            />
          </div>
          <button 
            onClick={addNote}
            className="p-3 bg-primary hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { setActiveNote(note); setIsEditing(false); }}
              className={cn(
                "w-full text-left p-5 rounded-[1.5rem] transition-all border",
                activeNote?.id === note.id 
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                  : "bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              )}
            >
              <h4 className={cn("font-black text-sm truncate mb-1", activeNote?.id === note.id ? "text-white" : "text-[#1B2559] dark:text-white")}>{note.title}</h4>
              <p className={cn("text-[10px] line-clamp-1 opacity-70 font-medium", activeNote?.id === note.id ? "text-white/80" : "text-slate-500")}>
                {note.content.replace(/[#*`]/g, '').substring(0, 40)}
              </p>
              <div className={cn("mt-3 text-[8px] font-black uppercase tracking-widest", activeNote?.id === note.id ? "text-white/60" : "text-slate-400")}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
          {filteredNotes.length === 0 && !loading && (
            <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
               <BookOpen size={32} className="mx-auto mb-4 text-slate-300" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No notes found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel - Note Content */}
      <div className="flex-1 glass-card rounded-[2rem] overflow-hidden flex flex-col">
        {activeNote ? (
          <>
            <div className="px-8 py-5 bg-white/50 dark:bg-slate-900/50 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {isEditing ? (
                  <input 
                    value={activeNote.title}
                    onChange={e => setActiveNote({...activeNote, title: e.target.value})}
                    className="bg-transparent border-none p-0 text-xl font-black text-[#1B2559] dark:text-white focus:ring-0 w-full"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-xl font-black text-[#1B2559] dark:text-white">{activeNote.title}</h2>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button onClick={saveNote} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-xl active:scale-95 transition-all">
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={downloadNote} title="Download Markdown" className="p-2.5 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all">
                      <Download size={18} />
                    </button>
                    <button onClick={() => setIsEditing(true)} className="p-2.5 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteNote(activeNote.id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white/30 dark:bg-slate-900/10">
              {isEditing ? (
                <textarea 
                  value={activeNote.content}
                  onChange={e => setActiveNote({...activeNote, content: e.target.value})}
                  className="w-full h-full bg-transparent border-none p-0 focus:ring-0 font-mono text-sm leading-loose dark:text-white"
                  placeholder="Start writing in markdown..."
                />
              ) : (
                <article className="prose prose-indigo dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-pre:bg-slate-900/50">
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </article>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-gray-50/30 dark:bg-slate-900/30">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/5 border border-white dark:border-slate-800">
              <Edit3 size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black text-[#1B2559] dark:text-white mb-3">Note Editor</h3>
            <p className="text-sm font-medium max-w-xs text-slate-500 line-height-relaxed">Select a note from the sidebar or click the plus button to start your brilliant study ideas.</p>
            <button 
              onClick={addNote}
              className="mt-8 btn-primary"
            >
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
