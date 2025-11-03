'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QrCode, Keypad, ArrowLeft } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/library';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TicketResult {
  ticket: {
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
    seats: Array<{
      row: string;
      number: string;
    }>;
    event: {
      title: string;
      date: string;
      time?: string;
      venue?: string;
    };
    confirmationCode: string;
    totalAmount?: number;
    status?: string;
    used?: boolean;
    [key: string]: unknown;
  };
  isValid: boolean;
  docId: string;
}

export default function MobileScanPage() {
  const router = useRouter();
  const [showScanning, setShowScanning] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [codeReader, setCodeReader] = useState<BrowserQRCodeReader | null>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Si no es móvil, mostrar mensaje
  if (!isMobile && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="mb-6">
            <QrCode className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Solo en Móvil
            </h1>
            <p className="text-gray-600">
              Esta página está diseñada solo para dispositivos móviles.
              Por favor, accede desde tu teléfono.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const handleScanQR = async () => {
    setShowScanning(true);
    setError('');
    setResult(null);
    setShowModal(false);

    try {
      const reader = new BrowserQRCodeReader();
      setCodeReader(reader);
      
      const videoInputDevices = await reader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError('No se encontró ninguna cámara');
        setShowScanning(false);
        return;
      }

      // Usar la cámara trasera si está disponible
      const videoDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      ) || videoInputDevices[0];

      await reader.decodeFromVideoDevice(
        videoDevice.deviceId,
        'video',
        (result, error) => {
          if (result) {
            const qrText = result.getText();
            reader.reset();
            setShowScanning(false);
            verifyTicket(qrText);
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Error en escaneo:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error escaneando QR:', err);
      setError('Error al acceder a la cámara. Asegúrate de dar permisos de cámara.');
      setShowScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
      setCodeReader(null);
    }
    const video = document.getElementById('video') as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setShowScanning(false);
  };

  const verifyTicket = async (qrCode: string) => {
    if (!qrCode.trim()) {
      setError('Código QR inválido');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const q = query(
        collection(db, 'tickets'),
        where('qrCode', '==', qrCode.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Ticket no encontrado');
        setLoading(false);
        return;
      }

      const ticketDoc = querySnapshot.docs[0];
      const ticketData = ticketDoc.data() as TicketResult['ticket'];

      const ticketResult: TicketResult = {
        ticket: ticketData,
        isValid: ticketData.status === 'approved',
        docId: ticketDoc.id
      };

      setResult(ticketResult);
      setShowModal(true);

    } catch (err) {
      console.error('Error verificando ticket:', err);
      setError(err instanceof Error ? err.message : 'Error al verificar el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = () => {
    if (!codeInput.trim()) {
      setError('Por favor ingresa un código');
      return;
    }
    setShowCodeInput(false);
    verifyTicket(codeInput.trim());
  };

  const handleValidateEntry = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'tickets', result.docId), {
        used: true,
        usedAt: new Date()
      });
      
      setResult({
        ...result,
        ticket: {
          ...result.ticket,
          used: true
        }
      });
      
      // Actualizar el estado en el modal también
      alert('Entrada redimida exitosamente');
    } catch (err) {
      console.error('Error validando entrada:', err);
      alert('Error al validar la entrada');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (result?.ticket.used) {
      return {
        text: 'REDIMIDO',
        color: 'bg-orange-500',
        textColor: 'text-orange-50'
      };
    }
    
    if (result?.ticket.status === 'approved') {
      return {
        text: 'VERIFICADO',
        color: 'bg-green-500',
        textColor: 'text-green-50'
      };
    }
    
    return {
      text: 'PENDIENTE',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-50'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4" style={{ marginTop: '-3rem', paddingTop: '1rem' }}>
      {/* Header */}
      {!showScanning && !showCodeInput && !result && (
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Verificación de Entradas
          </h1>
          <p className="text-gray-600 text-center">
            Escanea o ingresa el código del ticket
          </p>
        </div>
      )}

      {/* Botones principales */}
      {!showScanning && !showCodeInput && !result && (
        <div className="space-y-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScanQR}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 font-semibold text-lg"
          >
            <QrCode className="w-8 h-8" />
            Escanear QR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCodeInput(true)}
            className="w-full bg-white text-purple-600 border-2 border-purple-600 py-6 rounded-2xl shadow-lg flex items-center justify-center gap-4 font-semibold text-lg hover:bg-purple-50 transition-colors"
          >
            <Keypad className="w-8 h-8" />
            Ingresar Código
          </motion.button>
        </div>
      )}

      {/* Vista de escaneo */}
      {showScanning && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Escaneando QR
            </h2>
            <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '1/1' }}>
              <video
                id="video"
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
            </div>
            <button
              onClick={stopScanning}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vista de ingreso de código */}
      {showCodeInput && !result && (
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Ingresar Código
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="TKT-XXXXX-XXXXX"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg text-center"
                autoFocus
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeInput('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCodeSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Resultado */}
      {result && showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Estado grande en el header */}
            <div className={`${getStatusDisplay().color} ${getStatusDisplay().textColor} p-6 text-center rounded-t-2xl`}>
              <div className="text-4xl font-bold mb-2">
                {getStatusDisplay().text}
              </div>
              {result.ticket.status !== 'approved' && !result.ticket.used && (
                <p className="text-sm opacity-90">
                  El ticket aún no ha sido verificado
                </p>
              )}
              {result.ticket.used && (
                <p className="text-sm opacity-90">
                  Esta entrada ya fue utilizada
                </p>
              )}
            </div>

            {/* Detalles del ticket */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles del Ticket</h3>
              
              <div className="space-y-4">
                {/* Cliente */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Cliente</div>
                  <div className="font-semibold text-gray-900">
                    {result.ticket.customer.firstName} {result.ticket.customer.lastName}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {result.ticket.customer.email}
                  </div>
                </div>

                {/* Evento */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Evento</div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {result.ticket.event.title}
                  </div>
                  {result.ticket.event.date && (
                    <div className="text-sm text-gray-600 mt-1">
                      {result.ticket.event.date}
                      {result.ticket.event.time && ` • ${result.ticket.event.time}`}
                    </div>
                  )}
                  {result.ticket.event.venue && (
                    <div className="text-sm text-gray-600">
                      {result.ticket.event.venue}
                    </div>
                  )}
                </div>

                {/* Asientos */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Asientos</div>
                  <div className="flex flex-wrap gap-2">
                    {result.ticket.seats.map((seat, index) => (
                      <span
                        key={index}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg"
                      >
                        {seat.row}{seat.number}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Valor Pagado */}
                {result.ticket.totalAmount !== undefined && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Valor Pagado</div>
                    <div className="font-bold text-2xl text-green-600">
                      ${result.ticket.totalAmount.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Código de Confirmación */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Código de Confirmación</div>
                  <div className="font-mono font-semibold text-gray-900">
                    {result.ticket.confirmationCode}
                  </div>
                </div>
              </div>

              {/* Botón para redimir */}
              {result.ticket.status === 'approved' && !result.ticket.used && (
                <button
                  onClick={handleValidateEntry}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Redimiendo...' : 'Redimir Entrada'}
                </button>
              )}

              {/* Botón para cerrar y escanear otro */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult(null);
                    setCodeInput('');
                    setError('');
                    setShowCodeInput(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold"
                >
                  Escanear Otro
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

