'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Seat, Event, SeatStatus, SeatCategory } from '@/types/events';
import SeatMap from '@/components/events/SeatMap';
import CheckoutSummary from '@/components/events/CheckoutSummary';
import TicketModal from '@/components/events/TicketModal';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Datos de ejemplo del evento
const mockEvent: Event = {
  id: '1',
  title: 'Concierto de Rock en Vivo',
  artist: 'The Electric Band',
  date: '15 de Diciembre, 2024',
  time: '20:00 hrs',
  venue: 'Auditorio Nacional',
  image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
  description: 'Una noche inolvidable con los mejores éxitos del rock',
  totalSeats: 200,
  availableSeats: 150
};

// Generar asientos del auditorio
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 20;

  rows.forEach((row, rowIndex) => {
    let category: SeatCategory;
    let basePrice: number;

    // Definir categorías por fila
    if (rowIndex < 2) {
      category = 'vip';
      basePrice = 150;
    } else if (rowIndex < 5) {
      category = 'premium';
      basePrice = 100;
    } else if (rowIndex < 8) {
      category = 'standard';
      basePrice = 60;
    } else {
      category = 'balcony';
      basePrice = 40;
    }

    for (let num = 1; num <= seatsPerRow; num++) {
      // Simular algunos asientos ocupados aleatoriamente
      const random = Math.random();
      let status: SeatStatus = 'available';
      
      if (random < 0.15) {
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
  const [seats, setSeats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

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
    // Generar código de confirmación único
    const code = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setConfirmationCode(code);
    
    // Marcar asientos como ocupados
    setSeats(seats.map(s => 
      selectedSeats.some(selected => selected.id === s.id) 
        ? { ...s, status: 'occupied' as SeatStatus } 
        : s
    ));
    
    // Mostrar modal del ticket
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setSelectedSeats([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
        className="relative h-64 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mockEvent.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center max-w-4xl px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold mb-4"
            >
              {mockEvent.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl mb-6"
            >
              {mockEvent.artist}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{mockEvent.date} • {mockEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{mockEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{mockEvent.availableSeats} asientos disponibles</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <SeatMap
              seats={seats}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
            />
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              event={mockEvent}
              selectedSeats={selectedSeats}
              onRemoveSeat={handleRemoveSeat}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={handleCloseTicketModal}
        event={mockEvent}
        seats={selectedSeats}
        confirmationCode={confirmationCode}
      />
    </div>
  );
}

