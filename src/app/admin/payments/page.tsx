'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  month: string;
  year: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  receiptUrl?: string;
  createdAt: string;
}

const AdminPaymentsPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', name: 'María González', email: 'maria@email.com', role: 'student' },
      { id: '2', name: 'Carlos Mendoza', email: 'carlos@email.com', role: 'student' },
      { id: '3', name: 'Ana Rodríguez', email: 'ana@email.com', role: 'student' },
      { id: '4', name: 'Luis Fernández', email: 'luis@email.com', role: 'student' },
      { id: '5', name: 'Sofia Martínez', email: 'sofia@email.com', role: 'student' }
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        userId: '1',
        userName: 'María González',
        userEmail: 'maria@email.com',
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
        userId: '2',
        userName: 'Carlos Mendoza',
        userEmail: 'carlos@email.com',
        amount: 45,
        month: 'Octubre',
        year: 2024,
        status: 'overdue',
        dueDate: '2024-10-01',
        createdAt: '2024-10-01'
      },
      {
        id: '3',
        userId: '3',
        userName: 'Ana Rodríguez',
        userEmail: 'ana@email.com',
        amount: 45,
        month: 'Octubre',
        year: 2024,
        status: 'pending',
        dueDate: '2024-10-01',
        receiptUrl: 'https://images.unsplash.com/photo-1554224311-bd4c9e5e5f1e?w=400',
        createdAt: '2024-10-01'
      },
      {
        id: '4',
        userId: '1',
        userName: 'María González',
        userEmail: 'maria@email.com',
        amount: 45,
        month: 'Noviembre',
        year: 2024,
        status: 'pending',
        dueDate: '2024-11-01',
        createdAt: '2024-11-01'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const handleMarkAsPaid = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
        : p
    ));
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, receiptUrl: undefined }
        : p
    ));
    setShowReceiptModal(false);
    setSelectedPaymentForReceipt(null);
  };

  const handleGenerateBills = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Generar facturas para todos los usuarios que no tengan pago del mes actual
    const newBills: Payment[] = users
      .filter(user => user.role === 'student')
      .filter(user => !payments.some(p => 
        p.userId === user.id && 
        p.month === currentMonth && 
        p.year === currentYear
      ))
      .map(user => ({
        id: `new-${user.id}-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        amount: 45,
        month: currentMonth,
        year: currentYear,
        status: 'pending' as const,
        dueDate: `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`,
        createdAt: new Date().toISOString()
      }));
    
    setPayments([...payments, ...newBills]);
    alert(`Se generaron ${newBills.length} facturas para el mes de ${currentMonth}`);
  };

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
          alignItems: 'center',
          marginBottom: '20px'
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
              <CreditCard size={24} style={{ marginRight: '8px' }} />
              Gestión de Pagos
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Administra los pagos de los estudiantes
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleGenerateBills}
              style={{
                backgroundColor: '#10b981',
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
                e.target.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
              }}
            >
              <Calendar size={16} style={{ marginRight: '8px' }} />
              Generar Facturas del Mes
            </button>
            
            <button
              onClick={() => router.push('/admin')}
              style={{
                backgroundColor: 'transparent',
                color: '#374151',
                padding: '10px 20px',
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
              ← Volver al Panel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Pagos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.filter(p => p.status === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pendientes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.filter(p => p.status === 'paid').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pagados</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {payments.filter(p => p.status === 'overdue').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Vencidos</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Buscar pago
            </label>
            <input
              type="text"
              placeholder="Nombre o email del estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagados</option>
              <option value="overdue">Vencidos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
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
            Lista de Pagos ({filteredPayments.length})
          </h3>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Estudiante
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Mes
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Monto
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Estado
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Fecha de Vencimiento
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} style={{
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <td style={{
                    padding: '16px 24px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {payment.userName}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {payment.userEmail}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '16px',
                    color: '#1f2937'
                  }}>
                    {payment.month} {payment.year}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    ${payment.amount}
                  </td>
                  <td style={{
                    padding: '16px 24px'
                  }}>
                    {getStatusBadge(payment.status)}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                  </td>
                  <td style={{
                    padding: '16px 24px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {payment.receiptUrl && payment.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedPaymentForReceipt(payment);
                            setShowReceiptModal(true);
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            animation: 'pulse 2s infinite'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#3b82f6';
                          }}
                        >
                          🔔 Ver Recibo
                        </button>
                      )}
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#10b981';
                          }}
                        >
                          Marcar como Pagado
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <span style={{
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: '600'
                        }}>
                          ✓ Pagado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
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
              No se encontraron pagos
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Intenta con otros filtros o términos de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPaymentForReceipt && (
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
            setShowReceiptModal(false);
            setSelectedPaymentForReceipt(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '700px',
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
              🔔 Recibo de Pago Pendiente de Revisión
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              {selectedPaymentForReceipt.userName} - {selectedPaymentForReceipt.month} {selectedPaymentForReceipt.year} - ${selectedPaymentForReceipt.amount}
            </p>

            {/* Receipt Image */}
            {selectedPaymentForReceipt.receiptUrl && (
              <div style={{
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img
                  src={selectedPaymentForReceipt.receiptUrl}
                  alt="Recibo de pago"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  handleRejectPayment(selectedPaymentForReceipt.id);
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  padding: '12px',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ❌ Rechazar
              </button>
              
              <button
                onClick={() => {
                  handleMarkAsPaid(selectedPaymentForReceipt.id);
                  setShowReceiptModal(false);
                  setSelectedPaymentForReceipt(null);
                }}
                style={{
                  flex: 2,
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                }}
              >
                ✓ Aprobar y Marcar como Pagado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
