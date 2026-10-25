import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Edit3, 
  Trash2, 
  AlertCircle,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Exam, Subject, ExamType } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

interface ExamsPageProps {
  exams: Exam[];
  subjects: Subject[];
  onCreateExam: (exam: Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateExam: (examId: string, updates: Partial<Exam>) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
}

const EXAM_TYPES: ExamType[] = ['Midterm', 'Final', 'Quiz', 'Practical', 'Oral', 'Other'];

export const ExamsPage: React.FC<ExamsPageProps> = ({
  exams,
  subjects,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState<ExamType>('Midterm');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('10:00');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const now = Date.now();
  const upcomingExams = exams.filter(e => new Date(e.examAt).getTime() >= now);
  const pastExams = exams.filter(e => new Date(e.examAt).getTime() < now);

  const openCreateModal = () => {
    setEditingExam(null);
    setTitle('');
    setSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setExamType('Midterm');
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    setExamDate(`${yyyy}-${mm}-${dd}`);
    setExamTime('10:00');
    setVenue('');
    setNotes('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSubjectId(exam.subjectId || '');
    setExamType(exam.examType || 'Midterm');
    setVenue(exam.venue || '');
    setNotes(exam.notes || '');

    const d = new Date(exam.examAt);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setExamDate(`${yyyy}-${mm}-${dd}`);
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setExamTime(`${hh}:${min}`);
    }
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examDate) {
      setErrorMsg('Exam title and date are required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const [year, month, day] = examDate.split('-').map(Number);
      const [hours, minutes] = examTime.split(':').map(Number);
      const targetDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);

      if (editingExam) {
        await onUpdateExam(editingExam.id, {
          title: title.trim(),
          subjectId: subjectId || undefined,
          examType,
          examAt: targetDate.toISOString(),
          venue: venue.trim(),
          notes: notes.trim(),
        });
      } else {
        await onCreateExam({
          title: title.trim(),
          subjectId: subjectId || undefined,
          examType,
          examAt: targetDate.toISOString(),
          venue: venue.trim(),
          notes: notes.trim(),
          reminderMinutesBefore: 1440,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save exam. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      await onDeleteExam(examId);
    }
  };

  const getSubject = (subId?: string) => subjects.find(s => s.id === subId);

  return (
    <div className="flex flex-col w-full pb-16 gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Exams & Test Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Midterms, practical evaluations, and finals with countdown tracking
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Exam</span>
        </button>
      </div>

      {/* UPCOMING EXAMS SECTION */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Upcoming Exams ({upcomingExams.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upcomingExams.map((exam) => {
            const sub = getSubject(exam.subjectId);
            const examTimeMs = new Date(exam.examAt).getTime();
            const diffDays = Math.ceil((examTimeMs - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {sub && (
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {sub.subjectCode} • {sub.name}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded">
                          {exam.examType}
                        </span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                        {exam.title}
                      </h3>
                    </div>

                    <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-center shrink-0 shadow-xs">
                      <span className="text-sm font-bold uppercase tracking-wider block">
                        {diffDays > 0 ? `${diffDays} Days` : 'Today'}
                      </span>
                      <span className="text-[10px] opacity-80 block uppercase">Left</span>
                    </div>
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {exam.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(exam.examAt)} • {formatTime(exam.examAt)}</span>
                    </div>
                    {exam.venue && (
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{exam.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exam.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingExams.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No upcoming exams scheduled. Click "+ Schedule Exam" to add a test.
          </div>
        )}
      </div>

      {/* PAST EXAMS SECTION (If any) */}
      {pastExams.length > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Past Exams ({pastExams.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExams.map((exam) => {
              const sub = getSubject(exam.subjectId);
              return (
                <div
                  key={exam.id}
                  className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-semibold">
                      {sub?.subjectCode} • {formatDate(exam.examAt)}
                    </span>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {exam.title}
                    </span>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">
                    Concluded
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Exam */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
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
                  Exam Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm: Distributed Systems & Cloud"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course / Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">(General Exam)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subjectCode}: {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Exam Format / Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setExamType(type)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        examType === type
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Exam Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Time
                  </label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hall / Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Hall B-204, Lab 3 (Linux Wing)"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Syllabus Notes & Materials Allowed
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Covers Chapters 1-6. Bring scientific calculator."
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
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
                  {saving ? 'Saving...' : (editingExam ? 'Update Exam' : 'Schedule Exam')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
