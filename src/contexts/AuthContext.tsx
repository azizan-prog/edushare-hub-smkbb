import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured, 
  OperationType, 
  handleFirestoreError 
} from '../firebase/firebaseConfig';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: { uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const LOCAL_STORAGE_DEMO_USER_KEY = 'emmi_demo_user';
let isSigningInFlag = false;

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      const savedDemoUser = localStorage.getItem(LOCAL_STORAGE_DEMO_USER_KEY);
      if (savedDemoUser) {
        try {
          const parsed = JSON.parse(savedDemoUser);
          setCurrentUser(parsed);
          setUserProfile({
            uid: parsed.uid,
            name: parsed.displayName || 'Guru Demo',
            email: parsed.email || '',
            photoURL: parsed.photoURL || '',
            createdAt: Date.now()
          });
        } catch {
          // ignore corrupted data
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const simpleUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        setCurrentUser(simpleUser);

        if (db) {
          const userPath = `users/${user.uid}`;
          const userRef = doc(db, 'users', user.uid);
          try {
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
              const newProfile: UserProfile = {
                uid: user.uid,
                name: (user.displayName || 'Guru MMI').slice(0, 150),
                email: (user.email || 'guru@moe-dl.edu.my').slice(0, 200),
                photoURL: (user.photoURL || '').slice(0, 1000),
                createdAt: Date.now()
              };
              try {
                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
              } catch (writeErr) {
                handleFirestoreError(writeErr, OperationType.CREATE, userPath);
              }
            } else {
              setUserProfile(snap.data() as UserProfile);
            }
          } catch (err) {
            console.error('Error syncing user profile:', err);
            setUserProfile({
              uid: user.uid,
              name: user.displayName || 'Guru MMI',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: Date.now()
            });
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<string | null> => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser = {
        uid: 'demo-guru-101',
        displayName: 'Cikgu Azizan Hisham',
        email: 'azizanhisham@moe-dl.edu.my',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      setUserProfile({
        uid: demoUser.uid,
        name: demoUser.displayName,
        email: demoUser.email,
        photoURL: demoUser.photoURL,
        createdAt: Date.now()
      });
      return null;
    }

    if (isSigningInFlag) {
      return null;
    }

    try {
      isSigningInFlag = true;
      await signInWithPopup(auth, googleProvider);
      return null;
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return null;
      }
      if (err?.code === 'auth/popup-blocked') {
        throw new Error('POPUP LOG MASUK DISEKAT OLEH PELAYAR. SILA BENARKAN POPUP UNTUK LAMAN INI.');
      }
      console.error('Google Sign-in Error:', err);
      throw err;
    } finally {
      isSigningInFlag = false;
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(LOCAL_STORAGE_DEMO_USER_KEY);
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    await fbSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      isDemoMode: !isFirebaseConfigured,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
