import React, { useState, useEffect } from 'react';
import { 
  User, 
  School, 
  Moon, 
  Sun, 
  Bell, 
  Save, 
  Check, 
  LogOut, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface SettingsPageProps {
  onOpenSeedDataModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenSeedDataModal }) => {
  const { user, profile, updateUserProfile, signOutUser, theme, setTheme } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || 'Alex Rivera');
  const [course, setCourse] = useState(profile?.course || 'B.Tech Computer Science - Year 3');
  const [semester, setSemester] = useState(profile?.semester || 'Semester 6 • Spring 2025');
  const [termProgress, setTermProgress] = useState(profile?.termProgressPercent ?? 74);
  const [defaultReminder, setDefaultReminder] = useState(profile?.defaultReminderMinutes ?? 120);
  const [browserNotifications, setBrowserNotifications] = useState(profile?.browserNotificationsEnabled ?? false);
  const [notificationPermissionState, setNotificationPermissionState] = useState<string>('default');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setCourse(profile.course || 'B.Tech Computer Science - Year 3');
      setSemester(profile.semester || 'Semester 6 • Spring 2025');
      setTermProgress(profile.termProgressPercent ?? 74);
      setDefaultReminder(profile.defaultReminderMinutes ?? 120);
      setBrowserNotifications(profile.browserNotificationsEnabled ?? false);
    }
    if ('Notification' in window) {
      setNotificationPermissionState(Notification.permission);
    }
  }, [profile]);

  const handleRequestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermissionState(permission);
    if (permission === 'granted') {
      setBrowserNotifications(true);
      new Notification('Taskora Notifications Active', {
        body: 'You will now receive alerts for upcoming assignment deadlines!',
        icon: '/favicon.ico',
      });
    } else {
      setBrowserNotifications(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile({
        displayName: displayName.trim(),
        course: course.trim(),
        semester: semester.trim(),
        termProgressPercent: Number(termProgress),
        defaultReminderMinutes: Number(defaultReminder),
        browserNotificationsEnabled: browserNotifications,
        theme,
      });
      setSavedSuccess(true);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your academic profile, term progress, notifications, and appearance
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
        
        {/* Profile & Academic Track */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Academic Profile & Program</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || profile?.email || ''}
                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Degree / Program
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science - Year 3"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Semester & Term Label
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Semester 6 • Spring 2025"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <span>Semester Completion Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">{termProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={termProgress}
              onChange={(e) => setTermProgress(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Reflected in the left sidebar's Academic Term widget.
            </p>
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-indigo-600" />
            <span>Theme & Display</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Light Mode</span>
              <span className="text-[11px] text-slate-500">Default clean workspace with #F8FAFC canvas</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-indigo-400" />
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Dark Mode</span>
              <span className="text-[11px] text-slate-500">Low-glare deep contrast for late night study</span>
            </button>
          </div>
        </div>

        {/* Reminders & Notifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Reminders & Notifications</span>
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default In-App Deadline Alert Threshold
              </label>
              <select
                value={defaultReminder}
                onChange={(e) => setDefaultReminder(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-xs"
              >
                <option value={15}>15 minutes before deadline</option>
                <option value={60}>1 hour before deadline</option>
                <option value={120}>2 hours before deadline (Recommended)</option>
                <option value={1440}>24 hours before deadline</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Browser Desktop Notifications
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                  Send native desktop popups when deadlines are approaching. Note: In standard browser mode without background ServiceWorker workers, desktop alerts fire when the application tab is open.
                </p>
                <span className="text-[10px] text-slate-400 mt-1">
                  Current Browser Permission: <strong className="text-slate-600 dark:text-slate-300">{notificationPermissionState}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleRequestBrowserNotification}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs shrink-0 transition-all"
              >
                {notificationPermissionState === 'granted' ? 'Enabled' : 'Request Permission'}
              </button>
            </div>
          </div>
        </div>

        {/* Demo Data & Account Operations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Academic Sample Data</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Load Realistic University Engineering Data
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Instantly populate CS-402, CS-405, CS-301 courses, labs, and midterms matching the Taskora preview screenshot.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenSeedDataModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs shrink-0 transition-all"
            >
              Seed Sample Data
            </button>
          </div>
        </div>

        {/* Save & Sign out buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={signOutUser}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
