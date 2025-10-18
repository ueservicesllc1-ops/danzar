'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        // Usuario existe en Firestore, redirigir al dashboard
        router.push('/dashboard');
      } else {
        // Usuario no existe en Firestore, redirigir a completar perfil
        router.push('/profile/setup');
      }
    } catch (error: unknown) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Correo electrónico inválido';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
            break;
          default:
            errorMessage = firebaseError.message || 'Error al iniciar sesión';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Crear documento de usuario en Firestore si no existe
        const userData = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          avatar: result.user.photoURL || '',
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
      }
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      let errorMessage = 'Error al iniciar sesión con Google';
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Inicio de sesión cancelado';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup bloqueado. Permite ventanas emergentes';
            break;
          default:
            errorMessage = firebaseError.message || 'Error al iniciar sesión con Google';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img 
            src="/images/logo.png" 
            alt="DanZar Logo" 
            style={{
              height: '100px',
              width: '180px',
              objectFit: 'contain',
              marginBottom: '8px'
            }}
          />
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            margin: '0'
          }}>
            Iniciar sesión
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Tu contraseña"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          color: '#6b7280'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e7eb'
          }}></div>
          <span style={{
            padding: '0 15px',
            fontSize: '14px'
          }}>
            o
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e7eb'
          }}></div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'white',
            color: '#374151',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            style={{ 
              width: '20px', 
              height: '20px' 
            }} 
          />
          {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
        </button>

        {/* Links */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
            <Link href="/auth/forgot-password" style={{ 
              color: '#3b82f6', 
              textDecoration: 'none'
            }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
