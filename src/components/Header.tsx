import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  School, 
  Bell, 
  ChevronDown, 
  Menu, 
  Moon, 
  Sun, 
  LogOut, 
  Settings as SettingsIcon,
  Sparkles,
  CheckCheck,
  Clock,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../services/dataService';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
  onOpenSeedDataModal: () => void;
  notifications: NotificationItem[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
  onOpenSettings,
  onOpenSeedDataModal,
  notifications,
}) => {
  const { user, profile, signOutUser, theme, setTheme } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (!user) return;
    const ids = unreadNotifs.map(n => n.id);
    await markAllNotificationsAsRead(user.uid, ids);
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!user) return;
    if (!notif.isRead) {
      await markNotificationAsRead(user.uid, notif.id);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Linear / Command style) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 w-full max-w-xs sm:max-w-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 rounded-lg px-3 py-1.5 text-slate-500 dark:text-slate-400 transition-colors text-left"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">
            Search tasks, subjects, exams...
          </span>
          <kbd className="hidden sm:inline bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[11px] font-semibold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right cluster: Course pill, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Course Switcher / Pill */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 transition-colors text-xs font-semibold max-w-[240px]"
          title="Academic Course / Degree"
        >
          <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">{profile?.course || 'B.Tech Computer Science - Year 3'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No notifications yet. You're all caught up!
                  </div>
                ) : (
                  notifications.map((n) => {
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                          !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'overdue' ? (
                            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          ) : n.type === 'exam' ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                              <GraduationCap className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'} truncate`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={profile?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUdNjrd5xZJELASN8TCp1Pn9bimoDAGaT8wI5RUrhehk90l7zQbqWWvtRdjDxjmnFPlyWPD0QPuBNN2Ai5jSgiUouZ2CL6Qloiwgf7bmHlmTXQH-fVyGGdeW88DJcmwR9hGa3lN5bgHFX0Zf_jaAZJU7Mf9oA6ZaZ_9BiGPmB-ctq-Kd8sDSQbHmDpz1Iv5UOBmHeYKiH9BYU_V_leDBEVhRxSYdBxrL3gSk2aZt4X7Cp2rHWPg2Xw'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/20"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {profile?.displayName || 'Alex Rivera'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                CS Engineering
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{profile?.displayName || 'Alex Rivera'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile?.email || user?.email}</p>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Toggle</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onOpenSeedDataModal();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Reset / Seed Sample Data</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>Preferences & Settings</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  signOutUser();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
