'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Music, Settings, Shield, Zap, Circle, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalPayments: 0,
    monthlyRevenue: 0
  });

  // Datos de ejemplo - en una app real vendrían de la API
  useEffect(() => {
    setStats({
      totalUsers: 156,
      totalClasses: 24,
      totalPayments: 89,
      monthlyRevenue: 12450
    });
  }, []);

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'Nuevo usuario registrado: María González',
      time: 'Hace 5 minutos',
      icon: <User size={24} />
    },
    {
      id: 2,
      type: 'payment',
      message: 'Pago recibido: $45 - Clase de Salsa',
      time: 'Hace 15 minutos',
      icon: <CreditCard size={24} />
    },
    {
      id: 3,
      type: 'class',
      message: 'Nueva clase creada: Bachata Intermedio',
      time: 'Hace 1 hora',
      icon: <Music size={24} />
    },
    {
      id: 4,
      type: 'user',
      message: 'Usuario actualizado: Carlos Mendoza',
      time: 'Hace 2 horas',
      icon: <User size={24} />
    }
  ];

  const quickActions = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar estudiantes e instructores',
      icon: <Users size={24} />,
      link: '/admin/manage-users',
      color: '#3b82f6'
    },
    {
      title: 'Gestión de Clases',
      description: 'Crear y editar clases de baile',
      icon: <Music size={24} />,
      link: '/admin/classes',
      color: '#10b981'
    },
    {
      title: 'Gestión de Pagos',
      description: 'Administrar pagos y facturación',
      icon: <CreditCard size={24} />,
      link: '/admin/payments',
      color: '#f59e0b'
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: <Settings size={24} />,
      link: '/admin/settings',
      color: '#8b5cf6'
    }
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px 40px 20px'
    }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
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
              <Shield size={24} style={{ marginRight: '8px' }} />
              Panel de Administración
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Bienvenido, {user?.name || user?.email}
            </p>
          </div>
          
          <div style={{
            backgroundColor: user?.role === 'developer' ? '#8b5cf6' : '#ef4444',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {user?.role === 'developer' ? <Zap size={16} style={{ marginRight: '4px' }} /> : <Circle size={16} fill="#ef4444" color="#ef4444" style={{ marginRight: '4px' }} />} 
            {user?.role === 'developer' ? 'Desarrollador' : 'Admin'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Usuarios */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#dbeafe',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            👥
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            {stats.totalUsers}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Total Usuarios
          </p>
        </div>

        {/* Total Clases */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#dcfce7',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            <Music size={24} color="#3b82f6" />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            {stats.totalClasses}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Total Clases
          </p>
        </div>

        {/* Total Pagos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#fef3c7',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            <CreditCard size={24} color="#10b981" />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            {stats.totalPayments}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Pagos Este Mes
          </p>
        </div>

        {/* Ingresos Mensuales */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#e9d5ff',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '24px'
          }}>
            <CreditCard size={24} color="#f59e0b" />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            ${stats.monthlyRevenue.toLocaleString()}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Ingresos Mensuales
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px'
      }}>
        
        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Acciones Rápidas
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.link)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '24px',
                  marginBottom: '8px'
                }}>
                  {action.icon}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Actividad Reciente
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#1f2937',
                    marginBottom: '4px',
                    lineHeight: '1.4'
                  }}>
                    {activity.message}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: '#3b82f6',
            padding: '12px',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            (e.target as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#3b82f6';
          }}>
            Ver Todas las Actividades
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
