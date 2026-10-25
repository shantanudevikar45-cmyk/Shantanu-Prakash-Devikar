export type TaskType = 
  | 'Assignment' 
  | 'Practical' 
  | 'Lab Work' 
  | 'Project' 
  | 'Quiz' 
  | 'Reading' 
  | 'Other';

export type Priority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId?: string;
  taskType: TaskType;
  dueAt: string; // ISO string
  priority: Priority;
  status: TaskStatus;
  reminderMinutesBefore?: number;
  notes?: string;
  weight?: number; // e.g. 8 (% or points)
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  subjectCode: string;
  semester?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type ExamType = 'Midterm' | 'Final' | 'Quiz' | 'Practical' | 'Oral' | 'Other';

export interface Exam {
  id: string;
  userId: string;
  title: string;
  subjectId?: string;
  examType: ExamType;
  examAt: string; // ISO string
  venue?: string;
  notes?: string;
  reminderMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'overdue' | 'exam' | 'system';
  isRead: boolean;
  linkId?: string;
  linkType?: 'task' | 'exam' | 'general';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  course?: string;
  semester?: string;
  theme: 'light' | 'dark' | 'system';
  defaultReminderMinutes: number;
  browserNotificationsEnabled: boolean;
  termProgressPercent?: number;
  createdAt: string;
  updatedAt: string;
}
