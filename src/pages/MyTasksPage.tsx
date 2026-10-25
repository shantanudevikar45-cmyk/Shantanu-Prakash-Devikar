import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ListFilter, 
  LayoutList, 
  Kanban, 
  Download, 
  Plus, 
  Search, 
  AlarmClock, 
  Clock, 
  Calendar as CalendarIcon, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  RotateCcw, 
  ArrowUpDown, 
  Check, 
  AlertTriangle,
  Flame,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Task, Subject, Priority, TaskType, TaskStatus } from '../types';
import { isTaskOverdue, isDueToday, isDueNext7Days, formatTime, formatDate, getCountdownString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface MyTasksPageProps {
  tasks: Task[];
  subjects: Subject[];
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTaskComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onBulkDelete: (taskIds: string[]) => Promise<void>;
  onBulkUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<void>;
  onEnterFocusMode: (task: Task) => void;
}

export const MyTasksPage: React.FC<MyTasksPageProps> = ({
  tasks,
  subjects,
  onOpenNewTask,
  onEditTask,
  onToggleTaskComplete,
  onDeleteTask,
  onBulkDelete,
  onBulkUpdateStatus,
  onEnterFocusMode,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'due_soon' | 'completed' | 'overdue'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter tasks based on search & filter controls
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q) || false;
        const matchesType = task.taskType.toLowerCase().includes(q);
        const sub = subjects.find(s => s.id === task.subjectId);
        const matchesSub = sub ? sub.subjectCode.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc && !matchesType && !matchesSub) return false;
      }

      // Status
      const overdue = isTaskOverdue(task);
      if (statusFilter === 'pending' && (task.status !== 'Pending' || overdue)) return false;
      if (statusFilter === 'in_progress' && (task.status !== 'In Progress' || overdue)) return false;
      if (statusFilter === 'completed' && task.status !== 'Completed') return false;
      if (statusFilter === 'overdue' && !overdue) return false;
      if (statusFilter === 'due_soon') {
        const dueSoon = (isDueToday(task.dueAt) || isDueNext7Days(task.dueAt)) && task.status !== 'Completed';
        if (!dueSoon) return false;
      }

      // Subject
      if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) return false;

      // Type
      if (typeFilter !== 'all' && task.taskType !== typeFilter) return false;

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, searchQuery, statusFilter, subjectFilter, typeFilter, priorityFilter, sortBy, subjects]);

  // Derived counts for tabs and analytic strip
  const activeCount = tasks.filter(t => t.status !== 'Completed').length;
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => isTaskOverdue(t)).length;
  const dueTodayCount = tasks.filter(t => isDueToday(t.dueAt) && t.status !== 'Completed').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending' && !isTaskOverdue(t)).length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress' && !isTaskOverdue(t)).length;

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Grouped task categorizations for the list view
  const overdueTasksGroup = filteredTasks.filter(t => isTaskOverdue(t));
  const dueTodayTasksGroup = filteredTasks.filter(t => isDueToday(t.dueAt) && !isTaskOverdue(t) && t.status !== 'Completed');
  const upcomingThisWeekGroup = filteredTasks.filter(t => isDueNext7Days(t.dueAt) && !isDueToday(t.dueAt) && !isTaskOverdue(t) && t.status !== 'Completed');
  const otherOrCompletedGroup = filteredTasks.filter(t => 
    !isTaskOverdue(t) && 
    !isDueToday(t.dueAt) && 
    !isDueNext7Days(t.dueAt) || 
    t.status === 'Completed'
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(paginatedTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelectOne = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkDone = async () => {
    if (selectedTaskIds.length === 0) return;
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      await onBulkUpdateStatus(selectedTaskIds, 'Completed');
      setSelectedTaskIds([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      await onBulkDelete(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Subject', 'Type', 'Priority', 'Status', 'Due Date', 'Notes'];
    const rows = filteredTasks.map(t => {
      const sub = subjects.find(s => s.id === t.subjectId);
      return [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${sub ? sub.subjectCode : ''}"`,
        `"${t.taskType}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.dueAt}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taskora_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setSortBy('dueDate');
    setCurrentPage(1);
  };

  const getSubject = (subId?: string) => subjects.find(s => s.id === subId);

  return (
    <div className="flex flex-col w-full pb-16">
      
      {/* Top Bar & Primary Metric Header */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  My Tasks
                </h1>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-indigo-600 dark:text-indigo-400">{activeCount} Active</span>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="text-slate-500 dark:text-slate-400">{completedCount} Completed</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Semester 6 Deliverables • {dueTodayCount + overdueCount} Deadlines approaching or requiring attention
              </p>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span>Board</span>
              </button>
            </div>

            {/* Export button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Export tasks to CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Primary Add Task Trigger */}
            <button
              type="button"
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Task</span>
            </button>
          </div>
        </div>

        {/* Quick Analytic Strip (4 Cards matching Screenshot #2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: On-Time Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                On-Time Rate
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">94.2%</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+3.1% vs mid-term</span>
              </div>
            </div>
            {/* Micro Sparkline SVG */}
            <svg className="w-14 h-8 text-emerald-500 overflow-visible" fill="none" viewBox="0 0 56 32">
              <path d="M2 26 L12 24 L22 18 L32 20 L42 10 L54 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              <circle cx="54" cy="6" fill="currentColor" r="3" />
            </svg>
          </div>

          {/* Card 2: Due in 24 Hours */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Due in 24 Hours
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {dueTodayCount} Tasks
                </span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Critical</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlarmClock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Term Weight Covered */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Term Weight Covered
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">420 / 600 pts</span>
              </div>
            </div>
            {/* Dual Ring SVG */}
            <svg className="w-9 h-9" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
              <path className="text-indigo-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="70, 100" strokeLinecap="round" strokeWidth="3.5" />
            </svg>
          </div>

          {/* Card 4: Weekly Focus Load */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Weekly Focus Load
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">18.5 hrs</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Moderate</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Command Rail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs mb-6 flex flex-col gap-4">
        {/* Top Row: Search & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-full md:w-96 text-slate-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, or keyword..."
              className="bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:outline-none"
            />
            <kbd className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">
              /
            </kbd>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            {[
              { id: 'all', label: `All (${tasks.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'due_soon', label: `Due Soon (${dueTodayCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
              { id: 'overdue', label: `Overdue (${overdueCount})`, isError: true },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as typeof statusFilter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    isSelected
                      ? tab.isError 
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : tab.isError
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Row & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Select */}
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Subject: All ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subjectCode}: {s.name}</option>
              ))}
            </select>

            {/* Type Select */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Type: All Types</option>
              <option value="Assignment">Assignment</option>
              <option value="Practical">Practical</option>
              <option value="Lab Work">Lab Work</option>
              <option value="Project">Project</option>
              <option value="Quiz">Quiz</option>
              <option value="Reading">Reading</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Priority: All</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium py-1 px-2 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date (Earliest First)</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="title">Deliverable Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Selection / Bulk Actions Banner */}
        {selectedTaskIds.length > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5 rounded-lg text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold">
                {selectedTaskIds.length} tasks selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleBulkDone}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-md shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Mark as Done
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteSelected}
                className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-md hover:bg-rose-600 hover:text-white transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedTaskIds([])}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODES: LIST VS BOARD (KANBAN) */}
      {viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((statusCol) => {
            const colTasks = filteredTasks.filter(t => t.status === statusCol);
            return (
              <div 
                key={statusCol}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      statusCol === 'Completed' ? 'bg-emerald-500' : (statusCol === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400')
                    }`} />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{statusCol}</h3>
                  </div>
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No deliverables in {statusCol}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const sub = getSubject(task.subjectId);
                      const countdown = getCountdownString(task.dueAt);
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                              {task.title}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                            {sub && (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {sub.subjectCode}
                              </span>
                            )}
                            <span>•</span>
                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                              {task.taskType}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                            <span className={`text-[11px] font-medium ${countdown.isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                              {countdown.label}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onEditTask(task)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleTaskComplete(task)}
                                className={`p-1 ${task.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STRUCTURED LIST VIEW (Matching screenshot #2 with categorized subsections) */
        <div className="flex flex-col gap-6">
          
          {/* 1. OVERDUE SUBSECTION (If any) */}
          {overdueTasksGroup.length > 0 && (statusFilter === 'all' || statusFilter === 'overdue') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-md border border-rose-200 dark:border-rose-900/60">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold tracking-tight">
                    OVERDUE • {overdueTasksGroup.length} Action Required
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Immediate submission recommended</span>
              </div>

              {overdueTasksGroup.map((task) => {
                const sub = getSubject(task.subjectId);
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="group bg-white dark:bg-slate-900 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(task.id)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 border-slate-300 mt-1 md:mt-0 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {sub && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {sub.subjectCode}
                            </span>
                          )}
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-md">
                            {task.taskType}
                          </span>
                          <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                            High Priority
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="flex flex-col md:items-end">
                        <div className="flex items-center gap-1 text-rose-600 text-xs font-semibold">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Due {formatDate(task.dueAt)} ({formatTime(task.dueAt)})</span>
                        </div>
                        <span className="text-[10px] text-rose-500 font-medium">-10% penalty today</span>
                      </div>

                      <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 text-xs px-3 py-1 rounded-full font-semibold">
                        Overdue
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEnterFocusMode(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                          title="Focus Mode"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. DUE TODAY SUBSECTION */}
          {dueTodayTasksGroup.length > 0 && (statusFilter === 'all' || statusFilter === 'due_soon') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Flame className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Due Today</span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {dueTodayTasksGroup.length} items
                  </span>
                </div>
                <span className="text-xs text-slate-400">{todayFormatted}</span>
              </div>

              {dueTodayTasksGroup.map((task) => {
                const sub = getSubject(task.subjectId);
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(task.id)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 border-slate-300 mt-1 md:mt-0 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {sub && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {sub.subjectCode}
                            </span>
                          )}
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-md">
                            {task.taskType}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                        >
                          {task.title}
                        </button>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {task.description && <span className="truncate">{task.description}</span>}
                          {task.status === 'In Progress' && (
                            <div className="hidden sm:flex items-center gap-1.5 w-28 shrink-0">
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                              </div>
                              <span className="text-[10px] text-emerald-600 font-mono font-bold">65%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="flex flex-col md:items-end">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Today, {formatTime(task.dueAt)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {task.weight ? `Weight: ${task.weight}% of Grade` : 'Standard assignment'}
                        </span>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        task.status === 'In Progress' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {task.status}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEnterFocusMode(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                          title="Open Focus Mode"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. UPCOMING THIS WEEK SUBSECTION */}
          {upcomingThisWeekGroup.length > 0 && (statusFilter === 'all' || statusFilter === 'due_soon') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span>Upcoming This Week</span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {upcomingThisWeekGroup.length} items
                  </span>
                </div>
                <span className="text-xs text-slate-400">Next 7 Days</span>
              </div>

              {upcomingThisWeekGroup.map((task) => {
                const sub = getSubject(task.subjectId);
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start md:items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(task.id)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 border-slate-300 mt-1 md:mt-0 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {sub && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {sub.subjectCode}
                            </span>
                          )}
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-md">
                            {task.taskType}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            {task.priority} Priority
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="flex flex-col md:items-end">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(task.dueAt)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatTime(task.dueAt)}</span>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        task.status === 'In Progress' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {task.status}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEnterFocusMode(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                          title="Open Focus Mode"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. OTHER / COMPLETED / LATER DELIVERABLES */}
          {otherOrCompletedGroup.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {statusFilter === 'completed' ? 'Completed Deliverables' : 'Other Deliverables & History'}
                </span>
                <span className="text-xs text-slate-400">{otherOrCompletedGroup.length} items</span>
              </div>

              {otherOrCompletedGroup.map((task) => {
                const sub = getSubject(task.subjectId);
                const isSelected = selectedTaskIds.includes(task.id);
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    className={`group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDone ? 'opacity-70 hover:opacity-100' : ''
                    }`}
                  >
                    <div className="flex items-start md:items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(task.id)}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 border-slate-300 mt-1 md:mt-0 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {sub && (
                            <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {sub.subjectCode}
                            </span>
                          )}
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-md">
                            {task.taskType}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className={`text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="flex flex-col md:items-end">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {formatDate(task.dueAt)}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatTime(task.dueAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleTaskComplete(task)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 transition-colors ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{task.status}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No tasks found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                No deliverables match your search criteria or filter selections. Try adjusting the filters or create a new task.
              </p>
              <button
                type="button"
                onClick={onOpenNewTask}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                + Create New Task
              </button>
            </div>
          )}

        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{Math.min(1, filteredTasks.length)}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{filteredTasks.length}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{tasks.length}</span> deliverables
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-600 text-white rounded-md">
            1
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
