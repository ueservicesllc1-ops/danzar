'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CheckRolePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateToDeveloper = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: 'developer',
        updatedAt: new Date().toISOString()
      });
      setMessage('✅ ¡Tu rol ha sido actualizado a Desarrollador! Recarga la página.');
    } catch (error) {
      setMessage('❌ Error al actualizar el rol: ' + error);
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
            🔍
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Verificar Rol de Usuario
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280'
          }}>
            Actualizar tu rol a Desarrollador
          </p>
        </div>

        {/* User Info */}
        {user && (
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
              Información de tu usuario:
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6'
            }}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nombre:</strong> {user.name || 'No especificado'}</p>
              <p><strong>Rol actual:</strong> 
                <span style={{
                  backgroundColor: user.role === 'developer' ? '#dcfce7' : 
                                  user.role === 'admin' ? '#fee2e2' :
                                  user.role === 'instructor' ? '#dbeafe' : '#fef3c7',
                  color: user.role === 'developer' ? '#166534' : 
                         user.role === 'admin' ? '#dc2626' :
                         user.role === 'instructor' ? '#1e40af' : '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: '8px'
                }}>
                  {user.role === 'student' ? 'Estudiante' : 
                   user.role === 'instructor' ? 'Instructor' :
                   user.role === 'admin' ? 'Administrador' :
                   user.role === 'developer' ? 'Desarrollador' : user.role}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
            color: message.includes('✅') ? '#166534' : '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Actions */}
        {user && user.email === 'luisuf@gmail.com' && user.role !== 'developer' && (
          <button
            onClick={updateToDeveloper}
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
            {loading ? 'Actualizando...' : '🚀 Actualizar a Desarrollador'}
          </button>
        )}

        {user && user.email === 'luisuf@gmail.com' && user.role === 'developer' && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            ✅ ¡Ya tienes rol de Desarrollador! Puedes acceder al panel de administración.
          </div>
        )}

        {user && user.email !== 'luisuf@gmail.com' && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            color: '#92400e',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            ⚠️ Solo el usuario luisuf@gmail.com puede usar esta función.
          </div>
        )}

        {/* Back buttons */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
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
              ← Volver al Login de Admin
            </button>
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none', 
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Volver al Dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


