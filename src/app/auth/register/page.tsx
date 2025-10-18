'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Crear nombre completo
      const fullName = `${formData.firstName} ${formData.secondName} ${formData.lastName} ${formData.secondLastName}`.trim();

      // Actualizar el perfil del usuario
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Crear documento en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: formData.firstName,
        secondName: formData.secondName,
        lastName: formData.lastName,
        secondLastName: formData.secondLastName,
        fullName: fullName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: 'student'
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de Firebase
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('Este correo electrónico ya está registrado. ¿Ya tienes cuenta? Inicia sesión.');
        } else if (firebaseError.code === 'auth/weak-password') {
          setError('La contraseña es muy débil. Usa al menos 6 caracteres.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          setError('El correo electrónico no es válido.');
        } else {
          setError(firebaseError.message || 'Error al crear la cuenta');
        }
      } else {
        setError('Error al crear la cuenta');
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
        padding: '0px 30px 30px 30px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px'
      }}>
        
        {/* Logo Section */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0px'
        }}>
          <img 
            src="/images/logo.png" 
            alt="DanZar Logo" 
            style={{
              height: '100px',
              width: '180px',
              objectFit: 'contain',
              marginBottom: '0px'
            }}
          />
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: '0',
            padding: '0',
            lineHeight: '1'
          }}>
            Crear cuenta
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '0px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '12px' 
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Primer nombre
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Tu primer nombre"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Segundo nombre
              </label>
              <input
                type="text"
                name="secondName"
                value={formData.secondName}
                onChange={handleChange}
                required
                placeholder="Tu segundo nombre"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                }}
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '12px' 
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Primer apellido
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Tu primer apellido"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Segundo apellido
              </label>
              <input
                type="text"
                name="secondLastName"
                value={formData.secondLastName}
                onChange={handleChange}
                required
                placeholder="Tu segundo apellido"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
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
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
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
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
