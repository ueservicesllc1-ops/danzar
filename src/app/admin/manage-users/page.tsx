'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Shield, UserCheck, Mail, Calendar, Crown, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

const ManageUsersPage = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Manejar fechas de forma segura
        const getDate = (dateField: unknown) => {
          if (!dateField) return new Date();
          if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
            const timestamp = dateField as { toDate: () => Date };
            if (typeof timestamp.toDate === 'function') {
              return timestamp.toDate();
            }
          }
          if (dateField instanceof Date) {
            return dateField;
          }
          if (typeof dateField === 'string') {
            return new Date(dateField);
          }
          return new Date();
        };
        
        usersData.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || 'Sin nombre',
          role: data.role || 'student',
          createdAt: getDate(data.createdAt),
          updatedAt: getDate(data.updatedAt),
          avatar: data.avatar || ''
        });
      });

      // Ordenar por fecha de creación (más recientes primero)
      usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setUsers(usersData);
      console.log('Usuarios cargados:', usersData.length);
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'permission-denied') {
          setError('No tienes permisos para acceder a los usuarios. Contacta al administrador.');
        } else if (firebaseError.code === 'unavailable') {
          setError('Firebase no está disponible. Intenta más tarde.');
        } else {
          setError('Error al cargar los usuarios. Verifica la conexión a Firebase.');
        }
      } else {
        setError('Error al cargar los usuarios. Verifica la conexión a Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });

      // Actualizar el estado local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole, updatedAt: new Date() }
            : user
        )
      );

      const roleLabels = {
        'admin': 'Administrador',
        'developer': 'Desarrollador', 
        'teacher': 'Profesor',
        'student': 'Estudiante'
      };

      setSuccess(`Rol actualizado a ${roleLabels[newRole as keyof typeof roleLabels] || newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      
      console.log(`Usuario ${userId} actualizado a rol: ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(`Error al actualizar el rol del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: '#fef3c7', text: '#92400e', icon: Crown };
      case 'developer':
        return { bg: '#dbeafe', text: '#1e40af', icon: Shield };
      case 'teacher':
        return { bg: '#dcfce7', text: '#166534', icon: UserCheck };
      default:
        return { bg: '#f3f4f6', text: '#374151', icon: User };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'developer':
        return 'Desarrollador';
      case 'teacher':
        return 'Profesor';
      default:
        return 'Estudiante';
    }
  };

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
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Cargando usuarios...</p>
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
                <Users style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                Gestión de Usuarios
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Administra los roles y permisos de los usuarios registrados
              </p>
            </div>
            <button
              onClick={fetchUsers}
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
              Actualizar
            </button>
          </div>
        </div>

        {/* Messages */}
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

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            {success}
          </div>
        )}

        {/* Users List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 30px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              margin: '0'
            }}>
              Usuarios Registrados ({users.length})
            </h3>
          </div>

          {users.length === 0 ? (
            <div style={{
              padding: '60px 30px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: '0' }}>No hay usuarios registrados</p>
            </div>
          ) : (
            <div style={{ padding: '0' }}>
              {users.map((user, index) => {
                const roleConfig = getRoleColor(user.role);
                const RoleIcon = roleConfig.icon;
                const isCurrentUser = currentUser?.id === user.id;

                return (
                  <div
                    key={user.id}
                    style={{
                      padding: '20px 30px',
                      borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isCurrentUser ? '#f0f9ff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: user.avatar ? 'transparent' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <User style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                        )}
                      </div>

                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0'
                          }}>
                            {user.name}
                            {isCurrentUser && (
                              <span style={{
                                fontSize: '12px',
                                color: '#3b82f6',
                                marginLeft: '8px'
                              }}>
                                (Tú)
                              </span>
                            )}
                          </h4>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              {user.createdAt.toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: roleConfig.bg,
                          color: roleConfig.text,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <RoleIcon style={{ width: '14px', height: '14px' }} />
                          {getRoleLabel(user.role)}
                        </div>
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isCurrentUser && (
                        <>
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            disabled={updating === user.id}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                              cursor: updating === user.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <option value="student">Estudiante</option>
                            <option value="teacher">Profesor</option>
                            <option value="developer">Desarrollador</option>
                            <option value="admin">Administrador</option>
                          </select>

                          {updating === user.id && (
                            <RefreshCw style={{ 
                              width: '16px', 
                              height: '16px', 
                              color: '#3b82f6',
                              animation: 'spin 1s linear infinite'
                            }} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          {[
            { label: 'Total Usuarios', value: users.length, color: '#3b82f6' },
            { label: 'Administradores', value: users.filter(u => u.role === 'admin').length, color: '#f59e0b' },
            { label: 'Desarrolladores', value: users.filter(u => u.role === 'developer').length, color: '#1e40af' },
            { label: 'Profesores', value: users.filter(u => u.role === 'teacher').length, color: '#10b981' },
            { label: 'Estudiantes', value: users.filter(u => u.role === 'student').length, color: '#6b7280' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
