'use client';

import { useState, useEffect } from 'react';
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
  date: '6 de Diciembre, 2024',
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

  rows.forEach((row, rowIndex) => {
    // Todos los asientos son premium con precio único
    const category: SeatCategory = 'premium';
    const basePrice: number = 12;

    // Generar 24 asientos por fila
    for (let num = 1; num <= totalSeatsPerRow; num++) {
      let status: SeatStatus = 'available';
      
      // Solo la fila A está ocupada (gris)
      if (row === 'A') {
        status = 'occupied';
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
              createdAt?: any;
            }>;
            const lastTicket = tickets.sort((a, b) => {
              const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
              const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
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
      if (selectedSeats.length < 10) { // Máximo 10 asientos
        setSelectedSeats([...selectedSeats, seat]);
        setSeats(seats.map(s => 
          s.id === seat.id ? { ...s, status: 'selected' } : s
        ));
      } else {
        alert('Máximo 10 asientos por compra');
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
        totalAmount: selectedSeats.length === 3 ? 30 : selectedSeats.length === 5 ? 45 : selectedSeats.reduce((sum, s) => sum + s.price, 0),
        status: 'pending',
        confirmationCode: code,
        qrCode: `TICKET-${code}-${mockEvent.id}`,
        paymentDetails: details,
        createdAt: new Date(),
        paymentMethod: details.id?.includes('paypal') ? 'PayPal' : 
                       details.id?.includes('transfer') ? 'Transferencia' : 'Pago Móvil'
      };
      
      await addDoc(collection(db, 'tickets'), ticketData);
      
      // Generar URL del ticket
      const ticketUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/ticket/${code}`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ticket/${code}`;
      
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
      const testTicketUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/ticket/${testCode}`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ticket/${testCode}`;

      // Formatear asientos para el email
      const testSeats = selectedSeats.length > 0 
        ? selectedSeats.map(s => `Fila ${s.row} - Asiento ${s.number}`).join(', ')
        : 'Fila B - Asiento 10';
      const testTotal = selectedSeats.length > 0 
        ? selectedSeats.reduce((sum, s) => sum + s.price, 0)
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
          app_name: process.env.NEXT_PUBLIC_APP_NAME || 'DanZar'
        }
      );

      alert(`Email de prueba enviado exitosamente a ${testEmailAddress}`);
      setShowTestEmailModal(false);
      setTestEmailAddress('');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.text || error.message || 'Error al enviar email'}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Selección de Asientos
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Event Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[500px] overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mockEvent.image})` }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="w-full py-12">
        <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* Seat Map */}
          <div className="flex-1">
            <SeatMap
              seats={seats}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
            />
          </div>

          {/* Checkout Summary */}
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
              className="bg-white rounded-2xl shadow-lg border border-gray-200"
              style={{ padding: '2rem' }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">{mockEvent.title}</h3>
              <Button
                onClick={() => setShowMobilePreviewModal(true)}
                className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                📱 Vista Previa Móvil
              </Button>
              <p className="text-lg text-gray-700 mb-4">{mockEvent.artist}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{mockEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{mockEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{mockEvent.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
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

            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 1000 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl pointer-events-auto"
                style={{ width: '500px', border: '1px solid #9B0000', zIndex: 1001 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ width: 'calc(100% - 10px)', margin: '5px', border: '1px solid #efb810', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Datos del Comprador</h2>
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="bg-white pointer-events-auto rounded-none shadow-2xl relative flex flex-col"
                style={{
                  width: '390px',
                  maxWidth: '100vw',
                  height: '844px',
                  maxHeight: '90vh'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón cerrar */}
                <button
                  onClick={() => setShowMobilePreviewModal(false)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Contenido del móvil - Ticket en blanco para diseñar */}
                <div className="flex-1 overflow-y-auto">
                  {/* Header - Franja negra */}
                  <div className="w-full bg-black flex-shrink-0" style={{ height: '40px' }} />
                  
                  {/* Banner arriba */}
                  <div 
                    className="w-full h-[150px] bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${mockEvent.image})` }}
                  />
                  
                  {/* Palabra Ticket */}
                  <div className="px-4 pt-6 pb-4" style={{ marginTop: '20px' }}>
                    <h2 className="text-4xl font-bold text-gray-900 text-center">TICKET</h2>
                  </div>
                  
                  {/* Nombre del concierto */}
                  <div className="px-4 pt-8 pb-4 relative" style={{ zIndex: 10 }}>
                    <h3 className="text-3xl font-semibold text-gray-900 text-center">{mockEvent.title}</h3>
                  </div>
                  
                  {/* Código QR grande */}
                  <div className="px-2 pt-8 pb-4 flex justify-center" style={{ marginTop: '-20px' }}>
                    <MobileQRCode
                      value={`TICKET-PREVIEW-${mockEvent.id}`}
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
                      <span className="text-base">{mockEvent.date} - {mockEvent.time}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5" />
                      <span className="text-base">{mockEvent.venue}</span>
                    </div>
                  </div>
                  
                  {/* Asientos comprados y Estado del ticket */}
                  <div className="px-4 pt-12 pb-4" style={{ marginTop: '30px' }}>
                    {/* Asientos comprados */}
                    {ticketSeats.length > 0 && (
                      <div className="text-center mb-4" style={{ marginTop: '-20px' }}>
                        <p className="text-sm text-gray-600 mb-3">Asientos:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {ticketSeats.map((s, index) => (
                            <div
                              key={`${s.row}${s.number}-${index}`}
                              className="bg-purple-600 text-white font-bold text-lg px-4 py-2 min-w-[60px] text-center"
                              style={{ borderRadius: '0' }}
                            >
                              {s.row}{s.number}
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
                          {ticketStatus === 'pending' ? 'PENDIENTE' : 
                           ticketStatus === 'used' ? 'REDIMIDO' : 
                           ticketStatus === 'approved' ? 'VERIFICADO' : 'VERIFICADO'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Franja negra abajo */}
                  <div className="w-full bg-black flex-shrink-0" style={{ height: '40px', marginTop: 'auto' }} />
                  
                  {/* Contenido del ticket aquí */}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

