'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Database, Users, AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

const DebugUsersPage = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    timestamp: string;
    currentUser: {
      id: string;
      email: string;
      name: string;
      role: string;
    } | null;
    firebaseConnection: boolean;
    usersCollection: {
      exists: boolean;
      count: number;
      users: {
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: string;
        hasAvatar: boolean;
      }[];
    };
    errors: string[];
  } | null>(null);
  const [error, setError] = useState('');

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        currentUser: currentUser,
        firebaseConnection: false,
        usersCollection: {
          exists: false,
          count: 0,
          users: []
        },
        errors: []
      };

      // Verificar conexión a Firebase
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        diagnostics.firebaseConnection = true;
        diagnostics.usersCollection.exists = true;
        diagnostics.usersCollection.count = querySnapshot.size;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const userData = {
            id: doc.id,
            email: data.email || 'Sin email',
            name: data.name || 'Sin nombre',
            role: data.role || 'student',
            createdAt: data.createdAt?.toDate()?.toISOString() || 'Sin fecha',
            hasAvatar: !!data.avatar
          };
          diagnostics.usersCollection.users.push(userData);
        });

        console.log('Diagnóstico completado:', diagnostics);
      } catch (firebaseError) {
        diagnostics.errors.push(`Error de Firebase: ${firebaseError}`);
        console.error('Error de Firebase:', firebaseError);
      }

      setDebugInfo(diagnostics);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setError('Error al ejecutar diagnóstico');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
      runDiagnostics();
    } else {
      router.push('/admin/login');
    }
  }, [currentUser, router, runDiagnostics]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <RefreshCw style={{ width: '40px', height: '40px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Ejecutando diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Database style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                Diagnóstico de Usuarios
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Verifica la conexión a Firebase y el estado de los usuarios
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Ejecutar Diagnóstico
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            {error}
          </div>
        )}

        {debugInfo && (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {/* Estado de Conexión */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {debugInfo.firebaseConnection ? (
                  <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                ) : (
                  <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                )}
                Conexión a Firebase
              </h3>
              <p style={{ color: debugInfo.firebaseConnection ? '#10b981' : '#dc2626' }}>
                {debugInfo.firebaseConnection ? 'Conectado correctamente' : 'Error de conexión'}
              </p>
            </div>

            {/* Información del Usuario Actual */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Shield style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                Usuario Actual
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <p><strong>ID:</strong> {debugInfo.currentUser?.id || 'No disponible'}</p>
                <p><strong>Email:</strong> {debugInfo.currentUser?.email || 'No disponible'}</p>
                <p><strong>Nombre:</strong> {debugInfo.currentUser?.name || 'No disponible'}</p>
                <p><strong>Rol:</strong> {debugInfo.currentUser?.role || 'No disponible'}</p>
              </div>
            </div>

            {/* Colección de Usuarios */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                Colección de Usuarios
              </h3>
              <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                <p><strong>Existe:</strong> {debugInfo.usersCollection.exists ? 'Sí' : 'No'}</p>
                <p><strong>Total de usuarios:</strong> {debugInfo.usersCollection.count}</p>
              </div>

              {debugInfo.usersCollection.users.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Lista de Usuarios:
                  </h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {debugInfo.usersCollection.users.map((user: {
                      id: string;
                      email: string;
                      name: string;
                      role: string;
                      createdAt: string;
                      hasAvatar: boolean;
                    }, index: number) => (
                      <div
                        key={index}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <p><strong>ID:</strong> {user.id}</p>
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Nombre:</strong> {user.name}</p>
                          <p><strong>Rol:</strong> {user.role}</p>
                          <p><strong>Creado:</strong> {user.createdAt}</p>
                          <p><strong>Avatar:</strong> {user.hasAvatar ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Errores */}
            {debugInfo.errors.length > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle style={{ width: '20px', height: '20px' }} />
                  Errores Encontrados
                </h3>
                {debugInfo.errors.map((error: string, index: number) => (
                  <p key={index} style={{ color: '#dc2626', marginBottom: '8px' }}>
                    • {error}
                  </p>
                ))}
              </div>
            )}

            {/* Información de Debug */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '12px'
              }}>
                Información de Debug
              </h3>
              <p style={{ color: '#0369a1', fontSize: '14px', margin: '0' }}>
                <strong>Timestamp:</strong> {debugInfo.timestamp}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugUsersPage;
