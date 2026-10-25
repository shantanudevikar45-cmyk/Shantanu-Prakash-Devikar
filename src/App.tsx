import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { ExamsPage } from './pages/ExamsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskModal } from './components/TaskModal';
import { FocusModeModal } from './components/FocusModeModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AuthModal } from './components/AuthModal';
import { 
  Task, 
  Subject, 
  Exam, 
  NotificationItem, 
  TaskStatus 
} from './types';
import { 
  subscribeToTasks, 
  subscribeToSubjects, 
  subscribeToExams, 
  subscribeToNotifications,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  createSubject,
  updateSubject,
  deleteSubject,
  createExam,
  updateExam,
  deleteExam,
  seedAcademicData
} from './services/dataService';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const MainApp: React.FC = () => {
  const { user, profile, loading: authLoading, theme, setTheme } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Drawer / Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Firestore Real-time subscriptions
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setSubjects([]);
      setExams([]);
      setNotifications([]);
      return;
    }

    const unsubTasks = subscribeToTasks(user.uid, (taskList) => {
      setTasks(taskList);
    });

    const unsubSubjects = subscribeToSubjects(user.uid, (subList) => {
      setSubjects(subList);
    });

    const unsubExams = subscribeToExams(user.uid, (examList) => {
      setExams(examList);
    });

    const unsubNotifs = subscribeToNotifications(user.uid, (notifList) => {
      setNotifications(notifList);
    });

    return () => {
      unsubTasks();
      unsubSubjects();
      unsubExams();
      unsubNotifs();
    };
  }, [user]);

  // If user has 0 tasks and 0 subjects on initial entry, auto-seed starter data
  useEffect(() => {
    if (user && tasks.length === 0 && subjects.length === 0 && !isSeeding) {
      const timer = setTimeout(async () => {
        try {
          setIsSeeding(true);
          await seedAcademicData(user.uid);
        } catch (e) {
          console.error('Initial auto-seed error:', e);
        } finally {
          setIsSeeding(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, tasks.length, subjects.length, isSeeding]);

  // Global Keyboard shortcuts: T for Add Task, Cmd+K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleOpenNewTask();
      } else if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTask = (defaultDate?: string) => {
    setEditingTask(null);
    setDefaultTaskDate(defaultDate);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    if (editingTask) {
      await updateTask(user.uid, editingTask.id, taskData);
    } else {
      await createTask(user.uid, taskData);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTask(user.uid, taskId);
  };

  const handleToggleTaskComplete = async (task: Task) => {
    if (!user) return;
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    if (newStatus === 'Completed') {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
    await updateTask(user.uid, task.id, { status: newStatus });
  };

  const handleEnterFocusMode = (task: Task) => {
    setFocusTask(task);
    setFocusModalOpen(true);
  };

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedAcademicData(user.uid);
      setSeedModalOpen(false);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Loading Taskora Workspace...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTask={() => handleOpenNewTask()}
        tasks={tasks}
        subjects={subjects}
        exams={exams}
        course={profile?.course}
        semester={profile?.semester}
        termProgress={profile?.termProgressPercent}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenSeedDataModal={() => setSeedModalOpen(true)}
          notifications={notifications}
        />

        {/* Page Canvas */}
        <main className="pt-20 px-4 sm:px-8 w-full max-w-7xl mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardPage
              displayName={profile?.displayName || 'Alex Rivera'}
              tasks={tasks}
              subjects={subjects}
              exams={exams}
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onNavigate={setCurrentTab}
              onEnterFocusMode={handleEnterFocusMode}
            />
          )}

          {currentTab === 'my-tasks' && (
            <MyTasksPage
              tasks={tasks}
              subjects={subjects}
              onOpenNewTask={() => handleOpenNewTask()}
              onEditTask={handleEditTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onBulkDelete={(ids) => bulkDeleteTasks(user.uid, ids)}
              onBulkUpdateStatus={(ids, st) => bulkUpdateTaskStatus(user.uid, ids, st)}
              onEnterFocusMode={handleEnterFocusMode}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarPage
              tasks={tasks}
              subjects={subjects}
              exams={exams}
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsPage
              subjects={subjects}
              tasks={tasks}
              onCreateSubject={(s) => createSubject(user.uid, s).then(() => {})}
              onUpdateSubject={(id, s) => updateSubject(user.uid, id, s)}
              onDeleteSubject={(id) => deleteSubject(user.uid, id)}
            />
          )}

          {currentTab === 'exams' && (
            <ExamsPage
              exams={exams}
              subjects={subjects}
              onCreateExam={(e) => createExam(user.uid, e).then(() => {})}
              onUpdateExam={(id, e) => updateExam(user.uid, id, e)}
              onDeleteExam={(id) => deleteExam(user.uid, id)}
            />
          )}

          {currentTab === 'completed' && (
            <MyTasksPage
              tasks={tasks.filter(t => t.status === 'Completed')}
              subjects={subjects}
              onOpenNewTask={() => handleOpenNewTask()}
              onEditTask={handleEditTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onBulkDelete={(ids) => bulkDeleteTasks(user.uid, ids)}
              onBulkUpdateStatus={(ids, st) => bulkUpdateTaskStatus(user.uid, ids, st)}
              onEnterFocusMode={handleEnterFocusMode}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage onOpenSeedDataModal={() => setSeedModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Task Drawer Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        subjects={subjects}
        defaultDate={defaultTaskDate}
      />

      {/* Deep Work Focus Mode Chamber */}
      <FocusModeModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        task={focusTask}
        subjects={subjects}
        onCompleteTask={async (taskId) => {
          if (!user) return;
          await updateTask(user.uid, taskId, { status: 'Completed' });
        }}
      />

      {/* Command Palette */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tasks={tasks}
        subjects={subjects}
        exams={exams}
        onSelectTask={(task) => {
          handleEditTask(task);
        }}
        onNavigate={setCurrentTab}
        onOpenNewTask={() => handleOpenNewTask()}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSeedData={() => setSeedModalOpen(true)}
      />

      {/* Seed Sample Data Confirmation Modal */}
      {seedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset & Seed Academic Data
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSeedModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will populate your account with the full university computer science curriculum deliverables from the Taskora preview:
            </p>

            <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <li>6 Core Courses (CS-402 Distributed Systems, CS-405, CS-301, etc.)</li>
              <li>1 Overdue assignment (Cache Coherence Simulation)</li>
              <li>3 Tasks due today (Raft Consensus, LR Parser, B+ Trees Quiz)</li>
              <li>Upcoming sprint projects & CNN deliverables</li>
              <li>Midterms & Practical Exams with real countdowns</li>
            </ul>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSeedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSeeding}
                onClick={handleSeedData}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSeeding && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSeeding ? 'Seeding Data...' : 'Populate Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
