import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Subject } from '../types';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  subjects: Subject[];
  onCompleteTask: (taskId: string) => Promise<void>;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  task,
  subjects,
  onCompleteTask,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  if (!isOpen || !task) return null;

  const subject = subjects.find(s => s.id === task.subjectId);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setSecondsLeft(25 * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(5 * 60);
    else setSecondsLeft(15 * 60);
  };

  const handleComplete = async () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
      await onCompleteTask(task.id);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <span className="font-semibold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Deep Work Focus Chamber
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={soundEnabled ? 'Mute ambient sound' : 'Enable ambient focus chime'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task target header */}
        <div className="mt-5 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            {subject && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {subject.subjectCode}: {subject.name}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {task.taskType}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white max-w-lg">
            {task.title}
          </h2>

          {task.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {task.description}
            </p>
          )}
        </div>

        {/* Timer Mode selector */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => handleSelectMode('focus')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('shortBreak')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'shortBreak'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('longBreak')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'longBreak'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Giant Timer Display */}
        <div className="my-8 flex flex-col items-center">
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900 dark:text-white select-none">
            {formatTimer(secondsLeft)}
          </div>
          <span className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Distraction-free timer running
          </span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              handleSelectMode(mode);
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Task Notes / Rubric info */}
        {task.notes && (
          <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Notes:</span>
            <p className="whitespace-pre-line">{task.notes}</p>
          </div>
        )}

        {/* Completion Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Finished this deliverable?</span>
          <button
            type="button"
            onClick={handleComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Complete & Celebrate 🎉</span>
          </button>
        </div>

      </div>
    </div>
  );
};
