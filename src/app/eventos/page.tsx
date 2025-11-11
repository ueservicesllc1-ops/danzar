'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Seat, Event, SeatStatus, SeatCategory, PaymentDetails } from '@/types/events';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import SeatMap from '@/components/events/SeatMap';
import CheckoutSummary from '@/components/events/CheckoutSummary';
import PaymentModal from '@/components/events/PaymentModal';
import MobileQRCode from '@/components/events/MobileQRCode';

const TicketModal = dynamic(() => import('@/components/events/TicketModal'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="text-gray-600">Cargando ticket...</div></div>
});

// Datos de ejemplo del evento
const mockEvent: Event = {
  id: '1',
  title: 'The Greatest Showdance',
  artist: 'DanZar Dance Company',
  date: '6 de Diciembre, 2025',
  time: '5:00 PM',
  venue: 'Teatro Municipal de Cabimas',
  image: '/images/banner.jpg',
  description: 'Un espectáculo único de danza contemporánea',
  totalSeats: 480,
  availableSeats: 400
};

// Generar asientos del auditorio
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  const totalSeatsPerRow = 24; // 24 asientos por fila total (12 por cada nave)

  const manuallyReleasedSeats = new Set([
    'B13',
    'B14',
    'B15',
    'B16',
    'B17',
    'B18',
    'B19',
    'B20',
    'B21',
    'B22',
    'B23',
    'B24',
  ]);

  rows.forEach((row) => {
    // Todos los asientos son premium con precio único
    const category: SeatCategory = 'premium';
    const basePrice: number = 12; // Precio en euros

    // Generar 24 asientos por fila
    for (let num = 1; num <= totalSeatsPerRow; num++) {
      let status: SeatStatus = 'available';
      
      // Filas A y B están bloqueadas (grises)
      if (row === 'A') {
        status = 'occupied';
      } else if (row === 'B') {
        const seatId = `${row}${num}`;
        status = manuallyReleasedSeats.has(seatId) ? 'available' : 'occupied';
      }

      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        category,
        status,
        price: basePrice
      });
    }
  });

  return seats;
};

