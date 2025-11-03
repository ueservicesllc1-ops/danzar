'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Loader2, AlertCircle, Wifi, WifiOff, X, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Efecto de movimiento 3D con cursor/dedo
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 20;
    const rotateX = ((y / rect.height) - 0.5) * -20;

    // Permitir movimiento 3D solo cuando está volteado (mostrando el ticket)
    if (isFlipped) {
      card.style.setProperty('--rotate-y', `${rotateY}deg`);
      card.style.setProperty('--rotate-x', `${rotateX}deg`);
    }
  };

  const resetCardPosition = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--rotate-y', '0deg');
      cardRef.current.style.setProperty('--rotate-x', '0deg');
    }
  };

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

  // Cargar ticket y escuchar actualizaciones en tiempo real
  useEffect(() => {
    if (!code) return;

    const codeUpper = code.toUpperCase().trim();
    let unsubscribeFn: (() => void) | null = null;

    const loadTicket = async () => {
      setLoading(true);
      setError('');

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

      // Buscar en Firestore y escuchar actualizaciones en tiempo real
      try {
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('confirmationCode', '==', codeUpper)
        );
        
        // Primera carga para obtener el ticket inicial
        const querySnapshot = await getDocs(ticketsQuery);

        if (querySnapshot.empty) {
          setError('No se encontró ningún ticket con ese código. Verifica que el código sea correcto.');
          setLoading(false);
        } else {
          const docSnapshot = querySnapshot.docs[0];
          const ticketId = docSnapshot.id;
          const ticketData = { id: ticketId, ...docSnapshot.data() } as TicketData;
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

          // Escuchar actualizaciones en tiempo real
          const ticketRef = doc(db, 'tickets', ticketId);
          unsubscribeFn = onSnapshot(ticketRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const updatedData = { id: docSnapshot.id, ...docSnapshot.data() } as TicketData;
              console.log('Ticket actualizado en tiempo real:', updatedData.status);
              setTicket(updatedData);
              
              // Actualizar también localStorage con los nuevos datos
              try {
                const saved = localStorage.getItem(STORAGE_KEY);
                const tickets = saved ? JSON.parse(saved) : {};
                
                const serializableTicket = {
                  ...updatedData,
                  createdAt: updatedData.createdAt instanceof Date 
                    ? updatedData.createdAt.toISOString() 
                    : updatedData.createdAt
                };
                
                tickets[updatedData.confirmationCode] = serializableTicket;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
              } catch (err) {
                console.error('Error actualizando ticket en localStorage:', err);
              }
            }
          }, (error) => {
            console.error('Error en listener de tiempo real:', error);
          });
        }
      } catch (err) {
        console.error('Error buscando ticket:', err);
        setError('Error al buscar el ticket. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie el código
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
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

      {/* Main Content - Ticket Metálico 3D */}
      <div className="w-full min-h-screen sm:flex sm:items-center sm:justify-center sm:bg-gray-100 sm:p-4">
        <div 
          className="metallic-card-3d pointer-events-auto mx-auto"
          style={{
            width: '390px',
            maxWidth: '100vw',
            height: '750px',
            maxHeight: '85vh'
          }}
          onMouseMove={handleCardMove}
          onMouseLeave={resetCardPosition}
          onTouchMove={handleCardMove}
          onTouchEnd={resetCardPosition}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            ref={cardRef}
            className={`metallic-card-inner pointer-events-auto ${isFlipped ? 'flipped' : ''}`}
            style={{
              '--rotate-y': '0deg',
              '--rotate-x': '0deg'
            } as React.CSSProperties & { '--rotate-y'?: string; '--rotate-x'?: string }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Reverso del ticket - Visible inicialmente */}
            <motion.div
              className="metallic-card-face metallic-back pointer-events-auto rounded-none shadow-2xl relative flex flex-col items-center justify-center absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: `rotateY(0deg)`
              }}
            >
              {/* Indicador de click en reverso */}
              {!isFlipped && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold animate-pulse pointer-events-none">
                  👆 Toca para voltear
                </div>
              )}
              
              {/* Botón X de cierre también en el reverso */}
              <Link href="/" className="absolute top-4 right-4 z-[60] pointer-events-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </Link>
              
              {/* Solo el logo en el centro sobre fondo dorado */}
              <div className="flex items-center justify-center w-full h-full">
                <img 
                  src="/images/logo.png" 
                  alt="Logo DanZar" 
                  className="w-48 h-48 object-contain opacity-90"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))'
                  }}
                />
              </div>
            </motion.div>
            
            {/* Frente del ticket con efecto metálico */}
            <motion.div
              className="metallic-card-face metallic-front pointer-events-auto rounded-none shadow-2xl relative flex flex-col absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: `rotateY(180deg) rotateY(var(--rotate-y, 0deg)) rotateX(var(--rotate-x, 0deg))`
              }}
            >
              {/* Indicador de click en frente */}
              {isFlipped && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold animate-pulse pointer-events-none">
                  👆 Toca para voltear
                </div>
              )}
              
              {/* Botón X de cierre - Z-index más alto y fuera del área clickeable */}
              <Link href="/" className="absolute top-4 right-4 z-[60] pointer-events-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </Link>

              {/* Contenido del ticket con efecto metálico */}
              <div className="flex-1 overflow-hidden">
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
                <div className="px-4 pt-6 pb-4 flex justify-center items-center" style={{ marginTop: '20px' }}>
                  <h2 className="text-black text-3xl font-bold text-center">TICKET</h2>
                </div>
                
                {/* Espacio reservado para mantener el layout */}
                <div className="px-4 pt-8 pb-4 relative" style={{ zIndex: 10, height: '40px' }}>
                  {/* Nombre del concierto eliminado pero espacio mantenido */}
                </div>
                
                {/* Código QR grande con marco metálico (sin fondo blanco) */}
                <div className="px-2 pt-8 pb-4 flex justify-center" style={{ marginTop: '-20px' }}>
                  <div 
                    className="metallic-border-gold p-2"
                    style={{
                      background: 'transparent',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1)'
                    }}
                  >
                    <div style={{ backgroundColor: 'transparent' }}>
                      <MobileQRCode
                        value={ticket.qrCode || `TICKET-${ticket.confirmationCode}-${ticket.event.id}`}
                        size={280}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "/images/logo.png",
                          height: 55,
                          width: 55,
                          excavate: true,
                        }}
                        className="qr-code-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Detalles del evento */}
                <div className="px-4 pt-6 pb-4 space-y-4" style={{ marginTop: '20px' }}>
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
                <div className="px-4 pt-12 pb-4" style={{ marginTop: '20px' }}>
                  {/* Asientos comprados */}
                  {ticket.seats && ticket.seats.length > 0 && (
                    <div className="text-center mb-4" style={{ marginTop: '-7px' }}>
                      <p className="text-sm text-gray-600 mb-3">Asientos:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {ticket.seats.map((seat, index) => (
                          <div
                            key={`${seat.row}${seat.number}-${index}`}
                            className="metallic-border-gold font-bold text-lg px-4 py-2 min-w-[60px] text-center"
                            style={{ 
                              borderRadius: '0',
                              background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                              color: '#ffd700',
                              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)',
                              boxShadow: '0 0 15px rgba(147, 51, 234, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.2)'
                            }}
                          >
                            {seat.row}{seat.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Estado del ticket con efecto metálico */}
                  <div 
                    className="metallic-border-gold rounded-lg p-4" 
                    style={{ 
                      marginTop: '8px',
                      background: ticket.status === 'approved' 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)'
                        : ticket.status === 'used'
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(234, 88, 12, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 100%)',
                      boxShadow: '0 0 25px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle 
                        className="w-6 h-6" 
                        style={{ 
                          color: ticket.status === 'approved' ? '#22c55e' : ticket.status === 'used' ? '#f97316' : '#eab308',
                          filter: 'drop-shadow(0 0 8px currentColor)'
                        }} 
                      />
                      <span 
                        className="text-lg font-bold"
                        style={{
                          color: '#000000',
                          textShadow: 'none'
                        }}
                      >
                        {ticket.status === 'pending' ? 'PENDIENTE' : 
                         ticket.status === 'used' ? 'REDIMIDO' : 
                         ticket.status === 'approved' ? 'VERIFICADO' : 'VERIFICADO'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Franja negra abajo */}
                <div className="w-full bg-black flex-shrink-0" style={{ height: '25px', marginTop: 'auto' }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

