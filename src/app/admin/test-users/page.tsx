'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TestUsersPage = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
      fetchUsers();
    } else {
      router.push('/admin/login');
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Intentando obtener usuarios...');
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      console.log('📊 QuerySnapshot size:', querySnapshot.size);
      console.log('📊 QuerySnapshot empty:', querySnapshot.empty);
      
      const usersData: unknown[] = [];
      querySnapshot.forEach((doc) => {
        console.log('👤 Usuario encontrado:', doc.id, doc.data());
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setUsers(usersData);
      console.log('✅ Usuarios cargados:', usersData.length);
    } catch (error: unknown) {
      console.error('❌ Error fetching users:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando usuarios...</h2>
        <p>Verificando conexión a Firebase...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Diagnóstico de Usuarios</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchUsers}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Recargar Usuarios
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Información del Usuario Actual:</h3>
        <pre style={{
          backgroundColor: '#f3f4f6',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>

      <div>
        <h3>👥 Usuarios en Firestore ({users.length}):</h3>
        
        {users.length === 0 ? (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e',
            padding: '15px',
            borderRadius: '5px'
          }}>
            <strong>⚠️ No se encontraron usuarios</strong>
            <p>Posibles causas:</p>
            <ul>
              <li>No hay usuarios registrados en Firestore</li>
              <li>Problemas de permisos en las reglas de Firestore</li>
              <li>Error de conexión a Firebase</li>
            </ul>
          </div>
        ) : (
          <div>
            {users.map((user, index) => (
              <div key={index} style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                <h4>👤 Usuario {index + 1}</h4>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '3px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUsersPage;
