import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Bot, 
  Zap, 
  MoreVertical, 
  ArrowRight, 
  School, 
  FileText, 
  Download, 
  AlertTriangle,
  FolderOpen,
  Layers,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { Task, Subject, Exam } from '../types';
import { isTaskOverdue, isDueToday, isDueNext7Days, formatTime, formatDate, getCountdownString } from '../utils/dateUtils';

interface DashboardPageProps {
  displayName: string;
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  onOpenNewTask: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTaskComplete: (task: Task) => void;
  onNavigate: (tab: string) => void;
  onEnterFocusMode: (task: Task) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  displayName,
  tasks,
  subjects,
  exams,
  onOpenNewTask,
  onEditTask,
  onToggleTaskComplete,
  onNavigate,
  onEnterFocusMode,
}) => {
  const [upcomingTab, setUpcomingTab] = useState<'All' | 'Assignments' | 'Projects' | 'Labs'>('All');

  // Calculations from real Firestore records
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueTasks = tasks.filter(t => isTaskOverdue(t));
  const dueTodayTasks = tasks.filter(t => isDueToday(t.dueAt) && t.status !== 'Completed');
  const highPriorityActive = activeTasks.filter(t => t.priority === 'High');

  const upcomingNext7Days = tasks.filter(t => isDueNext7Days(t.dueAt) && t.status !== 'Completed');

  // Completion percentage rate
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  // Find most urgent high-priority task for Priority Engine Assistant
  const urgentTask = [...dueTodayTasks, ...activeTasks].find(t => t.priority === 'High') || activeTasks[0];

  // Filter upcoming deadlines by tab
  const filteredUpcoming = upcomingNext7Days.filter(t => {
    if (upcomingTab === 'Assignments') return t.taskType === 'Assignment';
    if (upcomingTab === 'Projects') return t.taskType === 'Project';
    if (upcomingTab === 'Labs') return t.taskType === 'Lab Work' || t.taskType === 'Practical';
    return true;
  });

  const getSubject = (subId?: string) => subjects.find(s => s.id === subId);

  // Today formatted in English
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const currentDayOfWeek = new Date().getDay(); // 0 is Sun, 1 is Mon...

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      
      {/* Top Welcome & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Good morning, {displayName.split(' ')[0]} 👋
            </h1>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Week 9 of 16
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here's your academic schedule at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-2xs text-slate-600 dark:text-slate-300 text-xs">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-900 dark:text-white">{todayFormatted}</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>View Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTask()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
            <kbd className="bg-indigo-500/40 text-[10px] px-1 py-0.5 rounded text-white ml-0.5 font-mono">T</kbd>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Active Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-xl shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeTasks.length}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                <TrendingUp className="w-3 h-3" /> +2 this week
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{highPriorityActive.length} high priority remaining</span>
            </p>
          </div>
        </div>

        {/* Card 2: Due Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-xl shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Due Today
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dueTodayTasks.length}
              </span>
              {dueTodayTasks.length > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {dueTodayTasks.length > 0 ? 'Requires attention before 11:59 PM' : 'No deadlines today. Enjoy!'}
            </p>
          </div>
        </div>

        {/* Card 3: Upcoming This Week */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-xl shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Upcoming This Week
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {upcomingNext7Days.length}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full font-semibold">
                Next 7 days
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {upcomingNext7Days.length > 0 ? 'Next deadline tomorrow, 11:59 PM' : 'Clear horizon ahead'}
            </p>
          </div>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-xl shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {completedTasks.length}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-semibold">
                {completionRate}% rate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              On-time completion this semester
            </p>
          </div>
        </div>
      </div>

      {/* AI Focus Banner Assistant */}
      {urgentTask && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 p-4 sm:p-5 rounded-xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                  Deadline Assistant
                </span>
                <span className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Priority Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {highPriorityActive.length > 0 
                  ? `You have ${highPriorityActive.length} high-priority tasks requiring focus. Consider tackling the `
                  : 'Your next impending deliverable is '}
                <strong className="text-slate-900 dark:text-white font-semibold">
                  {urgentTask.title}
                </strong> first.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEnterFocusMode(urgentTask)}
            className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Enter Focus Mode</span>
          </button>
        </div>
      )}

      {/* Main Asymmetric Dashboard Layout: 7 cols vs 5 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Deadlines & Schedules (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Today's Schedule & Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Today's Schedule & Deadlines
                </h2>
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {dueTodayTasks.length} Pending
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Sorted by urgency</span>
            </div>

            {/* Task Item Rows */}
            <div className="flex flex-col gap-2.5 mt-1">
              {dueTodayTasks.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No deadlines due today!
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You're fully up to speed on all tasks due before midnight.
                  </p>
                </div>
              ) : (
                dueTodayTasks.map((task) => {
                  const sub = getSubject(task.subjectId);
                  const countdown = getCountdownString(task.dueAt);
                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
                    >
                      <label className="mt-0.5 relative flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completed'}
                          onChange={() => onToggleTaskComplete(task)}
                          className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 border-slate-300 cursor-pointer"
                        />
                      </label>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug truncate"
                          >
                            {task.title}
                          </button>

                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 flex items-center gap-1 ${
                            task.priority === 'High' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-slate-500 text-xs">
                          {sub && (
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color || '#4F46E5' }} />
                              <span>{sub.subjectCode}</span>
                            </div>
                          )}

                          <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                            {task.taskType}
                          </span>

                          <div className={`flex items-center gap-1 text-[11px] font-medium ${countdown.isOverdue ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due {formatTime(task.dueAt)} ({countdown.label})</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title="Edit task"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Upcoming Deadlines (Next 7 Days) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Upcoming Deadlines</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                  Next 7 Days
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1 text-xs">
                {(['All', 'Assignments', 'Projects', 'Labs'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setUpcomingTab(tab)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      upcomingTab === tab
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUpcoming.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No upcoming deadlines matching this filter.
                </div>
              ) : (
                filteredUpcoming.map((task) => {
                  const sub = getSubject(task.subjectId);
                  const countdown = getCountdownString(task.dueAt);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          {task.taskType === 'Practical' || task.taskType === 'Lab Work' ? (
                            <Terminal className="w-4 h-4" />
                          ) : task.taskType === 'Project' ? (
                            <Layers className="w-4 h-4" />
                          ) : (
                            <Code2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate"
                          >
                            {task.title}
                          </button>
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                            {sub && <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.subjectCode}</span>}
                            <span>•</span>
                            <span>Due {formatDate(task.dueAt)}, {formatTime(task.dueAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {countdown.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Study Rhythm & Exams (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 3: Weekly Progress & Study Rhythm */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Weekly Progress & Rhythm
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {completionRate}% on track
              </span>
            </div>

            {/* Metric Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{completedTasks.length} of {totalTasksCount} Tasks Completed</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeTasks.length} Remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Day-by-Day Activity Chart */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
                {[
                  { day: 'M', height: '65%', isToday: currentDayOfWeek === 1 },
                  { day: 'T', height: '85%', isToday: currentDayOfWeek === 2 },
                  { day: 'W', height: '100%', isToday: currentDayOfWeek === 3 },
                  { day: 'T', height: '30%', isToday: currentDayOfWeek === 4 },
                  { day: 'F', height: '45%', isToday: currentDayOfWeek === 5 },
                  { day: 'S', height: '15%', isToday: currentDayOfWeek === 6 },
                  { day: 'S', height: '20%', isToday: currentDayOfWeek === 0 },
                ].map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        col.isToday 
                          ? 'bg-indigo-600 shadow-sm' 
                          : 'bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200'
                      }`}
                      style={{ height: col.height }}
                    />
                    <span className={`text-[11px] ${col.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                      {col.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Pill */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <span className="font-bold">6 Days Streak</span>
                <span className="text-slate-500 dark:text-slate-400">— keep it going!</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                Top 5%
              </span>
            </div>
          </div>

          {/* Section 4: Upcoming Exams & Tests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Exams & Tests</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('exams')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View all exams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Exam Countdown Cards */}
            <div className="flex flex-col gap-3">
              {exams.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No exams scheduled. Use the Exams tab to add your midterms and finals!
                </div>
              ) : (
                exams.slice(0, 2).map((exam) => {
                  const sub = getSubject(exam.subjectId);
                  const examDate = new Date(exam.examAt);
                  const diffDays = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={exam.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {exam.title}
                          </span>
                          {sub && (
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                              {sub.subjectCode} • {sub.name}
                            </span>
                          )}
                        </div>

                        <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-center shrink-0">
                          <span className="text-xs font-bold uppercase tracking-wider block">
                            {diffDays > 0 ? `${diffDays} Days` : 'Today'}
                          </span>
                          <span className="text-[9px] opacity-80 block uppercase">Left</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(exam.examAt)} • {formatTime(exam.examAt)}</span>
                        </div>
                        {exam.venue && (
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {exam.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Study Material Card */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  CS-402 Syllabus & Lecture Slides
                </span>
                <span className="text-[11px] text-slate-400">
                  Updated yesterday by Prof. Vance
                </span>
              </div>
            </div>
            <button
              type="button"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download material"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
