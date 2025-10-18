'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const setupDeveloper = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Intentar crear el usuario desarrollador
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'luisuf@gmail.com',
        'developer123' // Contraseña temporal
      );

      // Crear documento en Firestore con rol de desarrollador
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: 'Luis',
        lastName: 'Desarrollador',
        fullName: 'Luis Desarrollador',
        email: 'luisuf@gmail.com',
        role: 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSuccess('✅ Usuario desarrollador creado exitosamente!');
      
      // Cerrar sesión para que puedas iniciar con las credenciales correctas
      setTimeout(() => {
        auth.signOut();
        router.push('/admin/login');
      }, 2000);

    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          // El usuario ya existe, intentar iniciar sesión para verificar
          try {
            await signInWithEmailAndPassword(auth, 'luisuf@gmail.com', 'developer123');
            setSuccess('✅ Usuario desarrollador ya existe y está configurado correctamente!');
          } catch (signInError: unknown) {
            setError('El usuario ya existe pero la contraseña es incorrecta. Contacta al administrador.');
          }
        } else {
          setError(`Error: ${firebaseError.message || 'Error desconocido'}`);
        }
      } else {
        setError('Error desconocido al crear el usuario');
      }
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
      paddingTop: '40px',
      paddingBottom: '40px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        border: '2px solid #8b5cf6'
      }}>
        
        {/* Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ⚙️
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Configuración de Desarrollador
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280'
          }}>
            Configurar usuario desarrollador para luisuf@gmail.com
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {/* Info */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Información del Usuario Desarrollador:
          </h3>
          <div style={{
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.6'
          }}>
            <p><strong>Email:</strong> luisuf@gmail.com</p>
            <p><strong>Rol:</strong> Desarrollador</p>
            <p><strong>Contraseña temporal:</strong> developer123</p>
            <p><strong>Privilegios:</strong> Acceso completo al panel de administración</p>
          </div>
        </div>

        {/* Warning */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          color: '#92400e',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          ⚠️ <strong>Importante:</strong> Cambia la contraseña después del primer acceso por seguridad.
        </div>

        <button
          onClick={setupDeveloper}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Configurando...' : '🚀 Configurar Usuario Desarrollador'}
        </button>

        {/* Back to normal login */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            ¿Ya tienes acceso?{' '}
            <button 
              onClick={() => router.push('/admin/login')}
              style={{ 
                color: '#8b5cf6', 
                textDecoration: 'none', 
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


