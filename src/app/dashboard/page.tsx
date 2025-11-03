'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/animated-button';
import PaymentAlertButton from '@/components/ui/payment-alert-button';
import EventSales from '@/components/dashboard/EventSales';
import { Music, Clock, Trophy, Calendar, CreditCard, Camera, QrCode } from 'lucide-react';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        paddingTop: '100px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Acceso no autorizado
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Necesitas iniciar sesión para acceder al dashboard.
          </p>
          <button 
            onClick={() => router.push('/auth/login')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingTop: '120px', // Espacio para el header
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Header del Dashboard */}
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
                marginBottom: '8px'
              }}>
                ¡Hola, {user.name}!
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Bienvenido a tu dashboard de DanZar
              </p>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Clases Activas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              backgroundColor: '#dbeafe',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Music size={24} color="#3b82f6" />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              3
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Clases Activas
            </p>
          </motion.div>

          {/* Horas Bailadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              backgroundColor: '#dcfce7',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Clock size={24} color="#10b981" />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              24
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Horas Bailadas
            </p>
          </motion.div>

          {/* Pagos Pendientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PaymentAlertButton
              count={1}
              month="Octubre 2024"
              onClick={() => router.push('/payments')}
            />
          </motion.div>

          {/* Nivel Actual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
            }}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              backgroundColor: '#e9d5ff',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trophy size={24} color="#8b5cf6" />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              Intermedio
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Nivel Actual
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px'
        }}>
          
          {/* Próximas Clases */}
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
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Calendar size={20} color="#3b82f6" style={{ marginRight: '8px' }} />
              Próximas Clases
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Clase 1 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    Salsa Intermedio
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                    Carlos Mendoza
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>
                    Hoy • 19:00 - 20:30
                  </p>
                </div>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Confirmado
                </span>
              </div>

              {/* Clase 2 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    Bachata Principiante
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                    María González
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>
                    Mañana • 18:00 - 19:00
                  </p>
                </div>
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Pendiente
                </span>
              </div>

              {/* Clase 3 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    Hip Hop Avanzado
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                    Alex Rivera
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>
                    Viernes • 20:00 - 21:30
                  </p>
                </div>
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Pendiente
                </span>
              </div>
            </div>

            <AnimatedButton
              variant="outline"
              className="w-full mt-5"
              onClick={() => router.push('/gallery')}
              animationType="glow"
              glowColor="#3b82f6"
            >
              Ver Todas las Clases
            </AnimatedButton>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Acciones Rápidas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Acciones Rápidas
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/payments')}
                  animationType="bounce"
                  animate={true}
                >
                  <CreditCard size={16} style={{ marginRight: '8px' }} />
                  Ver Pagos
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/gallery')}
                  animationType="bounce"
                  animate={true}
                  delay={0.2}
                >
                  <Camera size={16} style={{ marginRight: '8px' }} />
                  Galería
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/scan-qr')}
                  animationType="bounce"
                  animate={true}
                  delay={0.4}
                >
                  <QrCode size={16} style={{ marginRight: '8px' }} />
                  Escáner QR
                </AnimatedButton>
              </div>
            </div>

            {/* Progreso */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px'
              }}>
                Tu Progreso
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>Salsa</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>75%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '75%',
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>Bachata</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>60%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '60%',
                      height: '100%',
                      backgroundColor: '#10b981',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>Hip Hop</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>30%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '30%',
                      height: '100%',
                      backgroundColor: '#f59e0b',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Sales Section */}
        <EventSales />
      </div>

      {/* QR Link Box */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        marginTop: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                minWidth: '280px',
                width: '100%'
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
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
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
    </div>
  );
};

export default DashboardPage;