'use client';

import { motion } from 'framer-motion';
import { Seat, Event } from '@/types/events';
import { ShoppingCart, Ticket, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutSummaryProps {
  event: Event;
  selectedSeats: Seat[];
  onRemoveSeat: (seat: Seat) => void;
  onCheckout: () => void;
}

export default function CheckoutSummary({ 
  event, 
  selectedSeats, 
  onRemoveSeat,
  onCheckout 
}: CheckoutSummaryProps) {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = totalPrice * 0.1; // 10% de cargo por servicio
  const finalTotal = totalPrice + serviceFee;

  if (selectedSeats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 sticky top-8"
      >
        <div className="text-center py-8">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No has seleccionado ningún asiento</p>
          <p className="text-sm text-gray-400 mt-2">Haz clic en los asientos disponibles para comenzar</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 sticky top-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <Ticket className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Resumen de Compra</h3>
      </div>

      {/* Event Info */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
        <p className="text-sm text-gray-600">{event.artist}</p>
        <p className="text-sm text-gray-500">{event.date} • {event.time}</p>
        <p className="text-sm text-gray-500">{event.venue}</p>
      </div>

      {/* Selected Seats */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          Asientos Seleccionados ({selectedSeats.length})
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedSeats.map((seat) => (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Fila {seat.row} - Asiento {seat.number}
                </p>
                <p className="text-sm text-gray-500 capitalize">{seat.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-gray-900">${seat.price}</p>
                <button
                  onClick={() => onRemoveSeat(seat)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({selectedSeats.length} {selectedSeats.length === 1 ? 'entrada' : 'entradas'})</span>
          <span className="font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Cargo por servicio (10%)</span>
          <span className="font-medium">${serviceFee.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-purple-600">${finalTotal.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Proceder al Pago
      </Button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Pago seguro y protegido
      </p>
    </motion.div>
  );
}

