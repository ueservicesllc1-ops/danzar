'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode } from 'lucide-react';
import { Seat, Event, PaymentDetails } from '@/types/events';
import PayPalCheckout from './PayPalCheckout';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  seats: Seat[];
  onPaymentSuccess: (details: PaymentDetails) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  event, 
  seats,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [showMobilePayment, setShowMobilePayment] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [lastDigits, setLastDigits] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const handlePaymentSuccess = (details: PaymentDetails) => {
    onPaymentSuccess(details);
    setShowPayPal(false);
    onClose();
  };

  const handlePaymentError = (error: Error | unknown) => {
    console.error('Payment error:', error);
    alert('Hubo un error al procesar el pago. Por favor, intenta de nuevo.');
  };
  const basePrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  
  // Nueva lógica de precios: 3 o 4 entradas = $10 c/u, 5+ entradas = $9 c/u
  const numTickets = seats.length;
  let totalPrice = basePrice;
  
  if (numTickets === 3 || numTickets === 4) {
    totalPrice = numTickets * 10; // $10 cada una
  } else if (numTickets >= 5) {
    totalPrice = numTickets * 9; // $9 cada una
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-2xl pointer-events-auto"
              style={{ width: '500px', height: '700px', border: '1px solid #9B0000', boxSizing: 'border-box' }}
            >
              <div style={{ width: 'calc(100% - 10px)', height: 'calc(100% - 10px)', margin: '5px', border: '1px solid #efb810', padding: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Realizar Pago</h2>
                
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{event.title}</h3>
                  <p style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#666' }}>{event.artist}</p>
                  <p style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#666' }}>{event.date} • {event.time}</p>
                  <p style={{ fontSize: '14px', margin: '0', color: '#666' }}>{event.venue}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Asientos Seleccionados:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {seats.map((seat) => (
                      <span key={seat.id} style={{ 
                        padding: '4px 12px', 
                        backgroundColor: '#efb810', 
                        color: '#9B0000',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {seat.row}{seat.number}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #9B0000', paddingTop: '20px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total a Pagar:</span>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#9B0000' }}>${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setShowPayPal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: '#9B0000',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      PayPal
                    </button>
                    
                    <button
                      onClick={() => {
                        alert('Pago con Transferencia procesado exitosamente');
                        onPaymentSuccess({ id: 'transfer-' + Date.now() });
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: '#9B0000',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Transferencia
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowMobilePayment(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: '#9B0000',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Pago Móvil
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
      </AnimatePresence>

      {/* Mobile Payment Modal */}
      <AnimatePresence>
      {showMobilePayment && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobilePayment(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-2xl pointer-events-auto"
              style={{ width: '500px', border: '1px solid #9B0000', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ width: 'calc(100% - 10px)', margin: '5px', border: '1px solid #efb810', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Pago Móvil</h2>
                  <button
                    onClick={() => setShowMobilePayment(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Banco Info */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Datos del Banco</h3>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Banco:</strong> Bancamiga</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>C.I:</strong> 26522453</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Teléfono:</strong> 04149631044</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Titular:</strong> DanZar Dance Company</p>
                </div>

                {/* Monto */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '4px', border: '2px solid #efb810' }}>
                  <p style={{ margin: '0', fontSize: '16px' }}><strong>Monto a Transferir:</strong></p>
                  <p style={{ margin: '5px 0 15px 0', fontSize: '28px', fontWeight: 'bold', color: '#9B0000' }}>${totalPrice.toFixed(2)}</p>
                  <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button
                      onClick={() => setShowQRModal(true)}
                      style={{
                        padding: '15px',
                        backgroundColor: '#efb810',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <QrCode size={32} color="#9B0000" />
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#9B0000' }}>Ver Código QR</span>
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                    Últimos 4 dígitos del comprobante:
                  </label>
                  <input
                    type="text"
                    value={lastDigits}
                    onChange={(e) => setLastDigits(e.target.value)}
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                    placeholder="1234"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                    Foto del comprobante:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <button
                  onClick={async () => {
                    if (lastDigits && screenshotFile) {
                      try {
                        // Crear FormData para enviar al API route
                        const formData = new FormData();
                        formData.append('file', screenshotFile);
                        
                        // Subir imagen usando API route (proxy server)
                        const response = await fetch('/api/upload-receipt', {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || 'Error al subir el archivo');
                        }
                        
                        const data = await response.json();
                        
                        if (!data.success || !data.url) {
                          throw new Error('Error al obtener la URL del archivo subido');
                        }
                        
                        const timestamp = Date.now();
                        
                        alert('Comprobante enviado exitosamente');
                        onPaymentSuccess({ 
                          id: 'movil-' + timestamp,
                          lastDigits,
                          screenshot: data.url,
                          fileName: data.fileName || `receipts/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${screenshotFile.name.split('.').pop()}`
                        });
                        setShowMobilePayment(false);
                        onClose();
                      } catch (error) {
                        console.error('Error subiendo imagen:', error);
                        alert(`Error al subir el comprobante: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta de nuevo.`);
                      }
                    } else {
                      alert('Por favor completa todos los campos');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#9B0000',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Enviar Comprobante
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
      </AnimatePresence>

      {/* PayPal Modal */}
      <AnimatePresence>
        {showPayPal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayPal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 50
              }}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl pointer-events-auto"
                style={{ width: '500px', border: '1px solid #9B0000', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <div style={{ width: 'calc(100% - 10px)', margin: '5px', border: '1px solid #efb810', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Pago con PayPal</h2>
                    <button
                      onClick={() => setShowPayPal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <PayPalCheckout
                    seats={seats}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  maxWidth: '400px',
                  textAlign: 'center'
                }}
              >
                <img 
                  src="/qrbanco.jfif" 
                  alt="QR Pago Móvil" 
                  style={{ 
                    width: '300px',
                    height: '300px',
                    objectFit: 'contain',
                    marginBottom: '20px'
                  }} 
                />
                <button
                  onClick={() => setShowQRModal(false)}
                  style={{
                    padding: '12px 40px',
                    backgroundColor: '#9B0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
