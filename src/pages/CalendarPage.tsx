import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  School,
  GraduationCap
} from 'lucide-react';
import { Task, Subject, Exam } from '../types';
import { formatTime, formatDate, isTaskOverdue } from '../utils/dateUtils';

interface CalendarPageProps {
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  onOpenNewTask: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  subjects,
  exams,
  onOpenNewTask,
  onEditTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get items for a given year-month-day
  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => {
      const d = new Date(t.dueAt);
      if (isNaN(d.getTime())) return false;
      const tStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return tStr === dateStr;
    });

    const dayExams = exams.filter(e => {
      const d = new Date(e.examAt);
      if (isNaN(d.getTime())) return false;
      const eStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return eStr === dateStr;
    });

    return { tasks: dayTasks, exams: dayExams };
  };

  // Selected date items
  const selDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayItems = {
    tasks: tasks.filter(t => {
      const d = new Date(t.dueAt);
      if (isNaN(d.getTime())) return false;
      const tStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return tStr === selDateStr;
    }),
    exams: exams.filter(e => {
      const d = new Date(e.examAt);
      if (isNaN(d.getTime())) return false;
      const eStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return eStr === selDateStr;
    })
  };

  const getSubject = (subId?: string) => subjects.find(s => s.id === subId);

  return (
    <div className="flex flex-col w-full pb-16 gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deadlines, exam schedules, and study rhythms in local timezone
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewTask(selDateStr)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white ml-2">
            {monthName}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] p-1.5 bg-slate-50/50 dark:bg-slate-950/20" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const { tasks: dayTasks, exams: dayExams } = getItemsForDay(dayNum);
                const isToday = 
                  new Date().getDate() === dayNum && 
                  new Date().getMonth() === month && 
                  new Date().getFullYear() === year;
                const isSelected = 
                  selectedDate.getDate() === dayNum && 
                  selectedDate.getMonth() === month && 
                  selectedDate.getFullYear() === year;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                    className={`min-h-[95px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-600 inset-0'
                        : isToday 
                          ? 'bg-slate-50/80 dark:bg-slate-800/40' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-indigo-600 text-white font-bold' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {dayNum}
                      </span>

                      {(dayTasks.length > 0 || dayExams.length > 0) && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dayTasks.length + dayExams.length}
                        </span>
                      )}
                    </div>

                    {/* Day pills */}
                    <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayExams.map((exam) => (
                        <div
                          key={exam.id}
                          className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[10px] font-semibold px-1.5 py-0.5 rounded truncate flex items-center gap-1 border border-amber-200 dark:border-amber-900"
                        >
                          <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{exam.title}</span>
                        </div>
                      ))}

                      {dayTasks.slice(0, 2).map((task) => {
                        const sub = getSubject(task.subjectId);
                        const isDone = task.status === 'Completed';
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 transition-all ${
                              isDone
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                : task.priority === 'High'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sub?.color || '#4F46E5' }} />
                            <span className="truncate">{task.title}</span>
                          </div>
                        );
                      })}

                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-semibold px-1">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Schedule Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Schedule for {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDayItems.tasks.length + selectedDayItems.exams.length} items planned
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewTask(selDateStr)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                + Add Task
              </button>
            </div>

            {/* List for selected date */}
            <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto">
              {/* Exams first */}
              {selectedDayItems.exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>{exam.title}</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">
                      Exam
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400 mt-1">
                    <span>{formatTime(exam.examAt)}</span>
                    <span>{exam.venue || 'Campus Hall'}</span>
                  </div>
                </div>
              ))}

              {/* Tasks */}
              {selectedDayItems.tasks.map((task) => {
                const sub = getSubject(task.subjectId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-bold text-slate-900 dark:text-white ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      {sub && <span>{sub.subjectCode} • {task.taskType}</span>}
                      <span>{formatTime(task.dueAt)}</span>
                    </div>
                  </div>
                );
              })}

              {selectedDayItems.tasks.length === 0 && selectedDayItems.exams.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No deliverables or exams scheduled on this day.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AGENDA VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No tasks in your agenda.</div>
          ) : (
            tasks.map((task) => {
              const sub = getSubject(task.subjectId);
              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub?.color || '#4F46E5' }} />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {task.title}
                      </span>
                      <span className="text-xs text-slate-400">
                        {sub?.subjectCode} • {task.taskType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {formatDate(task.dueAt)} at {formatTime(task.dueAt)}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
