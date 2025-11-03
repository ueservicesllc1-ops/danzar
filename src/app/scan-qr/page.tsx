'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/library';

interface TicketData {
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
  };
  confirmationCode: string;
  status?: string;
  used?: boolean;
  [key: string]: unknown;
}

export default function ScanQRPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ticket: TicketData; isValid: boolean; docId: string } | null>(null);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Por favor ingresa un código QR');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Buscar el ticket en Firestore por el código QR usando query
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

      // Debería haber solo un resultado
      const ticketDoc = querySnapshot.docs[0];
      const ticketData = ticketDoc.data() as TicketData;

      // Mostrar resultado
      setResult({
        ticket: ticketData,
        isValid: ticketData.status === 'approved',
        docId: ticketDoc.id
      });

    } catch (err) {
      console.error('Error escaneando QR:', err);
      setError(err instanceof Error ? err.message : 'Error al escanear el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateEntry = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      // Marcar el ticket como usado
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
      
      alert('Entrada validada exitosamente');
    } catch (err) {
      console.error('Error validando entrada:', err);
      alert('Error al validar la entrada');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1619') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('PIN incorrecto');
    }
  };

  const startCamera = async () => {
    try {
      const codeReader = new BrowserQRCodeReader();
      const devices = await codeReader.listVideoInputDevices();
      
      if (devices.length === 0) {
        setError('No se encontró cámara disponible');
        return;
      }

      const deviceId = devices[devices.length - 1].deviceId;
      const videoElement = videoRef.current;

      if (!videoElement) {
        setError('Error al acceder al video');
        return;
      }

      // Obtener el stream directamente usando getUserMedia
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      
      setStream(mediaStream);
      videoElement.srcObject = mediaStream;
      setShowCamera(true);
      setError('');

      // Iniciar la lectura de QR
      codeReader.decodeFromVideoDevice(deviceId, videoElement, (result: { getText: () => string } | null) => {
        if (result) {
          setQrCode(result.getText());
          setShowCamera(false);
          // Detener el stream
          codeReader.reset();
          handleScan();
        }
      });
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      setError('Error al acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Pantalla de autenticación
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="text-center mb-6">
              <QrCode className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Verificación de Entradas
              </h1>
              <p className="text-gray-600">Ingresa el PIN de acceso</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN de Acceso
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ingresa el PIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg text-center"
                  maxLength={4}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Acceder
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verificación de Entradas
            </h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Scanner Input */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <QrCode className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Ingresar Código QR</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código QR del Ticket
              </label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="TICKET-XXXXX-XXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
              />
            </div>

            {/* Camera */}
            {showCamera && (
              <div className="bg-black rounded-xl overflow-hidden" style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
                <video
                  ref={videoRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  autoPlay
                  playsInline
                />
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleScan}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Escaneando...' : 'Escanear Manual'}
              </button>
              <button
                onClick={showCamera ? stopCamera : startCamera}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Camera size={24} />
                {showCamera ? 'Detener' : 'Cámara'}
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              {result.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">Resultado del Escaneo</h2>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div className={`p-6 rounded-xl ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.isValid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-xl font-bold text-green-800">ENTRADA VÁLIDA</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-xl font-bold text-red-800">ENTRADA NO VÁLIDA</span>
                    </>
                  )}
                </div>
                {!result.isValid && (
                  <p className="text-red-700">El ticket aún no ha sido activado por el administrador.</p>
                )}
              </div>

              {/* Ticket Details */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">Detalles del Ticket</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-semibold text-gray-900">
                      {result.ticket.customer.firstName} {result.ticket.customer.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{result.ticket.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asientos:</span>
                    <span className="font-semibold text-gray-900">
                      {result.ticket.seats.map((s) => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Evento:</span>
                    <span className="font-semibold text-gray-900">{result.ticket.event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold text-gray-900">{result.ticket.event.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-semibold text-gray-900">{result.ticket.confirmationCode}</span>
                  </div>
                  {result.ticket.used && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-semibold text-orange-600">REDIMIDO</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {result.isValid && !result.ticket.used && (
                <button
                  onClick={handleValidateEntry}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Validando...' : 'Redimir Entrada'}
                </button>
              )}
              
              {result.ticket.used && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                  <p className="text-orange-800 font-semibold">
                    ⚠️ Esta entrada ya fue redimida
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setQrCode('');
                  setError('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Escanear Otro Código
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

