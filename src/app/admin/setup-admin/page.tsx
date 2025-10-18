'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, User, Mail, Key, CheckCircle, AlertCircle } from 'lucide-react';

const SetupAdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const setupAdminUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear IDs únicos para los administradores
      const isaiId = 'admin-isai-macho';
      const luisId = 'developer-luis-uf';

      // Configurar isai.macho@gmail.com como admin
      const isaiUser = {
        id: isaiId,
        email: 'isai.macho@gmail.com',
        name: 'Isai Macho',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: isaiId
      };

      // Configurar luisuf@gmail.com como developer
      const luisUser = {
        id: luisId,
        email: 'luisuf@gmail.com',
        name: 'Luis Developer',
        role: 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: luisId
      };

      // Crear documentos en Firestore con manejo de errores
      try {
        await setDoc(doc(db, 'users', isaiId), isaiUser);
        console.log('Usuario isai configurado correctamente');
      } catch (isaiError) {
        console.error('Error configurando isai:', isaiError);
        throw new Error('Error al configurar usuario isai.macho@gmail.com');
      }

      try {
        await setDoc(doc(db, 'users', luisId), luisUser);
        console.log('Usuario luis configurado correctamente');
      } catch (luisError) {
        console.error('Error configurando luis:', luisError);
        throw new Error('Error al configurar usuario luisuf@gmail.com');
      }

      setSuccess('Usuarios administradores configurados correctamente!');
      
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error configurando administradores:', error);
      setError(error instanceof Error ? error.message : 'Error al configurar los usuarios administradores');
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
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Shield style={{ 
            width: '60px', 
            height: '60px', 
            color: '#3b82f6', 
            margin: '0 auto 20px' 
          }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '10px'
          }}>
            Configurar Administradores
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Configura los usuarios administradores para acceder al panel de administración
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '20px'
          }}>
            Usuarios que se configurarán:
          </h3>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <User style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '10px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#374151' }}>Isai Macho</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>isai.macho@gmail.com</div>
                <div style={{ 
                  display: 'inline-block',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop: '5px'
                }}>
                  ADMIN
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <User style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '10px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#374151' }}>Luis Developer</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>luisuf@gmail.com</div>
                <div style={{ 
                  display: 'inline-block',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginTop: '5px'
                }}>
                  DEVELOPER
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            {success}
          </div>
        )}

        <button
          onClick={setupAdminUsers}
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
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
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
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Configurando...
            </>
          ) : (
            <>
              <Shield style={{ width: '20px', height: '20px' }} />
              Configurar Administradores
            </>
          )}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            <strong>Nota:</strong> Después de configurar, podrás acceder al panel de administración con estos usuarios.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupAdminPage;