export default function EventosPage() {
  const [seats, setSeats] = useState<Seat[]>(() => generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showCustomerDataModal, setShowCustomerDataModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<'pending' | 'approved' | 'used' | null>(null);
  const [loadingTicketStatus, setLoadingTicketStatus] = useState(false);
  const [ticketSeats, setTicketSeats] = useState<Array<{row: string, number: number}>>([]);
  const [isFlipped, setIsFlipped] = useState(false); // false = muestra reverso (dorado con logo), true = muestra ticket (rota 180deg)
  const cardRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

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

  // Asegurar que solo se renderice en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Buscar estado del ticket en Firestore cuando se abre el modal
  useEffect(() => {
    if (showMobilePreviewModal && confirmationCode) {
      const fetchTicketStatus = async () => {
        setLoadingTicketStatus(true);
        try {
          const ticketsRef = collection(db, 'tickets');
          const q = query(ticketsRef, where('confirmationCode', '==', confirmationCode));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const ticketData = querySnapshot.docs[0].data();
            if (ticketData.status === 'approved') {
              setTicketStatus(ticketData.used ? 'used' : 'approved');
            } else {
              setTicketStatus('pending');
            }
            if (ticketData.seats) {
              setTicketSeats(ticketData.seats);
            }
          } else {
            setTicketStatus(null);
            setTicketSeats([]);
          }
        } catch (error) {
          console.error('Error buscando estado del ticket:', error);
          setTicketStatus(null);
        } finally {
          setLoadingTicketStatus(false);
        }
      };
      
      fetchTicketStatus();
    } else if (showMobilePreviewModal && !confirmationCode) {
      // Si no hay código de confirmación, buscar el último ticket del evento
      const fetchLastTicket = async () => {
        setLoadingTicketStatus(true);
        try {
          const ticketsRef = collection(db, 'tickets');
          const q = query(ticketsRef, where('event.id', '==', mockEvent.id));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Obtener el último ticket (más reciente)
            const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
              id: string;
              status?: string;
              used?: boolean;
              seats?: Array<{row: string, number: number}>;
              createdAt?: Date | { seconds: number; nanoseconds: number } | unknown;
            }>;
            const lastTicket = tickets.sort((a, b) => {
              const aCreatedAt = a.createdAt as { toDate?: () => Date } | Date | string | undefined;
              const bCreatedAt = b.createdAt as { toDate?: () => Date } | Date | string | undefined;
              const aDate = (aCreatedAt && typeof aCreatedAt === 'object' && 'toDate' in aCreatedAt && aCreatedAt.toDate) 
                ? aCreatedAt.toDate() 
                : (aCreatedAt instanceof Date ? aCreatedAt : new Date(0));
              const bDate = (bCreatedAt && typeof bCreatedAt === 'object' && 'toDate' in bCreatedAt && bCreatedAt.toDate) 
                ? bCreatedAt.toDate() 
                : (bCreatedAt instanceof Date ? bCreatedAt : new Date(0));
              return bDate.getTime() - aDate.getTime();
            })[0];
            
            if (lastTicket.status === 'approved') {
              setTicketStatus(lastTicket.used ? 'used' : 'approved');
            } else {
              setTicketStatus('pending');
            }
            if (lastTicket.seats) {
              setTicketSeats(lastTicket.seats);
            }
          } else {
            setTicketStatus(null);
            setTicketSeats([]);
          }
        } catch (error) {
          console.error('Error buscando último ticket:', error);
          setTicketStatus(null);
        } finally {
          setLoadingTicketStatus(false);
        }
      };
      
      fetchLastTicket();
    }
  }, [showMobilePreviewModal, confirmationCode]);

  
  // Customer data
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  // Generar asientos y cargar tickets existentes de Firestore
  useEffect(() => {
    if (!isMounted) return;
    
    const loadSeats = async () => {
      // Generar asientos base
      const initialSeats = generateSeats();
      
      try {
        // Consultar tickets existentes para este evento
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('event.id', '==', mockEvent.id)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        
        // Crear un Set de IDs de asientos ocupados
        const occupiedSeatIds = new Set<string>();
        
        ticketsSnapshot.forEach((doc) => {
          const ticketData = doc.data();
          // Los asientos están en ticketData.seats como array de objetos con id
          if (ticketData.seats && Array.isArray(ticketData.seats)) {
            ticketData.seats.forEach((seat: { id: string }) => {
              if (seat.id) {
                occupiedSeatIds.add(seat.id);
              }
            });
          }
        });
        
        // Marcar asientos como ocupados
        const updatedSeats = initialSeats.map(seat => {
          if (occupiedSeatIds.has(seat.id)) {
            return { ...seat, status: 'occupied' as SeatStatus };
          }
          return seat;
        });
        
        setSeats(updatedSeats);
      } catch (error) {
        console.error('Error cargando tickets:', error);
        // Si hay error, usar los asientos generados sin modificar
        setSeats(initialSeats);
      }
    };

    loadSeats();
  }, [isMounted]);

  const handleSeatSelect = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      // Deseleccionar
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      setSeats(seats.map(s => 
        s.id === seat.id ? { ...s, status: 'available' } : s
      ));
    } else {
      // Seleccionar
      if (selectedSeats.length < 5) { // Máximo 5 entradas por usuario
        setSelectedSeats([...selectedSeats, seat]);
        setSeats(seats.map(s => 
          s.id === seat.id ? { ...s, status: 'selected' } : s
        ));
      } else {
        setShowLimitModal(true);
      }
    }
  };

  const handleRemoveSeat = (seat: Seat) => {
    setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    setSeats(seats.map(s => 
      s.id === seat.id ? { ...s, status: 'available' } : s
    ));
  };

  const handleCheckout = () => {
    // Abrir modal de datos del cliente primero
    setShowCustomerDataModal(true);
  };

  const handleCustomerDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo guardar en estado local, NO en Firebase aún
    // Cerrar modal de datos y abrir modal de pago
    setShowCustomerDataModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (details: PaymentDetails) => {
    // Generar código de confirmación único
    const code = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setConfirmationCode(code);
    setPaymentDetails(details);
    
    // Guardar en Firebase después del pago exitoso
    try {
      const ticketData = {
        customer: customerData,
        event: {
          id: mockEvent.id,
          title: mockEvent.title,
          date: mockEvent.date,
          time: mockEvent.time,
          venue: mockEvent.venue,
          image: mockEvent.image
        },
        seats: selectedSeats.map(s => ({ id: s.id, row: s.row, number: s.number })),
        totalSeats: selectedSeats.length,
        redeemedCount: 0,
        // Nueva lógica de precios: 3 o 4 entradas = $10 c/u, 5+ entradas = $9 c/u
        totalAmount: (() => {
          const count = selectedSeats.length;
          if (count === 3 || count === 4) {
            return count * 10; // $10 cada una
          } else if (count >= 5) {
            return count * 9; // $9 cada una
          }
          return selectedSeats.reduce((sum, s) => sum + s.price, 0);
        })(),
        // Detectar si es PayPal o Pago Móvil
        // PayPal tiene paypalOrderId, paypalStatus, o soft_descriptor con "PAYPAL"
        // Pago Móvil tiene screenshot o fileName
        paymentMethod: (() => {
          const hasPayPalOrderId = !!(details as { paypalOrderId?: string }).paypalOrderId;
          const hasPayPalStatus = !!(details as { paypalStatus?: string }).paypalStatus;
          const softDescriptor = (details as { soft_descriptor?: string }).soft_descriptor || '';
          const purchaseUnits = (details as { purchase_units?: Array<{ soft_descriptor?: string }> }).purchase_units;
          const hasSoftDescriptorPayPal = softDescriptor.toUpperCase().includes('PAYPAL') ||
            (purchaseUnits && purchaseUnits.length > 0 && purchaseUnits[0]?.soft_descriptor?.toUpperCase().includes('PAYPAL'));
          const hasPayPalId = details.id?.toLowerCase().includes('paypal') || false;
          const hasScreenshot = !!(details.screenshot || details.fileName);
          
          if (hasPayPalOrderId || hasPayPalStatus || hasSoftDescriptorPayPal || hasPayPalId) {
            return 'PayPal';
          }
          if (hasScreenshot) {
            return 'Pago Móvil';
          }
          // Por defecto PayPal si no tiene screenshot (probablemente es PayPal)
          return 'PayPal';
        })(),
        // Si es PayPal exitoso, estado "approved". Si es Pago Móvil, "pending" hasta verificación
        status: (() => {
          const hasPayPalOrderId = !!(details as { paypalOrderId?: string }).paypalOrderId;
          const paypalStatus = (details as { paypalStatus?: string }).paypalStatus;
          const hasScreenshot = !!(details.screenshot || details.fileName);
          
          if (hasPayPalOrderId || paypalStatus === 'COMPLETED') {
            return 'approved';
          }
          if (hasScreenshot) {
            return 'pending';
          }
          // PayPal por defecto es approved (el pago ya fue exitoso si llegó aquí)
          return 'approved';
        })(),
        confirmationCode: code,
        qrCode: `TICKET-${code}-${mockEvent.id}`,
        paymentDetails: details,
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'tickets'), ticketData);
      
      // Generar URL del ticket
      // Priorizar NEXT_PUBLIC_APP_URL si está configurado y no es localhost
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL && 
                      !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') 
        ? process.env.NEXT_PUBLIC_APP_URL
        : typeof window !== 'undefined' 
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || '';
      
      const ticketUrl = `${baseUrl}/ticket/${code}`;
      const logoUrl = `${baseUrl}/images/logo.png`;
      
      // Enviar email de confirmación usando EmailJS desde el cliente
      try {
        // Formatear asientos para el email
        const seatsList = selectedSeats.map(s => `Fila ${s.row} - Asiento ${s.number}`).join(', ');
        
        // Inicializar EmailJS con la public key
        emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '');
        
        // Enviar email usando EmailJS desde el cliente (evita bloqueo del servidor)
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
          {
            to_email: customerData.email,
            to_name: `${customerData.firstName} ${customerData.lastName}`,
            event_title: mockEvent.title,
            event_date: mockEvent.date,
            event_time: mockEvent.time,
            event_venue: mockEvent.venue,
            seats: seatsList,
            total_amount: `$${ticketData.totalAmount.toFixed(2)}`,
            confirmation_code: code,
            ticket_url: ticketUrl,
            logo_url: logoUrl,
            app_name: process.env.NEXT_PUBLIC_APP_NAME || 'DanZar'
          }
        );
        
        console.log('Email de confirmación enviado exitosamente');
      } catch (emailError) {
        console.error('Error al intentar enviar email de confirmación:', emailError);
        // No bloquear el flujo si falla el email
      }
      
      // Marcar asientos como ocupados
      setSeats(seats.map(s => 
        selectedSeats.some(selected => selected.id === s.id) 
          ? { ...s, status: 'occupied' as SeatStatus } 
          : s
      ));
      
      // Cerrar modal de pago y mostrar popup de verificación
      setShowPaymentModal(false);
      setShowVerificationPopup(true);
    } catch (error) {
      console.error('Error guardando ticket:', error);
      alert('Error al guardar el ticket. Contacta soporte.');
    }
  };

  const handleShowTicket = () => {
    setShowVerificationPopup(false);
    setShowTicketModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setSelectedSeats([]);
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }

    setSendingTestEmail(true);
    try {
      const testCode = `TKT-TEST-${Date.now().toString(36).toUpperCase()}`;
      // Priorizar NEXT_PUBLIC_APP_URL si está configurado y no es localhost
      const testBaseUrl = process.env.NEXT_PUBLIC_APP_URL && 
                          !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') 
        ? process.env.NEXT_PUBLIC_APP_URL
        : typeof window !== 'undefined' 
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || '';
      
      const testTicketUrl = `${testBaseUrl}/ticket/${testCode}`;
      const testLogoUrl = `${testBaseUrl}/images/logo.png`;

      // Formatear asientos para el email
      const testSeats = selectedSeats.length > 0 
        ? selectedSeats.map(s => `Fila ${s.row} - Asiento ${s.number}`).join(', ')
        : 'Fila B - Asiento 10';
      const testTotal = selectedSeats.length > 0 
        ? (() => {
            const count = selectedSeats.length;
            if (count === 3 || count === 4) {
              return count * 10;
            } else if (count >= 5) {
              return count * 9;
            }
            return selectedSeats.reduce((sum, s) => sum + s.price, 0);
          })()
        : 12;

      // Inicializar EmailJS con la public key
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '');
      
      // Enviar email usando EmailJS desde el cliente
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        {
          to_email: testEmailAddress,
          to_name: 'Usuario de Prueba',
          event_title: mockEvent.title,
          event_date: mockEvent.date,
          event_time: mockEvent.time,
          event_venue: mockEvent.venue,
          seats: testSeats,
          total_amount: `$${testTotal.toFixed(2)}`,
          confirmation_code: testCode,
          ticket_url: testTicketUrl,
          logo_url: testLogoUrl,
          app_name: process.env.NEXT_PUBLIC_APP_NAME || 'DanZar'
        }
      );

      alert(`Email de prueba enviado exitosamente a ${testEmailAddress}`);
      setShowTestEmailModal(false);
      setTestEmailAddress('');
    } catch (error: unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'text' in error
        ? String(error.text)
        : 'Error al enviar email';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </Link>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center flex-1 px-2">
              Selección de Asientos
            </h1>
            <div className="w-16 sm:w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Event Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[200px] sm:h-[300px] lg:h-[500px] overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mockEvent.image})` }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="w-full py-4 sm:py-6 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-8" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* Seat Map - Izquierda */}
          <div className="flex-1">
            <SeatMap
              seats={seats}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
            />
          </div>

          {/* Checkout Summary - Derecha */}
          <div className="lg:w-80 flex flex-col gap-3">
            <CheckoutSummary
              event={mockEvent}
              selectedSeats={selectedSeats}
              onRemoveSeat={handleRemoveSeat}
              onCheckout={handleCheckout}
              onTestEmail={() => setShowTestEmailModal(true)}
            />
            
            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-2">{mockEvent.title}</h3>
              <p className="text-lg text-gray-700 mb-4 sm:mb-3">{mockEvent.artist}</p>
              <div className="space-y-3 sm:space-y-2">
                <div className="flex items-center gap-2 text-base text-gray-600 sm:text-sm">
                  <Calendar className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>{mockEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-gray-600 sm:text-sm">
                  <Calendar className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>{mockEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-gray-600 sm:text-sm">
                  <MapPin className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="break-words">{mockEvent.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-gray-600 sm:text-sm">
                  <Users className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>{seats.filter(s => s.status === 'available').length} asientos disponibles</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Customer Data Modal */}
      <AnimatePresence>
        {showCustomerDataModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomerDataModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 999
              }}
            />

            <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none" style={{ zIndex: 1000 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl pointer-events-auto w-full max-w-md sm:max-w-lg"
                style={{ border: '1px solid #9B0000', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-[calc(100%-10px)] m-[5px] border border-[#efb810] p-6 sm:p-4">
                  <div className="flex justify-between items-center mb-6 sm:mb-4">
                    <h2 className="text-2xl font-bold m-0 sm:text-lg">Datos del Comprador</h2>
                    <button
                      onClick={() => setShowCustomerDataModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleCustomerDataSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerData.firstName}
                        onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        placeholder="Juan"
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerData.lastName}
                        onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        placeholder="Pérez"
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        placeholder="04141234567"
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        placeholder="juan@email.com"
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: '#9B0000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Continuar al Pago
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        event={mockEvent}
        seats={selectedSeats}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Verification Popup */}
      <AnimatePresence>
        {showVerificationPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleShowTicket()}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 999
              }}
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 1100 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl pointer-events-auto"
                style={{ width: '400px', border: '1px solid #9B0000', zIndex: 1101 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#fff3cd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    border: '3px solid #efb810'
                  }}>
                    <CheckCircle size={32} color="#efb810" />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937' }}>
                    Pago Realizado Exitosamente
                  </h2>
                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
                    Su ticket será activado luego de verificar el pago. 
                    <strong style={{ color: '#9B0000' }}> Será notificado dentro de las próximas 24 horas.</strong>
                  </p>
                  <button
                    onClick={handleShowTicket}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      backgroundColor: '#9B0000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Ver Mi Ticket
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={handleCloseTicketModal}
        event={mockEvent}
        seats={selectedSeats}
        confirmationCode={confirmationCode}
      />

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestEmailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTestEmailModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[10000]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-2xl pointer-events-auto w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Test Email</h2>
                    <button
                      onClick={() => setShowTestEmailModal(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email:</label>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  
                  <Button
                    onClick={handleTestEmail}
                    disabled={!testEmailAddress || !testEmailAddress.includes('@') || sendingTestEmail}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {sendingTestEmail ? 'Enviando...' : 'Enviar Email'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Límite de 5 Entradas */}
      <AnimatePresence>
        {showLimitModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLimitModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[10000]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-2xl pointer-events-auto w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <X className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Límite de Entradas
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Máximo 5 entradas por usuario. Por favor, deselecciona una entrada para agregar otra.
                  </p>
                  <Button
                    onClick={() => setShowLimitModal(false)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Entendido
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showMobilePreviewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobilePreviewModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[10000]">
              <div 
                className="metallic-card-3d pointer-events-auto"
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  ref={cardRef}
                  className={`metallic-card-inner pointer-events-auto ${isFlipped ? 'flipped' : ''}`}
                  style={{
                    '--rotate-y': '0deg',
                    '--rotate-x': '0deg'
                  } as React.CSSProperties & { '--rotate-y'?: string; '--rotate-x'?: string }}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔄 Click en card, isFlipped actual:', isFlipped);
                    const newFlipped = !isFlipped;
                    console.log('🔄 Nuevo estado:', newFlipped);
                    setIsFlipped(newFlipped);
                  }}
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
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                        👆 Toca para voltear
                      </div>
                    )}
                    
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
                  
                  {/* Frente del ticket con efecto metálico - Visible cuando está volteado */}
                  <motion.div
                    className="metallic-card-face metallic-front pointer-events-auto rounded-none shadow-2xl relative flex flex-col absolute inset-0 w-full h-full"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: `rotateY(180deg) rotateY(var(--rotate-y, 0deg)) rotateX(var(--rotate-x, 0deg))`
                    }}
                  >
                    {/* Indicador de click en frente (cuando se muestra el ticket) */}
                    {isFlipped && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                        👆 Toca para voltear
                      </div>
                    )}
                    {/* Botón cerrar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobilePreviewModal(false);
                      }}
                      className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Contenido del móvil - Ticket con efecto metálico */}
                    <div className="flex-1 overflow-hidden">
                      {/* Header - Franja negra */}
                      <div className="w-full bg-black flex-shrink-0" style={{ height: '40px' }} />
                      
                      {/* Banner arriba */}
                      <div 
                        className="w-full h-[150px] bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${mockEvent.image})` }}
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
                              value={`TICKET-PREVIEW-${mockEvent.id}`}
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
                          <span className="text-base">{mockEvent.date} - {mockEvent.time}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-700">
                          <MapPin className="w-5 h-5" />
                          <span className="text-base">{mockEvent.venue}</span>
                        </div>
                      </div>
                      
                      {/* Asientos comprados y Estado del ticket */}
                      <div className="px-4 pt-12 pb-4" style={{ marginTop: '20px' }}>
                        {/* Asientos comprados */}
                        {ticketSeats.length > 0 && (
                          <div className="text-center mb-4" style={{ marginTop: '-7px' }}>
                            <p className="text-sm text-gray-600 mb-3">Asientos:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {ticketSeats.map((s, index) => (
                                <div
                                  key={`${s.row}${s.number}-${index}`}
                                  className="metallic-border-gold font-bold text-lg px-4 py-2 min-w-[60px] text-center"
                                  style={{ 
                                    borderRadius: '0',
                                    background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                                    color: '#ffd700',
                                    textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)',
                                    boxShadow: '0 0 15px rgba(147, 51, 234, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.2)'
                                  }}
                                >
                                  {s.row}{s.number}
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
                            background: ticketStatus === 'approved' 
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)'
                              : ticketStatus === 'used'
                              ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(234, 88, 12, 0.4) 100%)'
                              : 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 100%)',
                            boxShadow: '0 0 25px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.1)'
                          }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle 
                              className="w-6 h-6" 
                              style={{ 
                                color: ticketStatus === 'approved' ? '#22c55e' : ticketStatus === 'used' ? '#f97316' : '#eab308',
                                filter: 'drop-shadow(0 0 8px currentColor)'
                              }} 
                            />
                            <span 
                              className="metallic-gold-text text-lg font-bold"
                              style={{
                                color: ticketStatus === 'approved' ? '#22c55e' : ticketStatus === 'used' ? '#f97316' : '#eab308',
                                filter: 'drop-shadow(0 0 6px currentColor)'
                              }}
                            >
                              {ticketStatus === 'pending' ? 'PENDIENTE' : 
                               ticketStatus === 'used' ? 'REDIMIDO' : 
                               ticketStatus === 'approved' ? 'VERIFICADO' : 'VERIFICADO'}
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
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

