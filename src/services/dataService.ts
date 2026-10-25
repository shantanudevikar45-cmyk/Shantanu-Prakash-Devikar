import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Task, Subject, Exam, NotificationItem } from '../types';

// ========================
// TASKS CRUD
// ========================

export function subscribeToTasks(userId: string, onUpdate: (tasks: Task[]) => void, onError?: (err: unknown) => void) {
  const path = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('dueAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: Task[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Task);
    });
    onUpdate(list);
  }, (err) => {
    if (onError) onError(err);
    handleFirestoreError(err, OperationType.GET, path);
  });
}

export async function createTask(userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/tasks`;
  try {
    const newDocRef = doc(collection(db, 'users', userId, 'tasks'));
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: newDocRef.id,
      userId,
      createdAt: now,
      updatedAt: now,
      completedAt: task.status === 'Completed' ? now : undefined,
    };
    await setDoc(newDocRef, newTask);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const dataToUpdate: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.status === 'Completed' && !updates.completedAt) {
      dataToUpdate.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'Completed') {
      dataToUpdate.completedAt = null;
    }
    await updateDoc(taskRef, dataToUpdate);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function bulkDeleteTasks(userId: string, taskIds: string[]): Promise<void> {
  const path = `users/${userId}/tasks`;
  try {
    const batch = writeBatch(db);
    taskIds.forEach((id) => {
      const taskRef = doc(db, 'users', userId, 'tasks', id);
      batch.delete(taskRef);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function bulkUpdateTaskStatus(userId: string, taskIds: string[], status: Task['status']): Promise<void> {
  const path = `users/${userId}/tasks`;
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    taskIds.forEach((id) => {
      const taskRef = doc(db, 'users', userId, 'tasks', id);
      batch.update(taskRef, {
        status,
        updatedAt: now,
        completedAt: status === 'Completed' ? now : null,
      });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ========================
// SUBJECTS CRUD
// ========================

export function subscribeToSubjects(userId: string, onUpdate: (subjects: Subject[]) => void) {
  const path = `users/${userId}/subjects`;
  const subjectsRef = collection(db, 'users', userId, 'subjects');
  const q = query(subjectsRef, orderBy('subjectCode', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: Subject[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Subject);
    });
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

export async function createSubject(userId: string, subject: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/subjects`;
  try {
    const newDocRef = doc(collection(db, 'users', userId, 'subjects'));
    const now = new Date().toISOString();
    const newSubject: Subject = {
      ...subject,
      id: newDocRef.id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, newSubject);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateSubject(userId: string, subjectId: string, updates: Partial<Subject>): Promise<void> {
  const path = `users/${userId}/subjects/${subjectId}`;
  try {
    const subRef = doc(db, 'users', userId, 'subjects', subjectId);
    await updateDoc(subRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteSubject(userId: string, subjectId: string): Promise<void> {
  const path = `users/${userId}/subjects/${subjectId}`;
  try {
    const subRef = doc(db, 'users', userId, 'subjects', subjectId);
    await deleteDoc(subRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ========================
// EXAMS CRUD
// ========================

export function subscribeToExams(userId: string, onUpdate: (exams: Exam[]) => void) {
  const path = `users/${userId}/exams`;
  const examsRef = collection(db, 'users', userId, 'exams');
  const q = query(examsRef, orderBy('examAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: Exam[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Exam);
    });
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

export async function createExam(userId: string, exam: Omit<Exam, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/exams`;
  try {
    const newDocRef = doc(collection(db, 'users', userId, 'exams'));
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...exam,
      id: newDocRef.id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, newExam);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateExam(userId: string, examId: string, updates: Partial<Exam>): Promise<void> {
  const path = `users/${userId}/exams/${examId}`;
  try {
    const examRef = doc(db, 'users', userId, 'exams', examId);
    await updateDoc(examRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteExam(userId: string, examId: string): Promise<void> {
  const path = `users/${userId}/exams/${examId}`;
  try {
    const examRef = doc(db, 'users', userId, 'exams', examId);
    await deleteDoc(examRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ========================
// NOTIFICATIONS CRUD
// ========================

export function subscribeToNotifications(userId: string, onUpdate: (notifications: NotificationItem[]) => void) {
  const path = `users/${userId}/notifications`;
  const notifsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notifsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: NotificationItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
    });
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, path);
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const path = `users/${userId}/notifications/${notificationId}`;
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function markAllNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
  const path = `users/${userId}/notifications`;
  try {
    const batch = writeBatch(db);
    notificationIds.forEach((id) => {
      const notifRef = doc(db, 'users', userId, 'notifications', id);
      batch.update(notifRef, { isRead: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function createNotification(userId: string, item: Omit<NotificationItem, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  const path = `users/${userId}/notifications`;
  try {
    const newDocRef = doc(collection(db, 'users', userId, 'notifications'));
    const newNotif: NotificationItem = {
      ...item,
      id: newDocRef.id,
      userId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, newNotif);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// ==========================================
// SEED STARTER ACADEMIC DATA
// Populates full CS deliverables from screenshot
// ==========================================
export async function seedAcademicData(userId: string): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date();

  // 1. Subjects
  const subjectsData = [
    { id: 'sub-cs402', name: 'Distributed Systems', subjectCode: 'CS-402', semester: 'Semester 6', color: '#4F46E5' },
    { id: 'sub-cs405', name: 'Compiler Design', subjectCode: 'CS-405', semester: 'Semester 6', color: '#7C3AED' },
    { id: 'sub-cs301', name: 'Database Management Systems', subjectCode: 'CS-301', semester: 'Semester 6', color: '#006C49' },
    { id: 'sub-cs304', name: 'Computer Networks', subjectCode: 'CS-304', semester: 'Semester 6', color: '#0284C7' },
    { id: 'sub-cs310', name: 'Software Engineering', subjectCode: 'CS-310', semester: 'Semester 6', color: '#16A34A' },
    { id: 'sub-cs412', name: 'Machine Learning', subjectCode: 'CS-412', semester: 'Semester 6', color: '#D97706' },
  ];

  subjectsData.forEach((s) => {
    const subRef = doc(db, 'users', userId, 'subjects', s.id);
    batch.set(subRef, {
      ...s,
      userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  // Calculate dynamic deadlines relative to right now
  const todayAt5pm = new Date(now);
  todayAt5pm.setHours(17, 0, 0, 0);

  const todayAt9pm = new Date(now);
  todayAt9pm.setHours(21, 0, 0, 0);

  const todayAt1159pm = new Date(now);
  todayAt1159pm.setHours(23, 59, 0, 0);

  const yesterday1159pm = new Date(now);
  yesterday1159pm.setDate(now.getDate() - 1);
  yesterday1159pm.setHours(23, 59, 0, 0);

  const tomorrow1159pm = new Date(now);
  tomorrow1159pm.setDate(now.getDate() + 1);
  tomorrow1159pm.setHours(23, 59, 0, 0);

  const in2Days = new Date(now);
  in2Days.setDate(now.getDate() + 2);
  in2Days.setHours(18, 0, 0, 0);

  const in3Days = new Date(now);
  in3Days.setDate(now.getDate() + 3);
  in3Days.setHours(23, 59, 0, 0);

  const in4Days = new Date(now);
  in4Days.setDate(now.getDate() + 4);
  in4Days.setHours(16, 0, 0, 0);

  // 2. Tasks
  const tasksData: Array<Omit<Task, 'userId'>> = [
    {
      id: 'task-overdue-1',
      title: 'Computer Architecture: Cache Coherence Simulation',
      description: 'Deliverable: MSI vs MESI Benchmark Report & C++ Implementation Trace',
      subjectId: 'sub-cs402',
      taskType: 'Assignment',
      dueAt: yesterday1159pm.toISOString(),
      priority: 'High',
      status: 'Pending',
      weight: 10,
      estimatedHours: 4,
      notes: 'Late submission incurs 10% penalty per day. Benchmark scripts in /scripts/cache_sim.py.',
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-today-1',
      title: 'Distributed Systems Lab 4: Raft Consensus Implementation',
      description: 'Leader election & log replication tests passing. Test with 5-node cluster failure simulation.',
      subjectId: 'sub-cs402',
      taskType: 'Practical',
      dueAt: todayAt5pm.toISOString(),
      priority: 'High',
      status: 'In Progress',
      weight: 12,
      estimatedHours: 5,
      notes: 'Passes test 2A and 2B. Need to finish network partition recovery test 2C.',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-today-2',
      title: 'Compiler Design Assignment 3: LR Parser Syntax Trees',
      description: 'Construct parse tables for ambiguous grammar & AST generation using Bison/Yacc.',
      subjectId: 'sub-cs405',
      taskType: 'Assignment',
      dueAt: todayAt9pm.toISOString(),
      priority: 'Medium',
      status: 'Pending',
      weight: 8,
      estimatedHours: 3,
      notes: 'Check shift-reduce conflict resolution on page 142 of Dragon Book.',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-today-3',
      title: 'Database Systems Quiz 2: B+ Trees & Indexing',
      description: 'Moodle portal assessment • 30 mins runtime window. Covers leaf splitting & node rebalancing.',
      subjectId: 'sub-cs301',
      taskType: 'Quiz',
      dueAt: todayAt1159pm.toISOString(),
      priority: 'High',
      status: 'Pending',
      weight: 5,
      estimatedHours: 1,
      notes: '25 multiple choice questions. Calculator allowed for disk I/O cost formulas.',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-week-1',
      title: 'Computer Networks: Socket Programming Client-Server',
      description: 'Multithreaded TCP chat protocol demo in Python/C. Session includes packet sniffing verification.',
      subjectId: 'sub-cs304',
      taskType: 'Lab Work',
      dueAt: tomorrow1159pm.toISOString(),
      priority: 'Medium',
      status: 'In Progress',
      weight: 10,
      estimatedHours: 3.5,
      notes: 'Lab session tomorrow at 2:00 PM in Computer Center Room 302.',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-week-2',
      title: 'Software Engineering: Sprint 2 User Story Mapping & Jira',
      description: 'Team Sync: 4 Epics completed, finalize velocity chart and burn-down sprint review.',
      subjectId: 'sub-cs310',
      taskType: 'Project',
      dueAt: in2Days.toISOString(),
      priority: 'Medium',
      status: 'Pending',
      weight: 15,
      estimatedHours: 4,
      notes: 'Sprint demo scheduled with product mentor on Friday afternoon.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-week-3',
      title: 'Machine Learning: Convolutional Neural Network on CIFAR-10',
      description: 'PyTorch implementation with data augmentation & validation accuracy >= 82%.',
      subjectId: 'sub-cs412',
      taskType: 'Assignment',
      dueAt: in3Days.toISOString(),
      priority: 'High',
      status: 'In Progress',
      weight: 15,
      estimatedHours: 6,
      notes: 'Train on Colab T4 GPU. Log loss graphs into WandB dashboard.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-week-4',
      title: 'Operating Systems: Kernel Hook Implementation',
      description: 'Interception of `sys_read` call in Linux kernel module using kprobes.',
      subjectId: 'sub-cs402',
      taskType: 'Practical',
      dueAt: in4Days.toISOString(),
      priority: 'Low',
      status: 'Pending',
      weight: 6,
      estimatedHours: 2.5,
      notes: 'Use Ubuntu 22.04 LTS VM. Kernel headers required.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    // Completed tasks for realistic statistics
    {
      id: 'task-done-1',
      title: 'Database Systems: Relational Algebra & SQL Normalization',
      description: '3NF and BCNF functional dependency proofs and SQL schema decomposition.',
      subjectId: 'sub-cs301',
      taskType: 'Assignment',
      dueAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      priority: 'Medium',
      status: 'Completed',
      weight: 8,
      createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
    {
      id: 'task-done-2',
      title: 'Computer Networks: Wireshark HTTP/DNS Protocol Trace',
      description: 'Analyze TLS 1.3 handshake packet exchange and DNS query resolution timings.',
      subjectId: 'sub-cs304',
      taskType: 'Lab Work',
      dueAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      priority: 'Low',
      status: 'Completed',
      weight: 6,
      createdAt: new Date(now.getTime() - 86400000 * 9).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },
    {
      id: 'task-done-3',
      title: 'Software Engineering: Requirement Specification (SRS Document)',
      description: 'IEEE 830 standard requirements breakdown for university portal project.',
      subjectId: 'sub-cs310',
      taskType: 'Project',
      dueAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
      priority: 'High',
      status: 'Completed',
      weight: 10,
      createdAt: new Date(now.getTime() - 86400000 * 12).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
    }
  ];

  tasksData.forEach((t) => {
    const taskRef = doc(db, 'users', userId, 'tasks', t.id);
    batch.set(taskRef, {
      ...t,
      userId,
    });
  });

  // 3. Exams
  const in9Days = new Date(now);
  in9Days.setDate(now.getDate() + 9);
  in9Days.setHours(10, 0, 0, 0);

  const in15Days = new Date(now);
  in15Days.setDate(now.getDate() + 15);
  in15Days.setHours(14, 0, 0, 0);

  const examsData: Array<Omit<Exam, 'userId'>> = [
    {
      id: 'exam-1',
      title: 'Midterm: Distributed Systems & Cloud',
      subjectId: 'sub-cs402',
      examType: 'Midterm',
      examAt: in9Days.toISOString(),
      venue: 'Hall B-204',
      notes: 'Covers RPCs, Clock Synchronization (Lamport & Vector), and Raft consensus algorithm.',
      reminderMinutesBefore: 1440,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'exam-2',
      title: 'Practical Exam: Compiler Construction & Lex/Yacc',
      subjectId: 'sub-cs405',
      examType: 'Practical',
      examAt: in15Days.toISOString(),
      venue: 'Lab 3 (Linux Wing)',
      notes: 'Hands-on programming exam. Bring university ID card and student pass.',
      reminderMinutesBefore: 1440,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  ];

  examsData.forEach((e) => {
    const examRef = doc(db, 'users', userId, 'exams', e.id);
    batch.set(examRef, {
      ...e,
      userId,
    });
  });

  // 4. Notifications
  const notifsData: Array<Omit<NotificationItem, 'userId'>> = [
    {
      id: 'notif-1',
      title: 'Urgent: Distributed Systems Lab 4 due in 5 hours',
      message: 'Complete leader election and log replication test cases before 5:00 PM.',
      type: 'reminder',
      isRead: false,
      linkId: 'task-today-1',
      linkType: 'task',
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'notif-2',
      title: 'Overdue Alert: Cache Coherence Simulation',
      message: 'Assignment was due yesterday. Submit immediately to minimize late penalty.',
      type: 'overdue',
      isRead: false,
      linkId: 'task-overdue-1',
      linkType: 'task',
      createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Exam Scheduled: Distributed Systems Midterm',
      message: 'Midterm exam is in 9 days at Hall B-204.',
      type: 'exam',
      isRead: true,
      linkId: 'exam-1',
      linkType: 'exam',
      createdAt: new Date(now.getTime() - 1000 * 60 * 360).toISOString(),
    }
  ];

  notifsData.forEach((n) => {
    const nRef = doc(db, 'users', userId, 'notifications', n.id);
    batch.set(nRef, {
      ...n,
      userId,
    });
  });

  await batch.commit();
}
