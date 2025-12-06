'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, DollarSign, Users, QrCode, CheckCircle, Eye, Download, Trash2 } from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface Sale {
  id: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  seats?: Array<{
    row: string;
    number: string;
  }>;
  totalAmount?: number;
  paymentMethod?: string;
  paymentDetails?: {
    lastDigits?: string;
    [key: string]: unknown;
  };
  qrCode?: string;
  confirmationCode?: string;
  status?: string;
  used?: boolean;
  redeemedCount?: number;
  totalSeats?: number;
  [key: string]: unknown;
}

const DELETE_PIN = '1619';

export default function EventSales() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [saleToDelete, setSaleToDelete] = useState<{ id: string; customerName: string } | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(ticketsData);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setLoading(false);
    }
  };

  const stats = {
    totalSold: sales.reduce((sum, sale) => sum + (sale.seats?.length || 0), 0),
    totalRevenue: sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
    paypalRevenue: sales.filter(s => s.paymentMethod === 'PayPal').reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    mobileRevenue: sales.filter(s => s.paymentMethod === 'Pago Móvil').reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    transferRevenue: sales.filter(s => s.paymentMethod === 'Transferencia').reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, { status: 'approved' });
      alert(`Ticket ${id} activado. Correo enviado.`);
      loadSales();
      setShowDetails(false);
    } catch (error) {
      console.error('Error aprobando pago:', error);
      alert('Error al aprobar el pago. Contacta soporte.');
    }
  };

  const handleDeleteClick = (id: string, customerName: string) => {
    setSaleToDelete({ id, customerName });
    setShowPinModal(true);
    setPinInput('');
  };

  const handlePinSubmit = async () => {
    if (pinInput !== DELETE_PIN) {
      alert('PIN incorrecto. No se puede eliminar la entrada.');
      setPinInput('');
      return;
    }

    if (!saleToDelete) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la entrada vendida de ${saleToDelete.customerName}?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) {
      setShowPinModal(false);
      setSaleToDelete(null);
      setPinInput('');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', saleToDelete.id);
      await deleteDoc(ticketRef);
      alert('Entrada vendida eliminada exitosamente.');
      loadSales();
      if (selectedSale?.id === saleToDelete.id) {
        setShowDetails(false);
        setSelectedSale(null);
      }
    } catch (error) {
      console.error('Error eliminando entrada:', error);
      alert('Error al eliminar la entrada. Contacta soporte.');
    } finally {
      setShowPinModal(false);
      setSaleToDelete(null);
      setPinInput('');
    }
  };

  const handleViewTicket = (confirmationCode: string | undefined) => {
    if (!confirmationCode) {
      alert('No hay código de confirmación disponible para este ticket.');
      return;
    }
    router.push(`/ticket/${confirmationCode}`);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>Cargando ventas...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          marginTop: '30px'
        }}
      >
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Ticket style={{ color: '#efb810' }} />
          Reporte de Ventas - The Greatest Showdance
        </h2>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Ticket size={32} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              {stats.totalSold}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Entradas Vendidas</p>
          </div>

          <div style={{
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <DollarSign size={32} color="#10b981" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              ${stats.totalRevenue}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Ingresos Totales</p>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <DollarSign size={32} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              ${stats.paypalRevenue}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>PayPal</p>
          </div>

          <div style={{
            backgroundColor: '#e0e7ff',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <DollarSign size={32} color="#6366f1" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              ${stats.mobileRevenue}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Pago Móvil</p>
          </div>

          <div style={{
            backgroundColor: '#fce7f3',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <DollarSign size={32} color="#ec4899" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
              ${stats.transferRevenue}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Transferencia</p>
          </div>
        </div>

        {/* Sales List */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Entradas Vendidas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sales.map((sale) => {
              const seatsDisplay = sale.seats?.map((s) => `${s.row}${s.number}`).join(', ') || 'N/A';
              return (
                <motion.div
                  key={sale.id}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <Users size={18} color="#6b7280" />
                      <strong style={{ color: '#1f2937', fontSize: '15px' }}>{sale.customer?.firstName || ''} {sale.customer?.lastName || ''}</strong>
                      <span style={{
                        backgroundColor: sale.status === 'approved' ? '#dcfce7' : '#fef3c7',
                        color: sale.status === 'approved' ? '#166534' : '#92400e',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {sale.status === 'approved' ? 'Confirmado' : 'Pendiente'}
                      </span>
                      {(() => {
                        const totalSeats = sale.seats?.length || sale.totalSeats || 0;
                        const redeemedCount = sale.redeemedCount || 0;
                        const isFullyRedeemed = sale.used || (totalSeats > 0 && redeemedCount >= totalSeats);
                        
                        if (isFullyRedeemed) {
                          return (
                            <span style={{
                              backgroundColor: '#fef3c7',
                              color: '#d97706',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              REDIMIDO
                            </span>
                          );
                        }
                        
                        if (redeemedCount > 0 && redeemedCount < totalSeats) {
                          const remaining = totalSeats - redeemedCount;
                          return (
                            <span style={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              Redimidas {redeemedCount} / Por redimir {remaining}
                            </span>
                          );
                        }
                        
                        return null;
                      })()}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '2px' }}>
                      {sale.customer?.email || 'N/A'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '2px' }}>
                      Asientos: {seatsDisplay} | ${sale.totalAmount} • {sale.paymentMethod}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {(() => {
                        if (!sale.createdAt) return 'N/A';
                        if (typeof sale.createdAt === 'object' && 'toDate' in sale.createdAt && typeof sale.createdAt.toDate === 'function') {
                          return sale.createdAt.toDate().toLocaleString();
                        }
                        if (sale.createdAt instanceof Date) {
                          return sale.createdAt.toLocaleString();
                        }
                        return String(sale.createdAt);
                      })()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {(() => {
                      const hasScreenshot = sale.paymentDetails && 
                        typeof sale.paymentDetails === 'object' && 
                        'screenshot' in sale.paymentDetails && 
                        Boolean(sale.paymentDetails.screenshot);
                      return hasScreenshot ? (
                        <button
                        onClick={() => handleViewDetails(sale)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={16} />
                        Ver Detalles
                      </button>
                      ) : null;
                    })()}
                    <button
                      onClick={() => handleDeleteClick(
                        sale.id,
                        `${sale.customer?.firstName || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente'
                      )}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                      }}
                      title="Eliminar entrada vendida"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                    <button
                      onClick={() => handleViewTicket(sale.confirmationCode)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                      title={`Ver ticket 4D - ${sale.confirmationCode || 'N/A'}`}
                    >
                      <QrCode size={24} color="#3b82f6" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {showDetails && selectedSale && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    Detalles del Pago
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '10px' }}><strong>Cliente:</strong> {selectedSale.customer?.firstName} {selectedSale.customer?.lastName}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Email:</strong> {selectedSale.customer?.email}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Teléfono:</strong> {selectedSale.customer?.phone}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Asientos:</strong> {selectedSale.seats?.map((s) => `${s.row}${s.number}`).join(', ') || 'N/A'}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Monto:</strong> ${selectedSale.totalAmount}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Método:</strong> {selectedSale.paymentMethod}</p>
                  {selectedSale.paymentDetails?.lastDigits && (
                    <p style={{ marginBottom: '10px' }}><strong>Últimos 4 dígitos:</strong> {selectedSale.paymentDetails.lastDigits}</p>
                  )}
                  <p style={{ marginBottom: '10px' }}><strong>Código QR:</strong> {String(selectedSale.qrCode || 'N/A')}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Código de Confirmación:</strong> {String(selectedSale.confirmationCode || 'N/A')}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Fecha:</strong> {(() => {
                    if (!selectedSale.createdAt) return 'N/A';
                    if (typeof selectedSale.createdAt === 'object' && 'toDate' in selectedSale.createdAt && typeof selectedSale.createdAt.toDate === 'function') {
                      return selectedSale.createdAt.toDate().toLocaleString();
                    }
                    if (selectedSale.createdAt instanceof Date) {
                      return selectedSale.createdAt.toLocaleString();
                    }
                    return String(selectedSale.createdAt);
                  })()}</p>
                </div>

                {(() => {
                  const paymentDetails = selectedSale.paymentDetails;
                  if (!paymentDetails || typeof paymentDetails !== 'object' || !('screenshot' in paymentDetails)) {
                    return null;
                  }
                  const screenshot = paymentDetails.screenshot;
                  if (typeof screenshot !== 'string' || !screenshot) {
                    return null;
                  }
                  return (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Comprobante de Pago:</p>
                      <img 
                        src={screenshot} 
                        alt="Comprobante" 
                        style={{
                          maxWidth: '100%',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  {selectedSale.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleApprovePayment(selectedSale.id);
                        setShowDetails(false);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle size={20} />
                      Activar Ticket
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteClick(
                        selectedSale.id,
                        `${selectedSale.customer?.firstName || ''} ${selectedSale.customer?.lastName || ''}`.trim() || 'Cliente'
                      );
                      setShowDetails(false);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                    }}
                  >
                    <Trash2 size={20} />
                    Eliminar Entrada
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de PIN para Eliminar */}
      <AnimatePresence>
        {showPinModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPinModal(false);
                setSaleToDelete(null);
                setPinInput('');
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  maxWidth: '400px',
                  width: '100%'
                }}
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  🔒 Confirmar Eliminación
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '20px'
                }}>
                  Ingresa el PIN para eliminar la entrada de {saleToDelete?.customerName || 'este cliente'}.
                </p>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePinSubmit();
                    }
                  }}
                  placeholder="Ingresa el PIN"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontFamily: 'monospace'
                  }}
                  autoFocus
                />
                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => {
                      setShowPinModal(false);
                      setSaleToDelete(null);
                      setPinInput('');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

