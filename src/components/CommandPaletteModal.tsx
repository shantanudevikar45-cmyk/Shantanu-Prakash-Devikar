import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  Plus, 
  LayoutDashboard, 
  CalendarDays, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Task, Subject, Exam } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  onSelectTask: (task: Task) => void;
  onNavigate: (tab: string) => void;
  onOpenNewTask: () => void;
  onToggleTheme: () => void;
  onSeedData: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  tasks,
  subjects,
  exams,
  onSelectTask,
  onNavigate,
  onOpenNewTask,
  onToggleTheme,
  onSeedData,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.description?.toLowerCase().includes(query.toLowerCase()) ||
    t.taskType.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.subjectCode.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) || 
    e.venue?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tasks, subjects, exams..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          
          {/* Quick Actions */}
          <div className="py-1">
            <span className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Actions
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewTask();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>Create New Task</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('dashboard');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Go to Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('calendar');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>Go to Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSeedData();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Seed / Reset Academic Sample Data</span>
            </button>
          </div>

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div className="py-1">
              <span className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Deliverables & Tasks
              </span>
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTask(t);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 ml-2">
                    {t.taskType}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Subjects Results */}
          {filteredSubjects.length > 0 && (
            <div className="py-1">
              <span className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Subjects
              </span>
              {filteredSubjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('subjects');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate font-medium">{s.subjectCode}: {s.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">View</span>
                </button>
              ))}
            </div>
          )}

          {/* Exams Results */}
          {filteredExams.length > 0 && (
            <div className="py-1">
              <span className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Exams
              </span>
              {filteredExams.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('exams');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate font-medium">{e.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">View</span>
                </button>
              ))}
            </div>
          )}

          {query && filteredTasks.length === 0 && filteredSubjects.length === 0 && filteredExams.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching tasks, subjects, or exams found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrows or click</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
