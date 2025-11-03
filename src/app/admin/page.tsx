'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Music, Settings, Shield, Zap, Circle, Users, QrCode } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
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
      title: 'Escáner de QR',
      description: 'Verificar y validar entradas',
      icon: <QrCode size={24} />,
      link: '/scan-qr',
      color: '#ef4444'
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
                onClick={() => {
                  if (action.link === '/scan-qr') {
                    setShowQRModal(true);
                  } else {
                    router.push(action.link);
                  }
                }}
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

      {/* QR Link Box */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QrCode size={32} color="#ef4444" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                Escáner de QR
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Link para verificar entradas
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value="http://localhost:3000/scan-qr"
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                color: '#1f2937',
                width: '300px'
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText('http://localhost:3000/scan-qr');
                alert('Link copiado');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
            >
              Copiar
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <QrCode size={64} color="#ef4444" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                Escáner de QR
              </h2>
              <p style={{ color: '#6b7280' }}>
                Accede al escáner de códigos QR para verificar entradas
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                URL del Escáner:
              </p>
              <input
                type="text"
                readOnly
                value="http://localhost:3000/scan-qr"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#1f2937'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('http://localhost:3000/scan-qr');
                  alert('Link copiado al portapapeles');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Copiar Link
              </button>
              <button
                onClick={() => router.push('/scan-qr')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Ir
              </button>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
