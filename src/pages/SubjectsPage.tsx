import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Palette
} from 'lucide-react';
import { Subject, Task } from '../types';

interface SubjectsPageProps {
  subjects: Subject[];
  tasks: Task[];
  onCreateSubject: (subject: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onSelectSubjectFilter?: (subjectId: string) => void;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#006C49', // Forest Emerald
  '#0284C7', // Sky Blue
  '#16A34A', // Green
  '#D97706', // Amber
  '#DC2626', // Red
  '#DB2777', // Pink
];

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  tasks,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onSelectSubjectFilter,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [name, setName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('Semester 6');
  const [color, setColor] = useState('#4F46E5');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setSubjectCode('');
    setSemester('Semester 6');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setSubjectCode(sub.subjectCode);
    setSemester(sub.semester || 'Semester 6');
    setColor(sub.color || '#4F46E5');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectCode.trim()) {
      setErrorMsg('Subject name and code are required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      if (editingSubject) {
        await onUpdateSubject(editingSubject.id, {
          name: name.trim(),
          subjectCode: subjectCode.trim(),
          semester: semester.trim(),
          color,
        });
      } else {
        await onCreateSubject({
          name: name.trim(),
          subjectCode: subjectCode.trim(),
          semester: semester.trim(),
          color,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: Subject) => {
    const linkedTasks = tasks.filter(t => t.subjectId === sub.id);
    let confirmMsg = `Are you sure you want to delete ${sub.subjectCode}?`;
    if (linkedTasks.length > 0) {
      confirmMsg += `\nWarning: ${linkedTasks.length} tasks are currently associated with this course. They will remain in your system as general tasks.`;
    }
    if (confirm(confirmMsg)) {
      await onDeleteSubject(sub.id);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Courses & Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage enrolled courses, syllabus tags, and deliverable grouping
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Course</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const subTasks = tasks.filter(t => t.subjectId === sub.id);
          const activeTasks = subTasks.filter(t => t.status !== 'Completed');
          const completedTasks = subTasks.filter(t => t.status === 'Completed');
          const progressPercent = subTasks.length > 0 ? Math.round((completedTasks.length / subTasks.length) * 100) : 0;

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: sub.color || '#4F46E5' }} 
                    />
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {sub.subjectCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Course"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sub)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2 leading-tight">
                  {sub.name}
                </h3>
                {sub.semester && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sub.semester}
                  </p>
                )}
              </div>

              {/* Progress & metrics */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{activeTasks.length} Active • {completedTasks.length} Completed</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%`, backgroundColor: sub.color || '#4F46E5' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <BookOpen className="w-10 h-10 text-indigo-500 mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No subjects added yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Add your semester courses (like CS-402, CS-301) to organize and categorize your assignments.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            + Add First Course
          </button>
        </div>
      )}

      {/* Modal for Create/Edit Subject */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Course Subject' : 'Add New Course'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-402"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Semester / Term
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. Semester 6"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Badge Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-600' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingSubject ? 'Update Course' : 'Save Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
