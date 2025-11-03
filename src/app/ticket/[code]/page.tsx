'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Loader2, AlertCircle, Wifi, WifiOff, X, Calendar, MapPin, CheckCircle } from 'lucide-react';
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
    image?: string;
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
            // Convertir createdAt de string a Date si es necesario
            const ticketData = {
              ...savedTicket,
              createdAt: savedTicket.createdAt ? new Date(savedTicket.createdAt) : new Date()
            };
            setTicket(ticketData as TicketData);
            setLoadedFromCache(true);
            setLoading(false);
            console.log('Ticket cargado desde localStorage (modo offline)');
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
            
            // Convertir datos de Firestore a formato serializable para localStorage
            const serializableTicket = {
              ...ticketData,
              createdAt: ticketData.createdAt instanceof Date 
                ? ticketData.createdAt.toISOString() 
                : ticketData.createdAt
            };
            
            tickets[ticketData.confirmationCode] = serializableTicket;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
            
            console.log('Ticket guardado en localStorage para acceso offline');
            
            // Notificar al Service Worker para cachear esta página
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_TICKET_PAGE',
                url: window.location.href
              });
            }
          } catch (err) {
            console.error('Error guardando ticket en localStorage:', err);
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
    <div className="min-h-screen w-full">
      {/* Header - Eliminado para pantalla completa móvil */}
      {false && (
      <div className="hidden">
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
      )}

      {/* Main Content - Diseño Móvil Vertical Pantalla Completa */}
      <div className="w-full min-h-screen bg-white sm:flex sm:items-center sm:justify-center sm:bg-gray-100 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-none shadow-2xl relative flex flex-col w-full sm:w-[390px] sm:max-w-[100vw] min-h-screen sm:min-h-[844px] sm:max-h-[90vh]"
        >
          {/* Botón X de cierre */}
          <Link href="/">
            <button className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </Link>

          {/* Contenido del ticket */}
          <div className="flex-1 overflow-y-auto">
            {/* Header - Franja negra */}
            <div className="w-full bg-black flex-shrink-0" style={{ height: '40px' }} />
            
            {/* Banner del evento */}
            <div 
              className="w-full h-[150px] bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: `url(${ticket.event.image || '/images/banner.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Palabra Ticket */}
            <div className="px-4 pt-6 pb-4" style={{ marginTop: '20px' }}>
              <h2 className="text-4xl font-bold text-gray-900 text-center">TICKET</h2>
            </div>
            
            {/* Nombre del concierto */}
            <div className="px-4 pt-8 pb-4 relative" style={{ zIndex: 10 }}>
              <h3 className="text-3xl font-semibold text-gray-900 text-center">{ticket.event.title}</h3>
            </div>
            
            {/* Código QR grande */}
            <div className="px-2 pt-8 pb-4 flex justify-center" style={{ marginTop: '-20px' }}>
              <MobileQRCode
                value={ticket.qrCode || `TICKET-${ticket.confirmationCode}-${ticket.event.id}`}
                size={380}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/images/logo.png",
                  height: 75,
                  width: 75,
                  excavate: true,
                }}
              />
            </div>
            
            {/* Detalles del evento */}
            <div className="px-4 pt-6 pb-4 space-y-4" style={{ marginTop: '-20px' }}>
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span className="text-base">{ticket.event.date} - {ticket.event.time}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5" />
                <span className="text-base">{ticket.event.venue}</span>
              </div>
            </div>
            
            {/* Asientos comprados y Estado del ticket */}
            <div className="px-4 pt-12 pb-4 space-y-4" style={{ marginTop: '30px' }}>
              {/* Asientos comprados */}
              {ticket.seats && ticket.seats.length > 0 && (
                <div className="text-center mb-4" style={{ marginTop: '-20px' }}>
                  <p className="text-sm text-gray-600 mb-3">Asientos:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {ticket.seats.map((seat, index) => (
                      <div
                        key={`${seat.row}${seat.number}-${index}`}
                        className="bg-purple-600 text-white font-bold text-lg px-4 py-2 min-w-[60px] text-center"
                        style={{ borderRadius: '0' }}
                      >
                        {seat.row}{seat.number}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Estado del ticket */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4" style={{ marginTop: '20px' }}>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-800">
                    {ticket.status === 'pending' ? 'PENDIENTE' : 
                     ticket.status === 'used' ? 'REDIMIDO' : 
                     ticket.status === 'approved' ? 'VERIFICADO' : 'VERIFICADO'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Franja negra abajo */}
            <div className="w-full bg-black flex-shrink-0" style={{ height: '40px', marginTop: 'auto' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

