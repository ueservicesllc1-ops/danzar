'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Search, AlertCircle, Loader2, Download, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MobileQRCode from '@/components/events/MobileQRCode';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface TicketData {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
  };
  seats: Array<{
    id: string;
    row: string;
    number: number;
  }>;
  totalAmount: number;
  confirmationCode: string;
  qrCode: string;
  status: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | unknown;
}

const STORAGE_KEY = 'danzar_saved_tickets';

export default function MiTicketPage() {
  const [code, setCode] = useState('');
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [savedTickets, setSavedTickets] = useState<Record<string, TicketData>>({});

  // Detectar estado online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cargar tickets guardados al iniciar
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const tickets = JSON.parse(saved);
        setSavedTickets(tickets);
      } catch (err) {
        console.error('Error cargando tickets guardados:', err);
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  // Cargar tickets guardados desde localStorage
  const loadSavedTickets = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const tickets = JSON.parse(saved);
        setSavedTickets(tickets);
      }
    } catch (err) {
      console.error('Error cargando tickets guardados:', err);
    }
  };

  // Guardar ticket en localStorage
  const saveTicketToStorage = (ticketData: TicketData) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const tickets = saved ? JSON.parse(saved) : {};
      tickets[ticketData.confirmationCode] = ticketData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
      setSavedTickets(tickets);
    } catch (err) {
      console.error('Error guardando ticket:', err);
    }
  };

  // Buscar ticket guardado
  const loadSavedTicket = (ticketCode: string): boolean => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const tickets = JSON.parse(saved);
        const savedTicket = tickets[ticketCode.toUpperCase().trim()];
        if (savedTicket) {
          setTicket(savedTicket);
          setSavedTickets(tickets);
          return true;
        }
      }
    } catch (err) {
      console.error('Error cargando ticket guardado:', err);
    }
    return false;
  };

  const handleSearch = async () => {
    if (!code.trim()) {
      setError('Por favor ingresa un código de ticket');
      return;
    }

    const codeUpper = code.toUpperCase().trim();
    setLoading(true);
    setError('');
    setTicket(null);

    // Primero buscar en tickets guardados (funciona offline)
    if (loadSavedTicket(codeUpper)) {
      setLoading(false);
      return;
    }

    // Si no está guardado y no hay internet, mostrar error
    if (!isOnline) {
      setError('Sin conexión a internet y el ticket no está guardado. Guarda tu ticket cuando tengas conexión.');
      setLoading(false);
      return;
    }

    try {
      // Buscar ticket en Firestore por código de confirmación
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('confirmationCode', '==', codeUpper)
      );
      
      const querySnapshot = await getDocs(ticketsQuery);

      if (querySnapshot.empty) {
        setError('No se encontró ningún ticket con ese código. Verifica que el código sea correcto.');
      } else {
        // Obtener el primer ticket (debería haber solo uno con ese código)
        const doc = querySnapshot.docs[0];
        const ticketData = { id: doc.id, ...doc.data() } as TicketData;
        setTicket(ticketData);
        // Guardar automáticamente para acceso offline
        saveTicketToStorage(ticketData);
      }
    } catch (err) {
      console.error('Error buscando ticket:', err);
      setError('Error al buscar el ticket. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForOffline = () => {
    if (ticket) {
      saveTicketToStorage(ticket);
      alert('✅ Ticket guardado exitosamente. Ahora puedes acceder a él sin internet.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mi Ticket Digital
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Consultar Mi Ticket</h2>
                <p className="text-sm text-gray-600">Ingresa tu código único de compra</p>
              </div>
            </div>
            {/* Indicador de conexión */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">En línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-700 font-medium">Sin conexión</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Ejemplo: TKT-ABC123-XYZ789"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1 text-lg py-6"
              disabled={loading}
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Info sobre tickets guardados */}
          {Object.keys(savedTickets).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-xs text-blue-800">
                💾 Tienes {Object.keys(savedTickets).length} ticket(s) guardado(s). Puedes acceder a ellos sin internet.
              </p>
            </motion.div>
          )}

          {/* Info sobre funcionamiento offline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <p className="text-sm text-purple-900 font-semibold mb-2">📱 Funciona Sin Internet</p>
            <p className="text-xs text-purple-800 leading-relaxed">
              Esta página se guarda automáticamente en tu navegador. Después de la primera visita con internet, 
              podrás acceder a ella sin conexión. <strong>Abre esta página antes de ir al evento para que funcione offline.</strong>
            </p>
          </motion.div>
        </motion.div>

        {/* Ticket Display */}
        {ticket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden shadow-xl border-4 border-white"
          >
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="w-6 h-6" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Ticket Digital</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{ticket.event.title}</h3>
                <p className="text-xl text-white/90">{ticket.event.venue}</p>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side - Event Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <span className="text-xs uppercase tracking-wider">Fecha y Hora</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{ticket.event.date}</p>
                    <p className="text-gray-700">{ticket.event.time}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <span className="text-xs uppercase tracking-wider">Comprador</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {ticket.customer.firstName} {ticket.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{ticket.customer.email}</p>
                    <p className="text-sm text-gray-600">{ticket.customer.phone}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <span className="text-xs uppercase tracking-wider">Asientos</span>
                    </div>
                    <div className="space-y-2">
                      {ticket.seats.map((seat, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <span className="font-semibold text-gray-900">
                            Fila {seat.row} - Asiento {seat.number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total Pagado</span>
                      <span>${ticket.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-gray-100">
                    <MobileQRCode
                      value={ticket.qrCode || `TICKET-${ticket.confirmationCode}-${ticket.event.id}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "/images/logo.png",
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="mt-5 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Código de Confirmación</p>
                    <p className="text-base font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                      {ticket.confirmationCode}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-5 max-w-xs leading-relaxed">
                    Presenta este código QR en la entrada del evento
                  </p>
                </div>
              </div>

              {/* Save for Offline Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSaveForOffline}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Guardar para Usar Sin Internet
                </Button>
              </div>

              {/* Status Notice */}
              <div className={`mt-6 p-4 rounded-xl ${
                ticket.status === 'pending' 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <p className={`text-sm ${
                  ticket.status === 'pending' ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  <strong>
                    {ticket.status === 'pending' 
                      ? '⚠️ Ticket Pendiente de Verificación:' 
                      : '✅ Ticket Verificado:'}
                  </strong>{' '}
                  {ticket.status === 'pending' 
                    ? 'Este ticket será activado luego de verificar el pago. Será notificado dentro de las próximas 24 horas.'
                    : 'Tu ticket está verificado y activo. Puedes ingresar al evento con este código QR.'}
                </p>
              </div>

              {/* Offline Notice */}
              {savedTickets[ticket.confirmationCode] && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-800 text-center">
                    💾 Este ticket está guardado en tu dispositivo. Funciona sin internet.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

