'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Loader2, AlertCircle, Wifi, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function TicketPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // Detectar estado online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar ticket
  useEffect(() => {
    if (!code) return;

    const loadTicket = async () => {
      setLoading(true);
      setError('');
      
      const codeUpper = code.toUpperCase().trim();

      // Primero intentar cargar desde localStorage (offline)
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const tickets = JSON.parse(saved);
          const savedTicket = tickets[codeUpper];
          if (savedTicket) {
            setTicket(savedTicket);
            setLoadedFromCache(true);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error cargando ticket desde cache:', err);
      }

      // Si no está guardado y no hay internet, mostrar error
      if (!isOnline) {
        setError('Sin conexión a internet y el ticket no está guardado. Consulta tu ticket con internet para guardarlo.');
        setLoading(false);
        return;
      }

      // Buscar en Firestore
      try {
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('confirmationCode', '==', codeUpper)
        );
        
        const querySnapshot = await getDocs(ticketsQuery);

        if (querySnapshot.empty) {
          setError('No se encontró ningún ticket con ese código. Verifica que el código sea correcto.');
        } else {
          const doc = querySnapshot.docs[0];
          const ticketData = { id: doc.id, ...doc.data() } as TicketData;
          setTicket(ticketData);
          
          // Guardar automáticamente para acceso offline
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const tickets = saved ? JSON.parse(saved) : {};
            tickets[ticketData.confirmationCode] = ticketData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
            
            // Notificar al Service Worker para cachear esta página
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_TICKET_PAGE',
                url: window.location.href
              });
            }
          } catch (err) {
            console.error('Error guardando ticket:', err);
          }
        }
      } catch (err) {
        console.error('Error buscando ticket:', err);
        setError('Error al buscar el ticket. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [code, isOnline]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el ticket</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link href="/mi-ticket">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Ir a Búsqueda de Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header - Oculto en móvil para más espacio */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-4">
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
              {loadedFromCache && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100">
                  <span className="text-xs text-purple-700 font-medium">💾 Modo Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-1 sm:py-12">
        {/* Ticket Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-2xl overflow-hidden shadow-xl border-2 sm:border-4 border-white relative"
        >
          {/* Botón X de cierre - Siempre visible en esquina superior derecha */}
          <Link href="/">
            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all active:scale-95">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </Link>
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12" />
            
            <div className="relative z-10 pr-12 sm:pr-0">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Ticket Digital</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 leading-tight">{ticket.event.title}</h3>
              <p className="text-sm sm:text-base lg:text-lg text-white/90">{ticket.event.venue}</p>
            </div>
          </div>

          {/* Perforated edge effect */}
          <div className="relative h-4 sm:h-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute top-0 left-0 right-0 flex justify-between">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full -mt-1.5 sm:-mt-2"
                />
              ))}
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-2.5 sm:p-6 lg:p-10">
            <div className="flex flex-col gap-3 sm:gap-6 md:grid md:grid-cols-2 md:gap-10">
              {/* QR Code - Primero en móvil */}
              <div className="flex flex-col items-center justify-center order-first md:order-last">
                <div className="bg-white p-2.5 sm:p-5 rounded-lg sm:rounded-2xl shadow-lg border-2 border-gray-100 w-full max-w-[160px] sm:max-w-[220px] md:max-w-none mx-auto">
                  <MobileQRCode
                    value={ticket.qrCode || `TICKET-${ticket.confirmationCode}-${ticket.event.id}`}
                    size={140}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/images/logo.png",
                      height: 26,
                      width: 26,
                      excavate: true,
                    }}
                    className="w-full h-auto"
                  />
                </div>
                <div className="mt-1.5 sm:mt-3 text-center w-full">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código</p>
                  <p className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded break-all">
                    {ticket.confirmationCode}
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1.5 max-w-xs mx-auto">
                  Presenta QR en la entrada
                </p>
              </div>

              {/* Event Details - Segundo en móvil */}
              <div className="space-y-2.5 sm:space-y-4 order-last md:order-first">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Fecha y Hora</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{ticket.event.date}</p>
                  <p className="text-xs text-gray-700">{ticket.event.time}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Comprador</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {ticket.customer.firstName} {ticket.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-600 break-all">{ticket.customer.email}</p>
                  <p className="text-xs text-gray-600">{ticket.customer.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">Asientos</p>
                  <div className="space-y-1">
                    {ticket.seats.map((seat, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-1.5">
                        <span className="text-xs font-semibold text-gray-900">
                          Fila {seat.row} - Asiento {seat.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-gray-300">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-900">
                    <span>Total</span>
                    <span>${ticket.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Notice */}
            <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg ${
              ticket.status === 'pending' 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-xs ${
                ticket.status === 'pending' ? 'text-yellow-800' : 'text-green-800'
              }`}>
                <strong>
                  {ticket.status === 'pending' 
                    ? '⚠️ Pendiente de Verificación' 
                    : '✅ Ticket Verificado'}
                </strong>
                {ticket.status === 'pending' && (
                  <span className="block mt-1">Será activado después de verificar el pago.</span>
                )}
              </p>
            </div>

            {/* Offline Notice */}
            {loadedFromCache && (
              <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800 text-center">
                  💾 Funciona sin internet
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

