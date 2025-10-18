'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  month: string;
  year: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  receiptUrl?: string;
  createdAt: string;
}

const PaymentsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Datos de ejemplo
  useEffect(() => {
    if (!user) return;

    const mockPayments: Payment[] = [
    {
      id: '1',
        userId: user.id,
      amount: 45,
        month: 'Octubre',
        year: 2024,
        status: 'paid',
        dueDate: '2024-10-01',
        paidDate: '2024-10-02',
        createdAt: '2024-10-01'
    },
    {
      id: '2',
        userId: user.id,
        amount: 45,
        month: 'Noviembre',
        year: 2024,
      status: 'pending',
        dueDate: '2024-11-01',
        createdAt: '2024-11-01'
      }
    ];

    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pendiente' },
      paid: { bg: '#dcfce7', text: '#166534', label: 'Pagado' },
      overdue: { bg: '#fee2e2', text: '#dc2626', label: 'Vencido' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelado' }
    };
    
    const color = colors[status as keyof typeof colors];
    
    return (
      <span style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {color.label}
      </span>
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!uploadedFile || !selectedPayment) return;

    setUploading(true);
    
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('paymentId', selectedPayment.id);
      formData.append('userId', user?.id || '');

      // Subir archivo a través de la API
      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      // Guardar metadatos en Firestore
      const saveResponse = await fetch('/api/save-payment-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          receiptUrl: data.url,
          userId: user?.id || '',
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Error al guardar los metadatos');
      }

      // Actualizar el pago con la URL del recibo
      setPayments(payments.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, receiptUrl: data.url }
          : p
      ));

      // Cerrar modal y limpiar
      setUploading(false);
      setShowUploadModal(false);
      setUploadedFile(null);
      setSelectedPayment(null);
      
      alert('Recibo subido exitosamente. El administrador lo revisará.');
      
    } catch (error) {
      console.error('Error al subir recibo:', error);
      setUploading(false);
      alert('❌ Error al subir el recibo. Por favor intenta nuevamente.');
    }
  };

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
            Necesitas iniciar sesión para ver tus pagos.
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
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingTop: '120px',
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
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
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CreditCard size={24} style={{ marginRight: '8px' }} />
            Mis Pagos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Gestiona tus pagos mensuales de clases
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Pagos</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.filter(p => p.status === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pendientes</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.filter(p => p.status === 'paid').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pagados</div>
          </div>
        </div>

        {/* Payments List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0'
            }}>
              Historial de Pagos
            </h3>
          </div>

          <div style={{ padding: '24px' }}>
            {payments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0'
                    }}>
                      Pago de {payment.month} {payment.year}
                    </h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span><strong>Monto:</strong> ${payment.amount}</span>
                    <span><strong>Vencimiento:</strong> {new Date(payment.dueDate).toLocaleDateString('es-ES')}</span>
                    {payment.paidDate && (
                      <span><strong>Pagado:</strong> {new Date(payment.paidDate).toLocaleDateString('es-ES')}</span>
                    )}
                  </div>
                  {payment.receiptUrl && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      ✓ Recibo subido
                    </div>
                  )}
                </div>

                <div>
                  {payment.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowUploadModal(true);
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      📤 Subir Recibo
                    </button>
                  )}
                  {payment.status === 'paid' && (
                    <span style={{
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      ✓ Pagado
                    </span>
                  )}
                  {payment.status === 'overdue' && (
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowUploadModal(true);
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                      }}
                    >
                      <AlertTriangle size={16} style={{ marginRight: '8px' }} />
                      Pagar Ahora
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {payments.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <CreditCard size={48} color="#3b82f6" />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                No tienes pagos registrados
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Tus pagos aparecerán aquí cuando sean generados
              </p>
                </div>
          )}
              </div>

        {/* Upload Modal */}
        {showUploadModal && selectedPayment && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '20px'
            }}
            onClick={() => {
              setShowUploadModal(false);
              setUploadedFile(null);
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                <CreditCard size={20} style={{ marginRight: '8px' }} />
                Realizar Pago - {selectedPayment.month} {selectedPayment.year}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '20px'
              }}>
                Monto: <strong>${selectedPayment.amount}</strong>
              </p>

              {/* Datos Bancarios */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏦 Datos Bancarios para Depósito
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6'
                }}>
                  <p><strong>Banco:</strong> Banco de Ejemplo</p>
                  <p><strong>Cuenta:</strong> 1234567890</p>
                  <p><strong>Tipo:</strong> Cuenta Corriente</p>
                  <p><strong>Titular:</strong> DanZar Academia de Danza</p>
                  <p><strong>RUT/CI:</strong> 12.345.678-9</p>
                </div>
                </div>

              {/* Instrucciones */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '8px'
                }}>
                  📋 Instrucciones:
                </h3>
                <ol style={{
                  fontSize: '13px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                  margin: '0'
                }}>
                  <li>Realiza el depósito en la cuenta indicada</li>
                  <li>Guarda el comprobante de depósito</li>
                  <li>Sube una foto clara del comprobante</li>
                  <li>El administrador revisará tu pago</li>
                </ol>
                </div>

              {/* Upload File */}
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '30px',
                textAlign: 'center',
                marginBottom: '20px',
                backgroundColor: '#f8fafc'
              }}>
                <input
                    type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '48px' }}>📄</div>
                  {uploadedFile ? (
                    <div>
                      <p style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                        ✓ {uploadedFile.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        Archivo seleccionado - {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                        Haz clic para seleccionar el comprobante
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        PNG, JPG, PDF hasta 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: '#374151',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleSubmitReceipt}
                  disabled={!uploadedFile || uploading}
                  style={{
                    flex: 1,
                    backgroundColor: uploading || !uploadedFile ? '#9ca3af' : '#10b981',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: uploading || !uploadedFile ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {uploading ? 'Subiendo...' : '✓ Confirmar Pago'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;