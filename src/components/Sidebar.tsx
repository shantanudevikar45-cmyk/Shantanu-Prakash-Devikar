import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  CalendarDays, 
  BookOpen, 
  GraduationCap, 
  CheckCheck, 
  Settings as SettingsIcon, 
  Plus,
  Flame
} from 'lucide-react';
import { Task, Subject, Exam } from '../types';
import { isTaskOverdue } from '../utils/dateUtils';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewTask: () => void;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  course?: string;
  semester?: string;
  termProgress?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTask,
  tasks,
  subjects,
  exams,
  semester = 'Semester 6 • Spring 2025',
  termProgress = 74,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const activeTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasksCount = tasks.filter(t => isTaskOverdue(t)).length;
  
  // Calculate upcoming exams within 14 days
  const soonExamsCount = exams.filter(e => {
    const diff = new Date(e.examAt).getTime() - Date.now();
    return diff > 0 && diff < 14 * 86400000;
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckCircle2,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
      badgeColor: overdueTasksCount > 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: BookOpen,
      badge: subjects.length > 0 ? subjects.length : undefined,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: GraduationCap,
      badge: soonExamsCount > 0 ? `${soonExamsCount} soon` : (exams.length > 0 ? exams.length : undefined),
      badgeColor: soonExamsCount > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCheck,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#0f172a] z-50 flex flex-col justify-between p-3.5
        border-r border-slate-200 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)]
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-3">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Taskora</span>
                <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                  Student Pro
                </span>
              </div>
            </div>
          </div>

          {/* New Task Button */}
          <button 
            type="button"
            onClick={onOpenNewTask}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm py-2 px-3 rounded-lg shadow-sm hover:shadow transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>+ New Task</span>
            <kbd className="hidden sm:inline bg-indigo-500/40 text-xs px-1.5 py-0.5 rounded text-white font-mono">T</kbd>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic Term Progress Footer Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academic Term</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{termProgress}%</span>
          </div>
          <div className="text-xs text-slate-900 dark:text-slate-200 font-semibold mb-2 truncate" title={semester}>
            {semester}
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, termProgress))}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
