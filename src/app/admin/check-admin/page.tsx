'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, User, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const CheckAdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdminUsers();
  }, []);

  const checkAdminUsers = async () => {
    setLoading(true);
    setError('');

    try {
      // Verificar si existen usuarios admin
      const isaiDoc = await getDoc(doc(db, 'users', 'admin-isai-macho'));
      const luisDoc = await getDoc(doc(db, 'users', 'developer-luis-uf'));

      const users = [];
      
      if (isaiDoc.exists()) {
        users.push({ ...isaiDoc.data(), id: 'admin-isai-macho', status: 'exists' });
      } else {
        users.push({ 
          id: 'admin-isai-macho', 
          email: 'isai.macho@gmail.com', 
          name: 'Isai Macho', 
          role: 'admin', 
          status: 'missing' 
        });
      }

      if (luisDoc.exists()) {
        users.push({ ...luisDoc.data(), id: 'developer-luis-uf', status: 'exists' });
      } else {
        users.push({ 
          id: 'developer-luis-uf', 
          email: 'luisuf@gmail.com', 
          name: 'Luis Developer', 
          role: 'developer', 
          status: 'missing' 
        });
      }

      setAdminUsers(users);
    } catch (error) {
      console.error('Error verificando administradores:', error);
      setError('Error al verificar usuarios administradores');
    } finally {
      setLoading(false);
    }
  };

  const createMissingUser = async (userData: any) => {
    setLoading(true);
    setError('');

    try {
      const userDoc = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: userData.id
      };

      await setDoc(doc(db, 'users', userData.id), userDoc);
      
      // Recargar la lista
      await checkAdminUsers();
    } catch (error) {
      console.error('Error creando usuario:', error);
      setError(`Error al crear usuario ${userData.email}`);
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
        maxWidth: '800px',
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
            Verificar Administradores
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Estado de los usuarios administradores en el sistema
          </p>
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

        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Usuarios Administradores
            </h3>
            <button
              onClick={checkAdminUsers}
              disabled={loading}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Actualizar
            </button>
          </div>

          {adminUsers.map((adminUser, index) => (
            <div key={index} style={{
              backgroundColor: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: adminUser.status === 'exists' ? '1px solid #10b981' : '1px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <User style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '10px' }} />
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{adminUser.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{adminUser.email}</div>
                    <div style={{ 
                      display: 'inline-block',
                      backgroundColor: adminUser.role === 'admin' ? '#dbeafe' : '#dcfce7',
                      color: adminUser.role === 'admin' ? '#1e40af' : '#166534',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginTop: '5px'
                    }}>
                      {adminUser.role.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {adminUser.status === 'exists' ? (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                      <CheckCircle style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>Configurado</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => createMissingUser(adminUser)}
                      disabled={loading}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{ color: '#0369a1', fontSize: '14px', margin: '0' }}>
            <strong>Nota:</strong> Una vez que todos los usuarios estén configurados, podrás acceder al panel de administración.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckAdminPage;
