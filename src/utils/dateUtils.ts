import { Task } from '../types';

export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'Completed') return false;
  const due = new Date(task.dueAt).getTime();
  return !isNaN(due) && due < Date.now();
}

export function isDueToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isDueNext7Days(dateStr: string): boolean {
  const d = new Date(dateStr).getTime();
  if (isNaN(d)) return false;
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return d >= now && d <= now + sevenDays;
}

export function getCountdownString(dateStr: string): { label: string; isOverdue: boolean; isImminent: boolean } {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (isNaN(target)) return { label: 'Invalid date', isOverdue: false, isImminent: false };

  if (diffMs < 0) {
    const overdueHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
    if (overdueHours < 1) {
      return { label: 'Overdue just now', isOverdue: true, isImminent: true };
    } else if (overdueHours < 24) {
      return { label: `Overdue by ${overdueHours}h`, isOverdue: true, isImminent: true };
    } else {
      const days = Math.round(overdueHours / 24);
      return { label: `Overdue by ${days}d`, isOverdue: true, isImminent: true };
    }
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const mins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return { label: `In ${mins} mins`, isOverdue: false, isImminent: true };
  } else if (hours < 6) {
    return { label: `In ${hours} hours ${mins > 0 ? `${mins}m` : ''}`, isOverdue: false, isImminent: true };
  } else if (hours < 24) {
    return { label: `In ${hours} hours`, isOverdue: false, isImminent: false };
  } else if (hours < 48) {
    return { label: `Tomorrow (${hours}h)`, isOverdue: false, isImminent: false };
  } else {
    const days = Math.floor(hours / 24);
    return { label: `In ${days} days`, isOverdue: false, isImminent: false };
  }
}

export function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}
