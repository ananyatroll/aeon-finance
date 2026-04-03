import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { syncService } from '../services/SyncService';
import { seedUserDefaults } from '../db';

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: () => {},
  signInWithEmail: () => {},
  signUpWithEmail: () => {},
  resetPassword: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    setIsOffline(!navigator.onLine);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        await seedUserDefaults(currentUser.uid);
        await syncService.startSync(currentUser.uid).catch(e => console.error("Sync init failed:", e));
      } else {
        syncService.stopSync();
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const enableOfflineMode = async () => {
    setIsOffline(true);
    const mockUser = { uid: 'offline-local-user', displayName: 'Local User', isAnonymous: true };
    setUser(mockUser);
    setLoading(false);
    await syncService.startSync(mockUser.uid).catch(e => console.warn('Offline sync gracefully skipped'));
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Firebase Google Auth Error:', error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Firebase Email Auth Error:', error.message);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result.user;
    } catch (error) {
      console.error('Firebase Signup Error:', error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Firebase Password Reset Error:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isOffline) {
        setIsOffline(false);
        setUser(null);
        syncService.stopSync();
        return;
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase Sign Out Error:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
      resetPassword,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
