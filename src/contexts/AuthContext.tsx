'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || firebaseUser.displayName || '',
            avatar: userData.avatar || firebaseUser.photoURL || '',
            role: userData.role || 'student',
            createdAt: userData.createdAt ? (
              typeof userData.createdAt === 'string' ? new Date(userData.createdAt) :
              typeof userData.createdAt === 'object' && userData.createdAt !== null && 'toDate' in userData.createdAt && typeof userData.createdAt.toDate === 'function' ? userData.createdAt.toDate() :
              userData.createdAt instanceof Date ? userData.createdAt : new Date()
            ) : new Date(),
            updatedAt: userData.updatedAt ? (
              typeof userData.updatedAt === 'string' ? new Date(userData.updatedAt) :
              typeof userData.updatedAt === 'object' && userData.updatedAt !== null && 'toDate' in userData.updatedAt && typeof userData.updatedAt.toDate === 'function' ? userData.updatedAt.toDate() :
              userData.updatedAt instanceof Date ? userData.updatedAt : new Date()
            ) : new Date(),
          });
        } else {
          // Si no existe el documento, crear uno por defecto
          const defaultUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            avatar: firebaseUser.photoURL || '',
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...defaultUser,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          setUser(defaultUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil de Firebase
      await updateFirebaseProfile(firebaseUser, { displayName: name });
      
      // Crear documento de usuario en Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        name,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      };
      
      await updateDoc(doc(db, 'users', user.id), updatedData);
      
      // Actualizar el estado local
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

