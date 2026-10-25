import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taskora_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('taskora_theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snapshot = await getDoc(userRef);
          if (!snapshot.exists()) {
            const initialProfile: UserProfile = {
              id: currentUser.uid,
              displayName: currentUser.displayName || 'Alex Rivera',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUdNjrd5xZJELASN8TCp1Pn9bimoDAGaT8wI5RUrhehk90l7zQbqWWvtRdjDxjmnFPlyWPD0QPuBNN2Ai5jSgiUouZ2CL6Qloiwgf7bmHlmTXQH-fVyGGdeW88DJcmwR9hGa3lN5bgHFX0Zf_jaAZJU7Mf9oA6ZaZ_9BiGPmB-ctq-Kd8sDSQbHmDpz1Iv5UOBmHeYKiH9BYU_V_leDBEVhRxSYdBxrL3gSk2aZt4X7Cp2rHWPg2Xw',
              course: 'B.Tech Computer Science - Year 3',
              semester: 'Semester 6 • Spring 2025',
              theme: 'light',
              defaultReminderMinutes: 120, // 2 hours
              browserNotificationsEnabled: false,
              termProgressPercent: 74,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, initialProfile);
            setProfile(initialProfile);
          } else {
            setProfile(snapshot.data() as UserProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile doc', error);
        }

        // Real-time listener for profile changes
        const unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            if (data.theme && (data.theme === 'dark' || data.theme === 'light')) {
              setTheme(data.theme);
            }
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        });

        setLoading(false);
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      console.error('Email Sign In error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        const userRef = doc(db, 'users', cred.user.uid);
        const newProfile: UserProfile = {
          id: cred.user.uid,
          displayName: name,
          email: cred.user.email || email,
          course: 'B.Tech Computer Science - Year 3',
          semester: 'Semester 6 • Spring 2025',
          theme: 'light',
          defaultReminderMinutes: 120,
          browserNotificationsEnabled: false,
          termProgressPercent: 74,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err: unknown) {
      console.error('Sign Up error:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updateData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        sendPasswordReset,
        updateUserProfile,
        theme,
        setTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
