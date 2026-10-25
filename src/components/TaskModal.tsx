import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Save, 
  AlertCircle,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { Task, Subject, TaskType, Priority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  initialTask?: Task | null;
  subjects: Subject[];
  defaultDate?: string;
}

const DELIVERABLE_TYPES: TaskType[] = [
  'Assignment',
  'Practical',
  'Quiz',
  'Lab Work',
  'Project',
  'Reading',
  'Other',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  subjects,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Assignment');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder2h, setReminder2h] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setSubjectId(initialTask.subjectId || '');
      setTaskType(initialTask.taskType || 'Assignment');
      setPriority(initialTask.priority || 'Medium');
      setStatus(initialTask.status || 'Pending');
      setWeight(initialTask.weight);
      setEstimatedHours(initialTask.estimatedHours);
      setNotes(initialTask.notes || '');

      if (initialTask.dueAt) {
        const d = new Date(initialTask.dueAt);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setDueDate(`${yyyy}-${mm}-${dd}`);
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setDueTime(`${hh}:${min}`);
        }
      }
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setSubjectId(subjects.length > 0 ? subjects[0].id : '');
      setTaskType('Assignment');
      setPriority('Medium');
      setStatus('Pending');
      setWeight(undefined);
      setEstimatedHours(undefined);
      setNotes('');
      setReminder24h(true);
      setReminder2h(true);

      if (defaultDate) {
        setDueDate(defaultDate);
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);
      }
      setDueTime('23:59');
    }
    setErrorMessage('');
  }, [initialTask, isOpen, defaultDate, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }
    if (!dueDate) {
      setErrorMessage('Due date is required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      // Formulate ISO timestamp in user local time
      const [year, month, day] = dueDate.split('-').map(Number);
      const [hours, minutes] = dueTime.split(':').map(Number);
      const targetDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);

      const reminderMinutes = reminder2h ? 120 : (reminder24h ? 1440 : 0);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        subjectId: subjectId || undefined,
        taskType,
        priority,
        status,
        dueAt: targetDate.toISOString(),
        reminderMinutesBefore: reminderMinutes,
        weight: weight ? Number(weight) : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        notes: notes.trim(),
      });

      onClose();
    } catch (err: unknown) {
      console.error('Error saving task', err);
      setErrorMessage('Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialTask || !onDelete) return;
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setSaving(true);
        await onDelete(initialTask.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete task', err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer (Width max-lg) */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-slate-900 dark:text-white">
                {initialTask ? 'Edit Deliverable' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add academic assignment or study checkpoint
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form id="task-form" onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Final Project Report for CS-402"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Subject / Course Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject / Course
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="">(No specific course / General task)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectCode}: {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deliverable Type Pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deliverable Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {DELIVERABLE_TYPES.map((type) => {
                const isSelected = taskType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaskType(type)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-center border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus-within:ring-2 focus-within:ring-indigo-500">
                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white w-full focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Time
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus-within:ring-2 focus-within:ring-indigo-500">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white w-full focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('Low')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                  priority === 'Low'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Low</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('Medium')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                  priority === 'Medium'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Medium</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('High')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                  priority === 'High'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>High</span>
              </button>
            </div>
          </div>

          {/* Status Selection (for editing) */}
          {initialTask && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Progress Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      status === st
                        ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Academic weight and estimated hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Weight (% or pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={weight ?? ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 8"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimated Focus
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours ?? ''}
                onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 3.5 hrs"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Automated Reminders */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Automated In-App Reminders
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder24h}
                  onChange={(e) => setReminder24h(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>24h before</span>
              </label>

              <label className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder2h}
                  onChange={(e) => setReminder2h(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>2 hours before</span>
              </label>
            </div>
          </div>

          {/* Description & Notes / Submission links */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Notes & Submission Guidelines
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste rubric guidelines, submission link, GitHub repo, or team member requirements..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <div>
            {initialTask && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : (initialTask ? 'Update Task' : 'Save Task')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
